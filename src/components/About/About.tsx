"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import styles from "./About.module.css";

interface AboutProps {
  t: {
    about: { label: string; text: string; clientsLabel: string };
  };
}

// Вырезка тебя без фона (прозрачный PNG) — фон рисуется через CSS-градиент
// в About.module.css (.bgWrap). Отдельное фото для мобилки больше не нужно.
const PHOTO_SRC = "/images/22222-cutout.png";

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

export default function About({ t }: AboutProps) {
  return (
    <section id="about" className={styles.section}>
      <div className={styles.photoBand}>
        <div className={styles.bgWrap}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={PHOTO_SRC}
            alt="Portrait"
            loading="lazy"
            decoding="async"
            className={styles.bgPhoto}
          />
          <div className={styles.grain} />
        </div>

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