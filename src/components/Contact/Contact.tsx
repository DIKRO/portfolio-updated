"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { EmailIcon } from "@/components/Icons/Icons";
import { SOCIALS } from "@/content/socials";
import CopyEmailLink from "@/components/CopyEmailLink/CopyEmailLink";
import ContactForm, { type ContactFormLabels } from "@/components/ContactForm/ContactForm";
import { useContactForm } from "@/components/ContactForm/useContactForm";
import styles from "./Contact.module.css";

interface ContactProps {
  t: {
    contact: {
      label: string;
      cta: string;
      email: string;
      emailLabel: string;
      copied: string;
      form: ContactFormLabels & { close: string };
    };
  };
}

export default function Contact({ t }: ContactProps) {
  // Форма открыта сразу (по фидбеку: если её скрыть, посетитель может решить,
  // что формы нет). Кнопка остаётся переключателем — форму можно свернуть.
  const [formOpen, setFormOpen] = useState(true);
  const form = useContactForm();
  const { status, setStatus } = form;

  return (
    <section id="contact" className={styles.section}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
      >
        <button
          type="button"
          className={styles.cta}
          aria-expanded={formOpen}
          aria-controls="contact-form"
          aria-label={formOpen ? t.contact.form.close : undefined}
          onClick={() => {
            setFormOpen((v) => !v);
            // Если открыли форму заново после успешной отправки — не
            // показываем старое "сообщение отправлено" повторно.
            if (status === "success" || status === "error") setStatus("idle");
          }}
        >
          {t.contact.cta}
        </button>

        <AnimatePresence initial={false}>
          {formOpen && (
            <motion.div
              key="contact-form"
              id="contact-form"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              className={styles.formWrap}
            >
              <div className={styles.formPanel}>
                <ContactForm form={form} labels={t.contact.form} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className={styles.row}>
          {/* Вместо полного адреса — короткая подпись «Gmail», как у остальных
              ссылок. Клик открывает письмо в Gmail (в браузере, в новой вкладке) и заодно
              копирует адрес в буфер обмена: подпись на пару секунд меняется на «Адрес скопирован».
              Сам адрес виден во всплывающей подсказке. */}
          <CopyEmailLink
            email={t.contact.email}
            copiedLabel={t.contact.copied}
            className={styles.iconLink}
            ariaLabel={`Email: ${t.contact.email}`}
            title={t.contact.email}
          >
            {(copied) => (
              <>
                <EmailIcon />
                <span>{copied ? t.contact.copied : t.contact.emailLabel}</span>
              </>
            )}
          </CopyEmailLink>

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
