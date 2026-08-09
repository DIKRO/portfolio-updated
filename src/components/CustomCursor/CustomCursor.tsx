"use client";

import { useEffect, useRef } from "react";
import styles from "./CustomCursor.module.css";

// Стрелка-курсор целиком нарисована сама (SVG + лёгкое свечение вокруг
// через filter: drop-shadow, который повторяет силуэт фигуры, а не
// прямоугольную область вокруг неё). Настоящая системная стрелка при
// этом СКРЫВАЕТСЯ (см. globals.css, класс hideNativeCursor на <html>) —
// иначе получались бы два наложенных друг на друга курсора одновременно.
// Только для мыши/трекпада (pointer: fine); на тач-устройствах курсора
// нет физически — там ничего не подписываем и не прячем. Уважаем
// prefers-reduced-motion — тогда остаётся обычный системный курсор.
export default function CustomCursor() {
  const cursorRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const isFinePointer = window.matchMedia("(pointer: fine)").matches;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!isFinePointer || reducedMotion) return;

    // Прячем системную стрелку только после того, как убедились, что
    // будет чем её заменить (мышь есть, reduced-motion выключен) — на
    // тач/reduced-motion класс вообще не добавляется, обычный курсор
    // остаётся как есть.
    document.documentElement.classList.add("hideNativeCursor");

    let pending = false;
    let x = 0;
    let y = 0;

    const apply = () => {
      pending = false;
      if (cursorRef.current) {
        // Без translate(-50%, -50%) и без CSS-transition на transform —
        // левый верхний угол SVG (кончик стрелки в viewBox) встаёт точно
        // в точку курсора, без отставания даже на долю кадра.
        cursorRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      }
    };

    // rAF тут не бесконечный цикл, а просто способ не применять transform
    // чаще, чем браузер всё равно успевает отрисовать кадр — в состоянии
    // покоя (мышь не двигается) ничего не выполняется.
    const handleMove = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (!pending) {
        pending = true;
        requestAnimationFrame(apply);
      }
    };

    const handleFirstMove = () => {
      cursorRef.current?.classList.add(styles.visible);
    };

    window.addEventListener("mousemove", handleMove, { passive: true });
    window.addEventListener("mousemove", handleFirstMove, { once: true, passive: true });

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mousemove", handleFirstMove);
      document.documentElement.classList.remove("hideNativeCursor");
    };
  }, []);

  return (
    <svg
      ref={cursorRef}
      className={styles.cursor}
      viewBox="0 0 24 24"
      width="24"
      height="24"
      aria-hidden="true"
    >
      {/* Силуэт стандартной стрелки-курсора (кончик — в точке 0,0 viewBox,
          она же встаёт в реальную позицию курсора). */}
      <path d="M1 1 L1 17 L5.6 13.2 L8.4 20 L11.2 18.8 L8.4 12 L15 12 Z" />
    </svg>
  );
}
