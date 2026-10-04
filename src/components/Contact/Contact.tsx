"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { EmailIcon } from "@/components/Icons/Icons";
import { SOCIALS } from "@/content/socials";
import CopyEmailLink from "@/components/CopyEmailLink/CopyEmailLink";
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
      emailLabel: string;
      copied: string;
      form: {
        name: string;
        email: string;
        message: string;
        consent: string;
        submit: string;
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
  // Раньше форма была скрыта за кнопкой (useState(false)) — по фидбеку это
  // создавало риск, что посетитель решит, что формы вообще нет, и уйдёт в
  // соцсети, даже не кликнув. Теперь форма открыта сразу; сама кнопка
  // (ниже) остаётся как переключатель — можно свернуть форму вручную,
  // просто по умолчанию она уже видна.
  const [formOpen, setFormOpen] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
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
        setConsent(false);
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
          {/* В закрытом состоянии — со стрелкой, в открытом — просто текст,
              без крестика. */}
          {t.contact.cta}
          {formOpen ? "" : " →"}
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
                    <label className={styles.formField}>
                      <span className={styles.formLabel}>{t.contact.form.name}</span>
                      <input
                        type="text"
                        required
                        placeholder={t.contact.form.name}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={styles.formInput}
                      />
                    </label>
                    <label className={styles.formField}>
                      <span className={styles.formLabel}>{t.contact.form.email}</span>
                      <input
                        type="email"
                        required
                        placeholder={t.contact.form.email}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={styles.formInput}
                      />
                    </label>
                  </div>
                  <label className={styles.formField}>
                    <span className={styles.formLabel}>{t.contact.form.message}</span>
                    <textarea
                      required
                      rows={4}
                      placeholder={t.contact.form.message}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className={styles.formTextarea}
                    />
                  </label>
                  <div className={styles.formConsent}>
                    <label className={styles.consent}>
                      <input
                        type="checkbox"
                        checked={consent}
                        onChange={(e) => setConsent(e.target.checked)}
                        required
                        className={styles.consentCheckbox}
                      />
                      <span>{t.contact.form.consent}</span>
                    </label>
                  </div>
                  <div className={styles.formFooter}>
                    <button
                      type="submit"
                      className={styles.formSubmit}
                      disabled={status === "sending" || !consent}
                    >
                      {status === "sending" ? t.contact.form.sending : `${t.contact.form.submit} →`}
                    </button>
                    {status === "error" && <p className={styles.formNoteError}>{t.contact.form.error}</p>}
                  </div>
                </form>
              )}
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
