"use client";

import { motion } from "framer-motion";
import { Lang } from "@/content/lang";
import { reviews } from "@/content/reviews";
import { QuoteIcon, StarIcon } from "@/components/Icons/Icons";
import styles from "./Reviews.module.css";

interface ReviewsProps {
  lang: Lang;
  t: {
    reviews: { label: string; title: string; subtitle: string };
  };
}

// Инициалы клиента для круглого "аватара" в подписи — фото клиентов
// собирать не нужно (не все готовы их присылать), инициалы на фирменном
// оранжевом фоне работают всегда и выглядят единообразно во всей сетке.
function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default function Reviews({ lang, t }: ReviewsProps) {
  return (
    <section id="reviews" className={styles.section}>
      <motion.div
        className={styles.head}
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
      >
        <span className={styles.label}>{t.reviews.label}</span>
        <h2 className={styles.title}>{t.reviews.title}</h2>
        <p className={styles.subtitle}>{t.reviews.subtitle}</p>
      </motion.div>

      <div className={styles.grid}>
        {reviews.map((review, index) => (
          <motion.article
            key={review.id}
            className={styles.card}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: (index % 3) * 0.08 }}
          >
            <div className={styles.quoteMark} aria-hidden="true">
              <QuoteIcon />
            </div>

            {!!review.rating && (
              <div className={styles.stars} aria-label={`${review.rating}/5`}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <span
                    key={i}
                    className={i < review.rating! ? styles.starFilled : styles.starEmpty}
                  >
                    <StarIcon />
                  </span>
                ))}
              </div>
            )}

            <p className={styles.text}>{review.text[lang]}</p>

            <footer className={styles.footer}>
              <span className={styles.avatar} aria-hidden="true">
                {initials(review.clientName)}
              </span>
              <div className={styles.meta}>
                <span className={styles.name}>{review.clientName}</span>
                {(review.company || review.role) && (
                  <span className={styles.companyRole}>
                    {review.role ? review.role[lang] : null}
                    {review.role && review.company ? " — " : null}
                    {review.company}
                  </span>
                )}
                <span className={styles.bottomLine}>
                  {review.country[lang]} · {review.year}
                </span>
              </div>
            </footer>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
