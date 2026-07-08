import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["172.25.208.1"],
  images: {
    // Разрешаем оптимизацию SVG — сейчас обложки проектов временно в SVG,
    // после замены на JPG/PNG это тоже продолжит работать.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
