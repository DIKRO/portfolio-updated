import { TelegramIcon, InstagramIcon, LinkedInIcon, ViberIcon } from "@/components/Icons/Icons";

// Замени ссылки на свои. Чтобы добавить ещё одну соцсеть — скопируй один
// объект из массива, поставь свою ссылку и подходящую иконку (см. Icons.tsx,
// для новых соцсетей без готовой иконки используй LinkIcon как заготовку).
export const SOCIALS = [
  { key: "telegram", href: "https://t.me/Dikrodesign", icon: TelegramIcon, label: "Telegram" },
  { key: "instagram", href: "https://instagram.com/socurdmitrii_gd", icon: InstagramIcon, label: "Instagram" },
  // Ссылка со встроенной кириллицей в адресе профиля (уже в закодированном виде).
  {
    key: "linkedin",
    href: "https://www.linkedin.com/in/socurdmitrii/",
    icon: LinkedInIcon,
    label: "LinkedIn",
  },
  // Замени номер на свой (в формате +код_страны_номер, без пробелов)
  { key: "viber", href: "viber://chat?number=%2B37368871018", icon: ViberIcon, label: "Viber" },
];
