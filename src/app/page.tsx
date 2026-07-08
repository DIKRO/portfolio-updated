"use client";

import { motion } from "framer-motion";
import { useLang } from "@/content/lang";
import Header from "@/components/Header/Header";
import Hero from "@/components/Hero/Hero";
import WorkGrid from "@/components/Work/WorkGrid";
import About from "@/components/About/About";
import Contact from "@/components/Contact/Contact";
import Footer from "@/components/Footer/Footer";

export default function Home() {
  const { lang, setLang, t } = useLang();

  return (
    <main>
      <Header lang={lang} setLang={setLang} t={t} />

      {/* key={lang} плавно перерисовывает контент при смене языка вместо
          мгновенного "мигания" (актуально и при самом первом рендере,
          когда сохранённый язык подхватывается уже после монтирования) */}
      <motion.div key={lang} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
        <Hero t={t} />
        <WorkGrid lang={lang} t={t} />
        <About t={t} />
        <Contact t={t} />
        <Footer />
      </motion.div>
    </main>
  );
}
