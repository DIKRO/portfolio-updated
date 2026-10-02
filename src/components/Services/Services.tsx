"use client";

import { motion } from "framer-motion";
import { PenIcon, PlayIcon, MonitorIcon, PrinterIcon } from "@/components/Icons/Icons";
import styles from "./Services.module.css";

const ICONS = [PenIcon, PlayIcon, MonitorIcon, PrinterIcon];

interface ServicesProps {
  t: {
    services: { label: string; faqHint: string; items: { title: string; text: string }[] };
  };
}

// Клик по карточке открывает FAQ (он живёт в Header.tsx) сразу на вкладке
// этого раздела: вкладка 0 — «Общие», поэтому у раздела с индексом i
// вкладка i + 1. Связь через window-событие, чтобы не тащить состояние
// FAQ через страницу.
const openFaq = (tab: number) => {
  window.dispatchEvent(new CustomEvent("faq:open", { detail: { tab } }));
};

export default function Services({ t }: ServicesProps) {
  return (
    <section id="services" className={styles.section}>
      <h2 className={styles.label}>{t.services.label}</h2>

      <div className={styles.grid}>
        {t.services.items.map((item, i) => {
          const Icon = ICONS[i % ICONS.length];
          return (
            <motion.button
              key={item.title}
              type="button"
              className={styles.card}
              onClick={() => openFaq(i + 1)}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
            >
              {/* Уголок-обводка — та же SVG-линия и те же размеры, что у
                  карточек отзывов (см. Reviews.tsx): верх + дуга + левая
                  сторона одной линией, дальше её продолжают градиентные
                  полоски ::before / ::after из CSS. */}
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

              {/* Иконка и название — в одной строке. Название переносится на
                  вторую строку само, только если не помещается. */}
              <span className={styles.head}>
                <span className={styles.badge}>
                  <Icon />
                </span>
                <strong className={styles.title}>{item.title}</strong>
              </span>
              <span className={styles.text}>{item.text}</span>
              <span className={styles.hint}>{t.services.faqHint} →</span>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
