"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { EmailIcon } from "@/components/Icons/Icons";
import { SOCIALS } from "@/content/socials";
import styles from "./Contact.module.css";

// Форма отправляет данные напрямую в Formspree (без своего бэкенда) —
// письмо с сообщением падает на почту, привязанную к этой форме на
// formspree.io. Чтобы поменять получателя или лимиты — правь настройки
// самой формы на их сайте, этот ID менять не нужно.
const FORMSPREE_ENDPOINT = "https://formspree.io/f/mpqvepdw";

interface ContactProps {
  t: {
    contact: {
      label: string;
      cta: string;
      email: string;
      form: {
        name: string;
        email: string;
        message: string;
        submit: string;
        note: string;
        close: string;
        sending: string;
        success: string;
        error: string;
        sendAnother: string;
      };
    };
  };
}

type Status = "idle" | "sending" | "success" | "error";

export default function Contact({ t }: ContactProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");

    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });

      if (res.ok) {
        setStatus("success");
        setName("");
        setEmail("");
        setMessage("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

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
          {t.contact.cta} {formOpen ? "×" : "→"}
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
              {status === "success" ? (
                <div className={styles.formStatus}>
                  <p>{t.contact.form.success}</p>
                  <button
                    type="button"
                    className={styles.formSubmit}
                    onClick={() => setStatus("idle")}
                  >
                    {t.contact.form.sendAnother}
                  </button>
                </div>
              ) : (
                <form className={styles.form} onSubmit={handleSubmit}>
                  <div className={styles.formRow}>
                    <input
                      type="text"
                      required
                      placeholder={t.contact.form.name}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={styles.formInput}
                    />
                    <input
                      type="email"
                      required
                      placeholder={t.contact.form.email}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={styles.formInput}
                    />
                  </div>
                  <textarea
                    required
                    rows={4}
                    placeholder={t.contact.form.message}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className={styles.formTextarea}
                  />
                  <div className={styles.formFooter}>
                    <button type="submit" className={styles.formSubmit} disabled={status === "sending"}>
                      {status === "sending" ? t.contact.form.sending : `${t.contact.form.submit} →`}
                    </button>
                    <p className={status === "error" ? styles.formNoteError : styles.formNote}>
                      {status === "error" ? t.contact.form.error : t.contact.form.note}
                    </p>
                  </div>
                </form>
              )}
            </motion.div>
          )}
        </AnimatePresence>

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
