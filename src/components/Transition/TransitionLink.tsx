"use client";

import Link from "next/link";
import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from "react";
import { usePageTransition } from "./PageTransitionProvider";

type TransitionLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: string;
  children: ReactNode;
};

// Обёртка над next/link — визуально и по поведению это та же ссылка
// (работает открытие в новой вкладке средней кнопкой мыши, Ctrl/Cmd+клик,
// работает без JS через обычный href), но обычный левый клик перехватывается
// и вместо мгновенной подмены контента запускает плавный переход через
// PageTransitionProvider (см. там подробное объяснение самого приёма).
export default function TransitionLink({ href, onClick, children, ...rest }: TransitionLinkProps) {
  const { navigate } = usePageTransition();

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented) return;

    // Открытие в новой вкладке/окне (средняя кнопка, Ctrl/Cmd/Shift+клик) —
    // не трогаем, пусть браузер обрабатывает как обычную ссылку.
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

    e.preventDefault();

    // e.detail === 0 — клик пришёл не от мыши (например, Enter на
    // сфокусированной ссылке через клавиатуру или скринридер) — в этом
    // случае координат клика нет и не должно быть, круг раскрывается из
    // центра экрана вместо угла (0,0), который выглядел бы как случайный.
    const origin =
      e.detail === 0 ? undefined : { x: e.clientX, y: e.clientY };

    navigate(href, origin);
  };

  return (
    <Link href={href} onClick={handleClick} {...rest}>
      {children}
    </Link>
  );
}
