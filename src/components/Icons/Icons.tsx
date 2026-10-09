export function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.5l2.6 6.3 6.8.5-5.2 4.4 1.7 6.6L12 16.9 6.1 20.3l1.7-6.6-5.2-4.4 6.8-.5L12 2.5z" />
    </svg>
  );
}

// Парные "лапки" кавычек — маленький декоративный акцент в углу карточки
// отзыва (см. Reviews.tsx), напротив имени клиента.
export function QuoteIcon() {
  return (
    <svg viewBox="0 0 32 24" fill="currentColor">
      <path d="M4 24V15.2C4 8.6 7.9 3.6 14.4 0l2.3 3.9C12.5 6.2 10.4 9 10 12.4h6V24H4zm16 0V15.2C20 8.6 23.9 3.6 30.4 0l2.3 3.9c-4.2 2.3-6.3 5.1-6.7 8.5h6V24H20z" />
    </svg>
  );
}

// Симметричная стрелка-шеврон для навигации (карусель проектов и т.п.) —
// используется и как "назад" (как есть), и как "вперёд" (через CSS
// transform: scaleX(-1) на самой кнопке), чтобы обе стрелки были
// зеркально одинаковыми и одинаково центрированными — обычные текстовые
// символы ‹ › для этого не годятся: у шрифтов их отрисовка часто немного
// смещена/асимметрична, из-за чего стрелки визуально "не ровно" стоят
// друг напротив друга.
export function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
      <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5.5v13l11-6.5-11-6.5z" />
    </svg>
  );
}

// Стандартная иконка "развернуть на весь экран" (4 стрелки к углам) — кнопка
// поверх видео в галерее кейса (см. ProjectView.tsx), которая открывает то
// же видео в лайтбоксе вместе с остальными фото проекта, посчитанным по
// общему счётчику "N / M" — отдельно от нативных play/controls самого
// видео, чтобы не путать два разных клика в одной области.
export function ExpandIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 3H5a2 2 0 0 0-2 2v4" />
      <path d="M15 3h4a2 2 0 0 1 2 2v4" />
      <path d="M9 21H5a2 2 0 0 1-2-2v-4" />
      <path d="M15 21h4a2 2 0 0 0 2-2v-4" />
    </svg>
  );
}

export function PenIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path
        d="M4 20l1-4.5L15.5 5 19 8.5 8.5 19 4 20z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M13 7l3.5 3.5" strokeLinecap="round" />
    </svg>
  );
}

export function PrinterIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M7 9V4h10v5" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M7 17H5.5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H17"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M7 14h10v6H7z" strokeLinejoin="round" />
    </svg>
  );
}

export function MonitorIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="3" y="4" width="18" height="13" rx="2" />
      <path d="M8 21h8M12 17v4" strokeLinecap="round" />
    </svg>
  );
}

export function EmailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function TelegramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path
        d="M21 4.5 3.5 11.2c-.9.35-.9 1.6.02 1.9l4.2 1.35 1.6 5.1c.28.9 1.42 1.1 2 .35l2.3-3 4.4 3.3c.8.6 1.95.16 2.15-.8L22 5.4c.2-1-.7-1.7-1.5-1.35Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M8.7 14.5l9.5-8.2" strokeLinecap="round" />
    </svg>
  );
}

export function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function ViberIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path
        d="M12 4c5 0 8 2.6 8 7.5 0 4.4-2.6 7-6.8 7.4-.7.07-1.1.5-1.4 1.1l-.5 1c-.3.6-1 .6-1.2-.1l-.4-1.5c-.15-.55-.4-.75-.95-.85C5.1 18 4 15.2 4 11.5 4 6.6 7 4 12 4Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.3 9.3c-.15-.6.15-1.2.75-1.3.6-.1 1.2.3 1.3.9M9.5 12.3c1.6 1.7 3 2.5 4.4 2.5.6 0 .8-.5.6-1-.15-.35-.5-.5-.85-.4-1.4.4-3.1-.9-3.9-2.6a.7.7 0 0 1 .3-.9M12.7 8.2c1.6.15 2.7 1.25 2.9 2.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Товары для дома, домашний ассортимент
export function HomeIcon() {
  return (
    <svg {...sphereProps}>
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5.5 10v10h13V10" />
      <path d="M10 20v-5h4v5" />
    </svg>
  );
}

// Универсальная иконка для соцсетей, для которых не завели отдельную —
// используй как заготовку для «других» ссылок (LinkedIn и т.д.)
export function LinkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path
        d="M9 15l6-6M10.5 6.5l1-1a3.5 3.5 0 0 1 5 5l-1 1M13.5 17.5l-1 1a3.5 3.5 0 0 1-5-5l1-1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function LayersIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M12 3.5 3 8.5l9 5 9-5-9-5z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 12.5l9 5 9-5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 16.5l9 5 9-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.2 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Иконки сфер деятельности клиентов для аватаров в карточках отзывов (см.
// Reviews.tsx и поле icon в content/reviews.ts). Контурные, на сетке 24×24,
// stroke берётся из currentColor — цвет и толщину линии задаёт CSS карточки
// (.avatar в Reviews.module.css), поэтому здесь они не прописаны.
const sphereProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

// Ветроэнергетика
export function WindTurbineIcon() {
  return (
    <svg {...sphereProps}>
      <circle cx="12" cy="9" r="1.4" />
      <path d="M12 7.6V2.5M10.8 9.7 6.4 12.3M13.2 9.7l4.4 2.6M12 10.4V21M8.5 21h7" />
    </svg>
  );
}

// Спорт, спортивная одежда и обувь
export function SneakerIcon() {
  return (
    <svg {...sphereProps}>
      <path d="M3 17V9.2c0-.7.5-1.2 1.2-1.2H7c.1 1.6 1.3 2.6 2.7 2.6H11l2.3-2.6 1.7 1.6c1.1 1.1 2.6 1.9 4.2 2.3l1.4.4c1 .3 1.7 1.1 1.7 2.1V17z" />
      <path d="M3 19.5h19M10.8 10.6l1.5 1.5M13.2 8.4l1.5 1.5" />
    </svg>
  );
}

// Одежда, fashion-бренды
export function ShirtIcon() {
  return (
    <svg {...sphereProps}>
      <path d="M8 3 3.5 5.5l2 4L8 8.5V20h8V8.5l2.5 1 2-4L16 3c-.5 1.5-2.1 2.2-4 2.2S8.5 4.5 8 3z" />
    </svg>
  );
}

// Розничная торговля, магазины
export function CartIcon() {
  return (
    <svg {...sphereProps}>
      <path d="M3 4h2.5l2.2 11h10.3l1.8-8H6" />
      <circle cx="9" cy="19" r="1.4" />
      <circle cx="17" cy="19" r="1.4" />
    </svg>
  );
}

// Стройматериалы, краски, ремонт
export function PaintRollerIcon() {
  return (
    <svg {...sphereProps}>
      <rect x="4" y="3" width="14" height="5" rx="1.5" />
      <path d="M18 5.5h2v5h-8v3" />
      <rect x="10.5" y="13.5" width="3" height="7.5" rx="1" />
    </svg>
  );
}

// Дроны, сервис техники
export function DroneIcon() {
  return (
    <svg {...sphereProps}>
      <rect x="9.5" y="10" width="5" height="4" rx="1" />
      <path d="M9.5 10 6.4 6.4M14.5 10l3.1-3.6M9.5 14l-3.1 3.6M14.5 14l3.1 3.6" />
      <circle cx="5" cy="5" r="2" />
      <circle cx="19" cy="5" r="2" />
      <circle cx="5" cy="19" r="2" />
      <circle cx="19" cy="19" r="2" />
    </svg>
  );
}

// Универсальная иконка — когда для сферы клиента отдельной нет
export function BriefcaseIcon() {
  return (
    <svg {...sphereProps}>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7M3 13h18" />
    </svg>
  );
}
