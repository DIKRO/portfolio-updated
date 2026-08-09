"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import styles from "./FAQ.module.css";

interface FaqItem {
  question: string;
  description: string;
  answer: string;
}

interface FAQProps {
  open: boolean;
  onClose: () => void;
  t: {
    title: string;
    items: FaqItem[];
  };
}

// Модалка FAQ — та же визуальная логика, что и у карточки клиента в
// "Обо мне" (About.tsx): размытая тёмная подложка + всплывающая по
// центру карточка с тем же фирменным стилем (оранжевые акценты,
// var(--surface)/var(--accent)/var(--radius)). Открывается по клику на
// пункт "FAQ" в шапке (см. Header.tsx), сам компонент не знает, откуда
// его открыли — просто получает open/onClose снаружи.
export default function FAQ({ open, onClose, t }: FAQProps) {
  // Блокировка скролла страницы, пока открыта модалка — тот же приём,
  // что и в About.tsx/Lightbox.tsx: фиксируем body на текущей позиции при
  // открытии, а при закрытии мгновенно (без анимации — на html глобально
  // стоит scroll-behavior: smooth, который иначе превратил бы это чисто
  // техническое восстановление позиции в заметный "скролл") возвращаем
  // обратно.
  useEffect(() => {
    if (!open) return;

    const scrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.removeEventListener("keydown", onKeyDown);

      const html = document.documentElement;
      const prevScrollBehavior = html.style.scrollBehavior;
      html.style.scrollBehavior = "auto";
      window.scrollTo(0, scrollY);
      html.style.scrollBehavior = prevScrollBehavior;
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className={styles.backdrop}
          initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
          animate={{ opacity: 1, backdropFilter: "blur(16px)" }}
          exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          onClick={onClose}
        >
          <motion.div
            className={styles.card}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            role="dialog"
            aria-modal="true"
            aria-label={t.title}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.header}>
              <h2 className={styles.title}>{t.title}</h2>
              <button type="button" className={styles.close} onClick={onClose} aria-label="Close">
                ✕
              </button>
            </div>

            <div className={styles.scrollArea}>
              {t.items.map((item) => (
                <div key={item.question} className={styles.item}>
                  <h3 className={styles.question}>{item.question}</h3>
                  <p className={styles.description}>{item.description}</p>
                  <p className={styles.answer}>{item.answer}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
