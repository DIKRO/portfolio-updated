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

// Раньше <img> в лайтбоксе указывал прямо на файл в public/images — то есть
// при открытии "посмотреть в полном размере" посетитель скачивал исходник
// как есть (у части фото это десятки мегабайт), без сжатия и конвертации в
// современный формат. Сетка превью (WorkGrid/ProjectView) уже идёт через
// next/image и этой проблемы не имеет — а лайтбокс рисуется обычным <img>
// из-за drag/свайпа между фото, поэтому здесь обращаемся к тому же
// встроенному эндпоинту оптимизации Next.js напрямую (тот же приём, что и
// в Hero/About.tsx для art-direction картинок).
function optimizedSrc(path: string, width: number, quality = 90): string {
  return `/_next/image?url=${encodeURIComponent(path)}&w=${width}&q=${quality}`;
}

// Оптимизатор Next.js генерирует и кэширует картинку под конкретную ширину
// только из этого списка (deviceSizes по умолчанию) — поэтому здесь берём
// ближайшее БОЛЬШЕЕ значение под реальный экран посетителя (с учётом
// плотности пикселей), а не произвольное число. Так лайтбокс переиспользует
// уже закэшированный на CDN вариант, если кто-то до этого открывал ту же
// фотографию на экране похожего размера.
const DEVICE_SIZES = [640, 750, 828, 1080, 1200, 1920, 2048, 3840];

function pickWidth(viewportWidth: number, dpr: number): number {
  const target = viewportWidth * dpr;
  return DEVICE_SIZES.find((size) => size >= target) ?? DEVICE_SIZES[DEVICE_SIZES.length - 1];
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

  // Ширина под конкретный экран посетителя — пересчитывается один раз при
  // открытии и при изменении размера окна (поворот телефона и т.п.).
  // 1920 по умолчанию — разумное значение на случай самого первого рендера
  // до того, как эффект ниже успел измерить реальный viewport.
  const [imgWidth, setImgWidth] = useState(1920);
  useEffect(() => {
    const update = () => setImgWidth(pickWidth(window.innerWidth, window.devicePixelRatio || 1));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

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
            src={optimizedSrc(src, imgWidth, 90)}
            alt={alt}
            className={styles.image}
            custom={direction}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            // Свайп/драг для перелистывания — актуально в первую очередь на
            // телефоне (палец), но точно так же работает мышью на десктопе.
            // dragElastic тянет картинку за курсором/пальцем, а если отпустили,
            // не дотянув до порога — плавно пружинит обратно на место.
            drag={total > 1 ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.7}
            onDragEnd={(_e, info) => {
              const { offset, velocity } = info;
              if (offset.x < -80 || velocity.x < -500) {
                goNext();
              } else if (offset.x > 80 || velocity.x > 500) {
                goPrev();
              }
            }}
            // Blur-up: пока полноразмерное фото ещё грузится по сети, оно
            // показывается смазанным, и резко проявляется в момент полной
            // загрузки — без этого на медленном интернете можно на секунду
            // увидеть пустое/битое место вместо картинки.
            onLoad={(e) => e.currentTarget.classList.add(styles.loaded)}
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
