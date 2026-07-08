"use client";

import { useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Lang } from "@/content/lang";
import { Project, CategoryKey } from "@/types/project";
import styles from "./Lightbox.module.css";

interface LightboxProps {
  lang: Lang;
  t: {
    categories: Record<"all" | CategoryKey, string>;
  };
  projects: Project[];
  index: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export default function Lightbox({
  lang,
  t,
  projects,
  index,
  onClose,
  onNavigate,
}: LightboxProps) {
  const project = projects[index];

  const goNext = useCallback(() => {
    onNavigate((index + 1) % projects.length);
  }, [index, projects.length, onNavigate]);

  const goPrev = useCallback(() => {
    onNavigate((index - 1 + projects.length) % projects.length);
  }, [index, projects.length, onNavigate]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose, goNext, goPrev]);

  if (!project) return null;

  return (
    <AnimatePresence>
      <motion.div
        className={styles.backdrop}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={onClose}
      >
        <button className={styles.close} onClick={onClose} aria-label="Close">
          ✕
        </button>

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

        <motion.div
          key={project.id}
          className={styles.content}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={project.cover} alt={project.title[lang]} className={styles.image} />
          <div className={styles.caption}>
            <span className={styles.title}>{project.title[lang]}</span>
            <span className={styles.category}>
              {t.categories[project.categoryKey]} — {project.year}
            </span>
          </div>
        </motion.div>

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
      </motion.div>
    </AnimatePresence>
  );
}
