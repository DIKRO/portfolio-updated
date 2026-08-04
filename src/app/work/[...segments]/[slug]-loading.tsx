"use client";

import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import { en } from "@/content/locales/en";
import styles from "./loading.module.css";

// Next.js подхватывает этот файл автоматически: показывается сам, пока
// грузится страница конкретного проекта (переход по ссылке с карточки,
// либо кнопка "Следующий проект"). Шапку рендерим настоящим компонентом
// Header (а не отдельной заглушкой) — она не зависит ни от каких данных
// проекта, поэтому просто продолжает работать как обычно, и при переходе
// не возникает "мигания" — шапка остаётся на месте, меняется только
// содержимое под ней.
export default function Loading() {
  return (
    <main>
      <Header lang="en" setLang={() => {}} t={en} />

      <div className={styles.page}>
        <div className={styles.topRow}>
          <div className={`${styles.skeleton} ${styles.link}`} />
          <div className={`${styles.skeleton} ${styles.link}`} />
        </div>

        <div className={`${styles.skeleton} ${styles.title}`} />
        <div className={`${styles.skeleton} ${styles.metaLine}`} />

        <div className={`${styles.skeleton} ${styles.descLine}`} />
        <div className={`${styles.skeleton} ${styles.descLine}`} style={{ width: "85%" }} />
        <div className={`${styles.skeleton} ${styles.descLine}`} style={{ width: "60%", marginBottom: 56 }} />

        <div className={styles.gallery}>
          <div className={`${styles.skeleton} ${styles.block}`} />
          <div className={styles.pairRow}>
            <div className={`${styles.skeleton} ${styles.blockHalf}`} />
            <div className={`${styles.skeleton} ${styles.blockHalf}`} />
          </div>
          <div className={`${styles.skeleton} ${styles.block}`} />
        </div>
      </div>

      <Footer />
    </main>
  );
}
