import { LocalizedText } from "@/types/project";

// Иконка сферы деятельности клиента — рисуется внутри квадратного аватара
// (см. ICONS в Reviews.tsx). Чтобы добавить новую сферу: нарисуй иконку в
// components/Icons/Icons.tsx, добавь её ключ сюда и в ICONS в Reviews.tsx.
export type ReviewIconKey =
  | "wind" // ветроэнергетика
  | "sport" // спорт, спортивная одежда/обувь
  | "clothing" // одежда, fashion-бренд
  | "retail" // розничная торговля
  | "home" // товары для дома
  | "construction" // стройматериалы, краски
  | "drone" // дроны, сервис техники
  | "business"; // универсальная

export interface Review {
  id: string;
  // Имя клиента — как и логотипы в About.tsx, не переводится, показывается
  // как есть на всех языках.
  clientName: string;
  // Компания и должность — необязательны (например, если отзыв от частного
  // клиента без компании, просто не указывай company).
  company?: string;
  role?: LocalizedText;
  // Сфера деятельности клиента → иконка в аватаре. Не указывать, если для
  // клиента нет подходящей — тогда покажется универсальный «портфель».
  icon?: ReviewIconKey;
  year: number;
  // Страна клиента — локализуется, чтобы на каждом языке название страны
  // выглядело естественно ("Молдова" / "Moldova" / "Moldova", но для
  // других стран текст может отличаться сильнее, ru/en/ro).
  country: LocalizedText;
  // Код страны ISO 3166-1 alpha-2 (например "MD" для Молдовы, "RO" для
  // Румынии, "US" для США, "US"/"DE"/"FR" и т.д. для любой другой страны)
  // — по нему подгружается маленький SVG-флаг слева от названия страны в
  // карточке отзыва (см. Reviews.tsx, flagcdn.com). Поддерживаются все
  // страны мира по этому же коду, поэтому для нового клиента из любой
  // точки мира достаточно просто указать его код — рисовать/добавлять
  // иконку флага вручную не нужно.
  countryCode: string;
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
    icon: "wind",
    clientName: "Cezar Russo",
    company: "Energy Wind Moldova",
    role: {
      ru: "Исполнительный директор",
      en: "Executive Director",
      ro: "Director executiv",
    },
    year: 2026,
    country: { ru: "Молдова", en: "Moldova", ro: "Moldova" },
    countryCode: "MD",
    text: {
      ru: "Сотрудничество прошло отлично — особенно понравился комплексный подход к визуальной коммуникации нашего бренда. Были разработаны динамичные Reels, логотип для юридической компании, а также digital-материалы: баннеры, презентация и другие графические решения. Всё выполнено современно, профессионально и с хорошим пониманием задач бизнеса.",
      en: "The collaboration went well—I was especially impressed by the integrated approach to our brand's visual communications. We developed dynamic Reels, a logo for the law firm, and digital materials such as banners, a presentation, and other graphic solutions. Everything was executed in a modern, professional manner, and with a clear understanding of the business's objectives.",
      ro: "Colaborarea a decurs bine - am fost deosebit de impresionat de abordarea integrată a comunicării vizuale a mărcii noastre. Am dezvoltat reel-uri dinamice, un logo pentru firma de avocatură și materiale digitale precum bannere, o prezentare și alte soluții grafice. Totul a fost executat într-o manieră modernă, profesională și cu o înțelegere clară a obiectivelor afacerii.",
    },
  },
  {
    id: "telemarket",
    icon: "home",
    clientName: "Lilia Culea",
    company: "Telemarket.md",
    role: {
      ru: "Руководитель отдела маркетинга",
      en: "Head of Marketing",
      ro: "Șef departament marketing",
    },
    year: 2025,
    country: { ru: "Молдова", en: "Moldova", ro: "Moldova" },
    countryCode: "MD",
    text: {
      ru: "Дмитрий легкий в общении, позитивный и креативный. Главные ценности в таком сотруднике, как Дмитрий, - он никогда не говорит, что что-то невозможно. Быстро находит решения, предлагает варианты и в срок.",
      en: "Dmitry is easy to get along with, positive, and creative. A key quality he brings to the role is that he never says something is impossible; he quickly finds solutions and proposes options, always meeting deadlines.",
      ro: "Dmitry este ușor de comunicat, pozitiv și creativ. Valorile cheie la un angajat ca Dmitry sunt că nu spune niciodată că ceva este imposibil. Găsește rapid soluții, oferă opțiuni și livrează la timp.",
    },
  },
  {
    id: "vitrum-letale",
    icon: "clothing",
    clientName: "Vladislav Gudkov",
    company: "Vitrum Letale",
    role: {
      ru: "Основатель бренда одежды",
      en: "Clothing Brand Founder",
      ro: "Fondatorul brandului de îmbrăcăminte",
    },
    year: 2026,
    country: { ru: "Молдова", en: "Moldova", ro: "Moldova" },
    countryCode: "MD",
    text: {
      ru: "Работой Дмитрия очень доволен: он быстро понял идею бренда и передал её в визуале. Для Vitrum Letale он сделал карточки товара, сертификат подлинности и стикеры для дропа, и всё выглядит цельно и соответствует нашей эстетике. Отдельно ценю чёткие сроки и спокойную коммуникацию — с удовольствием продолжим сотрудничество.",
      en: "I'm very happy with Dmitrii's work: he quickly understood the brand's idea and translated it into visuals. For Vitrum Letale he created product cards, a certificate of authenticity and stickers for our drop, and everything looks cohesive and true to our aesthetic. I especially value the clear deadlines and smooth communication — I'm glad to keep working together.",
      ro: "Sunt foarte mulțumit de munca lui Dmitrii: a înțeles rapid ideea brandului și a transpus-o vizual. Pentru Vitrum Letale a realizat fișe de produs, certificat de autenticitate și autocolante pentru colecție, iar totul arată unitar și în spiritul esteticii noastre. Apreciez în special termenele clare și comunicarea fluidă — continuăm colaborarea cu plăcere.",
    },
  },
  {
    id: "dji",
    icon: "drone",
    clientName: "Percy Jackson",
    company: "dji service",
    role: {
      ru: "Менеджер по продукту",
      en: "Product Manager",
      ro: "Manager de produs",
    },
    year: 2025,
    country: { ru: "Россия", en: "Russia", ro: "Rusia" },
    countryCode: "RU",
    text: {
      ru: "Заказ был выполнен в полном объеме, в точном соответствии с оговоренными условиями и в установленные сроки. Работа была организована четко и без задержек, что позволило получить результат именно в том виде, в каком он ожидался.",
      en: "The order was fulfilled in full, in strict accordance with the agreed-upon terms and within the specified timeframe. The work was organized efficiently and without delays, which ensured that the result was exactly as expected.",
      ro: "Comanda a fost executată în întregime, în conformitate strictă cu condițiile convenite și în termenele stabilite. Lucrările au fost organizate în mod riguros și fără întârzieri, ceea ce a permis obținerea unui rezultat exact așa cum era de așteptat.",
    },
  },
  {
    id: "ChetonGrup",
    icon: "construction",
    clientName: "Olga Kistol",
    company: "CHETON GRUP",
    role: {
      ru: "Ассистент коммерческого директора",
      en: "Commercial Director Assistant",
      ro: "Asistent Director Comercial",
    },
    year: 2026,
    country: { ru: "Молдова", en: "Moldova", ro: "Moldova" },
    countryCode: "MD",
    text: {
      ru: "Заказ был выполнен в полном объеме, в точном соответствии с оговоренными условиями и в установленные сроки. Работа была организована четко и без задержек, что позволило получить результат именно в том виде, в каком он ожидался.",
      en: "The order was fulfilled in full, in strict accordance with the agreed-upon terms and within the specified timeframe. The work was organized efficiently and without delays, which ensured that the result was exactly as expected.",
      ro: "Comanda a fost executată în întregime, în conformitate strictă cu condițiile convenite și în termenele stabilite. Lucrările au fost organizate în mod riguros și fără întârzieri, ceea ce a permis obținerea unui rezultat exact așa cum era de așteptat.",
    },
  },
];
