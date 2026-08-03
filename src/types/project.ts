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

  // Ключ клиента (см. CLIENTS в About.tsx, поле key) — если проект сделан
  // для компании из блока "С кем я сотрудничал", проставь тот же ключ
  // здесь. Тогда этот проект автоматически появится в карточке этого
  // клиента на странице "Обо мне", без необходимости где-то ещё вручную
  // прописывать его slug. Необязательное поле — просто не указывай, если
  // проект личный/не привязан ни к одному клиенту из этого блока.
  client?: string;
}
