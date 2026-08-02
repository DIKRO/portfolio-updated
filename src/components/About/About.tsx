"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { LocalizedText } from "@/types/project";
import { Lang } from "@/content/lang";
import styles from "./About.module.css";

interface AboutProps {
  lang: Lang;
  t: {
    about: { label: string; text: string; clientsLabel: string };
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
  },
  {
    logo: "/images/clients/ss.svg",
    name: "Sport Spirit",
    description: {
      ru: "Опиши здесь, что именно делал для Sport Spirit.",
      en: "Describe what you did for Sport Spirit here.",
      ro: "Descrie aici ce ai făcut pentru Sport Spirit.",
    },
  },
  {
    logo: "/images/clients/puma.svg",
    name: "PUMA",
    description: {
      ru: "Опиши здесь, что именно делал для PUMA.",
      en: "Describe what you did for PUMA here.",
      ro: "Descrie aici ce ai făcut pentru PUMA.",
    },
  },
  {
    logo: "/images/clients/telemarket.png",
    name: "Telemarket.md",
    description: {
      ru: "Опиши здесь, что именно делал для Telemarket.md.",
      en: "Describe what you did for Telemarket.md here.",
      ro: "Descrie aici ce ai făcut pentru Telemarket.md.",
    },
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
  },
];

export default function About({ lang, t }: AboutProps) {
  // Индекс открытой карточки клиента (null — ничего не открыто). По клику
  // на логотип показывается модалка с описанием на текущем языке сайта.
  const [openClient, setOpenClient] = useState<number | null>(null);

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
  }, [openClient]);

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