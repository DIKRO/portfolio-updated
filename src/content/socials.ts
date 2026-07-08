import { TelegramIcon, InstagramIcon, ViberIcon } from "@/components/Icons/Icons";

// Замени ссылки на свои. Чтобы добавить ещё одну соцсеть — скопируй один
// объект из массива, поставь свою ссылку и подходящую иконку (см. Icons.tsx,
// для новых соцсетей без готовой иконки используй LinkIcon как заготовку).
export const SOCIALS = [
  { key: "telegram", href: "https://t.me/your_username", icon: TelegramIcon, label: "Telegram" },
  { key: "instagram", href: "https://instagram.com/your_username", icon: InstagramIcon, label: "Instagram" },
  // Замени номер на свой (в формате +код_страны_номер, без пробелов)
  { key: "viber", href: "viber://chat?number=%2B10000000000", icon: ViberIcon, label: "Viber" },
];
