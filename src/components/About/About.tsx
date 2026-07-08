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
// Подойдёт горизонтальное фото хорошего разрешения (минимум ~1920px по ширине) —
// оно растянется на всю ширину экрана, а высота блока считается от ширины
// (как в приветственном блоке), а не подгоняется под рост/пропорции фото.
// Временно используется приветственное фото — замени на своё.
const PHOTO_SRC = "/images/22222.jpg";

// Добавь сюда пути к логотипам компаний, с которыми сотрудничал,
// например "/images/clients/acme.svg". Пустая строка "" рисуется
// как пустая заготовка-плейсхолдер — просто замени её на реальный путь.
const CLIENT_LOGOS: string[] = ["/images/clients/energy.svg", "/images/clients/ss.svg", "/images/clients/telemarket.png", "/images/clients/cheton.svg", ""];

export default function About({ t }: AboutProps) {
  return (
    <section id="about" className={styles.section}>
      <div className={styles.photoBand}>
        <div className={styles.bgWrap}>
          <Image
            src={PHOTO_SRC}
            alt="Portrait"
            fill
            sizes="100vw"
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