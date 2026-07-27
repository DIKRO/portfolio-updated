"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useLang } from "@/content/lang";
import { Project } from "@/types/project";
import { GalleryRow } from "@/lib/imageOrientation";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import GalleryLightbox from "@/components/Work/Lightbox";
import { EmailIcon } from "@/components/Icons/Icons";
import { SOCIALS } from "@/content/socials";
import styles from "./ProjectView.module.css";

interface ProjectViewProps {
  project: Project;
  galleryRows: GalleryRow[];
  nextProject: Project;
}

export default function ProjectView({ project, galleryRows, nextProject }: ProjectViewProps) {
  const { lang, setLang, t } = useLang();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Плоский список всех фото проекта в порядке отображения — по нему же
  // листает лайтбокс, независимо от группировки в галерее (одиночные
  // строки или пары портретных фото рядом). rowStartIndices[i] — с какого
  // плоского индекса начинается i-й ряд галереи (вычисляется один раз,
  // без мутаций во время рендера).
  const { flatImages, rowStartIndices } = useMemo(() => {
    const list: string[] = [];
    const starts: number[] = [];
    for (const row of galleryRows) {
      starts.push(list.length);
      if (row.type === "pair") {
        list.push(row.items[0].src, row.items[1].src);
      } else {
        list.push(row.src);
      }
    }
    return { flatImages: list, rowStartIndices: starts };
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

          <Link href={`/work/${nextProject.slug}`} className={styles.next}>
            {t.project.next} →
          </Link>
        </div>

        <motion.header
          className={styles.head}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1>{project.title[lang]}</h1>
          <span className={styles.meta}>
            {t.categories[project.categoryKey]} — {project.year}
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

        <div className={styles.gallery}>
          {galleryRows.map((row, index) => {
            const firstFlatIndex = rowStartIndices[index];
            if (row.type === "pair") {
              return (
                <motion.div
                  key={row.items[0].src + row.items[1].src}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.5 }}
                  className={styles.pairRow}
                >
                  {row.items.map((item, itemIndex) => (
                    <div
                      key={item.src}
                      className={styles.imageWrap}
                      style={{ "--ar": item.ratio } as React.CSSProperties}
                      onClick={() => setLightboxIndex(firstFlatIndex + itemIndex)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          setLightboxIndex(firstFlatIndex + itemIndex);
                        }
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.src}
                        alt={`${project.title[lang]} ${index + 1}.${itemIndex + 1}`}
                        loading="lazy"
                        decoding="async"
                        className={styles.image}
                      />
                    </div>
                  ))}
                </motion.div>
              );
            }

            const singleFlatIndex = firstFlatIndex;

            return (
              <motion.div
                key={row.src}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5 }}
                className={styles.imageWrap}
                style={{ alignSelf: row.isPortrait ? "center" : "stretch" }}
                onClick={() => setLightboxIndex(singleFlatIndex)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    setLightboxIndex(singleFlatIndex);
                  }
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={row.src}
                  alt={`${project.title[lang]} ${index + 1}`}
                  loading="lazy"
                  decoding="async"
                  className={styles.image}
                  style={row.isPortrait ? undefined : { width: "100%", maxHeight: "none" }}
                />
              </motion.div>
            );
          })}
        </div>

        {lightboxIndex !== null && (
          <GalleryLightbox
            images={flatImages}
            index={lightboxIndex}
            alt={project.title[lang]}
            onClose={() => setLightboxIndex(null)}
            onNavigate={setLightboxIndex}
          />
        )}

        <div className={styles.topRow}>
          <Link href="/#work" className={styles.back}>
            {t.project.back}
          </Link>

          <Link href={`/work/${nextProject.slug}`} className={styles.next}>
            {t.project.next} →
          </Link>
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
