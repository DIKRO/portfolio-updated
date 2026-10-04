"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { EmailIcon } from "@/components/Icons/Icons";
import CopyEmailLink from "@/components/CopyEmailLink/CopyEmailLink";
import { SOCIALS } from "@/content/socials";
import styles from "./FAQ.module.css";

interface FaqItem {
  question: string;
  description?: string;
  answer: string;
}

interface FAQProps {
  open: boolean;
  onClose: () => void;
  // Какая вкладка активна при открытии: 0 — «Общие», 1..N — FAQ по
  // соответствующему разделу из блока «Чем я занимаюсь» (по порядку).
  initialTab?: number;
  // Клик по кнопке в заметке внизу: закрыть FAQ и перейти к контактам.
  onContact?: () => void;
  // Почта для блока прямых контактов в заметке внизу (соцсети берутся
  // из SOCIALS — те же, что в шапке и в разделе «Контакты»).
  contact?: { email: string; emailLabel: string; copied: string };
  t: {
    title: string;
    generalTab: string;
    note: { text: string; cta: string };
    items: FaqItem[];
    services: { tab: string; items: FaqItem[] }[];
  };
}

// Модалка FAQ — та же визуальная логика, что и у карточки клиента в
// "Обо мне" (About.tsx): размытая тёмная подложка + всплывающая по
// центру карточка с тем же фирменным стилем (оранжевые акценты,
// var(--surface)/var(--accent)/var(--radius)). Открывается по клику на
// пункт "FAQ" в шапке (см. Header.tsx), сам компонент не знает, откуда
// его открыли — просто получает open/onClose снаружи.
export default function FAQ({ open, onClose, initialTab = 0, onContact, contact, t }: FAQProps) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const scrollRef = useRef<HTMLDivElement>(null);

  // При каждом открытии показываем ту вкладку, с которой пришли (из шапки —
  // «Общие», из карточки раздела — соответствующий раздел).
  useEffect(() => {
    if (open) setActiveTab(initialTab);
  }, [open, initialTab]);

  const tabs = [
    { label: t.generalTab, items: t.items },
    ...t.services.map((group) => ({ label: group.tab, items: group.items })),
  ];
  const current = tabs[activeTab] ?? tabs[0];

  const selectTab = (i: number) => {
    setActiveTab(i);
    scrollRef.current?.scrollTo({ top: 0 });
  };

  // Блокировка скролла страницы, пока открыта модалка — тот же приём,
  // что и в About.tsx/Lightbox.tsx: фиксируем body на текущей позиции при
  // открытии, а при закрытии мгновенно (без анимации — на html глобально
  // стоит scroll-behavior: smooth, который иначе превратил бы это чисто
  // техническое восстановление позиции в заметный "скролл") возвращаем
  // обратно.
  useEffect(() => {
    if (!open) return;

    const scrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.removeEventListener("keydown", onKeyDown);

      const html = document.documentElement;
      const prevScrollBehavior = html.style.scrollBehavior;
      html.style.scrollBehavior = "auto";
      window.scrollTo(0, scrollY);
      html.style.scrollBehavior = prevScrollBehavior;
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className={styles.backdrop}
          initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
          animate={{ opacity: 1, backdropFilter: "blur(16px)" }}
          exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          onClick={onClose}
        >
          <motion.div
            className={styles.card}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            role="dialog"
            aria-modal="true"
            aria-label={t.title}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.header}>
              <h2 className={styles.title}>{t.title}</h2>
              <button type="button" className={styles.close} onClick={onClose} aria-label="Close">
                ✕
              </button>
            </div>

            <div className={styles.tabs} role="tablist">
              {tabs.map((tab, i) => (
                <button
                  key={tab.label}
                  type="button"
                  role="tab"
                  aria-selected={i === activeTab}
                  className={`${styles.tab} ${i === activeTab ? styles.tabActive : ""}`}
                  onClick={() => selectTab(i)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className={styles.scrollArea} ref={scrollRef}>
              {current.items.map((item) => (
                <div key={item.question} className={styles.item}>
                  <h3 className={styles.question}>{item.question}</h3>
                  {item.description && <p className={styles.description}>{item.description}</p>}
                  <p className={styles.answer}>{item.answer}</p>
                </div>
              ))}

              <div className={styles.note}>
                <p>{t.note.text}</p>
                {/* Кнопка и иконки связи — в одной строке на одном уровне
                    (как блок CTA в конце страницы проекта). */}
                <div className={styles.noteActions}>
                  {onContact && (
                    <button type="button" className={styles.noteButton} onClick={onContact}>
                      {t.note.cta} →
                    </button>
                  )}

                  <div className={styles.noteSocials}>
                    {contact && (
                      <CopyEmailLink
                        email={contact.email}
                        copiedLabel={contact.copied}
                        className={styles.iconCircle}
                        ariaLabel={contact.emailLabel}
                        title={contact.emailLabel}
                        badge
                      >
                        <EmailIcon />
                      </CopyEmailLink>
                    )}
                    {SOCIALS.map(({ key, href, icon: Icon, label }) => (
                      <a
                        key={key}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.iconCircle}
                        aria-label={label}
                        title={label}
                      >
                        <Icon />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
