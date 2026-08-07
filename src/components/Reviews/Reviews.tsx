"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Lang } from "@/content/lang";
import { reviews } from "@/content/reviews";
import styles from "./Reviews.module.css";

interface ReviewsProps {
  lang: Lang;
  t: {
    reviews: { label: string; showAll: string; showLess: string };
  };
}

// Сколько рядов отзывов видно без разворачивания — та же логика обрезки,
// что и в сетке работ (WorkGrid), только на 1 ряд вместо 2: карточки
// отзывов компактнее, двух рядов сразу для "затравки" много.
const VISIBLE_ROWS = 1;

// Инициалы клиента для круглого "аватара" в подписи — фото клиентов
// собирать не нужно (не все готовы их присылать), инициалы на фирменном
// оранжевом фоне работают всегда и выглядят единообразно во всей сетке.
function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default function Reviews({ lang, t }: ReviewsProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [heights, setHeights] = useState<{ clip: number; full: number } | null>(null);
  const [expanded, setExpanded] = useState(false);

  // Замеряем реальную высоту первого ряда карточек (а не примерную vh),
  // чтобы обрезка всегда приходилась на 40% высоты 2-го ряда (видно 40%,
  // 60% тонет в фоне) — независимо от того, сколько колонок сейчас в сетке
  // (3 на десктопе, 2 на планшете, 1 на телефоне) и сколько там строк
  // текста у конкретных отзывов.
  useEffect(() => {
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

      const cutRowIndex = columns * VISIBLE_ROWS;
      const cutItem = items[cutRowIndex];
      if (!cutItem) {
        setHeights({ clip: full, full });
        return;
      }

      setHeights({ clip: cutItem.offsetTop + cutItem.offsetHeight * 0.4, full });
    }

    const raf = requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
    };
  }, []);

  const canClip = heights !== null && heights.clip < heights.full - 1;

  const collapse = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.blur();
    // Тот же порядок, что и в WorkGrid: сначала долистываем к началу
    // секции, пока сетка ещё полной высоты, и только потом схлопываем —
    // иначе скролл дёргает к футеру, пока высота уменьшается под ногами.
    sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => setExpanded(false), 400);
  };

  return (
    <section id="reviews" ref={sectionRef} className={styles.section}>
      <h2 className={styles.label}>{t.reviews.label}</h2>

      <div className={styles.gridWrap}>
        {/* animate.height всегда получает явную цель (число или "auto") —
            см. подробный комментарий в WorkGrid.tsx про баг с "залипающей"
            высотой контейнера, когда canClip переключается в false. */}
        <motion.div
          ref={gridRef}
          className={styles.grid}
          style={canClip ? { overflow: "hidden" } : undefined}
          animate={{ height: canClip ? (expanded ? heights!.full : heights!.clip) : "auto" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          {reviews.map((review, index) => (
            <motion.article
              key={review.id}
              className={styles.card}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: (index % 3) * 0.08 }}
            >
              <p className={styles.text}>{review.text[lang]}</p>

              <footer className={styles.footer}>
                <span className={styles.avatar} aria-hidden="true">
                  {initials(review.clientName)}
                </span>
                <div className={styles.meta}>
                  <span className={styles.name}>{review.clientName}</span>
                  {(review.company || review.role) && (
                    <span className={styles.companyRole}>
                      {review.role ? review.role[lang] : null}
                      {review.role && review.company ? " — " : null}
                      {review.company}
                    </span>
                  )}
                  <span className={styles.bottomLine}>
                    {review.country[lang]} · {review.year}
                  </span>
                </div>
              </footer>
            </motion.article>
          ))}
        </motion.div>

        {/* Подложка-градиент и кнопка "показать все" — та же анимация
            появления/исчезновения, что и в WorkGrid (см. комментарий там же
            про синхронизацию с ростом/сжатием сетки). */}
        <AnimatePresence>
          {canClip && !expanded && (
            <motion.div
              className={styles.fade}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <button className={styles.showAllButton} onClick={() => setExpanded(true)}>
                {t.reviews.showAll} →
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {canClip && expanded && (
        <div className={styles.collapseRow}>
          <button className={styles.showLessButton} onClick={collapse}>
            {t.reviews.showLess}
          </button>
        </div>
      )}
    </section>
  );
}
