"use client";

import { motion } from "framer-motion";
import { EmailIcon } from "@/components/Icons/Icons";
import { SOCIALS } from "@/content/socials";
import styles from "./Contact.module.css";

interface ContactProps {
  t: {
    contact: { label: string; cta: string; email: string };
  };
}

export default function Contact({ t }: ContactProps) {
  return (
    <section id="contact" className={styles.section}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
      >
        <a href={`mailto:${t.contact.email}`} className={styles.cta}>
          {t.contact.cta} →
        </a>

        <div className={styles.row}>
          <a href={`mailto:${t.contact.email}`} className={styles.iconLink} aria-label="Email">
            <EmailIcon />
            <span>{t.contact.email}</span>
          </a>

          {SOCIALS.map(({ key, href, icon: Icon, label }) => (
            <a
              key={key}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.iconLink}
              aria-label={label}
            >
              <Icon />
              <span>{label}</span>
            </a>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
