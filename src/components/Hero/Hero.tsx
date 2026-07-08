"use client";

import { motion } from "framer-motion";
import Image from "next/image";
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

// Замени на своё фото: положи файл в /public/images/ и обнови путь.
// Подойдёт горизонтальное фото хорошего разрешения (минимум ~1600px по ширине) —
// оно растянется на всю ширину и высоту блока, от шапки до галереи.
const PHOTO_SRC = "/images/1.jpg";

export default function Hero({ t }: HeroProps) {
  const scrollTo = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="top" className={styles.hero}>
      <div className={styles.bgWrap}>
        <Image
          src={PHOTO_SRC}
          alt="Portrait"
          fill
          priority
          sizes="100vw"
          className={styles.bgPhoto}
        />
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