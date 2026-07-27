"use client";

import { useEffect, useCallback, useState } from "react";
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

  const goNext = useCallback(() => {
    setDirection(1);
    onNavigate((index + 1) % total);
  }, [index, total, onNavigate]);

  const goPrev = useCallback(() => {
    setDirection(-1);
    onNavigate((index - 1 + total) % total);
  }, [index, total, onNavigate]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    document.addEventListener("keydown", onKeyDown);

    const scrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      window.scrollTo(0, scrollY);
    };
  }, [onClose, goNext, goPrev]);

  if (total === 0) return null;

  const src = images[index];

  return (
    <AnimatePresence>
      <motion.div
        className={styles.backdrop}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
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
    </AnimatePresence>
  );
}
