import "../styles/globals.css";
import { Montserrat } from "next/font/google";
import type { Metadata, Viewport } from "next";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

// Без этого экспорта Next.js вообще не добавляет <meta name="viewport">
// на страницу — мобильный браузер тогда считает, что сайт рассчитан на
// десктопную ширину (~980px по умолчанию) и просто масштабирует картинку
// под реальный экран. При повороте телефона этот масштаб пересчитывается
// некорректно, из-за чего сайт выглядит слишком приближенным.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

// Замени title/description на своё имя и специализацию.
// Замени metadataBase на реальный домен после публикации сайта, и добавь
// /public/images/og-cover.jpg (рекомендуемый размер 1200×630) для превью в соцсетях.
export const metadata: Metadata = {
  metadataBase: new URL("https://example.com"),
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
      </body>
    </html>
  );
}
