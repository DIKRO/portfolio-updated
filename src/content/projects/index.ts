import { Project } from "@/types/project";

// Плейсхолдеры — замени cover/images на свои работы (см. /public/images/work),
// заполни title/description на трёх языках. slug используется в адресе
// страницы проекта: /work/<slug> — сделай его коротким и на латинице.
export const projects: Project[] = [
  {
    id: "1",
    slug: "project-one",
    title: { ru: "Логотип для дизайнера Socur Dmitrii", en: "Logo for designer Socur Dmitrii", ro: "Logo pentru designerul Socur Dmitrii" },
    categoryKey: "branding",
    year: 2026,
    cover: "/images/work/cover-1.jpg",
    images: [
      "/images/work/socurdmitrii/work.jpg",
      "/images/work/socurdmitrii/work3.png",
      "/images/work/socurdmitrii/work4.png",
      "/images/work/socurdmitrii/work5.jpg",
      "/images/work/socurdmitrii/work6.jpg",
      "/images/work/socurdmitrii/work8.png",
      "/images/work/socurdmitrii/work7.jpg",
      "/images/work/socurdmitrii/work9.jpg"],
    description: {
      ru: "Логотип, разработанный для себя. Лого выполнено в плоском стиле, сочетает в себе аббревиатуру имени и фамилии Socur Dmitrii. Помимо этого, для формирования визуального баланса левая часть была дополнена вертикальным элементом, который замыкает фигуру.",
      en: "A logo I designed for myself. The logo is created in a flat style and combines the initials of my first and last name, Socur Dmitrii. In addition, to create visual balance, a vertical element was added to the left side to complete the shape.",
      ro: "Un logo creat pentru mine. Logo-ul este realizat în stil plat și combină inițialele numelui și prenumelui Socur Dmitrii. În plus, pentru a crea un echilibru vizual, partea stângă a fost completată cu un element vertical care încheie forma.",
    },
  },
  {
    id: "2",
    slug: "project-two",
    title: { ru: "Название проекта", en: "Project name", ro: "Numele proiectului" },
    categoryKey: "web",
    year: 2026,
    cover: "/images/work/cover-2.svg",
    images: ["/images/work/cover-2.svg", "/images/work/detail-1.svg", "/images/work/detail-2.svg"],
    description: {
      ru: "Краткое описание проекта: расскажи, что сделал в этой работе. Замени этот текст на реальную историю.",
      en: "Short project description: tell the story of what you did in this piece of work. Replace this with the real text.",
      ro: "Descriere scurtă a proiectului: povestește ce ai făcut în acest proiect. Înlocuiește cu textul real.",
    },
  },
  {
    id: "3",
    slug: "project-three",
    title: { ru: "Название проекта", en: "Project name", ro: "Numele proiectului" },
    categoryKey: "print",
    year: 2025,
    cover: "/images/work/cover-3.svg",
    images: ["/images/work/cover-3.svg", "/images/work/detail-1.svg", "/images/work/detail-2.svg"],
    description: {
      ru: "Краткое описание проекта: расскажи, что сделал в этой работе. Замени этот текст на реальную историю.",
      en: "Short project description: tell the story of what you did in this piece of work. Replace this with the real text.",
      ro: "Descriere scurtă a proiectului: povestește ce ai făcut în acest proiect. Înlocuiește cu textul real.",
    },
  },
  {
    id: "4",
    slug: "project-four",
    title: { ru: "Название проекта", en: "Project name", ro: "Numele proiectului" },
    categoryKey: "packaging",
    year: 2025,
    cover: "/images/work/cover-4.svg",
    images: ["/images/work/cover-4.svg", "/images/work/detail-1.svg", "/images/work/detail-2.svg"],
    description: {
      ru: "Краткое описание проекта: расскажи, что сделал в этой работе. Замени этот текст на реальную историю.",
      en: "Short project description: tell the story of what you did in this piece of work. Replace this with the real text.",
      ro: "Descriere scurtă a proiectului: povestește ce ai făcut în acest proiect. Înlocuiește cu textul real.",
    },
  },
  {
    id: "5",
    slug: "project-five",
    title: { ru: "Название проекта", en: "Project name", ro: "Numele proiectului" },
    categoryKey: "identity",
    year: 2025,
    cover: "/images/work/cover-5.svg",
    images: ["/images/work/cover-5.svg", "/images/work/detail-1.svg", "/images/work/detail-2.svg"],
    description: {
      ru: "Краткое описание проекта: расскажи, что сделал в этой работе. Замени этот текст на реальную историю.",
      en: "Short project description: tell the story of what you did in this piece of work. Replace this with the real text.",
      ro: "Descriere scurtă a proiectului: povestește ce ai făcut în acest proiect. Înlocuiește cu textul real.",
    },
  },
  {
    id: "6",
    slug: "project-six",
    title: { ru: "Название проекта", en: "Project name", ro: "Numele proiectului" },
    categoryKey: "advertising",
    year: 2024,
    cover: "/images/work/cover-6.svg",
    images: ["/images/work/cover-6.svg", "/images/work/detail-1.svg", "/images/work/detail-2.svg"],
    description: {
      ru: "Краткое описание проекта: расскажи, что сделал в этой работе. Замени этот текст на реальную историю.",
      en: "Short project description: tell the story of what you did in this piece of work. Replace this with the real text.",
      ro: "Descriere scurtă a proiectului: povestește ce ai făcut în acest proiect. Înlocuiește cu textul real.",
    },
  },
  {
    id: "7",
    slug: "project-seven",
    title: { ru: "Название проекта", en: "Project name", ro: "Numele proiectului" },
    categoryKey: "branding",
    year: 2024,
    cover: "/images/work/cover-7.svg",
    images: ["/images/work/cover-7.svg", "/images/work/detail-1.svg", "/images/work/detail-2.svg"],
    description: {
      ru: "Краткое описание проекта: расскажи, что сделал в этой работе. Замени этот текст на реальную историю.",
      en: "Short project description: tell the story of what you did in this piece of work. Replace this with the real text.",
      ro: "Descriere scurtă a proiectului: povestește ce ai făcut în acest proiect. Înlocuiește cu textul real.",
    },
  },
  {
    id: "8",
    slug: "project-eight",
    title: { ru: "Название проекта", en: "Project name", ro: "Numele proiectului" },
    categoryKey: "web",
    year: 2024,
    cover: "/images/work/cover-8.svg",
    images: ["/images/work/cover-8.svg", "/images/work/detail-1.svg", "/images/work/detail-2.svg"],
    description: {
      ru: "Краткое описание проекта: расскажи, что сделал в этой работе. Замени этот текст на реальную историю.",
      en: "Short project description: tell the story of what you did in this piece of work. Replace this with the real text.",
      ro: "Descriere scurtă a proiectului: povestește ce ai făcut în acest proiect. Înlocuiește cu textul real.",
    },
  },
  {
    id: "9",
    slug: "project-nine",
    title: { ru: "Название проекта", en: "Project name", ro: "Numele proiectului" },
    categoryKey: "print",
    year: 2023,
    cover: "/images/work/cover-9.svg",
    images: ["/images/work/cover-9.svg", "/images/work/detail-1.svg", "/images/work/detail-2.svg"],
    description: {
      ru: "Краткое описание проекта: расскажи, что сделал в этой работе. Замени этот текст на реальную историю.",
      en: "Short project description: tell the story of what you did in this piece of work. Replace this with the real text.",
      ro: "Descriere scurtă a proiectului: povestește ce ai făcut în acest proiect. Înlocuiește cu textul real.",
    },
  },
  {
    id: "10",
    slug: "project-ten",
    title: { ru: "Название проекта", en: "Project name", ro: "Numele proiectului" },
    categoryKey: "print",
    year: 2023,
    cover: "/images/work/cover-10.svg",
    images: ["/images/work/cover-10.svg", "/images/work/detail-1.svg", "/images/work/detail-2.svg"],
    description: {
      ru: "Краткое описание проекта: расскажи, что сделал в этой работе. Замени этот текст на реальную историю.",
      en: "Short project description: tell the story of what you did in this piece of work. Replace this with the real text.",
      ro: "Descriere scurtă a proiectului: povestește ce ai făcut în acest proiect. Înlocuiește cu textul real.",
    },
  },
];

export function getProjectBySlug(slug: string) {
  return projects.find((p) => p.slug === slug);
}
