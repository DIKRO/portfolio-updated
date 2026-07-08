"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Lang } from "@/content/lang";
import { projects } from "@/content/projects";
import { CategoryKey } from "@/types/project";
import styles from "./WorkGrid.module.css";

type FilterKey = "all" | CategoryKey;

interface WorkGridProps {
  lang: Lang;
  t: {
    work: { showAll: string; showLess: string };
    categories: Record<FilterKey, string>;
  };
}

const VISIBLE_ROWS = 2;

export default function WorkGrid({ lang, t }: WorkGridProps) {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [expanded, setExpanded] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const [heights, setHeights] = useState<{ clip: number; full: number } | null>(null);

  const selectFilter = (key: FilterKey) => {
    setFilter(key);
    setExpanded(false);
  };

  // Показываем только те фильтры, для которых реально есть работы,
  // в порядке первого появления в данных.
  const availableFilters = useMemo<FilterKey[]>(() => {
    const keys: FilterKey[] = ["all"];
    for (const project of projects) {
      if (!keys.includes(project.categoryKey)) keys.push(project.categoryKey);
    }
    return keys;
  }, []);

  const filtered =
    filter === "all" ? projects : projects.filter((p) => p.categoryKey === filter);

  const isAll = filter === "all";

  // Замеряем реальную высоту строк сетки (а не примерную vh), чтобы обрезка
  // всегда приходилась на 40% высоты 3-го ряда (видно 40%, 60% тонет в фоне),
  // независимо от того, сколько колонок сейчас в сетке (3 на десктопе, 2 на планшете, 1 на телефоне).
  useEffect(() => {
    if (!isAll) return;

    function measure() {
      const el = gridRef.current;
      if (!el) return;
      const items = Array.from(el.children) as HTMLElement[];
      if (items.length === 0) return;

      const firstTop = items[0].offsetTop;
      let columns = 1;
      for (let i = 1; i < items.length; i++) {
        if (Math.abs(items[i].offsetTop - firstTop) < 1) columns++;
        else break;
      }

      const totalRows = Math.ceil(items.length / columns);
      const full = el.scrollHeight;

      if (totalRows <= VISIBLE_ROWS) {
        setHeights({ clip: full, full });
        return;
      }

      const cutRowIndex = columns * VISIBLE_ROWS; // первый элемент обрезаемого ряда
      const cutItem = items[cutRowIndex];
      if (!cutItem) {
        setHeights({ clip: full, full });
        return;
      }

      // Третий ряд должен на 60% "утопать" в фон — обрезаем на уровне
      // 40% его высоты, оставшиеся 60% скрываются под градиентом-фейдом.
      setHeights({ clip: cutItem.offsetTop + cutItem.offsetHeight * 0.4, full });
    }

    const raf = requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
    };
  }, [isAll, filtered.length]);

  const canClip = isAll && heights !== null && heights.clip < heights.full - 1;

  return (
    <section id="work" className={styles.section}>
      <div className={styles.filters}>
        {availableFilters.map((key) => (
          <button
            key={key}
            className={key === filter ? styles.filterActive : styles.filter}
            onClick={() => selectFilter(key)}
          >
            {t.categories[key]}
          </button>
        ))}
      </div>

      <div className={styles.gridWrap}>
        <div
          ref={gridRef}
          className={styles.grid}
          style={
            canClip
              ? {
                  height: expanded ? heights!.full : heights!.clip,
                  overflow: "hidden",
                  transition: "height 0.8s cubic-bezier(0.22, 1, 0.36, 1)",
                }
              : undefined
          }
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((project, index) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, delay: (index % 3) * 0.05 }}
              >
                <Link href={`/work/${project.slug}`} className={styles.card}>
                  <div className={styles.imageWrap}>
                    <Image
                      src={project.cover}
                      alt={project.title[lang]}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className={styles.image}
                    />
                  </div>

                  <div className={styles.meta}>
                    <span className={styles.title}>{project.title[lang]}</span>
                    <span className={styles.category}>
                      {t.categories[project.categoryKey]} — {project.year}
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {canClip && !expanded && (
          <div className={styles.fade}>
            <button className={styles.showAllButton} onClick={() => setExpanded(true)}>
              {t.work.showAll} →
            </button>
          </div>
        )}
      </div>

      {canClip && expanded && (
        <div className={styles.collapseRow}>
          <button className={styles.showLessButton} onClick={() => setExpanded(false)}>
            {t.work.showLess}
          </button>
        </div>
      )}
    </section>
  );
}
