"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Lang } from "@/content/lang";
import { reviews, flagEmoji } from "@/content/reviews";
import { QuoteIcon, StarIcon } from "@/components/Icons/Icons";
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
      const grid = gridRef.current;
      if (!grid) return;
      const items = Array.from(grid.children) as HTMLElement[];
      if (items.length === 0) return;

      const computedStyle = window.getComputedStyle(grid);

      // Сетка ещё не стала настоящим CSS Grid в глазах браузера — класс из
      // Reviews.module.css в разметке уже есть, а сами стили применились на
      // кадр позже (бывает при Fast Refresh/HMR или на медленном
      // устройстве/сети). Замерять раскладку в этот момент бессмысленно:
      // подсчёт колонок будет случайным, потому что элементы ещё стоят
      // блочным потоком друг под другом. Раньше это приводило к тому, что
      // вместо целого первого ряда карточек с плашкой на пол-второго ряда
      // оставалась видна едва ли половина одной карточки — высота "видимой
      // без разворачивания" части считалась по одной строке блочного
      // потока, а не по целому ряду сетки. Вместо того чтобы зафиксировать
      // этот неверный замер, просто ждём следующий кадр.
      if (computedStyle.display !== "grid") {
        scheduleMeasure();
        return;
      }

      // Число колонок читаем напрямую из вычисленного grid-template-columns
      // — это уже итог применения стилей и медиа-запросов (3 на десктопе,
      // 2 на планшете, 1 на телефоне), а не эвристика по offsetTop соседних
      // карточек.
      const columns = Math.max(
        1,
        Math.min(
          computedStyle.gridTemplateColumns.split(" ").filter(Boolean).length,
          items.length
        )
      );

      const totalRows = Math.ceil(items.length / columns);
      const full = grid.scrollHeight;

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

    let frame = 0;
    function scheduleMeasure() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    }

    scheduleMeasure();

    // Дополнительные отложенные пере-измерения (не только rAF сразу после
    // монтирования) — подстраховка на случай, если шрифт (Montserrat грузится
    // через next/font) применяется на клиенте на кадр позже, чем успевает
    // отработать первый rAF: тогда самое первое измерение "full" ловит ещё
    // не до конца устаканившуюся высоту карточек (например, до подгрузки
    // шрифта текст переносится по-другому), а без повторного измерения эта
    // заниженная высота остаётся в heights.full навсегда — именно так
    // разворачивание "Показать все" могло обрезать текст карточек, хотя он
    // есть в разметке. document.fonts.ready и два setTimeout перекрывают
    // и шрифты, и любые другие поздние сдвиги раскладки.
    document.fonts?.ready?.then(() => scheduleMeasure());
    const t1 = window.setTimeout(scheduleMeasure, 300);
    const t2 = window.setTimeout(scheduleMeasure, 1000);

    // ВАЖНО: ResizeObserver подписан на КАЖДУЮ карточку по отдельности, а
    // не на сам .grid-контейнер. Причина: как только у контейнера
    // появляется canClip (explicit height + overflow:hidden), его
    // СОБСТВЕННЫЙ размер с точки зрения браузера становится
    // зафиксированным — мы сами его задаём через animate. ResizeObserver на
    // самом контейнере в этом случае просто перестаёт срабатывать на
    // изменения текста внутри (карточка стала выше/ниже из-за переноса
    // строк), потому что снаружи размер .grid не меняется — меняется
    // только то, что физически обрезано внутри него через overflow. Именно
    // поэтому предыдущая версия (только requestAnimationFrame +
    // document.fonts.ready) иногда всё равно ловила неправильную высоту —
    // не хватало триггера на реальные изменения контента уже ПОСЛЕ первого
    // измерения (например, шрифт на мобильном интернете догружается позже,
    // чем успевают отработать оба rAF). Слежка за самими карточками
    // (у которых высоту никто не фиксирует) работает при любых условиях
    // сети и устройства.
    const observer = new ResizeObserver(() => scheduleMeasure());
    Array.from(el.children).forEach((child) => observer.observe(child));

    window.addEventListener("resize", scheduleMeasure);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      observer.disconnect();
      window.removeEventListener("resize", scheduleMeasure);
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
            если количество отзывов в будущем изменится с "много" на "мало".

            В развёрнутом состоянии цель — именно "auto", а не заранее
            измеренный heights.full: Framer Motion умеет анимировать высоту
            и до, и из "auto" самостоятельно, каждый раз заново измеряя
            реальную высоту контента в момент анимации. Если использовать
            свой собственный heights.full (замеренный один раз через
            offsetTop/offsetHeight), при любом рассинхроне с реальной
            высотой карточек (например, из-за более позднего дозагруза
            шрифта) текст и нижняя часть карточек оставались обрезанными
            даже после разворачивания — с "auto" такой класс багов
            исключён в принципе, а не просто залатан лишними
            пере-измерениями выше. */}
        <motion.div
          ref={gridRef}
          className={styles.grid}
          style={canClip ? { overflow: "hidden" } : undefined}
          animate={{ height: canClip ? (expanded ? "auto" : heights!.clip) : "auto" }}
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
              {/* Скруглённый стык в левом верхнем углу — отдельный элемент
                  поверх линий-акцентов (::before/::after в CSS). Сами линии
                  скруглить своим border-radius нельзя красиво: на полоске
                  толщиной 3px радиус в 16px даёт не дугу, а острый срез.
                  Этот элемент — кольцо той же толщины, но с border-radius,
                  который честно повторяет скругление самой карточки, поэтому
                  верхняя и левая линии визуально перетекают одна в другую
                  без обрубленного угла. */}
              <span className={styles.cornerAccent} aria-hidden="true" />

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
                <span className={styles.quoteMark} aria-hidden="true">
                  <QuoteIcon />
                </span>
              </header>

              <p className={styles.text}>{review.text[lang]}</p>

              <div className={styles.footerRow}>
                <span className={styles.bottomLine}>
                  {flagEmoji(review.countryCode)} {review.country[lang]} · {review.year}
                </span>
                {/* Рейтинг не привязан к конкретному отзыву — здесь всегда
                    показываются проекты, которыми доволен клиент (см.
                    комментарий в content/reviews.ts), поэтому пять звёзд
                    рисуются как декоративная деталь, а не как поле данных.
                    Лёгкое свечение усиливается при наведении на карточку —
                    небольшой интерактивный отклик. */}
                <div className={styles.stars} aria-hidden="true">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <StarIcon key={i} />
                  ))}
                </div>
              </div>
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
