"use client";

import { useState, useSyncExternalStore } from "react";
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

// Антиспам: не больше MAX_MESSAGES сообщений с одного посетителя за
// WINDOW_MS (скользящее окно). Посетитель определяется анонимным id, который
// сохраняется в localStorage браузера (авторизации на сайте нет, поэтому
// «пользователь» = браузер). Чтобы поменять лимит или период — правь две
// константы ниже. ВАЖНО: это защита на стороне клиента — она останавливает
// случайный и ручной спам, но не защищает от скриптов, которые шлют запросы
// на Formspree напрямую; от них помогают настройки самой формы на formspree.io
// (reCAPTCHA, фильтр спама) — их стоит включить дополнительно.
const MAX_MESSAGES = 3;
const WINDOW_MS = 24 * 60 * 60 * 1000;
const VISITOR_KEY = "contact:visitorId";
const SENT_KEY = "contact:sent";
const SENT_EVENT = "contact:sent-changed";

function getVisitorId(): string {
  try {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch {
    return "unknown";
  }
}

// Время отправок за последние WINDOW_MS (старые отбрасываются).
function readRecentSends(): number[] {
  try {
    const raw = JSON.parse(localStorage.getItem(SENT_KEY) ?? "[]");
    if (!Array.isArray(raw)) return [];
    const now = Date.now();
    return raw.filter((n): n is number => typeof n === "number" && now - n < WINDOW_MS);
  } catch {
    return [];
  }
}

function saveSends(list: number[]) {
  try {
    localStorage.setItem(SENT_KEY, JSON.stringify(list));
  } catch {
    // localStorage недоступен (приватный режим и т.п.) — лимит просто не сохранится.
  }
  // В этой же вкладке событие "storage" не срабатывает — сообщаем сами.
  window.dispatchEvent(new Event(SENT_EVENT));
}

// Подписка для useSyncExternalStore: лимит пересчитывается при отправке в этой
// или соседней вкладке. На сервере (и при гидратации) значение — false, поэтому
// разметка сервера и клиента совпадает.
function subscribeToSends(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(SENT_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(SENT_EVENT, onChange);
  };
}
const isLimitReached = () => readRecentSends().length >= MAX_MESSAGES;
const isLimitReachedOnServer = () => false;

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
        limit: string;
      };
    };
  };
}

type Status = "idle" | "sending" | "success" | "error" | "limit";

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
  // Скрытое поле-ловушка для ботов: человек его не видит и не заполняет.
  const [trap, setTrap] = useState("");
  const limitReached = useSyncExternalStore(subscribeToSends, isLimitReached, isLimitReachedOnServer);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Бот заполнил скрытое поле — молча делаем вид, что всё отправлено.
    if (trap) {
      setStatus("success");
      return;
    }

    const recent = readRecentSends();
    if (recent.length >= MAX_MESSAGES) {
      setStatus("limit");
      return;
    }

    setStatus("sending");

    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message, visitorId: getVisitorId() }),
      });

      if (res.ok) {
        const updated = [...recent, Date.now()];
        saveSends(updated);
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
                  {!limitReached && (
                    <button
                      type="button"
                      className={styles.formSubmit}
                      onClick={() => setStatus("idle")}
                    >
                      {t.contact.form.sendAnother}
                    </button>
                  )}
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
                      disabled={status === "sending" || !consent || limitReached}
                    >
                      {status === "sending" ? t.contact.form.sending : `${t.contact.form.submit} →`}
                    </button>
                    {status === "error" && <p className={styles.formNoteError}>{t.contact.form.error}</p>}
                    {(status === "limit" || limitReached) && (
                      <p className={styles.formNoteError}>{t.contact.form.limit}</p>
                    )}
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
