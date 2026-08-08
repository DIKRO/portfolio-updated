"use client";

import dynamic from "next/dynamic";
import { useLang } from "@/content/lang";
import Header from "@/components/Header/Header";
import Hero from "@/components/Hero/Hero";
import Highlights from "@/components/Highlights/Highlights";

// Hero/Highlights — первый экран, грузятся сразу и обычным импортом.
// Всё, что ниже, пользователь физически не видит до скролла, поэтому
// незачем тащить их JS в основной бандл с первой секунды: next/dynamic
// выносит каждый компонент в отдельный чанк, который браузер догружает
// параллельно, не блокируя парсинг и выполнение основного скрипта.
// HTML при этом всё равно рендерится на сервере как обычно (ssr не
// отключаем) — контент виден сразу, ускоряется только момент, когда
// страница становится интерактивной на слабых устройствах.
const WorkGrid = dynamic(() => import("@/components/Work/WorkGrid"));
const About = dynamic(() => import("@/components/About/About"));
const Reviews = dynamic(() => import("@/components/Reviews/Reviews"));
const Contact = dynamic(() => import("@/components/Contact/Contact"));
const Footer = dynamic(() => import("@/components/Footer/Footer"));

export default function Home() {
  const { lang, setLang, t } = useLang();

  // key={lang} на секциях ниже полностью их перемонтирует при смене языка
  // (см. комментарий у motion.div). Из-за этого браузер иногда чуть
  // "поправляет" scrollY в момент перерисовки (пересчёт высоты страницы
  // на долю кадра) — и индикатор активного раздела в шапке успевал
  // соскочить на другой раздел ровно в момент переключения языка (например
  // с "Контактов" на "Работы"), хотя пользователь никуда не скроллил.
  // Явно фиксируем позицию скролла до смены языка и жёстко восстанавливаем
  // её после того, как новый контент отрисовался и встал на место —
  // scroll-behavior на время восстановления отключаем, чтобы это было
  // мгновенно, без визуальной анимации (иначе сработал бы глобальный
  // scroll-behavior: smooth и это выглядело бы как лишний скролл).
  const handleSetLang = (next: typeof lang) => {
    const scrollY = window.scrollY;
    setLang(next);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const html = document.documentElement;
        const prevBehavior = html.style.scrollBehavior;
        html.style.scrollBehavior = "auto";
        window.scrollTo(0, scrollY);
        html.style.scrollBehavior = prevBehavior;
      });
    });
  };

  return (
    <main>
      <Header lang={lang} setLang={handleSetLang} t={t} />

      {/* key={lang} плавно перерисовывает контент при смене языка вместо
          мгновенного "мигания" (актуально и при самом первом рендере,
          когда сохранённый язык подхватывается уже после монтирования).
          Раньше тут был motion.div из framer-motion с initial={{opacity:0}}
          — из-за этого браузер не мог закрасить контент (включая Hero,
          LCP-элемент почти на каждой странице), пока framer-motion не
          подгрузится и не выполнится на клиенте: JS ещё грузится —
          пиксели уже физически нарисованы сервером, но невидимы. Обычный
          div + CSS-анимация (см. .pageFadeIn в globals.css) даёт тот же
          плавный fade, но запускается сразу через CSS, без ожидания
          гидратации — LCP считается по первому реальному пикселю, а не
          по моменту, когда JS решит его показать. */}
      <div key={lang} className="pageFadeIn">
        <Hero t={t} />
        <Highlights t={t} />
        <WorkGrid lang={lang} t={t} />
        <About lang={lang} t={t} />
        <Reviews lang={lang} t={t} />
        <Contact t={t} />
        <Footer />
      </div>
    </main>
  );
}
