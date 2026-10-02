"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useLang } from "@/content/lang";
import { Project, CategoryKey } from "@/types/project";
import { GalleryRow } from "@/lib/imageOrientation";
import { shimmerBlurDataURL } from "@/lib/shimmer";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import { EmailIcon, ExpandIcon } from "@/components/Icons/Icons";
import { SOCIALS } from "@/content/socials";
import styles from "./ProjectView.module.css";
import type { LightboxMedia } from "@/components/Work/Lightbox";


// Для видео в галерее постер не задаём: браузер сам показывает первый кадр.
// Фрагмент #t=0.001 нужен, чтобы Safari/iOS при preload="metadata"
// действительно отрисовал кадр, а не чёрный прямоугольник.
const withFirstFrame = (url: string) => (url.includes("#") ? url : `${url}#t=0.001`);

// Лайтбокс нужен только после клика по фото в галерее — до этого момента
// незачем грузить его JS вообще. ssr: false — это чисто клиентский модал
// (клавиатурная навигация, скролл-блокировка), серверный рендер ему не
// нужен и не помогает SEO.
const GalleryLightbox = dynamic(() => import("../Work/Lightbox"), { ssr: false });

interface ProjectViewProps {
  project: Project;
  galleryRows: GalleryRow[];
  nextProject: Project;
  // Категория, внутри которой сейчас листаются проекты (undefined — режим
  // "Все", листаем по общему списку). Прокидывается дальше в ссылку
  // "Следующий проект", чтобы цепочка переходов оставалась внутри той же
  // категории и на следующей странице тоже.
  category?: CategoryKey;
  // false, если в подборке (общей или внутри category) всего один проект —
  // тогда "Следующий проект" вёл бы сам на себя, ссылку в этом случае
  // просто не показываем.
  hasMultipleProjects: boolean;
}

export default function ProjectView({
  project,
  galleryRows,
  nextProject,
  category,
  hasMultipleProjects,
}: ProjectViewProps) {
  const { lang, setLang, t } = useLang();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const nextProjectHref = category
    ? `/work/${category}/${nextProject.slug}`
    : `/work/${nextProject.slug}`;

  // Страница проекта должна всегда открываться сверху (с заголовка и
  // описания), а не там, где предыдущая страница была прокручена. Обычно
  // об этом заботится сам Next.js при переходе по ссылке, но если ссылка
  // на проект была нажата ИЗ открытого модального окна (карточка клиента
  // в "Обо мне" или лайтбокс фото в галерее — см. About.tsx/Lightbox.tsx),
  // при закрытии того окна восстанавливается позиция скролла СТАРОЙ
  // страницы, причём это может случиться уже после того, как эта, новая,
  // страница отрисовалась — и тогда именно эта, чужая, позиция "перебивает"
  // нормальный переход наверх. Явный scrollTo(0, 0) при каждом заходе на
  // страницу проекта (в том числе при переходе "Следующий проект" между
  // двумя такими страницами, поэтому — зависимость от project.slug, а не
  // пустой массив) гарантированно решает это независимо от того, что там
  // творится на предыдущей странице.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [project.slug]);

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  // Видео прямо в галерее играет своими нативными controls независимо от
  // лайтбокса (см. .videoGalleryWrap ниже) — если открыть лайтбокс на
  // СОСЕДНЕМ фото, пока это видео уже включено, оно продолжало играть
  // (и звучать) прямо под затемнённым/размытым фоном модалки, невидимо для
  // глаз, но вполне себе слышимо и нагружающе. При открытии лайтбокса
  // ставим на паузу все видео галереи разом — Map, а не просто массив
  // ref-ов, потому что коллбэк-реф у React вызывается заново на каждый
  // ре-рендер (пересоздание инлайн-функции), а Map с ключом по media.key
  // просто перезаписывает ту же запись вместо накопления дублей.
  const galleryVideoRefs = useRef(new Map<string, HTMLVideoElement>());
  const registerGalleryVideo = (key: string) => (el: HTMLVideoElement | null) => {
    if (el) galleryVideoRefs.current.set(key, el);
    else galleryVideoRefs.current.delete(key);
  };

  useEffect(() => {
    if (lightboxIndex !== null) {
      galleryVideoRefs.current.forEach((v) => v.pause());
    }
  }, [lightboxIndex]);

  // Плоский список ВСЕХ элементов галереи в порядке отображения — и фото,
  // и видео (раньше видео сюда не попадало вообще: у него, мол, уже есть
  // свой плеер с полноэкранным режимом через нативные controls, отдельно
  // листать в лайтбоксе незачем. На практике же это значило, что счётчик
  // "3 / 9" в лайтбоксе считал только фото, а загруженное видео как будто
  // не существовало для детального просмотра кейса — теперь считаем и его).
  // Видео при этом остаётся играбельным ПРЯМО в галерее как раньше (со
  // своими controls) — в лайтбокс из него можно попасть отдельной кнопкой
  // "развернуть" в углу (см. её ниже, в JSX), чтобы не спорить с попыткой
  // просто нажать play или потянуть за шкалу перемотки. rowIndices[i][j] —
  // flat-индекс j-го элемента i-й строки для лайтбокса.
  const { flatMedia, rowIndices } = useMemo(() => {
    const list: LightboxMedia[] = [];
    const indices: number[][] = [];

    for (const row of galleryRows) {
      if (row.type === "pair") {
        indices.push(
          row.items.map((item) => {
            if (item.kind === "video") {
              list.push({ kind: "video", src: (item.item as { video: string }).video });
            } else {
              list.push({ kind: "image", src: item.item as string });
            }
            return list.length - 1;
          })
        );
      } else {
        if (row.kind === "video") {
          list.push({ kind: "video", src: (row.item as { video: string }).video });
        } else {
          list.push({ kind: "image", src: row.item as string });
        }
        indices.push([list.length - 1]);
      }
    }

    return { flatMedia: list, rowIndices: indices };
  }, [galleryRows]);

  return (
    <main>
      <Header lang={lang} setLang={setLang} t={t} />

      <motion.article
        key={lang}
        className={styles.page}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
      >
        <div className={styles.topRow}>
          <Link href="/#work" className={styles.back}>
            {t.project.back}
          </Link>

          {hasMultipleProjects && (
            <Link href={nextProjectHref} className={styles.next}>
              {t.project.next} →
            </Link>
          )}
        </div>

        <motion.header
          className={styles.head}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1>{project.title[lang]}</h1>
          <span className={styles.meta}>
            <span className={styles.categoryYear}>
              {t.categories[project.categoryKey]} — {project.year}
            </span>
            {project.context && <span className={styles.contextLabel}>{project.context[lang]}</span>}
          </span>
        </motion.header>

        <motion.p
          className={styles.description}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {project.description[lang]}
        </motion.p>

        {project.video && (
          <motion.div
            className={styles.videoWrap}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
          >
            {/* preload="metadata" — грузим только размеры/превью-кадр
                сразу, а сам файл целиком только когда посетитель реально
                нажмёт play. poster — кадр из cover проекта, чтобы до
                нажатия play страница не выглядела пустым прямоугольником.
                controls — обычный плеер браузера. Никаких width/height не
                задаём намеренно — .video ниже сам подстраивается под
                РЕАЛЬНЫЕ пропорции видео (квадрат/вертикальное/
                горизонтальное — любое, без чёрных полос по бокам).
                controlsList="nodownload" убирает кнопку "Скачать" из
                панели плеера, onContextMenu — убирает пункт "Сохранить
                видео как" из правого клика. От по-настоящему
                целенаправленной кражи (запись экрана и т.п.) это не
                защищает — но закрывает самый ленивый/случайный способ
                скачать файл в один клик. */}
            <video
              ref={registerGalleryVideo("__showcase__")}
              className={styles.video}
              src={project.video}
              poster={project.cover}
              controls
              controlsList="nodownload"
              onContextMenu={(e) => e.preventDefault()}
              playsInline
              preload="metadata"
            />
          </motion.div>
        )}

        <div className={styles.gallery}>
          {galleryRows.map((row, index) => {
            const indices = rowIndices[index];

            if (row.type === "pair") {
              return (
                <motion.div
                  key={row.items[0].key + row.items[1].key}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.5 }}
                  className={styles.pairRow}
                >
                  {row.items.map((media, itemIndex) => {
                    const flatIndex = indices[itemIndex];

                    if (media.kind === "video") {
                      const videoItem = media.item as { video: string };
                      return (
                        <div
                          key={media.key}
                          className={styles.videoGalleryWrap}
                          style={{ "--ar": media.ratio } as React.CSSProperties}
                        >
                          <video
                            ref={registerGalleryVideo(media.key)}
                            className={styles.galleryVideo}
                            src={withFirstFrame(videoItem.video)}
                            controls
                            // nofullscreen убирает нативную кнопку "на весь экран" из
                            // controls — единственный путь к детальному просмотру теперь
                            // через .expandVideoBtn ниже → лайтбокс с размытым фоном
                            // (см. просьбу "не совсем на весь экран, а сзади
                            // размытость, как у фото"), а не резкий системный
                            // полноэкранный режим браузера. Работает в Chrome/Edge; в
                            // Firefox и Safari нативная кнопка фуллскрина всё же может
                            // остаться — эти браузеры не дают её скрыть через controlsList,
                            // это ограничение самого браузера, а не что-то, что можно
                            // обойти в разметке.
                            controlsList="nodownload nofullscreen"
                            disablePictureInPicture
                            onContextMenu={(e) => e.preventDefault()}
                            playsInline
                            preload="metadata"
                          />
                          <button
                            type="button"
                            className={styles.expandVideoBtn}
                            onClick={() => setLightboxIndex(flatIndex)}
                            aria-label={t.project.expandVideo}
                          >
                            <ExpandIcon />
                          </button>
                        </div>
                      );
                    }

                    return (
                      <button
                        key={media.key}
                        type="button"
                        className={styles.imageWrap}
                        style={{ "--ar": media.ratio } as React.CSSProperties}
                        onClick={() => setLightboxIndex(flatIndex)}
                        aria-label={`${project.title[lang]} ${index + 1}.${itemIndex + 1}`}
                      >
                        <Image
                          src={media.item as string}
                          alt={`${project.title[lang]} ${index + 1}.${itemIndex + 1}`}
                          width={media.width}
                          height={media.height}
                          loading="lazy"
                          placeholder="blur"
                          blurDataURL={shimmerBlurDataURL(media.width, media.height)}
                          sizes="(max-width: 768px) 90vw, 45vw"
                          // Без этого Next/Vercel отдаёт /_next/image по умолчанию с
                          // quality=75 — а исходники уже пережаты локально скриптом
                          // optimize-images.mjs (quality 82). Вторая пересжатие поверх
                          // первого — то самое "тусклые/ненасыщенные фото" (двойная
                          // JPEG-компрессия усиливает потери и сильнее режет хрому).
                          // 90 — то же значение, что уже используется в Lightbox.tsx.
                          quality={90}
                          className={styles.image}
                          onLoad={(e) => {
                            e.currentTarget.classList.add(styles.loaded);
                            e.currentTarget.parentElement?.classList.add(styles.wrapLoaded);
                          }}
                        />
                      </button>
                    );
                  })}
                </motion.div>
              );
            }

            const flatIndex = indices[0];

            if (row.kind === "video") {
              const videoItem = row.item as { video: string };
              return (
                <motion.div
                  key={row.key}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.5 }}
                  className={styles.videoGalleryWrap}
                  style={{ alignSelf: row.isPortrait ? "center" : "stretch" }}
                >
                  <video
                    ref={registerGalleryVideo(row.key)}
                    className={styles.galleryVideo}
                    src={withFirstFrame(videoItem.video)}
                    controls
                    controlsList="nodownload nofullscreen"
                    disablePictureInPicture
                    onContextMenu={(e) => e.preventDefault()}
                    playsInline
                    preload="metadata"
                  />
                  <button
                    type="button"
                    className={styles.expandVideoBtn}
                    onClick={() => setLightboxIndex(flatIndex)}
                    aria-label={t.project.expandVideo}
                  >
                    <ExpandIcon />
                  </button>
                </motion.div>
              );
            }

            return (
              <motion.button
                type="button"
                key={row.key}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5 }}
                className={styles.imageWrap}
                style={{ alignSelf: row.isPortrait ? "center" : "stretch" }}
                onClick={() => setLightboxIndex(flatIndex)}
                aria-label={`${project.title[lang]} ${index + 1}`}
              >
                <Image
                  src={row.item as string}
                  alt={`${project.title[lang]} ${index + 1}`}
                  width={row.width}
                  height={row.height}
                  loading="lazy"
                  placeholder="blur"
                  blurDataURL={shimmerBlurDataURL(row.width, row.height)}
                  sizes="(max-width: 768px) 100vw, 70vw"
                  quality={90}
                  className={styles.image}
                  style={row.isPortrait ? undefined : { width: "100%", maxHeight: "none" }}
                  onLoad={(e) => {
                    e.currentTarget.classList.add(styles.loaded);
                    e.currentTarget.parentElement?.classList.add(styles.wrapLoaded);
                  }}
                />
              </motion.button>
            );
          })}
        </div>

        <AnimatePresence>
          {lightboxIndex !== null && (
            <GalleryLightbox
              key="gallery-lightbox"
              media={flatMedia}
              index={lightboxIndex}
              alt={project.title[lang]}
              onClose={closeLightbox}
              onNavigate={setLightboxIndex}
            />
          )}
        </AnimatePresence>

        <div className={styles.topRow}>
          <Link href="/#work" className={styles.back}>
            {t.project.back}
          </Link>

          {hasMultipleProjects && (
            <Link href={nextProjectHref} className={styles.next}>
              {t.project.next} →
            </Link>
          )}
        </div>

        <motion.div
          className={styles.cta}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
        >
          <p>{t.project.cta}</p>
          <div className={styles.ctaRow}>
            <Link href="/#contact" className={styles.ctaButton}>
              {t.project.ctaButton} →
            </Link>

            <div className={styles.ctaSocials}>
              <a
                href={`mailto:${t.contact.email}`}
                className={styles.iconCircle}
                aria-label="Email"
              >
                <EmailIcon />
              </a>
              {SOCIALS.map(({ key, href, icon: Icon, label }) => (
                <a
                  key={key}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.iconCircle}
                  aria-label={label}
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.article>

      <Footer />
    </main>
  );
}
