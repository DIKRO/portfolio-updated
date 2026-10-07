"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import Image from "next/image";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Lang } from "@/content/lang";
import { projects } from "@/content/projects";
import { sortProjects } from "@/lib/sortProjects";
import { CategoryKey, Project } from "@/types/project";

// Видео для превью по наведению (см. WorkCard ниже) может лежать в двух
// разных местах данных проекта (см. src/types/project.ts): в отдельном
// поле project.video ("главный" ролик), либо прямо элементом внутри
// project.images (если видео должно вести себя как фото и влиять на
// раскладку в самом кейсе — см. buildGalleryRows). Для превью в сетке
// разницы нет, откуда оно взято — берём первое найденное.
function getPreviewVideoSrc(project: Project): string | undefined {
  if (project.video) return project.video;
  const inlineVideo = project.images.find((item) => typeof item !== "string");
  return inlineVideo?.video;
}
import { shimmerBlurDataURL } from "@/lib/shimmer";
import styles from "./WorkGrid.module.css";

type FilterKey = "all" | CategoryKey;

// Желаемый порядок фильтров — "Все", затем эти категории именно в этом
// порядке (если по ним есть хотя бы одна работа), а всё остальное — следом,
// в порядке первого появления в данных (как было раньше). Так порядок не
// зависит от того, в каком порядке лежат проекты в файле — и не ломается,
// когда добавляешь новые работы.
const PINNED_CATEGORY_ORDER: CategoryKey[] = [
  "branding",
  "motion-design",
  "digital",
  "video-editing",
  "packaging",
  "print",
  "ui-ux",
];

interface WorkGridProps {
  lang: Lang;
  t: {
    work: { showMore: string; showLess: string };
    categories: Record<FilterKey, string>;
  };
}

// Сколько карточек добавляет каждое нажатие «Показать ещё». 6 делится и на 3
// колонки (десктоп), и на 2 (планшет), и на 1 (телефон), поэтому последний
// ряд всегда получается полным. На телефоне карточки идут в одну колонку и
// занимают много высоты, поэтому там порция меньше.
const PAGE_SIZE_DESKTOP = 6;
const PAGE_SIZE_MOBILE = 4;
// Сколько карточек сверх видимых рисуем «про запас»: первый скрытый ряд
// выглядывает из-под градиента на 40% высоты. Колонок максимум 3.
const TEASER_EXTRA = 3;

// Флаг на уровне модуля (не React state) — переживает переходы между
// страницами внутри одной вкладки (модуль не перевыполняется заново при
// SPA-навигации), но сбрасывается в false при настоящей перезагрузке
// страницы (весь JS выполняется с нуля). Нужен, чтобы отличать два разных
// случая:
// 1) САМАЯ ПЕРВАЯ загрузка страницы — сервер всегда рендерит "all"/false,
//    не зная про sessionStorage. Если тут же прочитать sessionStorage на
//    клиенте, разметка разойдётся с серверной — React ругается на
//    гидратацию. Поэтому здесь тоже возвращаем "all"/false, как сервер.
// 2) Возврат из проекта на эту же страницу внутри той же вкладки — это
//    обычный клиентский рендер без сверки с HTML сервера, тут сверяться
//    не с чем, поэтому можно и нужно сразу читать sessionStorage.
let hasHydratedOnce = false;

// ===== Восстановление после обновления страницы (F5) =====
// Категория, раскрытие сетки и позиция прокрутки лежат в sessionStorage, но
// при загрузке страницы мы не читаем их при создании state (сервер всегда
// отдаёт "all"/свёрнуто — расхождение вызвало бы ошибку гидратации), а
// применяем уже после гидратации (см. useLayoutEffect в компоненте).
// Важная деталь: WorkGrid при загрузке создаётся ДВАЖДЫ. В page.tsx секции
// обёрнуты в <div key={lang}>, а язык стартует с "en" и лишь потом
// подхватывается сохранённый из localStorage — смена key полностью
// перемонтирует секции. Первый экземпляр к этому моменту уже успевает
// перезаписать sessionStorage значениями по умолчанию ("all"), и второй
// экземпляр читал бы уже затёртые данные. Поэтому сохранённое состояние
// читаем ОДИН раз на уровне модуля (до любых записей) и применяем в
// каждом экземпляре, но только в первые секунды после загрузки — иначе
// позднее перемонтирование (например, при ручной смене языка) откатывало
// бы текущий выбор человека к тому, что было до обновления.
// Только для перезагрузки и возврата кнопкой «назад» (navigation type):
// при обычном заходе по ссылке / в новой вкладке всё начинается с «Все».
type RestoredState = { filter: string | null; pages: number; scrollY: number; expiresAt: number };
let restoredState: RestoredState | null | undefined = undefined;

function getRestoredState(): RestoredState | null {
  if (typeof window === "undefined") return null;

  if (restoredState === undefined) {
    let navType: string | undefined;
    try {
      navType = (performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined)?.type;
    } catch {
      navType = undefined;
    }
    const shouldRestore = !hasHydratedOnce && (navType === "reload" || navType === "back_forward");
    try {
      restoredState = shouldRestore
        ? {
            filter: sessionStorage.getItem("workGridFilter"),
            pages: Math.max(1, Math.floor(Number(sessionStorage.getItem("workGridPages")) || 1)),
            scrollY: Number(sessionStorage.getItem("workGridScrollY")) || 0,
            expiresAt: Date.now() + 3000,
          }
        : null;
    } catch {
      restoredState = null;
    }
  }

  if (restoredState && Date.now() > restoredState.expiresAt) return null;
  return restoredState;
}

// Карточка проекта в сетке — вынесена в отдельный компонент, чтобы у
// каждой карточки было своё независимое состояние наведения/видео (иначе
// пришлось бы городить Map<id, ...> состояний на уровне всей сетки).
//
// Превью по наведению: пока курсор не на карточке — обычное фото (как и
// раньше). При наведении (только если canHoverPreview и у проекта вообще
// есть поле video, см. src/types/project.ts) поверх фото запускается то
// же видео, что показано на странице кейса — специально не требуем
// отдельного короткого ролика под превью, чтобы не удваивать работу по
// каждому проекту.
//
// Формат видео может быть любым — квадрат, портрет, альбомная ориентация,
// не важно: у .previewVideo тот же object-fit: cover, что и у .image
// (см. WorkGrid.module.css), поэтому видео обрезается точно под рамку
// карточки без искажений и чёрных полос, ровно как обложка.
//
// Тег <video> монтируется в DOM только при первом реальном наведении
// (hasHovered), а не сразу для всех карточек сетки — иначе на фильтре
// "Все работы" браузер начал бы одновременно тянуть с R2 десятки видео.
// После первого наведения элемент остаётся в DOM (просто на паузе) —
// повторное наведение уже не requestует файл заново.
function WorkCard({
  project,
  lang,
  href,
  categoryLabel,
  canHoverPreview,
}: {
  project: Project;
  lang: Lang;
  href: string;
  categoryLabel: string;
  canHoverPreview: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasHovered, setHasHovered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const previewVideoSrc = getPreviewVideoSrc(project);
  const showPreview = canHoverPreview && Boolean(previewVideoSrc);

  const handleEnter = () => {
    if (!showPreview) return;
    if (!hasHovered) {
      // Первое наведение — монтируем <video> ниже с autoPlay, он сам
      // начнёт играть, как только браузер сможет (см. onPlaying).
      setHasHovered(true);
    } else {
      // Повторное наведение — элемент уже смонтирован и на паузе.
      videoRef.current?.play().catch(() => {});
    }
  };

  const handleLeave = () => {
    if (!showPreview) return;
    setIsPlaying(false);
    const v = videoRef.current;
    if (v) {
      v.pause();
      v.currentTime = 0;
    }
  };

  return (
    <Link
      href={href}
      className={styles.card}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onTouchStart={(e) => e.currentTarget.classList.add(styles.cardActive)}
      onTouchEnd={(e) => e.currentTarget.classList.remove(styles.cardActive)}
      onTouchCancel={(e) => e.currentTarget.classList.remove(styles.cardActive)}
    >
      <div className={styles.imageWrap}>
        <Image
          src={project.cover}
          alt={project.title[lang]}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          // См. комментарий в ProjectView.tsx у quality={90} — та же
          // причина. Тут ставим 85, а не 90: это только превью-обложка
          // в сетке (не тот же файл, что открывают в лайтбоксе крупно),
          // поэтому чуть меньше можно сэкономить на трафике, разница
          // на маленьком превью не так заметна.
          quality={85}
          className={styles.image}
          placeholder="blur"
          blurDataURL={shimmerBlurDataURL()}
        />

        {showPreview && hasHovered && (
          <video
            ref={videoRef}
            className={isPlaying ? `${styles.previewVideo} ${styles.previewVideoActive}` : styles.previewVideo}
            src={previewVideoSrc}
            autoPlay
            muted
            loop
            playsInline
            preload="none"
            // Пока видео реально не начало играть (буферизация/сеть),
            // остаётся видна статичная обложка под ним — плавный переход
            // только когда есть что показать, без чёрного кадра-вспышки.
            onPlaying={() => setIsPlaying(true)}
            // Убирает "Сохранить видео как" из правого клика — та же
            // защита, что и у видео на самой странице кейса (ProjectView).
            onContextMenu={(e) => e.preventDefault()}
          />
        )}
      </div>

      <div className={styles.meta}>
        <span className={styles.title}>{project.title[lang]}</span>
        <span className={styles.category}>
          {categoryLabel} — {project.year}
        </span>
      </div>
    </Link>
  );
}

// Подписка на media query без setState в эффекте: на сервере и при гидратации
// значение false (как и раньше), на клиенте — актуальное, с реакцией на
// resize/поворот экрана.
function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

// Плавающая «Свернуть»: пока человек листает раскрытую галерею, она висит
// внизу экрана, чтобы можно было свернуть в любой момент, а не докручивать до
// конца. Показываем, только когда сама галерея на экране, а её нижний край
// (где уже есть обычные кнопки) ещё далеко. Рендерится порталом в body — у
// предков секции могут быть transform'ы, которые ломают position: fixed.
function FloatingCollapse({
  enabled,
  wrapRef,
  endRef,
  label,
  onCollapse,
}: {
  enabled: boolean;
  wrapRef: React.RefObject<HTMLElement | null>;
  endRef: React.RefObject<HTMLElement | null>;
  label: string;
  onCollapse: (e: React.MouseEvent<HTMLButtonElement>) => void;
}) {
  const [gridInView, setGridInView] = useState(false);
  const [endNear, setEndNear] = useState(false);

  // На сервере и при гидратации document недоступен — портал только на клиенте.
  const canPortal = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  useEffect(() => {
    const wrap = wrapRef.current;
    const end = endRef.current;
    if (!wrap || !end) return;

    const wrapObserver = new IntersectionObserver(([entry]) => setGridInView(entry.isIntersecting));
    // Запас 220px снизу: кнопка прячется заранее, до того как нижние кнопки
    // окажутся с ней на одном уровне.
    const endObserver = new IntersectionObserver(([entry]) => setEndNear(entry.isIntersecting), {
      rootMargin: "0px 0px 220px 0px",
    });
    wrapObserver.observe(wrap);
    endObserver.observe(end);
    return () => {
      wrapObserver.disconnect();
      endObserver.disconnect();
    };
  }, [wrapRef, endRef]);

  if (!canPortal) return null;

  const show = enabled && gridInView && !endNear;

  return createPortal(
    <AnimatePresence>
      {show && (
        <motion.button
          key="floating-collapse"
          type="button"
          className={styles.floatingCollapse}
          onClick={onCollapse}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 14 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <span aria-hidden="true" className={styles.floatingArrow}>
            ↑
          </span>
          {label}
        </motion.button>
      )}
    </AnimatePresence>,
    document.body,
  );
}

export default function WorkGrid({ lang, t }: WorkGridProps) {
  // Показываем только те фильтры, для которых реально есть работы.
  // Сначала — закреплённый порядок (см. PINNED_CATEGORY_ORDER выше), затем
  // любые остальные категории — в порядке первого появления в данных
  // (например, новая категория, которую забыли добавить в список выше).
  const availableFilters = useMemo<FilterKey[]>(() => {
    const present = new Set(projects.map((p) => p.categoryKey));
    const keys: FilterKey[] = ["all"];

    for (const key of PINNED_CATEGORY_ORDER) {
      if (present.has(key)) keys.push(key);
    }
    for (const project of projects) {
      if (!keys.includes(project.categoryKey)) keys.push(project.categoryKey);
    }

    return keys;
  }, []);

  const [rawFilter, setFilter] = useState<FilterKey>(() => {
    if (typeof window === "undefined" || !hasHydratedOnce) return "all";
    return (sessionStorage.getItem("workGridFilter") as FilterKey) || "all";
  });

  // Если сохранённая категория больше не существует (например, её
  // переименовали или удалили в данных проектов) — используем "all", чтобы
  // не остаться на пустом несуществующем фильтре. Считаем прямо при
  // рендере, без эффекта.
  const filter: FilterKey = availableFilters.includes(rawFilter) ? rawFilter : "all";

  // Сколько «порций» карточек сейчас раскрыто (1 — только первая).
  const [pages, setPages] = useState(() => {
    if (typeof window === "undefined" || !hasHydratedOnce) return 1;
    return Math.max(1, Math.floor(Number(sessionStorage.getItem("workGridPages")) || 1));
  });

  useEffect(() => {
    hasHydratedOnce = true;
  }, []);

  // Применяем сохранённые категорию и раскрытие. useLayoutEffect срабатывает
  // до первой отрисовки (так «Все» на экране не мелькает) и раньше любых
  // useEffect — записи в sessionStorage ниже ещё не успели ничего затереть.
  useLayoutEffect(() => {
    const saved = getRestoredState();
    if (!saved) return;
    // Намеренно: восстановление из sessionStorage только на клиенте и до
    // первой отрисовки (иначе серверная разметка разойдётся с клиентской).
    /* eslint-disable react-hooks/set-state-in-effect */
    if (saved.filter) setFilter(saved.filter as FilterKey);
    setPages(saved.pages);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  // Позиция прокрутки: запоминаем при уходе/перезагрузке страницы и, после
  // восстановления категории (высота страницы могла измениться), возвращаем
  // на то же место. Браузер и сам пытается вернуть прокрутку, но делает это
  // раньше, чем сетка перестроится, поэтому добавляем подстраховку: несколько
  // попыток в первые ~1.2 с и отмена, если человек сам начал прокручивать.
  // behavior "instant" — в globals.css включён smooth-scroll, а нам нужен
  // мгновенный возврат без «доезжания».
  useEffect(() => {
    const save = () => {
      try {
        sessionStorage.setItem("workGridScrollY", String(Math.round(window.scrollY)));
      } catch {
        // sessionStorage недоступен (приватный режим и т.п.) — не страшно
      }
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") save();
    };
    window.addEventListener("pagehide", save);
    document.addEventListener("visibilitychange", onVisibility);

    const targetY = getRestoredState()?.scrollY ?? 0;
    const timers: number[] = [];
    let userMoved = false;
    const stop = () => {
      userMoved = true;
    };
    const stopEvents = ["wheel", "touchstart", "keydown", "mousedown"] as const;

    if (targetY > 0) {
      stopEvents.forEach((ev) => window.addEventListener(ev, stop, { passive: true }));
      const jump = () => {
        if (userMoved) return;
        if (Math.abs(window.scrollY - targetY) > 40) {
          window.scrollTo({ top: targetY, behavior: "instant" as ScrollBehavior });
        }
      };
      requestAnimationFrame(() => requestAnimationFrame(jump));
      timers.push(window.setTimeout(jump, 300), window.setTimeout(jump, 800), window.setTimeout(jump, 1200));
    }

    return () => {
      window.removeEventListener("pagehide", save);
      document.removeEventListener("visibilitychange", onVisibility);
      stopEvents.forEach((ev) => window.removeEventListener(ev, stop));
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  const gridRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const filtersRef = useRef<HTMLDivElement>(null);

  // "Бесконечная" прокрутка фильтров нужна только на телефоне (на десктопе
  // они и так все помещаются без скролла) — определяем по той же ширине,
  // на которой уже переключается вёрстка в CSS (768px), и переслушиваем
  // resize/поворот экрана.
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Превью-видео по наведению на карточку (см. WorkCard ниже) должно
  // работать только там, где наведение вообще осмысленно — на устройстве
  // с настоящей мышью/трекпадом. isMobile выше завязан на ШИРИНУ экрана
  // (768px) и для этого не годится: у широкого планшета/ноутбука с
  // тачскрином ширина может быть больше 768px, но hover там всё равно
  // "залипающий" и работает через долгий тап, а не реальное наведение —
  // на таких устройствах видео лучше не запускать вообще, чтобы не ловить
  // случайный автоплей от касания. (hover: hover) и (pointer: fine) вместе
  // как раз и означают "есть настоящий указатель с наведением".
  const canHoverPreview = useMediaQuery("(hover: hover) and (pointer: fine)");

  useEffect(() => {
    sessionStorage.setItem("workGridPages", String(pages));
  }, [pages]);

  useEffect(() => {
    sessionStorage.setItem("workGridFilter", filter);
  }, [filter]);

  const collapse = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.blur();
    // Важен порядок: сначала долистываем к началу секции, и только когда
    // скролл ОСТАНОВИЛСЯ — убираем лишние карточки. Если убрать их во время
    // плавной прокрутки, страница мгновенно становится короче, браузер
    // урезает текущую позицию под новую высоту — отсюда рывок (особенно
    // заметно на телефоне, где листать вверх приходится далеко и долго).
    // Фиксированной задержки (раньше 400мс) недостаточно: длина прокрутки
    // зависит от того, как глубоко человек ушёл вниз. Поэтому следим за
    // самим скроллом: «стоим» ~6 кадров подряд (~100мс) — сворачиваем.
    // Страховка по времени — на случай, если скролл не остановился.
    sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

    const startedAt = performance.now();
    let lastY = window.scrollY;
    let stillFrames = 0;
    const tick = () => {
      const y = window.scrollY;
      stillFrames = Math.abs(y - lastY) < 1 ? stillFrames + 1 : 0;
      lastY = y;
      const elapsed = performance.now() - startedAt;
      if ((stillFrames >= 6 && elapsed > 150) || elapsed > 2500) {
        setPages(1);
        return;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const selectFilter = (key: FilterKey) => {
    // Модульная переменная меняется намеренно (не React-состояние).
    // eslint-disable-next-line react-hooks/globals
    restoredState = null; // человек выбрал сам — восстановление больше не нужно
    setFilter(key);
    setPages(1);
  };

  const showMore = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.blur();
    setPages((n) => n + 1);
  };

  // Порядок показа — по полю order (см. src/types/project.ts), а не по
  // тому, в каком порядке проекты лежат в файле/массиве. .slice() перед
  // .sort() — projects это общий модульный массив, .sort() мутирует на месте.
  // useMemo — чтобы массив не создавался заново при каждом рендере (от него
  // зависят эффекты ниже).
  const filtered = useMemo(
    () =>
      sortProjects(filter === "all" ? projects : projects.filter((p) => p.categoryKey === filter), {
        useFeatured: filter === "all",
      }),
    [filter],
  );

  const pageSize = isMobile ? PAGE_SIZE_MOBILE : PAGE_SIZE_DESKTOP;
  const shownCount = Math.min(pages * pageSize, filtered.length);
  const hasMore = shownCount < filtered.length;
  // Раскрыто больше первой порции — есть что сворачивать.
  const canCollapse = shownCount > pageSize;
  // В DOM — видимые карточки + «выглядывающий» ряд. Остальные проекты не
  // рендерятся вовсе (меньше картинок и видео на странице, пока их не
  // попросили).
  const rendered = useMemo(() => filtered.slice(0, shownCount + TEASER_EXTRA), [filtered, shownCount]);

  // Высоту сетки задаём напрямую в DOM (max-height), а не через React-состояние
  // или Framer Motion: React этим свойством не управляет, повторные рендеры
  // его не сбрасывают, а плавность даёт CSS-переход на .grid. max-height (а не
  // height) не растягивает строки сетки — старая проблема с огромными
  // отступами между рядами здесь невозможна.
  //  • есть ещё карточки — высота до 40% первого скрытого ряда (он тонет в
  //    градиенте, как и раньше);
  //  • показано всё — высота ровно по последней карточке.
  // Ищем карточки по data-project-id, а не по индексу среди детей: во время
  // анимации ухода (AnimatePresence) в сетке ещё лежат старые карточки, и
  // индексы съезжали бы.
  useLayoutEffect(() => {
    const el = gridRef.current;
    if (!el) return;

    const measure = () => {
      const items = rendered
        .map((p) => el.querySelector<HTMLElement>(`[data-project-id="${p.id}"]`))
        .filter((n): n is HTMLElement => n !== null);
      if (items.length === 0) return;

      let target: number;
      if (hasMore) {
        const cut = items[shownCount];
        if (!cut) return;
        target = cut.offsetTop + cut.offsetHeight * 0.4;
      } else {
        const last = items[items.length - 1];
        target = last.offsetTop + last.offsetHeight;
      }

      const value = `${Math.round(target)}px`;
      if (el.style.maxHeight === value) return;

      if (!el.dataset.measured) {
        // Самое первое измерение — без анимации, чтобы сетка не «доезжала»
        // с запасной высоты (.gridClipped) при загрузке страницы.
        el.style.transition = "none";
        el.style.maxHeight = value;
        void el.offsetHeight; // применить стиль до возврата перехода
        el.style.transition = "";
        el.dataset.measured = "1";
      } else {
        el.style.maxHeight = value;
      }
    };

    let frame = 0;
    const scheduleMeasure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };

    // На телефоне событие resize приходит и когда во время прокрутки
    // прячется/появляется адресная строка браузера (меняется только высота).
    // Раскладка карточек от высоты окна не зависит, а лишние замеры во время
    // скролла — это принудительные пересчёты layout и подёргивания.
    let lastWidth = window.innerWidth;
    const onResize = () => {
      if (window.innerWidth === lastWidth) return;
      lastWidth = window.innerWidth;
      scheduleMeasure();
    };

    measure();

    // ResizeObserver — на каждой карточке: у самой сетки высота зафиксирована
    // нами, поэтому изменение контента внутри (например, шрифт догрузился и
    // заголовок перенёсся иначе) через неё не поймать.
    const observer = new ResizeObserver(scheduleMeasure);
    Array.from(el.children).forEach((child) => observer.observe(child));
    window.addEventListener("resize", onResize);
    document.fonts?.ready.then(scheduleMeasure);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, [rendered, shownCount, hasMore]);

  // Плавающая «Свернуть» — отдельный компонент (см. FloatingCollapse выше),
  // у него своё состояние: появление/исчезновение кнопки при прокрутке не
  // перерисовывает всю сетку (а вместе с ней — замеры Framer Motion по всем
  // карточкам), иначе на телефоне это даёт подёргивания.
  const gridWrapRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  // Бесконечная прокрутка: рисуем список категорий трижды подряд (три
  // одинаковых "комплекта") и всегда стартуем со среднего комплекта — тогда
  // с обеих сторон есть запас, куда крутить. Как только пользователь
  // докручивает почти до края первого или третьего комплекта, незаметно
  // (без анимации) перепрыгиваем ровно на ширину одного комплекта в
  // противоположную сторону — глаз этого не замечает, а прокрутка кажется
  // бесконечной в обе стороны.
  // Ширина группы кнопок-фильтров (от левого края первой до правого края
  // последней) публикуется в CSS-переменную --filters-width на <html>:
  // ряд логотипов клиентов в «Обо мне» (About.module.css, .logoRow) берёт
  // её как свою ширину, чтобы края обоих рядов совпадали. Контейнер
  // .filters сам занимает всю ширину секции (кнопки внутри центрированы),
  // поэтому его собственную ширину брать нельзя — меряем именно кнопки.
  // На телефоне переменная не используется (там своя раскладка).
  useEffect(() => {
    const el = filtersRef.current;
    if (!el || isMobile) return;

    const root = document.documentElement;
    const measure = () => {
      const kids = Array.from(el.children) as HTMLElement[];
      if (kids.length === 0) return;
      let left = Infinity;
      let right = -Infinity;
      kids.forEach((kid) => {
        const rect = kid.getBoundingClientRect();
        left = Math.min(left, rect.left);
        right = Math.max(right, rect.right);
      });
      root.style.setProperty("--filters-width", `${Math.round(right - left)}px`);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    // Шрифт мог догрузиться после первого замера — ширины кнопок изменятся.
    document.fonts?.ready.then(measure);

    return () => {
      observer.disconnect();
      root.style.removeProperty("--filters-width");
    };
  }, [isMobile, availableFilters, t.categories]);

  useEffect(() => {
    if (!isMobile) return;
    const el = filtersRef.current;
    if (!el) return;

    const setWidth = () => el.scrollWidth / 3;

    // Стартуем со среднего комплекта.
    el.scrollLeft = setWidth();

    const onScroll = () => {
      const width = setWidth();
      if (width === 0) return;
      if (el.scrollLeft < width * 0.5) {
        el.scrollLeft += width;
      } else if (el.scrollLeft > width * 1.5) {
        el.scrollLeft -= width;
      }
    };

    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, [isMobile, availableFilters]);

  const filterSets = isMobile ? [0, 1, 2] : [0];

  // Вынесено из JSX ниже, чтобы одна и та же разметка карточек
  // переиспользовалась и внутри motion.div (фильтр "Все работы"), и
  // внутри обычного div (любая конкретная категория) — см. комментарий
  // у .gridWrap про то, почему это два разных типа контейнера.
  const gridItems = (
    <AnimatePresence mode="popLayout">
      {rendered.map((project, index) => (
        <motion.div
          key={project.id}
          data-project-id={project.id}
          layout
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.4, delay: (index % 3) * 0.05 }}
        >
          <WorkCard
            project={project}
            lang={lang}
            href={filter === "all" ? `/work/${project.slug}` : `/work/${filter}/${project.slug}`}
            categoryLabel={t.categories[project.categoryKey]}
            canHoverPreview={canHoverPreview}
          />
        </motion.div>
      ))}
    </AnimatePresence>
  );

  return (
    <section id="work" ref={sectionRef} className={styles.section}>
      <div className={styles.filters} ref={filtersRef}>
        {filterSets.map((setIndex) =>
          availableFilters.map((key) => (
            <button
              key={`${setIndex}-${key}`}
              className={key === filter ? styles.filterActive : styles.filter}
              onClick={() => selectFilter(key)}
            >
              {t.categories[key]}
            </button>
          ))
        )}
      </div>

      <div className={styles.gridWrap} ref={gridWrapRef}>
        <div ref={gridRef} className={`${styles.grid} ${hasMore ? styles.gridClipped : ""}`}>
          {gridItems}
        </div>

        {/* Подложка-градиент и кнопки плавно появляются/исчезают (0.5s), пока
            есть что показать ещё. Сам градиент не ловит клики
            (pointer-events: none) — кнопки внутри включают их себе обратно. */}
        <AnimatePresence>
          {hasMore && (
            <motion.div
              className={styles.fade}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className={styles.moreActions}>
                <span className={styles.counter}>
                  <span className={styles.counterShown}>{shownCount}</span> / {filtered.length}
                </span>
                <div className={styles.moreRow}>
                  <button className={styles.showAllButton} onClick={showMore}>
                    {t.work.showMore} →
                  </button>
                  {canCollapse && (
                    <button className={styles.fadeCollapse} onClick={collapse}>
                      {t.work.showLess}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Показано всё — обычная кнопка «Свернуть» под сеткой. */}
      {!hasMore && canCollapse && (
        <div className={styles.collapseRow}>
          <button className={styles.showLessButton} onClick={collapse}>
            {t.work.showLess}
          </button>
        </div>
      )}

      {/* Метка конца галереи — по ней прячем плавающую кнопку. */}
      <div ref={endRef} aria-hidden="true" className={styles.endSentinel} />

      <FloatingCollapse
        enabled={canCollapse}
        wrapRef={gridWrapRef}
        endRef={endRef}
        label={t.work.showLess}
        onCollapse={collapse}
      />
    </section>
  );
}
