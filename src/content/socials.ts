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
    href: "https://www.linkedin.com/in/%D0%B4%D0%BC%D0%B8%D1%82%D1%80%D0%B8%D0%B9-%D1%81%D0%BE%D0%BA%D1%83%D1%80-136867279/",
    icon: LinkedInIcon,
    label: "LinkedIn",
  },
  // Замени номер на свой (в формате +код_страны_номер, без пробелов)
  { key: "viber", href: "viber://chat?number=%2B37368871018", icon: ViberIcon, label: "Viber" },
];
