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
  const projectPages: MetadataRoute.Sitemap = projects.map((project) => ({
    url: `${BASE_URL}/work/${project.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    ...projectPages,
  ];
}
