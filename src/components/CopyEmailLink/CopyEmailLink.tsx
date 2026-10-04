"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import styles from "./CopyEmailLink.module.css";

// Ссылка на почту: по клику открывает окно нового письма в веб-версии Gmail
// (в новой вкладке) — человек уже сидит в браузере, и ему удобнее писать
// там, а не ждать, пока откроется почтовое приложение. ЗАОДНО адрес
// копируется в буфер обмена и на пару секунд показывается подтверждение
// (на случай, если человек пользуется другой почтой или просто хочет
// вставить адрес куда-то ещё).
//
// ВАЖНО: адрес ведёт именно в Gmail. Если когда-нибудь почта сменится на
// не-Gmail, поменяйте gmailComposeUrl ниже (например, вернув mailto:).

export function gmailComposeUrl(email: string) {
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}`;
}

interface CopyEmailLinkProps {
  email: string;
  // Текст подтверждения: «Адрес скопирован».
  copiedLabel: string;
  className?: string;
  ariaLabel?: string;
  title?: string;
  // true — над ссылкой всплывает маленькая плашка с подтверждением (для
  // кнопок-иконок без текста). false — подтверждение показывает сам
  // вызывающий, подставляя copied в children (например, меняя подпись).
  badge?: boolean;
  children: ReactNode | ((copied: boolean) => ReactNode);
}

async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // нет прав / небезопасный контекст — пробуем запасной способ ниже
  }
  try {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(area);
    return ok;
  } catch {
    return false;
  }
}

export default function CopyEmailLink({
  email,
  copiedLabel,
  className,
  ariaLabel,
  title,
  badge = false,
  children,
}: CopyEmailLinkProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  // preventDefault НЕ вызываем: браузер сам откроет Gmail в новой вкладке,
  // как у любой ссылки. Копирование идёт параллельно.
  const onClick = async () => {
    const ok = await copyText(email);
    if (!ok) return;
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <a
      href={gmailComposeUrl(email)}
      target="_blank"
      rel="noopener noreferrer"
      className={`${className ?? ""} ${styles.root}`}
      onClick={onClick}
      aria-label={ariaLabel}
      title={title}
    >
      {typeof children === "function" ? children(copied) : children}
      {badge && copied && (
        <span className={styles.badge} aria-hidden="true">
          {copiedLabel}
        </span>
      )}
      {/* Для скринридеров: озвучиваем, что адрес скопирован. */}
      <span className={styles.srOnly} role="status" aria-live="polite">
        {copied ? copiedLabel : ""}
      </span>
    </a>
  );
}
