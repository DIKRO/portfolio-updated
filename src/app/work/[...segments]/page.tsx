import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { projects, getProjectBySlug } from "@/content/projects";
import { buildGalleryRows } from "@/lib/imageOrientation";
import { CategoryKey } from "@/types/project";
import ProjectView from "@/components/ProjectView/ProjectView";
import { getServerLang } from "@/lib/serverLang";
import { ru } from "@/content/locales/ru";
import { en } from "@/content/locales/en";
import { ro } from "@/content/locales/ro";

const BASE_URL = "https://socurdmitrii.com";
const locales = { ru, en, ro };

// Раньше категория передавалась через query-параметр (/work/slug?category=branding),
// из-за чего ссылка на проект выглядела некрасиво в адресной строке и при
// шаринге. Теперь категория — часть самого пути:
//   /work/slug                — обычная ссылка (фильтр "Все")
//   /work/category/slug       — пришли из конкретной категории
// Оба варианта — это один и тот же catch-all сегмент [...segments], который
// матчит и один, и два уровня вложенности сразу, поэтому отдельный роут для
// каждого случая не нужен.
export function generateStaticParams() {
  const params: { segments: string[] }[] = [];
  for (const project of projects) {
    params.push({ segments: [project.slug] });
    params.push({ segments: [project.categoryKey, project.slug] });
  }
  return params;
}

interface PageProps {
  params: Promise<{ segments: string[] }>;
}

// Разбирает сегменты пути на слаг проекта и (опционально) категорию —
// один сегмент это просто "/work/slug", два — "/work/category/slug".
// Что угодно другое (0 сегментов или больше 2) считаем невалидным путём.
function parseSegments(segments: string[]): { slug?: string; categoryFromPath?: string } {
  if (segments.length === 1) {
    return { slug: segments[0] };
  }
  if (segments.length === 2) {
    return { slug: segments[1], categoryFromPath: segments[0] };
  }
  return {};
}

// Превью ссылки на конкретный проект в мессенджерах/соцсетях (когда кидаешь
// ссылку на работу, а не на весь сайт) — заголовок, описание и обложка
// именно этого проекта. Язык угадываем по Accept-Language браузера (см.
// getServerLang) — так превью хотя бы иногда совпадает с реальным языком
// сайта, а не всегда английский.
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { segments } = await params;
  const { slug } = parseSegments(segments);
  const project = slug ? getProjectBySlug(slug) : undefined;
  if (!project) return {};

  const lang = await getServerLang();
  const title = `${project.title[lang]} — Socur Dmitrii`;
  const description = project.description[lang];

  // У каждого проекта две валидных ссылки — с категорией и без
  // (/work/category/slug и /work/slug, см. комментарий у generateStaticParams
  // выше) — это один и тот же контент под двумя адресами. Без canonical
  // поисковик может решить, что это дублирующиеся страницы, и хуже
  // ранжировать обе. Явно объявляем короткий /work/slug основной версией.
  const canonicalUrl = `${BASE_URL}/work/${project.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      type: "article",
      url: canonicalUrl,
      images: [project.cover],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [project.cover],
    },
  };
}

export default async function ProjectPage({ params }: PageProps) {
  const { segments } = await params;
  const { slug, categoryFromPath } = parseSegments(segments);
  const project = slug ? getProjectBySlug(slug) : undefined;

  if (!project) {
    notFound();
  }

  const galleryRows = buildGalleryRows(project.images);

  // Если пользователь пришёл из конкретной категории (первый сегмент пути —
  // /work/category/slug), "следующий проект" листает только внутри неё, по
  // кругу (после последнего — снова первый). Категория не зависит от языка
  // (categoryKey — служебный ключ, а не переведённая строка), поэтому
  // работает одинаково на всех языках. Если категория не передана, невалидна
  // или в ней почему-то не оказалось текущего проекта — откатываемся к
  // прежнему поведению (следующий по общему списку "Все").
  const availableCategories = new Set(projects.map((p) => p.categoryKey));
  const isValidCategory = (value?: string): value is CategoryKey =>
    !!value && availableCategories.has(value as CategoryKey);

  let list = projects;
  let activeCategory: CategoryKey | undefined;

  if (isValidCategory(categoryFromPath)) {
    const scopedList = projects.filter((p) => p.categoryKey === categoryFromPath);
    if (scopedList.some((p) => p.slug === project.slug)) {
      list = scopedList;
      activeCategory = categoryFromPath;
    }
  }

  const currentIndex = list.findIndex((p) => p.slug === project.slug);
  const nextProject = list[(currentIndex + 1) % list.length];

  // JSON-LD для поисковиков: хлебные крошки (это только структурированные
  // данные для краулеров, на сайте они визуально не показываются — см.
  // обсуждение с пользователем) и сам проект как CreativeWork. Текст —
  // на языке, угаданном по Accept-Language (см. generateMetadata выше),
  // это не связано с тем, что реально увидит конкретный посетитель на
  // экране (тот выбор — целиком на клиенте), но для краулера этого
  // достаточно, чтобы не показывать всегда только английский.
  const lang = await getServerLang();
  const t = locales[lang];
  const homeLabel = { ru: "Главная", en: "Home", ro: "Acasă" }[lang];

  const breadcrumbItems = [
    { name: homeLabel, url: BASE_URL },
    ...(activeCategory
      ? [{ name: t.categories[activeCategory], url: `${BASE_URL}/#work` }]
      : []),
    { name: project.title[lang], url: `${BASE_URL}/work/${project.slug}` },
  ];

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbItems.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };

  const creativeWorkJsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title[lang],
    description: project.description[lang],
    image: `${BASE_URL}${project.cover}`,
    creator: { "@type": "Person", name: "Socur Dmitrii" },
    datePublished: `${project.year}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(creativeWorkJsonLd) }}
      />
      <ProjectView
        project={project}
        galleryRows={galleryRows}
        nextProject={nextProject}
        category={activeCategory}
        hasMultipleProjects={list.length > 1}
      />
    </>
  );
}
