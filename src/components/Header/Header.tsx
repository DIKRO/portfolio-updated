"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { Lang } from "@/content/lang";
import { SOCIALS } from "@/content/socials";
import { EmailIcon } from "@/components/Icons/Icons";
import styles from "./Header.module.css";

interface HeaderProps {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: {
    nav: { work: string; about: string; contact: string };
    contact: { email: string };
  };
}

const LANGS: Lang[] = ["en", "ru", "ro"];

// Замени на свой логотип: положи файл в /public/images/ и обнови путь
const LOGO_SRC = "/images/logo.png";

export default function Header({ lang, setLang, t }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === "/";
  // Страница конкретного проекта (/work/slug) — это всё ещё раздел
  // "Работы" по смыслу, хоть это и не главная. Подсвечиваем "Работы" в
  // шапке и там тоже.
  const isProjectPage = pathname?.startsWith("/work/") ?? false;

  // Мобильное меню-гамбургер (нав + языки собраны в выпадающую панель).
  // На десктопе не используется вообще — там нав и языки всегда видны
  // в строке шапки как обычно.
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileMenuOpen]);

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
    setMobileMenuOpen(false);
    if (isHome) {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    } else {
      router.push(`/#${id}`);
    }
  };

  // Индикатор текущего раздела в навигации (как активный язык) — работает
  // только на главной странице, где реально есть секции work/about/contact.
  // Считается напрямую от позиции скролла (см. эффект ниже, там же и
  // объяснение, почему не через IntersectionObserver).
  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    if (!isHome || headerHeight === 0) return;

    // На главной странице контент секций (Hero/WorkGrid/About/Contact)
    // оборачивается в <motion.div key={lang}>, который полностью
    // перемонтируется при смене языка — старые DOM-узлы #work/#about/#contact
    // уничтожаются, создаются новые, поэтому эффект пересоздаёт всё заново
    // при каждой смене lang (см. зависимость ниже).
    const ids = ["work", "about", "contact"];
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    // Раньше активный раздел определялся через IntersectionObserver: он
    // подсвечивал секцию, только пока часть её видна в определённой
    // "полосе" экрана. У этого подхода два слабых места: 1) короткая
    // секция (например "Обо мне") может целиком проскочить эту полосу за
    // один кадр скролла (особенно на трекпаде/инерционной прокрутке) —
    // observer просто не успевает зафиксировать промежуточное состояние,
    // и индикатор остаётся на предыдущем разделе; 2) при быстром скролле
    // вверх события enter/exit могут прийти не в том порядке, из-за чего
    // индикатор перескакивал сразу с "Контактов" на "Работы", минуя
    // "Обо мне".
    //
    // Вместо слежения за пересечениями считаем активный раздел напрямую
    // от текущей позиции скролла: берём последнюю (самую нижнюю) секцию,
    // верх которой уже поднялся выше фиксированной "линии" под шапкой.
    // Это чистая функция от scrollY — для любой позиции скролла результат
    // всегда однозначен и меняется строго по порядку секций, без
    // возможности что-то пропустить в любую сторону прокрутки.
    const lastId = ids[ids.length - 1];

    const update = () => {
      const activationLine = headerHeight + window.innerHeight * 0.35;

      let current = elements[0].id;
      for (const el of elements) {
        if (el.getBoundingClientRect().top <= activationLine) {
          current = el.id;
        }
      }

      // На случай совсем короткой последней секции на маленьком экране —
      // если долистали до самого низа документа, последняя секция активна
      // в любом случае, даже если формально не дотянула до линии.
      const atBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      if (atBottom) current = lastId;

      setActiveSection(current);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [isHome, headerHeight, lang]);

  return (
    <>
      {mobileMenuOpen && (
        <div
          className={styles.backdrop}
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      <header ref={headerRef} className={`${styles.header} ${mobileMenuOpen ? styles.headerMenuOpen : ""}`}>
        <a href={isHome ? "#top" : "/"} className={styles.brand} onClick={goTo("top")}>
          <Image src={LOGO_SRC} alt="Logo" width={24} height={24} className={styles.logoImg} priority />
          <span className={styles.logo}>
            Socur <span className={styles.accent}>Dmitrii</span>
          </span>
        </a>

        {/* display:contents на десктопе — обёртка "прозрачна" для CSS-грида
            шапки, .nav и .langSwitch занимают те же 2-я/3-я колонки, что и
            раньше, макет не меняется вообще. На мобильной версии эта же
            обёртка превращается в выпадающую панель под шапкой (см. CSS). */}
        <div className={styles.menuPanel} data-open={mobileMenuOpen}>
          <nav className={styles.nav}>
            <a
              href={isHome ? "#work" : "/#work"}
              onClick={goTo("work")}
              className={activeSection === "work" || isProjectPage ? styles.activeNav : ""}
            >
              {t.nav.work}
            </a>
            <a
              href={isHome ? "#about" : "/#about"}
              onClick={goTo("about")}
              className={activeSection === "about" ? styles.activeNav : ""}
            >
              {t.nav.about}
            </a>
            <a
              href={isHome ? "#contact" : "/#contact"}
              onClick={goTo("contact")}
              className={activeSection === "contact" ? styles.activeNav : ""}
            >
              {t.nav.contact}
            </a>
          </nav>

          <div className={styles.langSwitch}>
            {LANGS.map((l) => (
              <button
                key={l}
                className={lang === l ? styles.activeLang : ""}
                onClick={() => {
                  setLang(l);
                  setMobileMenuOpen(false);
                }}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Быстрые контакты — видны только в мобильном выпадающем меню
              (см. .mobileContacts в CSS, на десктопе display:none, чтобы
              не ломать 2-колоночный грид шапки). */}
          <div className={styles.mobileContacts}>
            <a
              href={`mailto:${t.contact.email}`}
              aria-label="Email"
              onClick={() => setMobileMenuOpen(false)}
            >
              <EmailIcon />
            </a>
            {SOCIALS.map(({ key, href, icon: Icon, label }) => (
              <a
                key={key}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Icon />
              </a>
            ))}
          </div>
        </div>

        <button
          type="button"
          className={`${styles.burger} ${mobileMenuOpen ? styles.burgerOpen : ""}`}
          aria-label={mobileMenuOpen ? "Закрыть меню" : "Открыть меню"}
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </header>

      {/* Спейсер: занимает место, которое раньше занимал header в потоке
          документа до перехода на position: fixed */}
      <div style={{ height: headerHeight }} aria-hidden="true" />
    </>
  );
}