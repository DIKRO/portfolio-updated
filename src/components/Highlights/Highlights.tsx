"use client";

import { motion } from "framer-motion";
import { PenIcon, MonitorIcon, LayersIcon, ClockIcon } from "@/components/Icons/Icons";
import styles from "./Highlights.module.css";

const ICONS = [PenIcon, MonitorIcon, LayersIcon, ClockIcon];

interface HighlightsProps {
  t: {
    highlights: { title: string; text: string }[];
  };
}

export default function Highlights({ t }: HighlightsProps) {
  return (
    <section className={styles.strip}>
      {t.highlights.map((item, i) => {
        const Icon = ICONS[i % ICONS.length];
        return (
          <motion.div
            key={item.title}
            className={styles.item}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: i * 0.05 }}
          >
            <Icon />
            <div>
              <strong>{item.title}</strong>
              <span>{item.text}</span>
            </div>
          </motion.div>
        );
      })}
    </section>
  );
}
