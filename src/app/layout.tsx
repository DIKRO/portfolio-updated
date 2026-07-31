import "../styles/globals.css";
import { Montserrat } from "next/font/google";
import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import ScrollToTop from "@/components/ScrollToTop/ScrollToTop";

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
};

// Замени title/description на своё имя и специализацию.
// metadataBase уже указывает на реальный домен (socurdmitrii.com). Если
// когда-нибудь сменишь домен — поменяй значение и тут, и в src/app/sitemap.ts
// и src/app/robots.ts (там та же константа BASE_URL).
// Не забудь также добавить /public/images/og-cover.jpg (рекомендуемый
// размер 1200×630) — сейчас его нет, а без него превью сайта в соцсетях
// будет без картинки.
export const metadata: Metadata = {
  metadataBase: new URL("https://socurdmitrii.com"),
  title: "Socur Dmitrii — Graphic Designer",
  description: "Brand identity, visual design and art direction portfolio.",
  openGraph: {
    title: "Socur Dmitrii — Graphic Designer",
    description: "Brand identity, visual design and art direction portfolio.",
    type: "website",
    images: ["/images/og-cover.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Socur Dmitrii — Graphic Designer",
    description: "Brand identity, visual design and art direction portfolio.",
    images: ["/images/og-cover.jpg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className={montserrat.className}>
        <div className="dotsBg" aria-hidden="true" />
        {children}
        <ScrollToTop />
        <Analytics />
      </body>
    </html>
  );
}
