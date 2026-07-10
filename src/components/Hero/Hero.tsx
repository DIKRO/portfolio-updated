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

// Вырезка тебя без фона (прозрачный PNG) — фон рисуется через CSS-градиент
// в Hero.module.css (.bgWrap), а не самим фото.
const PHOTO_SRC = "/images/11111-cutout.png";

// Отдельное фото для мобилки — положи файл с таким именем в public/images,
// подхватится само через <picture> ниже, десктопное фото трогать не надо.
const PHOTO_SRC_MOBILE = "/images/11111-mobile.jpg";

export default function Hero({ t }: HeroProps) {
  const scrollTo = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="top" className={styles.hero}>
      <div className={styles.bgWrap}>
        <picture style={{ display: "contents" }}>
          <source media="(max-width: 768px)" srcSet={PHOTO_SRC_MOBILE} />
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