"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { Lang } from "@/content/lang";
import styles from "./Header.module.css";

interface HeaderProps {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: {
    nav: { work: string; about: string; contact: string };
  };
}

const LANGS: Lang[] = ["en", "ru", "ro"];

// Замени на свой логотип: положи файл в /public/images/ и обнови путь
const LOGO_SRC = "/images/logo.png";

export default function Header({ lang, setLang, t }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === "/";

  // header теперь position: fixed (обходим баг Chrome с backdrop-filter
  // + position: sticky), поэтому под него нужен "спейсер" такой же высоты,
  // чтобы контент страницы не заезжал под хедер. Высоту меряем реальную,
  // а не хардкодим — она разная на десктопе и мобилке (там хедер выше
  // из-за переноса строк).
  const headerRef = useRef<HTMLElement>(null);
  const [headerHeight, setHeaderHeight] = useState(0);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;

    const update = () => setHeaderHeight(el.offsetHeight);
    update();

    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const goTo = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    if (isHome) {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    } else {
      router.push(`/#${id}`);
    }
  };

  return (
    <>
      <header ref={headerRef} className={styles.header}>
        <a href={isHome ? "#top" : "/"} className={styles.brand} onClick={goTo("top")}>
          <Image src={LOGO_SRC} alt="Logo" width={24} height={24} className={styles.logoImg} priority />
          <span className={styles.logo}>
            Socur <span className={styles.accent}>Dmitrii</span>
          </span>
        </a>

        <nav className={styles.nav}>
          <a href={isHome ? "#work" : "/#work"} onClick={goTo("work")}>
            {t.nav.work}
          </a>
          <a href={isHome ? "#about" : "/#about"} onClick={goTo("about")}>
            {t.nav.about}
          </a>
          <a href={isHome ? "#contact" : "/#contact"} onClick={goTo("contact")}>
            {t.nav.contact}
          </a>
        </nav>

        <div className={styles.langSwitch}>
          {LANGS.map((l) => (
            <button
              key={l}
              className={lang === l ? styles.activeLang : ""}
              onClick={() => setLang(l)}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </header>

      {/* Спейсер: занимает место, которое раньше занимал header в потоке
          документа до перехода на position: fixed */}
      <div style={{ height: headerHeight }} aria-hidden="true" />
    </>
  );
}