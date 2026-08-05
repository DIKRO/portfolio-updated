import type { MetadataRoute } from "next";
import { projects } from "@/content/projects";

// Замени на свой домен, если он отличается
const BASE_URL = "https://socurdmitrii.com";

// Next.js сам подхватывает этот файл и отдаёт готовый sitemap.xml по адресу
// /sitemap.xml — ничего руками собирать не нужно, достаточно вернуть
// массив страниц. Каждый раз при сборке сайта (npm run build) список
// проектов подтягивается автоматически из content/projects — добавил
// новый проект туда, он сам появится и здесь, без ручной правки.
export default function sitemap(): MetadataRoute.Sitemap {
  // lastModified — используем реальный год проекта (1 января этого года)
  // вместо "текущего момента сборки". Раньше здесь стоял new Date(), из-за
  // чего при каждой пересборке сайта (даже без единой правки в проектах)
  // поисковику сообщалось "все страницы только что обновились" — это не
  // враньё в смысле бана, но и не помогает: реальная дата хоть примерно
  // отражает, когда работа появилась.
  const projectPages: MetadataRoute.Sitemap = projects.map((project) => ({
    url: `${BASE_URL}/work/${project.slug}`,
    lastModified: new Date(project.year, 0, 1),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const latestYear = projects.reduce((max, p) => Math.max(max, p.year), new Date().getFullYear());

  return [
    {
      url: BASE_URL,
      lastModified: new Date(latestYear, 0, 1),
      changeFrequency: "monthly",
      priority: 1,
    },
    ...projectPages,
  ];
}
