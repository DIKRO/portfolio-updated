"use client";

import { useEffect, useState } from "react";
import styles from "./ScrollToTop.module.css";

// Рендерится один раз в корневом layout — работает одинаково на всех
// страницах (главная и любой проект), без привязки к конкретному компоненту.
export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Появляется примерно после "пары экранов" вниз — порог завязан на
    // высоту вьюпорта, а не на фиксированный пиксельный отступ, чтобы
    // одинаково ощущалось и на телефоне, и на большом десктопном экране.
    const update = () => setVisible(window.scrollY > window.innerHeight * 1.5);
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <button
      type="button"
      className={`${styles.button} ${visible ? styles.visible : ""}`}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Наверх"
      tabIndex={visible ? 0 : -1}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 19V5M5 12l7-7 7 7" />
      </svg>
    </button>
  );
}
