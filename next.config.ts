import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["172.25.208.1"],
  images: {
    // Разрешаем оптимизацию SVG — сейчас обложки проектов временно в SVG,
    // после замены на JPG/PNG это тоже продолжит работать.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Next.js 16 требует явно перечислить разрешённые значения quality
    // для встроенного оптимизатора изображений (/_next/image) — без этого
    // списка запрос с любым quality (даже дефолтным 75) отклоняется, и
    // <img>, который на него ссылается, просто не грузится. 75 — то,
    // что используется по умолчанию почти везде на сайте; 85/88 — то,
    // что используется у фото в Hero/About. 90/95 добавлены для ручного
    // сравнения качества через прямые ссылки вида /_next/image?...&q=95
    // (см. чат) — если по итогу остановишься на каком-то одном значении,
    // остальные отсюда можно смело убрать.
    qualities: [75, 85, 88, 90, 95],
  },
};

export default nextConfig;
