"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import styles from "./Lightbox.module.css";

interface GalleryLightboxProps {
  images: string[];
  index: number;
  alt: string;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export default function GalleryLightbox({
  images,
  index,
  alt,
  onClose,
  onNavigate,
}: GalleryLightboxProps) {
  const [direction, setDirection] = useState(0);
  const total = images.length;

  // index/total дублируем в ref, чтобы goNext/goPrev не пересоздавались
  // при каждой навигации — это важно для эффекта блокировки скролла ниже.
  const indexRef = useRef(index);
  const totalRef = useRef(total);
  useEffect(() => {
    indexRef.current = index;
    totalRef.current = total;
  }, [index, total]);

  const goNext = useCallback(() => {
    setDirection(1);
    onNavigate((indexRef.current + 1) % totalRef.current);
  }, [onNavigate]);

  const goPrev = useCallback(() => {
    setDirection(-1);
    onNavigate((indexRef.current - 1 + totalRef.current) % totalRef.current);
  }, [onNavigate]);

  // Блокировка скролла страницы: включается РОВНО ОДИН РАЗ при открытии
  // лайтбокса (пустой массив зависимостей) и снимается РОВНО ОДИН РАЗ при
  // закрытии. Раньше это было в одном эффекте с обработчиком клавиатуры,
  // который пересоздавался при каждом переключении фото — из-за этого
  // scrollY то и дело пересчитывался заново, и при закрытии восстанавливалась
  // не исходная позиция страницы, а сбитая (выглядело как "скролл с начала").
  useEffect(() => {
    const scrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";

    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";

      // На html глобально стоит scroll-behavior: smooth (плавный скролл по
      // якорям меню) — из-за этого браузер анимировал даже это чисто
      // техническое восстановление позиции страницы, и выглядело так, будто
      // при закрытии фото происходит "скролл к нему". Позиция здесь не
      // должна ни капли анимироваться — просто мгновенно встать туда же,
      // где страница была до открытия. Поэтому на время вызова принудительно
      // отключаем плавность, а затем возвращаем как было.
      const html = document.documentElement;
      const prevScrollBehavior = html.style.scrollBehavior;
      html.style.scrollBehavior = "auto";
      window.scrollTo(0, scrollY);
      html.style.scrollBehavior = prevScrollBehavior;
    };
  }, []);

  // Навигация с клавиатуры — отдельным эффектом, спокойно пересоздаётся
  // при каждом переключении фото, скролла не касается.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose, goNext, goPrev]);

  if (total === 0) return null;

  const src = images[index];

  return (
    <motion.div
      className={styles.backdrop}
      initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
      animate={{ opacity: 1, backdropFilter: "blur(20px)" }}
      exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      onClick={onClose}
    >
      <button className={styles.close} onClick={onClose} aria-label="Close">
        ✕
      </button>

      {total > 1 && (
        <span className={styles.counter}>
          {index + 1} / {total}
        </span>
      )}

      {total > 1 && (
        <button
          className={`${styles.nav} ${styles.prev}`}
          onClick={(e) => {
            e.stopPropagation();
            goPrev();
          }}
          aria-label="Previous"
        >
          ‹
        </button>
      )}

      <div className={styles.stage} onClick={(e) => e.stopPropagation()}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.img
            key={src}
            src={src}
            alt={alt}
            className={styles.image}
            custom={direction}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          />
        </AnimatePresence>
      </div>

      {total > 1 && (
        <button
          className={`${styles.nav} ${styles.next}`}
          onClick={(e) => {
            e.stopPropagation();
            goNext();
          }}
          aria-label="Next"
        >
          ›
        </button>
      )}
    </motion.div>
  );
}
