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

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;

    function measure() {
      const items = Array.from(el!.children) as HTMLElement[];
      if (items.length === 0) return;

      const firstTop = items[0].offsetTop;
      let columns = 1;
      for (let i = 1; i < items.length; i++) {
        if (Math.abs(items[i].offsetTop - firstTop) < 1) columns++;
        else break;
      }

      const totalRows = Math.ceil(items.length / columns);
      const full = el!.scrollHeight;

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

    // Двойной requestAnimationFrame — на первом кадре браузер может ещё не
    // успеть применить финальные стили (особенно с CSS-модулями), меряем
    // только начиная со второго, когда раскладка точно устоялась.
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(measure);
    });

    // Высота карточек отзывов целиком зависит от переноса текста, а он
    // зависит от того, каким шрифтом текст на момент измерения отрисован.
    // Если измерить до того, как догрузился основной шрифт (Montserrat),
    // браузер в этот момент ещё рисует текст системным шрифтом — обычно с
    // другими метриками и, соответственно, с другим переносом строк. Разница
    // может быть небольшой, но она навсегда "застревает" в heights, потому
    // что раньше измерение запускалось только один раз при монтировании и
    // никогда не пересчитывалось. Именно из-за этого весь блок отзывов
    // выглядел обрезанным до одной строки в каждой карточке даже в
    // развёрнутом виде. Пересчитываем ещё раз, когда шрифты точно готовы.
    if (typeof document !== "undefined" && "fonts" in document) {
      document.fonts.ready.then(measure).catch(() => {});
    }

    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
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
            высотой контейнера. Тут её вообще не бывает false→undefined,
            так как фильтров нет и canClip не переключается туда-обратно —
            но цель всё равно оставлена явной для единообразия и на случай,
            если количество отзывов в будущем изменится с "много" на "мало". */}
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
              <header className={styles.header}>
                <span className={styles.avatar} aria-hidden="true">
                  {initials(review.clientName)}
                </span>
                <div className={styles.identity}>
                  <span className={styles.name}>{review.clientName}</span>
                  {(review.company || review.role) && (
                    <span className={styles.companyRole}>
                      {review.role ? review.role[lang] : null}
                      {review.role && review.company ? " — " : null}
                      {review.company}
                    </span>
                  )}
                </div>
              </header>

              <p className={styles.text}>{review.text[lang]}</p>

              <span className={styles.bottomLine}>
                {review.country[lang]} · {review.year}
              </span>
            </motion.article>
          ))}
        </motion.div>

        {/* Подложка-градиент и кнопка появляются/исчезают плавным fade
            одновременно с тем, как сетка растёт/сжимается — см. подробный
            комментарий у аналогичного места в WorkGrid.tsx. */}
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
