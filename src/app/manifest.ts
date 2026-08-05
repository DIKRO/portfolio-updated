import type { MetadataRoute } from "next";

// Next.js сам подхватывает этот файл и отдаёт готовый manifest по адресу
// /manifest.webmanifest — ничего руками собирать не нужно. Основная польза
// не в поисковой выдаче напрямую, а в том, что браузер получает базовые
// "паспортные данные" сайта (имя, цвет, иконку) — это использует "Добавить
// на экран" на телефоне и иногда учитывается как сигнал качества сайта.
//
// icons ссылаются на те же файлы, что уже лежат в src/app (icon.png,
// apple-icon.png) — Next отдаёт их по тем же путям автоматически. Если их
// реальный пиксельный размер отличается от указанного ниже — поправь
// sizes на настоящий, иначе браузер может неправильно выбрать иконку.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Socur Dmitrii — Graphic Designer",
    short_name: "Socur Dmitrii",
    description: "Портфолио графического дизайнера в Кишинёве, Молдова.",
    start_url: "/",
    display: "standalone",
    background_color: "#0e0e0e",
    theme_color: "#0e0e0e",
    icons: [
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
