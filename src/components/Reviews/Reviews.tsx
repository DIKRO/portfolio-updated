"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Lang } from "@/content/lang";
import { reviews } from "@/content/reviews";
import { QuoteIcon, StarIcon } from "@/components/Icons/Icons";
import styles from "./Reviews.module.css";

interface ReviewsProps {
  lang: Lang;
  t: {
    reviews: { label: string; showAll: string; showLess: string };
  };
}

// Раньше высота "видимой без разворачивания" части сетки вычислялась в
// пикселях через JS (offsetTop/offsetHeight карточек) — идея была в том,
// чтобы обрезать ровно на границе ряда. На практике это оказалось слишком
// хрупко: стоило замеру случайно сработать на кадр раньше, чем к сетке
// применились стили (Fast Refresh, медленное устройство/сеть), как высота
// фиксировалась заниженной — и вместо целого первого ряда карточек
// оставалась видна половина одной. Такого не должно случаться в принципе,
// а не просто "реже" — поэтому здесь вообще нет измерения в пикселях.
//
// Вместо этого — обычный CSS max-height с overflow:hidden поверх ЕСТЕСТВЕННО
// отрисованной сетки (все карточки всегда полностью отрендерены, ни одна
// карточка никогда не обрезается посередине текста). Значение подобрано с
// запасом, чтобы гарантированно вмещать самую длинную карточку целиком
// (заголовок + до 6 строк текста + нижняя строка) на любой ширине экрана
// (на мобильном в сетке одна колонка, поэтому "ряд" — это одна карточка;
// сама карточка не становится выше от того, что колонок меньше). Плюс
// градиентная подложка снизу — она визуально "съедает" точную границу
// обрезки, поэтому не обязательно попадать пиксель в пиксель, важно лишь
// не обрезать ряд раньше, чем он закончился.
const COLLAPSED_MAX_HEIGHT = 560;

// Кнопку "Показать все" показываем, если отзывов заведомо больше, чем
// помещается в один ряд на самой широкой раскладке (3 колонки на десктопе).
// На более узких раскладках (планшет/телефон) колонок ещё меньше, поэтому
// это условие остаётся верным и там.
const canClip = reviews.length > 3;

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
  const sectionRef = useRef<HTMLElement>(null);
  const [expanded, setExpanded] = useState(false);

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
        <div
          className={styles.grid}
          style={
            canClip && !expanded
              ? { maxHeight: COLLAPSED_MAX_HEIGHT, overflow: "hidden" }
              : { maxHeight: "none" }
          }
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
              {/* Скруглённый уголок в левом верхнем углу — единая SVG-обводка
                  (верхняя сторона + дуга + левая сторона одной линией), а не
                  отдельные CSS-полоски с closed border-radius: на полоске
                  толщиной 3px border-radius не даёт аккуратной дуги, только
                  острый срез, а предыдущая попытка через mask-composite
                  местами рендерилась сплошным квадратом вместо тонкого
                  кольца. SVG-обводка со stroke-linecap:round не зависит от
                  таких браузерных нюансов и всегда рисуется одной сплошной
                  линией. Сама обводка сплошная (без градиента) — угасание
                  "в никуда" обеспечивают идущие от неё дальше градиентные
                  полоски (::before / ::after в CSS), которые начинаются
                  сразу за пределами этого SVG и подхватывают тот же цвет. */}
              {/* Толщина обводки и полосок задаётся ОДНИМ параметром —
                  переменной --corner-thickness в Reviews.module.css (ищи
                  её в самом верху файла, в блоке .card). Меняешь там — сразу
                  меняется и дуга здесь (stroke-width наследуется от .card
                  через CSS, см. правило ".cornerAccent" в модуле), и обе
                  прямые линии (::before/::after). Единственное, что задано
                  именно тут, в разметке — это геометрия дуги (радиус 14 и
                  сама форма пути), трогать её для регулировки толщины не
                  нужно. */}
              <svg
                className={styles.cornerAccent}
                width="28"
                height="28"
                viewBox="0 0 28 28"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M 28 1 L 15 1 A 14 14 0 0 0 1 15 L 1 28"
                  stroke="var(--accent)"
                  strokeLinecap="round"
                />
              </svg>

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
                  {/* Раньше здесь был эмодзи-флаг (Unicode "regional
                      indicator" символы) — красиво в теории, но
                      Windows и многие Linux-окружения не умеют рисовать
                      составной emoji-флаг и вместо него честно показывают
                      две буквы кода страны подряд ("MD"), что и было видно
                      на скриншоте. Настоящий SVG-флаг с flagcdn.com
                      выглядит одинаково везде и не зависит от того, какие
                      emoji-шрифты стоят у посетителя. Сервис бесплатный,
                      публичный, покрывает все страны по тому же коду ISO
                      3166-1 alpha-2, что уже хранится в countryCode —
                      добавление клиента из любой страны (США, Европа и
                      т.д.) не требует ничего, кроме указания её кода.

                      Обычный <img>, а не next/image: next/image требует
                      заранее разрешить домен flagcdn.com в next.config.ts
                      (images.remotePatterns) — это конфиг уровня всего
                      сервера, а не компонента, и он перечитывается только
                      при (пере)старте dev-сервера. Если .next-кеш от
                      предыдущего запуска не удалить перед стартом, новый
                      конфиг иногда не подхватывается и Next падает с
                      "hostname is not configured" — именно это и
                      произошло. Для маленькой SVG-иконки флага выгода от
                      next/image (ресайз/оптимизация) околонулевая, а вот
                      риск такого падения на ровном месте — вполне
                      реальный, поэтому здесь надёжнее и проще обычный
                      img: работает всегда, без обязательного перезапуска
                      сервера и настроек в конфиге. */}
                  <img
                    className={styles.flag}
                    src={`https://flagcdn.com/${review.countryCode.toLowerCase()}.svg`}
                    alt=""
                    width={18}
                    height={13}
                    loading="lazy"
                  />
                  {review.country[lang]} · {review.year}
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
        </div>

        {/* Подложка-градиент и кнопка — только когда есть что скрывать и
            сейчас свёрнутое состояние. Никакого fade-анимирования по высоте
            контейнера: сама сетка меняет max-height через обычный CSS
            transition (см. .grid в модуле), а этот блок просто появляется
            и исчезает вместе с ней. */}
        {canClip && !expanded && (
          <div className={styles.fade}>
            <button className={styles.showAllButton} onClick={() => setExpanded(true)}>
              {t.reviews.showAll} →
            </button>
          </div>
        )}
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
