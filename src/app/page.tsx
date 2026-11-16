import { getServerLang } from "@/lib/serverLang";
import HomeClient from "@/components/Home/HomeClient";

// Серверная обёртка: определяет язык по заголовку Accept-Language и передаёт
// его клиентской части, чтобы страница сразу отрисовалась на нужном языке.
export default async function Home() {
  const lang = await getServerLang();
  return <HomeClient initialLang={lang} />;
}
