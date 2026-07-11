export type CategoryKey =
  | "branding"
  | "web"
  | "print"
  | "packaging"
  | "video-editing"
  | "Motion design";

export interface LocalizedText {
  ru: string;
  en: string;
  ro: string;
}

export interface Project {
  id: string;
  slug: string;

  title: LocalizedText;

  categoryKey: CategoryKey;

  year: number;

  cover: string;

  // Дополнительные изображения для страницы проекта (case study)
  images: string[];

  // Сплошной текст описания проекта — кратко расскажи, что сделал в этой работе.
  description: LocalizedText;
}
