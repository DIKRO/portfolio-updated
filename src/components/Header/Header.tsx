"use client";

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

  const goTo = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    if (isHome) {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    } else {
      router.push(`/#${id}`);
    }
  };

  return (
    <header className={styles.header}>
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
  );
}
