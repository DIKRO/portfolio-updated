"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useLang } from "@/content/lang";
import { Project } from "@/types/project";
import { GalleryRow } from "@/lib/imageOrientation";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import { EmailIcon } from "@/components/Icons/Icons";
import { SOCIALS } from "@/content/socials";
import styles from "./ProjectView.module.css";

interface ProjectViewProps {
  project: Project;
  galleryRows: GalleryRow[];
}

export default function ProjectView({ project, galleryRows }: ProjectViewProps) {
  const { lang, setLang, t } = useLang();

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
        <Link href="/#work" className={styles.back}>
          {t.project.back}
        </Link>

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
            if (row.type === "pair") {
              return (
                <motion.div
                  key={row.items[0] + row.items[1]}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.5 }}
                  className={styles.pairRow}
                >
                  {row.items.map((src, itemIndex) => (
                    <div key={src} className={styles.imageWrap}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={src}
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

            return (
              <motion.div
                key={row.src}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5 }}
                className={styles.imageWrap}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={row.src}
                  alt={`${project.title[lang]} ${index + 1}`}
                  loading="lazy"
                  decoding="async"
                  className={styles.image}
                />
              </motion.div>
            );
          })}
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
