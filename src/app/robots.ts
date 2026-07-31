import type { MetadataRoute } from "next";

// Замени на свой домен, если он отличается
const BASE_URL = "https://socurdmitrii.com";

// Next.js сам подхватывает этот файл и отдаёт готовый robots.txt по адресу
// /robots.txt. Разрешаем ботам обходить весь сайт целиком и указываем им,
// где искать sitemap.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
