"use client";

import { motion } from "framer-motion";
import { useLang } from "@/content/lang";
import Header from "@/components/Header/Header";
import Hero from "@/components/Hero/Hero";
import Highlights from "@/components/Highlights/Highlights";
import WorkGrid from "@/components/Work/WorkGrid";
import About from "@/components/About/About";
import Contact from "@/components/Contact/Contact";
import Footer from "@/components/Footer/Footer";

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
          когда сохранённый язык подхватывается уже после монтирования) */}
      <motion.div key={lang} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
        <Hero t={t} />
        <Highlights t={t} />
        <WorkGrid lang={lang} t={t} />
        <About lang={lang} t={t} />
        <Contact t={t} />
        <Footer />
      </motion.div>
    </main>
  );
}
