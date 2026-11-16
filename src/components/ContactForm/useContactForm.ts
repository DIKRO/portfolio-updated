"use client";

import { useState, useSyncExternalStore, type FormEvent } from "react";

// Вся логика формы обратной связи (состояние, отправка, антиспам) живёт здесь,
// чтобы одна и та же форма работала и в разделе «Контакты» (Contact.tsx), и в
// выпадающей панели «Контакты» в шапке (Header.tsx) без дублирования кода.
//
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
// Лимит общий для всех экземпляров формы на сайте (шапка + раздел «Контакты»):
// счётчик хранится в localStorage, а не в состоянии компонента.
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
// или соседней вкладке (и в соседнем экземпляре формы на этой же странице).
// На сервере (и при гидратации) значение — false, поэтому разметка сервера и
// клиента совпадает.
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

export type FormStatus = "idle" | "sending" | "success" | "error" | "limit";

export function useContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<FormStatus>("idle");
  // Скрытое поле-ловушка для ботов: человек его не видит и не заполняет.
  const [trap, setTrap] = useState("");
  const limitReached = useSyncExternalStore(subscribeToSends, isLimitReached, isLimitReachedOnServer);

  const handleSubmit = async (e: FormEvent) => {
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
        saveSends([...recent, Date.now()]);
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

  return {
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
  };
}

export type ContactFormState = ReturnType<typeof useContactForm>;
