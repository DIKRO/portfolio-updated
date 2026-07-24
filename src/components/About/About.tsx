"use client";

import { motion } from "framer-motion";
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
    value: "5+",
    label: {
      ru: "Лет опыта",
      en: "Years of experience",
      ro: "Ani de experiență",
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
const PHOTO_SRC_MOBILE = "/images/22222-cutout-mobile.png";

// Добавь сюда пути к логотипам компаний, с которыми сотрудничал,
// например "/images/clients/acme.svg". Пустая строка "" рисуется
// как пустая заготовка-плейсхолдер — просто замени её на реальный путь.
const CLIENT_LOGOS: string[] = [
  "/images/clients/energy.svg",
  "/images/clients/ss.svg",
  "/images/clients/puma.svg",
  "/images/clients/telemarket.png",
  "/images/clients/cheton.svg",
  "/images/clients/stip.svg"];

export default function About({ lang, t }: AboutProps) {
  return (
    <section id="about" className={styles.section}>
      <div className={styles.photoBand}>
        <div className={styles.bgWrap}>
          <picture style={{ display: "contents" }}>
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
          {CLIENT_LOGOS.map((src, i) => (
            <div key={i} className={styles.logoSlot}>
              {src ? (
                <Image
                  src={src}
                  alt="Client logo"
                  fill
                  sizes="140px"
                  className={styles.logoImg}
                />
              ) : (
                <span className={styles.logoPlaceholder}>Logo</span>
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}