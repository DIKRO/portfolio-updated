"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import styles from "./About.module.css";

interface AboutProps {
  t: {
    about: { label: string; text: string; clientsLabel: string };
  };
}

// Замени на своё фото: положи файл в /public/images/ и обнови путь.
const PHOTO_SRC = "/images/22222.jpg";
const PHOTO_SRC_MOBILE = "/images/22222-mobile.jpg";
const CLIENT_LOGOS: string[] = [
  "/images/clients/energy.svg",
  "/images/clients/ss.svg",
  "/images/clients/puma.svg",
  "/images/clients/cheton.svg",
  "/images/clients/stip.svg",
  "/images/clients/telemarket.png"
];

export default function About({ t }: AboutProps) {
  return (
    <section id="about" className={styles.section}>
      <div className={styles.photoBand}>
        <div className={styles.bgWrap}>
          <picture>
            {/* Брейкпоинт совпадает с @media (max-width: 768px) в About.module.css */}
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