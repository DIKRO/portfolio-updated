// Генератор blurDataURL для next/image (placeholder="blur"). Next умеет
// сам генерировать блюр-превью только для картинок, импортированных
// статически (import img from "./photo.jpg") — у нас же пути к обложкам
// приходят строками из content/projects (project.cover), так что для них
// Next ничего сгенерировать не может. Вместо реального уменьшенного фото
// подсовываем маленькую animated SVG-заглушку с бегущей полосой — тот же
// "скелетон"-эффект, что и на остальных плейсхолдерах в проекте, просто
// в формате, который понимает сам компонент Image и его встроенный
// плавный переход blur → resolved.
const shimmer = (w: number, h: number) => `
<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg" version="1.1">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#171717" offset="20%" />
      <stop stop-color="#232323" offset="50%" />
      <stop stop-color="#171717" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#171717" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1.1s" repeatCount="indefinite" />
</svg>`;

const toBase64 = (str: string) =>
  typeof window === "undefined" ? Buffer.from(str).toString("base64") : window.btoa(str);

export function shimmerBlurDataURL(w = 700, h = 475) {
  return `data:image/svg+xml;base64,${toBase64(shimmer(w, h))}`;
}
