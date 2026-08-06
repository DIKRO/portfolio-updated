"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./PageTransition.module.css";

// ============================================================================
// Плавный переход между страницами ("открытие"/"закрытие" проекта).
//
// Идея: вместо мгновенной подмены контента при обычной навигации Next.js
// (клик по карточке — контент дёргано меняется, как только придёт RSC-ответ)
// рисуем поверх всего непрозрачный оверлей, который "раскрывается" кругом
// (clip-path: circle()) из точки клика — ровно как диафрагма объектива.
// Пока круг растёт и полностью не закроет экран, в фоне уже идёт настоящая
// навигация (router.push), так что к моменту, когда оверлей полностью
// закрыл вьюпорт, новая страница чаще всего уже готова под ним. Затем тот
// же круг схлопывается обратно в ту же точку — новая страница "проявляется"
// от краёв к центру. Один и тот же приём одинаково хорошо работает и на
// "открытие" (грид → проект), и на "закрытие" (проект → грид, назад).
//
// Живёт в корневом layout (см. app/layout.tsx) — не размонтируется между
// переходами, поэтому может пережить саму навигацию и довести анимацию до
// конца независимо от того, что происходит с деревом страниц под ним.
// ============================================================================

interface Origin {
  x: number;
  y: number;
}

interface TransitionContextValue {
  navigate: (href: string, origin?: Origin) => void;
}

const TransitionContext = createContext<TransitionContextValue | null>(null);

export function usePageTransition() {
  const ctx = useContext(TransitionContext);
  if (!ctx) {
    throw new Error("usePageTransition должен использоваться внутри PageTransitionProvider");
  }
  return ctx;
}

type Phase = "idle" | "covering" | "waiting" | "revealing";

// Максимум, сколько ждём готовности новой страницы под оверлеем, прежде чем
// всё равно начать раскрытие — подстраховка на случай очень медленной сети
// или сбоя навигации, чтобы пользователь не застрял на закрашенном экране.
const SAFETY_TIMEOUT_MS = 2200;

// Нормализует href для сравнения с usePathname() — отбрасывает hash и
// query, оставляя только путь ("/work/slug#section?x=1" → "/work/slug").
function toPathname(href: string): string {
  const withoutHash = href.split("#")[0];
  const withoutQuery = withoutHash.split("?")[0];
  return withoutQuery || "/";
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function PageTransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [phase, setPhase] = useState<Phase>("idle");
  const [origin, setOrigin] = useState<Origin>({ x: 0, y: 0 });
  const [radius, setRadius] = useState(0);

  const targetPathRef = useRef<string | null>(null);
  const safetyTimerRef = useRef<number | null>(null);
  const revealDelayRef = useRef<number | null>(null);

  const clearTimers = () => {
    if (safetyTimerRef.current !== null) {
      window.clearTimeout(safetyTimerRef.current);
      safetyTimerRef.current = null;
    }
    if (revealDelayRef.current !== null) {
      window.clearTimeout(revealDelayRef.current);
      revealDelayRef.current = null;
    }
  };

  const navigate = useCallback(
    (href: string, originPoint?: Origin) => {
      // Переход уже идёт — игнорируем повторный клик, пока текущий не
      // доиграет (двойной клик по карточке не должен ломать анимацию).
      if (targetPathRef.current !== null) return;

      const point = originPoint ?? {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      };

      // Радиус в пикселях до самого дальнего угла экрана от точки клика —
      // считаем сами (а не полагаемся на проценты в clip-path), чтобы круг
      // гарантированно перекрывал весь вьюпорт при любом соотношении сторон,
      // включая узкий высокий телефон и широкий альбомный планшет.
      const dx = Math.max(point.x, window.innerWidth - point.x);
      const dy = Math.max(point.y, window.innerHeight - point.y);
      const reach = Math.sqrt(dx * dx + dy * dy) + 24;

      setOrigin(point);
      setRadius(reach);

      targetPathRef.current = toPathname(href);

      if (prefersReducedMotion()) {
        // Уважаем системную настройку — без анимации, просто переходим.
        router.push(href);
        targetPathRef.current = null;
        return;
      }

      setPhase("covering");
      // Навигацию запускаем сразу же, параллельно с анимацией закрытия
      // круга — пока круг растёт (~0.45s), RSC-ответ чаще всего успевает
      // прийти, и в момент полного закрытия экрана новая страница уже
      // готова под оверлеем.
      router.push(href);
    },
    [router]
  );

  // Как только круг полностью закрыл экран — либо новая страница уже готова
  // (пути совпали), либо ждём её появления через pathname-эффект ниже.
  const handleCoverComplete = () => {
    if (targetPathRef.current === null) return;
    if (pathname === targetPathRef.current) {
      setPhase("revealing");
      return;
    }
    setPhase("waiting");
    safetyTimerRef.current = window.setTimeout(() => {
      setPhase("revealing");
    }, SAFETY_TIMEOUT_MS);
  };

  // Пока ждём (phase === "waiting") — следим за реальным изменением
  // маршрута и раскрываемся, как только новая страница подъехала.
  useEffect(() => {
    if (phase !== "waiting") return;
    if (targetPathRef.current === null) return;
    if (pathname !== targetPathRef.current) return;

    if (safetyTimerRef.current !== null) {
      window.clearTimeout(safetyTimerRef.current);
      safetyTimerRef.current = null;
    }

    // Небольшая пауза (даём кадр-другой на то, чтобы новый контент реально
    // отрисовался под оверлеем) — иначе иногда видно один кадр недорисованной
    // страницы в момент, когда круг уже начал схлопываться.
    revealDelayRef.current = window.setTimeout(() => {
      setPhase("revealing");
    }, 80);
  }, [pathname, phase]);

  const handleRevealComplete = () => {
    clearTimers();
    targetPathRef.current = null;
    setPhase("idle");
  };

  return (
    <TransitionContext.Provider value={{ navigate }}>
      {children}

      <AnimatePresence>
        {phase !== "idle" && (
          <motion.div
            className={styles.overlay}
            style={
              {
                "--ox": `${origin.x}px`,
                "--oy": `${origin.y}px`,
              } as React.CSSProperties
            }
            initial={{ clipPath: `circle(0px at ${origin.x}px ${origin.y}px)` }}
            animate={{
              clipPath:
                phase === "revealing"
                  ? `circle(0px at ${origin.x}px ${origin.y}px)`
                  : `circle(${radius}px at ${origin.x}px ${origin.y}px)`,
            }}
            transition={{
              duration: phase === "revealing" ? 0.6 : 0.46,
              ease: [0.65, 0, 0.35, 1],
            }}
            onAnimationComplete={() => {
              if (phase === "covering") handleCoverComplete();
              if (phase === "revealing") handleRevealComplete();
            }}
          >
            <span className={styles.mark} aria-hidden="true" />
          </motion.div>
        )}
      </AnimatePresence>
    </TransitionContext.Provider>
  );
}
