"use client";

import { useState } from "react";
import styles from "./ContactForm.module.css";
import type { ContactFormState } from "./useContactForm";

export interface ContactFormLabels {
  name: string;
  email: string;
  message: string;
  consent: string;
  submit: string;
  sending: string;
  success: string;
  error: string;
  sendAnother: string;
  limit: string;
  privacyToggle: string;
  privacyHide: string;
  privacy: string;
}

interface ContactFormProps {
  form: ContactFormState;
  labels: ContactFormLabels;
  // Компактный вид для выпадающей панели в шапке: поля друг под другом,
  // меньше отступов и высота текстового поля.
  compact?: boolean;
}

// Сама форма (поля, согласие, кнопка, статусы). Состояние и отправка — в
// useContactForm: так раздел «Контакты» и панель в шапке показывают одну и ту
// же форму, а набранный текст не пропадает, когда панель закрывается.
export default function ContactForm({ form, labels, compact = false }: ContactFormProps) {
  const {
    name,
    setName,
    email,
    setEmail,
    message,
    setMessage,
    consent,
    setConsent,
    trap,
    setTrap,
    status,
    setStatus,
    limitReached,
    handleSubmit,
  } = form;
  const [showPrivacy, setShowPrivacy] = useState(false);

  if (status === "success") {
    return (
      <div className={`${styles.formStatus} ${compact ? styles.compact : ""}`}>
        <p>{labels.success}</p>
        {!limitReached && (
          <button type="button" className={styles.formSubmit} onClick={() => setStatus("idle")}>
            {labels.sendAnother}
          </button>
        )}
      </div>
    );
  }

  return (
    <form className={`${styles.form} ${compact ? styles.compact : ""}`} onSubmit={handleSubmit}>
      <div className={styles.formRow}>
        <label className={styles.formField}>
          <span className={styles.formLabel}>{labels.name}</span>
          <input
            type="text"
            required
            placeholder={labels.name}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={styles.formInput}
          />
        </label>
        <label className={styles.formField}>
          <span className={styles.formLabel}>{labels.email}</span>
          <input
            type="email"
            required
            placeholder={labels.email}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.formInput}
          />
        </label>
      </div>
      <input
        type="text"
        name="_gotcha"
        value={trap}
        onChange={(e) => setTrap(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
      />
      <label className={styles.formField}>
        <span className={styles.formLabel}>{labels.message}</span>
        <textarea
          required
          rows={compact ? 3 : 4}
          placeholder={labels.message}
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
          <span>{labels.consent}</span>
        </label>
        {/* Краткая политика обработки данных — раскрывается прямо в форме,
            отдельной страницы нет. Кнопка вне <label>, чтобы клик по ней не
            ставил галочку. */}
        <button
          type="button"
          className={styles.privacyToggle}
          aria-expanded={showPrivacy}
          onClick={() => setShowPrivacy((v) => !v)}
        >
          {showPrivacy ? labels.privacyHide : labels.privacyToggle}
        </button>
        {showPrivacy && <p className={styles.privacyText}>{labels.privacy}</p>}
      </div>
      <div className={styles.formFooter}>
        <button
          type="submit"
          className={styles.formSubmit}
          disabled={status === "sending" || !consent || limitReached}
        >
          {status === "sending" ? labels.sending : labels.submit}
        </button>
        {status === "error" && <p className={styles.formNoteError}>{labels.error}</p>}
        {(status === "limit" || limitReached) && <p className={styles.formNoteError}>{labels.limit}</p>}
      </div>
    </form>
  );
}
