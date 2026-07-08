import { useEffect, useState } from "react";
import { ru } from "./locales/ru";
import { en } from "./locales/en";
import { ro } from "./locales/ro";

export type Lang = "ru" | "en" | "ro";

const locales = {
  ru,
  en,
  ro,
};

const STORAGE_KEY = "lang";

export function useLang() {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "ru" || saved === "en" || saved === "ro") {
      // Читаем сохранённый язык только после монтирования на клиенте,
      // чтобы избежать несовпадения серверного и клиентского рендера.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLangState(saved);
    }
  }, []);

  const setLang = (next: Lang) => {
    setLangState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  };

  const t = locales[lang];

  return {
    lang,
    setLang,
    t,
  };
}
