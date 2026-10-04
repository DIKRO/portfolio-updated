"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Lang } from "@/content/lang";
import { projects } from "@/content/projects";
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
    work: { showAll: string; showLess: string };
    categories: Record<FilterKey, string>;
  };
}

const VISIBLE_ROWS = 2;

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
type RestoredState = { filter: string | null; expanded: boolean; scrollY: number; expiresAt: number };
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
            expanded: sessionStorage.getItem("workGridExpanded") === "1",
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

export default function WorkGrid({ lang, t }: WorkGridProps) {
  const [filter, setFilter] = useState<FilterKey>(() => {
    if (typeof window === "undefined" || !hasHydratedOnce) return "all";
    return (sessionStorage.getItem("workGridFilter") as FilterKey) || "all";
  });

  const [expanded, setExpanded] = useState(() => {
    if (typeof window === "undefined" || !hasHydratedOnce) return false;
    return sessionStorage.getItem("workGridExpanded") === "1";
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
    if (saved.filter) setFilter(saved.filter as FilterKey);
    setExpanded(saved.expanded);
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
  const [heights, setHeights] = useState<{ clip: number; full: number } | null>(null);

  // "Бесконечная" прокрутка фильтров нужна только на телефоне (на десктопе
  // они и так все помещаются без скролла) — определяем по той же ширине,
  // на которой уже переключается вёрстка в CSS (768px), и переслушиваем
  // resize/поворот экрана.
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    setIsMobile(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Превью-видео по наведению на карточку (см. WorkCard ниже) должно
  // работать только там, где наведение вообще осмысленно — на устройстве
  // с настоящей мышью/трекпадом. isMobile выше завязан на ШИРИНУ экрана
  // (768px) и для этого не годится: у широкого планшета/ноутбука с
  // тачскрином ширина может быть больше 768px, но hover там всё равно
  // "залипающий" и работает через долгий тап, а не реальное наведение —
  // на таких устройствах видео лучше не запускать вообще, чтобы не ловить
  // случайный автоплей от касания. (hover: hover) и (pointer: fine) вместе
  // как раз и означают "есть настоящий указатель с наведением".
  const [canHoverPreview, setCanHoverPreview] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    setCanHoverPreview(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setCanHoverPreview(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    sessionStorage.setItem("workGridExpanded", expanded ? "1" : "0");
  }, [expanded]);

  useEffect(() => {
    sessionStorage.setItem("workGridFilter", filter);
  }, [filter]);

  const collapse = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.blur();
    // Важен порядок: сначала долистываем к началу секции (пока грид ещё
    // полной высоты — ничего не схлопывается, скроллу ничего не мешает),
    // и только когда страница уже встала на место, запускаем схлопывание.
    // Если делать это одновременно — пока высота грида на лету уменьшается
    // CSS-переходом (0.8s), браузер за это же время постоянно урезает
    // максимально доступный скролл под ещё-уменьшающуюся высоту страницы,
    // и текущую позицию резко тянет вниз, к футеру, пока наш scrollIntoView
    // это не перебьёт — отсюда и рывок.
    sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => setExpanded(false), 400);
  };

  const selectFilter = (key: FilterKey) => {
    restoredState = null; // человек выбрал сам — восстановление больше не нужно
    setFilter(key);
    setExpanded(false);
  };

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

  // Если сохранённая категория больше не существует (например, её
  // переименовали или удалили в данных проектов) — откатываемся на "all",
  // чтобы не остаться на пустом несуществующем фильтре.
  useEffect(() => {
    if (!availableFilters.includes(filter)) {
      setFilter("all");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableFilters]);

  // Порядок показа — по полю order (см. src/types/project.ts), а не по
  // тому, в каком порядке проекты лежат в файле/массиве. Раньше, когда
  // проекты выстроили по категориям (сплошными блоками id — см. комментарии
  // в src/content/projects/index.ts), вкладка "Все работы" стала показывать
  // их теми же сплошными блоками по категориям подряд, а не вперемешку.
  // .slice() перед .sort() — projects это общий модульный массив (импорт
  // из content/projects), .sort() мутирует на месте, без копии он бы менял
  // порядок и внутри самого исходного массива на будущие рендеры.
  const filtered = (filter === "all" ? projects : projects.filter((p) => p.categoryKey === filter))
    .slice()
    .sort((a, b) => a.order - b.order);

  const isAll = filter === "all";

  // Замеряем реальную высоту строк сетки (а не примерную vh), чтобы обрезка
  // всегда приходилась на 40% высоты 3-го ряда (видно 40%, 60% тонет в фоне),
  // независимо от того, сколько колонок сейчас в сетке (3 на десктопе, 2 на планшете, 1 на телефоне).
  useEffect(() => {
    if (!isAll) return;

    function measure() {
      const el = gridRef.current;
      if (!el) return;
      const items = Array.from(el.children) as HTMLElement[];
      if (items.length === 0) return;

      const firstTop = items[0].offsetTop;
      let columns = 1;
      for (let i = 1; i < items.length; i++) {
        if (Math.abs(items[i].offsetTop - firstTop) < 1) columns++;
        else break;
      }

      const totalRows = Math.ceil(items.length / columns);
      const full = el.scrollHeight;

      if (totalRows <= VISIBLE_ROWS) {
        setHeights({ clip: full, full });
        return;
      }

      const cutRowIndex = columns * VISIBLE_ROWS; // первый элемент обрезаемого ряда
      const cutItem = items[cutRowIndex];
      if (!cutItem) {
        setHeights({ clip: full, full });
        return;
      }

      // Третий ряд должен на 60% "утопать" в фон — обрезаем на уровне
      // 40% его высоты, оставшиеся 60% скрываются под градиентом-фейдом.
      setHeights({ clip: cutItem.offsetTop + cutItem.offsetHeight * 0.4, full });
    }

    let frame = 0;
    function scheduleMeasure() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    }

    scheduleMeasure();

    // ResizeObserver подписан на КАЖДУЮ карточку по отдельности, а не на
    // сам .grid — как только у контейнера появляется explicit height +
    // overflow:hidden (canClip), его собственный размер с точки зрения
    // браузера зафиксирован (мы сами его выставляем через animate), поэтому
    // ResizeObserver на самом контейнере не поймает изменение контента
    // внутри (например, более поздний догруз шрифта на медленной мобильной
    // сети, из-за которого текст переносится иначе и карточка меняет
    // высоту уже ПОСЛЕ первого измерения). Слежка за самими карточками —
    // у них высоту никто не фиксирует — ловит такие изменения при любых
    // условиях сети и устройства.
    const el = gridRef.current;
    const observer = el ? new ResizeObserver(() => scheduleMeasure()) : null;
    if (el && observer) {
      Array.from(el.children).forEach((child) => observer.observe(child));
    }

    window.addEventListener("resize", scheduleMeasure);
    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
      window.removeEventListener("resize", scheduleMeasure);
    };
  }, [isAll, filtered.length]);

  const canClip = isAll && heights !== null && heights.clip < heights.full - 1;

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
      {filtered.map((project, index) => (
        <motion.div
          key={project.id}
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

      <div className={styles.gridWrap}>
        {/* Обрезка по высоте (анимация height через Framer Motion) нужна
            ТОЛЬКО для фильтра "Все работы" — только там вообще может быть
            больше 2 рядов. Раньше сетка всегда была motion.div, и когда
            выбиралась конкретная категория, Framer Motion просто переставал
            трогать height, но инлайн-стиль height (в пикселях), который он
            уже успел выставить под фильтр "Все работы", оставался на
            элементе — а CSS Grid с явно заданной высотой растягивает
            пустые строки, чтобы её заполнить (align-content: stretch по
            умолчанию). Внешне это выглядело как гигантские отступы между
            рядами карточек в любой отдельной категории. Попытка чинить это
            через animate={{height: "auto"}} не помогла до конца — Framer
            Motion всё равно на секунду навязывает свой инлайн-стиль height
            при каждом ре-рендере. Поэтому теперь для категорий (isAll ===
            false) сетка — обычный <div> без Framer Motion вообще: она
            физически не может выставить height, высота всегда чисто
            браузерная (auto), и растягивать там нечего. */}
        {isAll ? (
          <motion.div
            ref={gridRef}
            className={styles.grid}
            style={canClip ? { overflow: "hidden" } : undefined}
            animate={{ height: canClip ? (expanded ? heights!.full : heights!.clip) : "auto" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            {gridItems}
          </motion.div>
        ) : (
          <div className={styles.grid}>{gridItems}</div>
        )}

        {/* Подложка-градиент и кнопка теперь исчезают/появляются плавным
            fade (0.5s) одновременно с тем, как сетка растёт/сжимается
            (0.8s) — раньше это был обычный React-условный рендер без
            перехода, то есть подложка пропадала/появлялась за один кадр
            прямо в момент клика, пока высота под ней ещё только начинала
            меняться. Из-за этого мгновенного "скачка" в самый первый
            момент разворачивание/сворачивание и ощущалось как резкое, хотя
            сама сетка растягивалась плавно. */}
        <AnimatePresence>
          {canClip && !expanded && (
            <motion.div
              className={styles.fade}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <button className={styles.showAllButton} onClick={() => setExpanded(true)}>
                {t.work.showAll} →
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {canClip && expanded && (
        <div className={styles.collapseRow}>
          <button className={styles.showLessButton} onClick={collapse}>
            {t.work.showLess}
          </button>
        </div>
      )}
    </section>
  );
}
