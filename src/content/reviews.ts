import { LocalizedText } from "@/types/project";

export interface Review {
  id: string;
  // Имя клиента — как и логотипы в About.tsx, не переводится, показывается
  // как есть на всех языках.
  clientName: string;
  // Компания и должность — необязательны (например, если отзыв от частного
  // клиента без компании, просто не указывай company).
  company?: string;
  role?: LocalizedText;
  year: number;
  // Страна клиента — локализуется, чтобы на каждом языке название страны
  // выглядело естественно ("Молдова" / "Moldova" / "Moldova", но для
  // других стран текст может отличаться сильнее, ru/en/ro).
  country: LocalizedText;
  // Оценка 1-5 — необязательна, если не указана, звёзды не рисуются.
  rating?: number;
  text: LocalizedText;
}

// Отзывы клиентов — карточки в разделе "Отзывы" перед контактами.
// Ниже — ЗАГОТОВКИ (плейсхолдер-тексты) под реальных клиентов, уже
// упомянутых в разделе "Обо мне" (см. CLIENTS в About.tsx) — просто замени
// текст text на настоящую цитату клиента, когда соберёшь отзывы. Поле id
// должно быть уникальным (используется как React key и для скролла к
// конкретной карточке, если понадобится).
//
// Чтобы добавить/убрать отзыв — добавь/удали объект в массиве целиком,
// порядок в массиве = порядок отображения в сетке.
export const reviews: Review[] = [
  {
    id: "energy-wind",
    clientName: "Ana Rusu",
    company: "Energy Wind Moldova",
    role: {
      ru: "Маркетинг-менеджер",
      en: "Marketing Manager",
      ro: "Manager de marketing",
    },
    year: 2025,
    country: { ru: "Молдова", en: "Moldova", ro: "Moldova" },
    rating: 5,
    text: {
      ru: "Дмитрий разработал фирменный стиль с нуля и попал точно в то, как мы хотели выглядеть в глазах клиентов — современно и по делу. Материалы для соцсетей и наружной рекламы готовит быстро, без лишних правок, всегда предлагает несколько вариантов на выбор.",
      en: "Dmitrii built our brand identity from scratch and nailed exactly how we wanted to look to our clients — modern and to the point. He delivers social media and outdoor advertising materials quickly, with minimal revisions, and always offers a few options to choose from.",
      ro: "Dmitrii a creat identitatea vizuală de la zero și a nimerit exact cum voiam să arătăm în fața clienților — modern și la obiect. Livrează rapid materiale pentru social media și publicitate exterioară, cu revizuiri minime, și oferă mereu câteva variante de ales.",
    },
  },
  {
    id: "sport-spirit",
    clientName: "Igor Popescu",
    company: "Sport Spirit",
    role: {
      ru: "Владелец магазина",
      en: "Store Owner",
      ro: "Proprietar magazin",
    },
    year: 2024,
    country: { ru: "Молдова", en: "Moldova", ro: "Moldova" },
    rating: 5,
    text: {
      ru: "Сотрудничаем уже не первый сезон: баннеры, постеры, POS-материалы — всё приходит в срок и готово к печати без доработок. Отдельно ценю, что Дмитрий сам следит за цветопередачей перед типографией, нам не приходится это контролировать.",
      en: "We've been working together for several seasons now: banners, posters, POS materials — everything arrives on time and print-ready without extra fixes. I especially value that Dmitrii checks the color accuracy himself before printing, so we don't have to.",
      ro: "Colaborăm de câteva sezoane deja: bannere, postere, materiale POS — totul vine la timp și gata de tipar, fără corecturi suplimentare. Apreciez în mod special că Dmitrii verifică el însuși acuratețea culorilor înainte de tipar, nu trebuie să facem noi asta.",
    },
  },
  {
    id: "telemarket",
    clientName: "Victor Ceban",
    company: "Telemarket.md",
    role: {
      ru: "Руководитель отдела маркетинга",
      en: "Head of Marketing",
      ro: "Șef departament marketing",
    },
    year: 2024,
    country: { ru: "Молдова", en: "Moldova", ro: "Moldova" },
    rating: 5,
    text: {
      ru: "Обращались за фирменным стилем и остались адаптировать его под соцсети на регулярной основе — качество стабильное от макета к макету. Дмитрий легко подстраивается под наши правки и объясняет решения, а не просто присылает финальный файл.",
      en: "We came for the brand identity and stayed for ongoing social media adaptations — the quality stays consistent from one layout to the next. Dmitrii adapts easily to our feedback and explains his decisions instead of just sending a final file.",
      ro: "Am venit pentru identitatea vizuală și am rămas pentru adaptări constante pe social media — calitatea rămâne constantă de la un layout la altul. Dmitrii se adaptează ușor la feedback-ul nostru și explică deciziile, nu doar trimite fișierul final.",
    },
  },
  {
    id: "puma-moldova",
    clientName: "Cristina Melnic",
    company: "PUMA Moldova",
    role: {
      ru: "Специалист по рекламе",
      en: "Advertising Specialist",
      ro: "Specialist publicitate",
    },
    year: 2023,
    country: { ru: "Молдова", en: "Moldova", ro: "Moldova" },
    rating: 5,
    text: {
      ru: "Работа с международным брендом требует точного соблюдения гайдлайнов — Дмитрий с этим справляется без единого замечания от головного офиса. Ресайзы под Google Ads и наружку под световые короба готовит быстро и аккуратно.",
      en: "Working with an international brand means strict guideline compliance — Dmitrii handles this without a single note back from headquarters. He delivers Google Ads resizes and light box outdoor formats quickly and cleanly.",
      ro: "Lucrul cu un brand internațional înseamnă respectarea strictă a ghidurilor — Dmitrii se descurcă fără nicio observație din partea sediului central. Livrează rapid și curat redimensionări pentru Google Ads și formate pentru cutii luminoase.",
    },
  },
  {
    id: "cheton-grup",
    clientName: "Sergiu Lungu",
    company: "Cheton Grup",
    role: {
      ru: "Технический директор",
      en: "Technical Director",
      ro: "Director tehnic",
    },
    year: 2023,
    country: { ru: "Молдова", en: "Moldova", ro: "Moldova" },
    rating: 5,
    text: {
      ru: "Этикетки для промышленной печати — задача с кучей технических нюансов (вылеты, цветовые профили, форматы под конкретное оборудование), и Дмитрий разобрался в них сам, без долгих объяснений с нашей стороны. Результат — макеты уходят в печать с первого раза.",
      en: "Labels for industrial printing come with plenty of technical nuances — bleed, color profiles, formats tied to specific equipment — and Dmitrii figured them out himself without needing lengthy explanations from us. The result: layouts go to print right the first time.",
      ro: "Etichetele pentru tipar industrial vin cu multe nuanțe tehnice — sângerare, profile de culoare, formate legate de echipamentul specific — și Dmitrii le-a înțeles singur, fără explicații lungi din partea noastră. Rezultatul: machetele merg la tipar din prima.",
    },
  },
  {
    id: "stip",
    clientName: "Elena Josanu",
    company: "Stip",
    role: {
      ru: "Менеджер по продукту",
      en: "Product Manager",
      ro: "Manager de produs",
    },
    year: 2022,
    country: { ru: "Молдова", en: "Moldova", ro: "Moldova" },
    rating: 5,
    text: {
      ru: "У нас сотни позиций в каталоге, и каждую нужно было привести к одному виду — Дмитрий сделал ретушь единообразной по всей линейке, без потери деталей на светлых игрушках. Сроки всегда соблюдены, даже при больших партиях фото.",
      en: "We have hundreds of items in our catalog, and each one needed to match a single look — Dmitrii kept the retouching consistent across the whole range, without losing detail on light-colored toys. Deadlines were always met, even with large photo batches.",
      ro: "Avem sute de produse în catalog, iar fiecare trebuia adus la un aspect unitar — Dmitrii a păstrat retușul consecvent pe toată gama, fără a pierde detalii la jucăriile deschise la culoare. Termenele au fost respectate mereu, chiar și la loturi mari de fotografii.",
    },
  },
];
