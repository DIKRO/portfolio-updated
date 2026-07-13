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

  // При заходе в конкретный проект и возврате назад Next.js иногда
  // переиспользует уже отрисованную версию этой страницы из своего
  // клиентского кэша, а не пересоздаёт компонент с нуля — из-за этого
  // эффект на монтирование может просто не сработать повторно. Поэтому
  // читаем sessionStorage прямо при инициализации состояния (тело
  // компонента выполняется заново при каждом рендере в любом случае),
  // а не только один раз в useEffect на mount.
  const [expanded, setExpanded] = useState(() => {
    if (typeof window === "undefined") return false; // на сервере sessionStorage нет
    return sessionStorage.getItem("workGridExpanded") === "1";
  });
  const gridRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [heights, setHeights] = useState<{ clip: number; full: number } | null>(null);

  useEffect(() => {
    sessionStorage.setItem("workGridExpanded", expanded ? "1" : "0");
  }, [expanded]);

  const collapse = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.blur();
    // Важен порядок: сначала долистываем к началу секции (пока грид ещё
    // полной высоты — ничего не схлопывается, скроллу ничего не мешает),
    // и только когда страница уже встала на место, запускаем схлопывание.
    // Если делать это одновременно — пока высота грида на лету уменьшается
    // CSS-переходом (0.8s), браузер за это же время постоянно урезает
    // максимально доступный скролл под ещё-уменьшающуюся высоту страницы,
    // и текущую позицию резко тянет вниз, к футеру, пока наш scrollIntoView
    // это не перебьёт — отсюда и рывок.
    sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => setExpanded(false), 400);
  };

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
    <section id="work" ref={sectionRef} className={styles.section}>
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
          <button className={styles.showLessButton} onClick={collapse}>
            {t.work.showLess}
          </button>
        </div>
      )}
    </section>
  );
}
