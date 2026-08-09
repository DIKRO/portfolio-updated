"use client";

import { StarIcon, PlayIcon } from "@/components/Icons/Icons";
import styles from "./Hero.module.css";

interface HeroProps {
  t: {
    hero: {
      title: string;
      subtitle: string;
      badge: string;
      cta: string;
      ctaSecondary: string;
    };
  };
}

// Вырезка тебя без фона (прозрачный PNG) — фон рисуется через CSS-градиент
// в Hero.module.css (.bgWrap), а не самим фото.
const PHOTO_SRC = "/images/11111-cutout.png";

// Отдельное фото для мобилки — положи файл с таким именем в public/images,
// подхватится само через <picture> ниже, десктопное фото трогать не надо.
const PHOTO_SRC_MOBILE = "/images/11111-mobile.jpg";

// Это самое крупное изображение на первом экране (LCP-элемент почти на
// каждой странице), но оно грузится обычным <img>, а не компонентом
// next/image — из-за art-direction через <picture> (на мобильном это
// вообще другой файл, а не просто уменьшенная версия того же самого,
// а next/image не умеет отдавать разные исходники под разные медиа-запросы
// сам по себе). Чтобы не потерять оптимизацию Next.js (пересжатие,
// конвертация в AVIF/WebP под возможности браузера, укладывание в разумный
// вес), обращаемся напрямую к его встроенному эндпоинту оптимизации
// изображений (/_next/image) — тому самому, которым пользуется сам
// компонент <Image /> под капотом — просто передаём ему путь к файлу и
// нужную ширину. Так фото по-прежнему одно на десктоп/один на мобилку
// (никакого двойного скачивания), но каждое из них едет по сети уже
// сжатым, а не как есть. Ширины (1920/828) — стандартные "deviceSizes" из
// конфига Next.js по умолчанию, специально ничего не настраивали.
//
// Качество (88 десктоп / 85 мобилка) сознательно выше дефолтных 75 —
// это единственное фото, которое видит вообще каждый посетитель первым,
// плюс оно уже наполовину прозрачное PNG-вырезка с тонкими деталями
// (волосы, край лица), где на 75 сильнее заметны артефакты сжатия.
// Разница в весе файла небольшая (JPEG/AVIF-подобные кодеки почти не
// увеличивают размер линейно от 75 до 88-90 — основной прирост веса
// происходит уже после 90-92), а на LCP это не влияет: тяжелее не сама
// загрузка деталей чёткости, а разрешение/формат, которые не менялись.
function optimizedSrc(path: string, width: number, quality = 75): string {
  return `/_next/image?url=${encodeURIComponent(path)}&w=${width}&q=${quality}`;
}

export default function Hero({ t }: HeroProps) {
  const scrollTo = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="top" className={styles.hero}>
      <div className={styles.bgWrap}>
        <picture style={{ display: "contents" }}>
          <source media="(max-width: 768px)" srcSet={optimizedSrc(PHOTO_SRC_MOBILE, 828, 85)} />
          {/* next/image не поддерживает art-direction через <picture> с
              разными файлами под разные media-запросы (тут ниже — другое
              фото для мобилки, а не просто уменьшенная версия того же). ESLint
              не ругается на <img> внутри <picture> — это ровно тот случай,
              для которого исключение и предусмотрено. Оптимизация (сжатие,
              современный формат) всё равно применяется — см. optimizedSrc()
              выше, обращаемся к встроенному эндпоинту Next.js напрямую. */}
          <img
            src={optimizedSrc(PHOTO_SRC, 1920, 88)}
            alt="Portrait"
            fetchPriority="high"
            loading="eager"
            decoding="async"
            className={styles.bgPhoto}
          />
        </picture>
        <div className={styles.grain} />
      </div>

      <div className={styles.contentWrap}>
        <div className={styles.content}>
          <span className={styles.badge}>
            <StarIcon />
            {t.hero.badge}
          </span>

          <h1>{t.hero.title}</h1>
          <p className={styles.subtitle}>{t.hero.subtitle}</p>

          <div className={styles.ctaRow}>
            <a href="#contact" className={styles.cta} onClick={scrollTo("contact")}>
              {t.hero.cta} →
            </a>
            <a href="#work" className={styles.ctaSecondary} onClick={scrollTo("work")}>
              <PlayIcon />
              {t.hero.ctaSecondary}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
