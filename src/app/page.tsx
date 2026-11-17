import type { Metadata } from "next";
import { getServerLang } from "@/lib/serverLang";
import HomeClient from "@/components/Home/HomeClient";

// Явный canonical для главной: сайт открывается и по socurdmitrii.com, и по
// www.socurdmitrii.com — без этого тега Google считал одну из версий копией
// другой («Страница является копией») и не спешил её индексировать.
export const metadata: Metadata = {
  alternates: { canonical: "https://socurdmitrii.com" },
};

// Серверная обёртка: определяет язык по заголовку Accept-Language и передаёт
// его клиентской части, чтобы страница сразу отрисовалась на нужном языке.
export default async function Home() {
  const lang = await getServerLang();
  return <HomeClient initialLang={lang} />;
}
