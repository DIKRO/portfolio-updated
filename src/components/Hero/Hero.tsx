"use client";

import { motion } from "framer-motion";
import { StarIcon, PlayIcon } from "@/components/Icons/Icons";
import styles from "./Hero.module.css";

interface HeroProps {
  t: {
    hero: {
      title: string;
      subtitle: string;
      badge: string;
      cta: string;
      ctaSecondary: string;
    };
  };
}

// Используй оригинал фото в /public/images/
const PHOTO_SRC = "/images/11111.jpg";
// Отдельное фото для телефонов (другой кадр/пропорции) — положи файл сюда.
// Рекомендуемый размер: ориентировочно 1600×2000 (портрет).
const PHOTO_SRC_MOBILE = "/images/11111-mobile.jpg";

export default function Hero({ t }: HeroProps) {
  const scrollTo = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="top" className={styles.hero}>
      <div className={styles.bgWrap}>
        <picture>
          {/* На экранах уже 900px (совпадает с брейкпоинтом .hero ниже)
              браузер скачает mobile-версию вместо десктопной. */}
          <source media="(max-width: 900px)" srcSet={PHOTO_SRC_MOBILE} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={PHOTO_SRC}
            alt="Portrait"
            fetchPriority="high"
            loading="eager"
            decoding="async"
            className={styles.bgPhoto}
          />
        </picture>
        <div className={styles.grain} />
      </div>

      <motion.div
        className={styles.content}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <span className={styles.badge}>
          <StarIcon />
          {t.hero.badge}
        </span>

        <h1>{t.hero.title}</h1>
        <p className={styles.subtitle}>{t.hero.subtitle}</p>

        <div className={styles.ctaRow}>
          <a href="#contact" className={styles.cta} onClick={scrollTo("contact")}>
            {t.hero.cta} →
          </a>
          <a href="#work" className={styles.ctaSecondary} onClick={scrollTo("work")}>
            <PlayIcon />
            {t.hero.ctaSecondary}
          </a>
        </div>
      </motion.div>
    </section>
  );
}