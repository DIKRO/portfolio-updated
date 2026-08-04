"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useAnimationControls } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { projects } from "@/content/projects";
import { LocalizedText, Project } from "@/types/project";
import { Lang } from "@/content/lang";
import styles from "./About.module.css";

interface AboutProps {
  lang: Lang;
  t: {
    about: { label: string; text: string; clientsLabel: string; viewProjects: string };
  };
}

// Блоки со статистикой (400+ работ, 100+ клиентов и т.п.) — добавляй,
// меняй или удаляй записи в этом массиве когда захочешь, порядок в
// массиве = порядок отображения. value — то, что крупным шрифтом
// (например "400+"), label — подпись под ним на трёх языках.
const STATS: { value: string; label: LocalizedText }[] = [
  {
    value: "400+",
    label: {
      ru: "Выполненных работ",
      en: "Projects completed",
      ro: "Proiecte finalizate",
    },
  },
  {
    value: "100+",
    label: {
      ru: "Довольных клиентов",
      en: "Happy clients",
      ro: "Clienți mulțumiți",
    },
  },
  {
    value: "4+",
    label: {
      ru: "Года опыта работы",
      en: "Years of experience",
      ro: "Ani de experiență",
    },
  },
  {
    value: "20+",
    label: {
      ru: "Напрвлений клиентов",
      en: "Market segments",
      ro: "Segmente de piață",
    },
  },
];

// Вырезка тебя без фона (прозрачный PNG) — фон рисуется через CSS-градиент
// в About.module.css (.bgWrap).
const PHOTO_SRC = "/images/22222-cutout.png";

// Отдельное фото для мобилки — на телефоне блок другой ширины/высоты
// (см. .photoBand в @media 768px), поэтому кроп/кадрирование часто
// нужен другой. Просто положи файл с таким именем в public/images —
// он подхватится сам через <picture> ниже, десктопное фото трогать не надо.
const PHOTO_SRC_MOBILE = "/images/22222-mobile.jpg";

interface ClientInfo {
  logo: string;
  name: string;
  description: LocalizedText;
  // Ключ клиента — должен совпадать с полем client у нужных проектов в
  // src/content/projects (см. комментарий там же). Все проекты с таким
  // же client подтягиваются в карточку автоматически — ничего вручную
  // перечислять не нужно, просто отметь клиента у проекта в его же
  // объекте, и он сам появится тут при следующей сборке сайта.
  key: string;
}

// По клику на логотип открывается карточка с этим описанием — замени
// плейсхолдерный текст на то, что реально делал для каждого клиента
// (4-5 предложений, или список — просто пиши каждый пункт с новой строки,
// переносы строк сохраняются автоматически). name — просто название
// компании, показывается заголовком в карточке.
//
// Чтобы добавить/убрать клиента — добавь/удали объект в массиве целиком
// (logo можно оставить пустой строкой "" — тогда отрисуется
// заготовка-плейсхолдер без возможности клика, как и раньше).
const CLIENTS: ClientInfo[] = [
  {
    logo: "/images/clients/energy.svg",
    name: "Energy Wind Moldova",
    description: {
      ru: "Опиши здесь, что именно делал для Energy Wind Moldova — например: разработка логотипа и фирменного стиля, дизайн презентации, оформление рекламных материалов. 4-5 предложений или список, каждый пункт с новой строки.",
      en: "Describe what you did for Energy Wind Moldova here — e.g. logo and brand identity design, presentation design, promotional materials. 4-5 sentences or a list, one item per line.",
      ro: "Descrie aici ce ai făcut pentru Energy Wind Moldova — de ex. design logo și identitate vizuală, design prezentare, materiale promoționale. 4-5 propoziții sau o listă, câte un punct pe linie.",
    },
    key: "energy",
  },
  {
    logo: "/images/clients/ss.svg",
    name: "Sport Spirit",
    description: {
      ru: "Опиши здесь, что именно делал для Sport Spirit.",
      en: "Describe what you did for Sport Spirit here.",
      ro: "Descrie aici ce ai făcut pentru Sport Spirit.",
    },
    // Ключ "ss" — все проекты с client: "ss" в src/content/projects
    // (сейчас это SS_flaer и sport_spirit_1..16) подтянутся сюда сами.
    key: "ss",
  },
  {
    logo: "/images/clients/puma.svg",
    name: "PUMA",
    description: {
      ru: "Опиши здесь, что именно делал для PUMA.",
      en: "Describe what you did for PUMA here.",
      ro: "Descrie aici ce ai făcut pentru PUMA.",
    },
    key: "puma",
  },
  {
    logo: "/images/clients/telemarket.png",
    name: "Telemarket.md",
    description: {
      ru: "Опиши здесь, что именно делал для Telemarket.md.",
      en: "Describe what you did for Telemarket.md here.",
      ro: "Descrie aici ce ai făcut pentru Telemarket.md.",
    },
    // Пока ни один проект не отмечен client: "telemarket" — как только
    // проставишь этот ключ нужным проектам в content/projects, они сами
    // появятся тут.
    key: "telemarket",
  },
  {
    // Замени "Cheton" на реальное название компании, если название файла
    // не совпадает с настоящим именем клиента.
    logo: "/images/clients/cheton.svg",
    name: "Cheton",
    description: {
      ru: "Опиши здесь, что именно делал для этого клиента.",
      en: "Describe what you did for this client here.",
      ro: "Descrie aici ce ai făcut pentru acest client.",
    },
    // Пока ни один проект не отмечен client: "cheton" — как только
    // проставишь этот ключ нужным проектам в content/projects, они сами
    // появятся тут.
    key: "cheton",
  },
  {
    // Замени "Stip" на реальное название компании, если название файла
    // не совпадает с настоящим именем клиента.
    logo: "/images/clients/stip.svg",
    name: "Stip",
    description: {
      ru: "Опиши здесь, что именно делал для этого клиента.",
      en: "Describe what you did for this client here.",
      ro: "Descrie aici ce ai făcut pentru acest client.",
    },
    // Пока ни один проект не отмечен client: "stip" — как только
    // проставишь этот ключ нужным проектам в content/projects, они сами
    // появятся тут.
    key: "stip",
  },
];

// Одна карточка проекта внутри карточки клиента — используется и в
// десктопной карусели ниже, и в обычном мобильном списке.
function RelatedProjectCard({ project, lang }: { project: Project; lang: Lang }) {
  return (
    <Link
      href={`/work/${project.slug}`}
      className={styles.relatedProjectCard}
      onClick={(e) => e.stopPropagation()}
    >
      <div className={styles.relatedProjectImageWrap}>
        <Image src={project.cover} alt={project.title[lang]} fill sizes="180px" className={styles.relatedProjectImage} />
      </div>
      <span className={styles.relatedProjectTitle}>{project.title[lang]}</span>
    </Link>
  );
}

// Десктопная карусель (только когда проектов больше 3) — вместо скролла
// контейнера показывает "окно" из 3 проектов и сдвигает его индексом по
// модулю длины массива. Из-за этого зацикливание получается по-настоящему
// бесшовным: после последнего сразу первый, без видимой границы и без
// "отскока" через весь список назад, как было при скролле контейнера.
// Свой independent state — компонент целиком размонтируется/монтируется
// заново при смене клиента (он вложен в <motion.div key={openClient}>
// снаружи), поэтому окно всегда начинается с первых трёх проектов при
// открытии новой карточки, без утечки состояния между клиентами.
//
// Дорожка с карточками ни разу не размонтируется между кликами по стрелкам —
// раньше окно целиком пересоздавалось (AnimatePresence + key={start}), из-за
// чего между исчезновением старого и появлением нового набора была
// небольшая пауза с пустым местом. Теперь один и тот же track всегда виден:
// на время шага в него временно добавляется 4-я карточка с той стороны,
// куда едем, затем весь track анимированно сдвигается на её ширину, и по
// завершении лишняя карточка убирается, а x мгновенно (без анимации)
// возвращается к 0 — с тем же самым набором из 3 карточек на экране, без
// видимого скачка.
function RelatedProjectsDesktopCarousel({ items, lang }: { items: Project[]; lang: Lang }) {
  const [start, setStart] = useState(0);
  // Пока не null — идёт шаг карусели: extra.dir — куда едем, extra.offsets —
  // какие 4 карточки (по смещению от start) сейчас в DOM.
  const [extra, setExtra] = useState<{ dir: 1 | -1; offsets: number[] } | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const controls = useAnimationControls();
  const busyRef = useRef(false);

  const offsets = extra ? extra.offsets : [0, 1, 2];
  const visible = offsets.map((o) => items[(start + o + items.length) % items.length]);

  const measureStep = () => {
    const track = trackRef.current;
    if (!track || track.children.length < 2) return 0;
    const a = track.children[0] as HTMLElement;
    const b = track.children[1] as HTMLElement;
    return b.offsetLeft - a.offsetLeft;
  };

  const paginate = async (dir: 1 | -1) => {
    if (busyRef.current) return;
    busyRef.current = true;

    setExtra({ dir, offsets: dir === 1 ? [0, 1, 2, 3] : [-1, 0, 1, 2] });
    // Ждём кадр, чтобы 4-я карточка успела попасть в DOM перед замером и
    // стартом анимации.
    await new Promise((r) => requestAnimationFrame(r));
    const step = measureStep();

    if (dir === -1) {
      // Новая карточка добавлена слева — сначала мгновенно (без анимации)
      // прячем её за левый край, чтобы на экране ничего не изменилось,
      // а затем едем вправо на шаг, раскрывая её.
      controls.set({ x: -step });
      await new Promise((r) => requestAnimationFrame(r));
    }

    await controls.start({
      x: dir === 1 ? -step : 0,
      transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] },
    });

    setStart((s) => (s + dir + items.length) % items.length);
    setExtra(null);
    controls.set({ x: 0 });
    busyRef.current = false;
  };

  return (
    <div className={styles.relatedProjectsWrap}>
      <button
        type="button"
        className={`${styles.relatedNav} ${styles.relatedPrev}`}
        onClick={(e) => {
          e.stopPropagation();
          paginate(-1);
        }}
        aria-label="Previous"
      >
        ‹
      </button>

      <div className={styles.relatedProjectsViewport}>
        <motion.div
          ref={trackRef}
          animate={controls}
          initial={false}
          className={styles.relatedProjectsRow}
        >
          {visible.map((project, i) => (
            <RelatedProjectCard key={`${project.slug}-${offsets[i]}`} project={project} lang={lang} />
          ))}
        </motion.div>
      </div>

      <button
        type="button"
        className={`${styles.relatedNav} ${styles.relatedNext}`}
        onClick={(e) => {
          e.stopPropagation();
          paginate(1);
        }}
        aria-label="Next"
      >
        ›
      </button>
    </div>
  );
}

export default function About({ lang, t }: AboutProps) {
  // Индекс открытой карточки клиента (null — ничего не открыто). По клику
  // на логотип показывается модалка с описанием на текущем языке сайта.
  const [openClient, setOpenClient] = useState<number | null>(null);

  // Сколько клиентов реально кликабельны (с логотипом) — стрелки навигации
  // показываем, только если есть, между чем переключаться.
  const clickableCount = CLIENTS.filter((c) => c.logo).length;

  // Переход к следующему/предыдущему клиенту внутри открытой карточки
  // (свайпом на телефоне, стрелками или клавишами ← → на десктопе).
  // Пропускает пустые заготовки без логотипа — у них нечего показывать,
  // открывать их нельзя.
  const goToClient = (direction: 1 | -1) => {
    if (openClient === null) return;
    let next = openClient;
    for (let i = 0; i < CLIENTS.length; i++) {
      next = (next + direction + CLIENTS.length) % CLIENTS.length;
      if (CLIENTS[next].logo) break;
    }
    setOpenClient(next);
  };

  // Блокировка скролла страницы, пока открыта карточка — тот же приём,
  // что и в лайтбоксе фото (см. Lightbox.tsx): фиксируем body на текущей
  // позиции при открытии, а при закрытии мгновенно (без анимации —
  // на html глобально стоит scroll-behavior: smooth, который иначе
  // превратил бы это чисто техническое восстановление позиции в заметный
  // "скролл") возвращаем её обратно.
  useEffect(() => {
    if (openClient === null) return;

    const scrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenClient(null);
      if (e.key === "ArrowRight") goToClient(1);
      if (e.key === "ArrowLeft") goToClient(-1);
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.removeEventListener("keydown", onKeyDown);

      const html = document.documentElement;
      const prevScrollBehavior = html.style.scrollBehavior;
      html.style.scrollBehavior = "auto";
      window.scrollTo(0, scrollY);
      html.style.scrollBehavior = prevScrollBehavior;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openClient]);

  return (
    <section id="about" className={styles.section}>
      <div className={styles.photoBand}>
        <div className={styles.bgWrap}>
          <picture style={{ display: "contents" }}>
            {/* Только портретная мобилка — квадратное фото. В альбомной
                ориентации специально НЕ подключаем его: полоса там низкая
                и широкая, а квадратный кроп при таком растягивании
                непредсказуемо обрезает кадр по бокам (лицо может занять
                почти всю видимую ширину независимо от object-position).
                Вместо этого в landscape просто используется тот же широкий
                десктопный PHOTO_SRC ниже (через <img> — сработает как
                обычный fallback <picture>, раз ни один <source> не подошёл)
                — там кадрирование лица уже подобрано под широкую полосу. */}
            <source media="(max-width: 768px)" srcSet={PHOTO_SRC_MOBILE} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={PHOTO_SRC}
              alt="Portrait"
              loading="lazy"
              decoding="async"
              className={styles.bgPhoto}
            />
          </picture>
        </div>

        <div className={styles.contentWrap}>
          <motion.div
            className={styles.content}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
          >
            <h2 className={styles.label}>{t.about.label}</h2>
            <p className={styles.text}>{t.about.text}</p>
          </motion.div>
        </div>
      </div>

      <motion.div
        className={styles.stats}
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6 }}
      >
        {STATS.map((stat, i) => (
          <div key={i} className={styles.statItem}>
            <span className={styles.statValue}>{stat.value}</span>
            <span className={styles.statLabel}>{stat.label[lang]}</span>
          </div>
        ))}
      </motion.div>

      <motion.div
        className={styles.clients}
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6 }}
      >
        <h3 className={styles.clientsLabel}>{t.about.clientsLabel}</h3>
        <div className={styles.logoRow}>
          {CLIENTS.map((client, i) => (
            <button
              key={i}
              type="button"
              className={`${styles.logoSlot} ${openClient === i ? styles.logoSlotActive : ""}`}
              onClick={() => client.logo && setOpenClient(i)}
              // Пустой логотип (заготовка) кликом не открывается — ставить
              // некуда нечего показывать.
              disabled={!client.logo}
              aria-label={client.logo ? client.name : undefined}
            >
              {client.logo ? (
                // Логотип красится через CSS-маску (а не <img> + filter),
                // потому что только так можно ПЕРЕКРАСИТЬ произвольную
                // картинку (лого может быть SVG или PNG, любого исходного
                // цвета) в конкретный цвет через CSS — обычный filter умеет
                // только обесцвечивать/высветлять, но не заливать нужным
                // оттенком. В покое залит белым (var(--text)), при
                // наведении/когда карточка открыта — оранжевым (var(--accent)).
                <span
                  className={styles.logoImg}
                  style={{ WebkitMaskImage: `url(${client.logo})`, maskImage: `url(${client.logo})` }}
                  role="img"
                  aria-label={client.name}
                />
              ) : (
                <span className={styles.logoPlaceholder}>Logo</span>
              )}
            </button>
          ))}
        </div>
      </motion.div>

      <AnimatePresence>
        {openClient !== null && (
          <motion.div
            className={styles.clientBackdrop}
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(16px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onClick={() => setOpenClient(null)}
          >
            {clickableCount > 1 && (
              <button
                type="button"
                className={`${styles.clientNav} ${styles.clientPrev}`}
                onClick={(e) => {
                  e.stopPropagation();
                  goToClient(-1);
                }}
                aria-label="Previous"
              >
                ‹
              </button>
            )}

            {/* Вложенный AnimatePresence — переключение между клиентами
                свайпом переанимирует только саму карточку (mode="wait"),
                а тёмная подложка остаётся на месте и не мигает заново. */}
            <AnimatePresence mode="wait">
              <motion.div
                key={openClient}
                className={styles.clientCard}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                onClick={(e) => e.stopPropagation()}
                // Свайп/драг для перехода между клиентами — работает и
                // пальцем на телефоне, и мышью на десктопе. Не дотянул до
                // порога — карточка пружинит обратно на место (dragElastic).
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.6}
                onDragEnd={(_e, info) => {
                  if (info.offset.x < -80 || info.velocity.x < -500) goToClient(1);
                  else if (info.offset.x > 80 || info.velocity.x > 500) goToClient(-1);
                }}
              >
                <button
                  type="button"
                  className={styles.clientClose}
                  onClick={() => setOpenClient(null)}
                  aria-label="Close"
                >
                  ✕
                </button>

                <div className={styles.clientInfo}>
                  <div className={styles.clientLogoWrap}>
                    <Image
                      src={CLIENTS[openClient].logo}
                      alt={CLIENTS[openClient].name}
                      fill
                      sizes="120px"
                      className={styles.clientLogoImg}
                    />
                  </div>

                  <h3 className={styles.clientName}>{CLIENTS[openClient].name}</h3>
                  <p className={styles.clientDescription}>{CLIENTS[openClient].description[lang]}</p>
                </div>

                {(() => {
                  // Все проекты, у которых client совпадает с ключом этого
                  // клиента (см. поле client в src/content/projects) —
                  // подтягиваются автоматически, ничего не нужно вручную
                  // перечислять. Порядок — тот же, что в самом списке
                  // проектов. Если для клиента ни один проект не отмечен —
                  // блок просто не рендерится.
                  const relatedProjects = projects.filter((p) => p.client === CLIENTS[openClient].key);

                  if (relatedProjects.length === 0) return null;

                  // 3 или меньше — влезает целиком, показываем как есть,
                  // без стрелок и какой-либо карусели вообще (никогда не
                  // потребуется скроллить/листать).
                  if (relatedProjects.length <= 3) {
                    return (
                      <div className={styles.relatedProjects}>
                        <span className={styles.relatedProjectsLabel}>{t.about.viewProjects}</span>
                        <div className={styles.relatedProjectsRow}>
                          {relatedProjects.map((project) => (
                            <RelatedProjectCard key={project.slug} project={project} lang={lang} />
                          ))}
                        </div>
                      </div>
                    );
                  }

                  // Больше 3 — на десктопе показываем настоящую бесконечную
                  // карусель (индекс по модулю, без видимой границы при
                  // зацикливании — см. RelatedProjectsDesktopCarousel). На
                  // телефоне вместо нее — обычный полный список со свайпом
                  // вверх/вниз (там зацикливание не нужно, там просто
                  // дочитываешь список до конца). Оба варианта в разметке
                  // одновременно, переключаются чисто через CSS
                  // (display:none/flex по медиа-запросу) — без определения
                  // ширины экрана в JS, это исключает любое несовпадение
                  // между сервером и браузером при первой отрисовке.
                  return (
                    <div className={styles.relatedProjects}>
                      <span className={styles.relatedProjectsLabel}>{t.about.viewProjects}</span>

                      <div className={styles.relatedProjectsDesktopOnly}>
                        <RelatedProjectsDesktopCarousel items={relatedProjects} lang={lang} />
                      </div>

                      <div className={styles.relatedProjectsMobileOnly}>
                        <div className={styles.relatedProjectsRow}>
                          {relatedProjects.map((project) => (
                            <RelatedProjectCard key={project.slug} project={project} lang={lang} />
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </motion.div>
            </AnimatePresence>

            {clickableCount > 1 && (
              <button
                type="button"
                className={`${styles.clientNav} ${styles.clientNext}`}
                onClick={(e) => {
                  e.stopPropagation();
                  goToClient(1);
                }}
                aria-label="Next"
              >
                ›
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}