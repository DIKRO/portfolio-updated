import "../styles/globals.css";
import { Montserrat } from "next/font/google";
import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import ScrollToTop from "@/components/ScrollToTop/ScrollToTop";
import { getServerLang } from "@/lib/serverLang";
import { ru } from "@/content/locales/ru";
import { en } from "@/content/locales/en";
import { ro } from "@/content/locales/ro";
import { SOCIALS } from "@/content/socials";

const BASE_URL = "https://socurdmitrii.com";
const seoLocales = { ru, en, ro };

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

// Без этого экспорта Next.js вообще не добавляет <meta name="viewport">
// на страницу — мобильный браузер тогда считает, что сайт рассчитан на
// десктопную ширину (~980px по умолчанию) и просто масштабирует картинку
// под реальный экран.
//
// maximumScale/userScalable добавлены отдельно, чтобы устранить известный
// баг Safari на iPhone: при повороте экрана (а иногда и просто при
// взаимодействии со страницей, где есть position:fixed-элементы — у нас
// это шапка) браузер иногда сам "залипает" на неверном масштабе и
// показывает сайт визуально приближенным, будто его зумнули вручную —
// пока пользователь сам не сведёт/разведёт пальцами. С этими двумя
// параметрами масштаб жёстко зафиксирован на 1 — Safari физически не
// может уйти в этот баг. Минус: пользователь также не сможет специально
// увеличить страницу через pinch-zoom (актуально для людей с плохим
// зрением) — но раз баг проявлялся постоянно и на всём сайте, а не
// в одном месте, это более важный компромисс.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0e0e0e",
};

// title/description теперь берутся из t.seo (см. src/content/locales/*.ts) —
// один и тот же текст, что раньше был захардкожен здесь трижды, только уже
// на 3 языках. Какой из них показать конкретному посетителю решает
// getServerLang() по заголовку Accept-Language его браузера (подробности —
// в комментарии самого хелпера). metadataBase указывает на реальный домен;
// если сменишь домен — поменяй BASE_URL здесь и в src/app/sitemap.ts,
// src/app/robots.ts (там та же константа).
export async function generateMetadata(): Promise<Metadata> {
  const lang = await getServerLang();
  const { seo } = seoLocales[lang];

  // og:locale — какой язык фактически показан в этом конкретном ответе
  // сервера (угадан по Accept-Language, см. getServerLang). Помогает
  // соцсетям/мессенджерам правильно подписать превью ссылки, если у них
  // это вообще поддерживается.
  const ogLocale = { ru: "ru_RU", en: "en_US", ro: "ro_RO" }[lang];

  return {
    metadataBase: new URL(BASE_URL),
    title: seo.title,
    description: seo.description,
    // TODO: коды подтверждения владения сайтом — вписать сюда, когда
    // добавишь сайт в Google Search Console / Яндекс.Вебмастер (см.
    // объяснение, как их получить, отдельно). Пока не заполнено —
    // Next.js просто не выведет эти мета-теги, ничего не сломается.
    // verification: {
    //   google: "СЮДА_КОД_ИЗ_GOOGLE_SEARCH_CONSOLE",
    //   yandex: "СЮДА_КОД_ИЗ_ЯНДЕКС_ВЕБМАСТЕРА",
    // },
    alternates: {
      // Сайт не разбит на отдельные /ru /en /ro URL (язык переключается на
      // клиенте на одном и том же адресе) — поэтому все 3 варианта честно
      // указывают на один и тот же canonical-URL, чтобы не путать поисковик
      // дублирующимся контентом на разных языках под разными адресами.
      languages: { ru: BASE_URL, en: BASE_URL, ro: BASE_URL },
    },
    openGraph: {
      title: seo.title,
      description: seo.description,
      type: "website",
      url: BASE_URL,
      locale: ogLocale,
      // width/height — рекомендованный Facebook/Telegram/VK размер обложки
      // (1200×630). Если реальный файл og-cover.jpg другого размера,
      // поменяй числа на настоящие — иначе некоторые площадки могут
      // обрезать превью криво.
      images: [{ url: "/images/og-cover.jpg", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
      images: ["/images/og-cover.jpg"],
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const lang = await getServerLang();

  // JSON-LD: помогает поисковикам понять, что сайт — портфолио конкретного
  // человека (а не безымянная компания), и показать это в rich snippets.
  // Ссылки в sameAs берём из тех же соцсетей, что уже выведены в шапке/футере.
  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Socur Dmitrii",
    jobTitle: "Graphic Designer",
    url: BASE_URL,
    // Город/страна — помогает поисковику связать имя с локальными запросами
    // ("графический дизайнер Кишинёв" и т.п.), а не только с общими.
    // Поменяй, если фактическая локация другая.
    address: {
      "@type": "PostalAddress",
      addressLocality: "Chișinău",
      addressCountry: "MD",
    },
    // sameAs — только настоящие профильные URL (http/https); viber:// —
    // deep-link на чат, а не публичный профиль, схема.org его не ждёт.
    sameAs: SOCIALS.filter((s) => s.href.startsWith("http")).map((s) => s.href),
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Socur Dmitrii",
    url: BASE_URL,
  };

  return (
    <html lang={lang} data-scroll-behavior="smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body className={montserrat.className}>
        <div className="dotsBg" aria-hidden="true" />
        {children}
        <ScrollToTop />
        <Analytics />
      </body>
    </html>
  );
}
