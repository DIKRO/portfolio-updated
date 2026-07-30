import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { projects, getProjectBySlug } from "@/content/projects";
import { buildGalleryRows } from "@/lib/imageOrientation";
import { CategoryKey } from "@/types/project";
import ProjectView from "@/components/ProjectView/ProjectView";

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ category?: string }>;
}

// Превью ссылки на конкретный проект в мессенджерах/соцсетях (когда кидаешь
// ссылку на работу, а не на весь сайт) — заголовок, описание и обложка
// именно этого проекта, а не общие og-теги сайта из layout.tsx. Язык не
// знаем на сервере (выбор языка — на клиенте, в localStorage), поэтому
// метатеги всегда на английском — как и общий title/description сайта
// в корневом layout.
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) return {};

  const title = `${project.title.en} — Socur Dmitrii`;
  const description = project.description.en;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
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

export default async function ProjectPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { category } = await searchParams;
  const project = getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const galleryRows = buildGalleryRows(project.images);

  // Если пользователь пришёл из конкретной категории (передаётся через
  // ?category=...), "следующий проект" листает только внутри неё, по кругу
  // (после последнего — снова первый). Категория не зависит от языка
  // (categoryKey — служебный ключ, а не переведённая строка), поэтому
  // работает одинаково на всех языках. Если категория не передана,
  // невалидна или в ней почему-то не оказалось текущего проекта —
  // откатываемся к прежнему поведению (следующий по общему списку "Все").
  const availableCategories = new Set(projects.map((p) => p.categoryKey));
  const isValidCategory = (value?: string): value is CategoryKey =>
    !!value && availableCategories.has(value as CategoryKey);

  let list = projects;
  let activeCategory: CategoryKey | undefined;

  if (isValidCategory(category)) {
    const scopedList = projects.filter((p) => p.categoryKey === category);
    if (scopedList.some((p) => p.slug === project.slug)) {
      list = scopedList;
      activeCategory = category;
    }
  }

  const currentIndex = list.findIndex((p) => p.slug === project.slug);
  const nextProject = list[(currentIndex + 1) % list.length];

  return (
    <ProjectView
      project={project}
      galleryRows={galleryRows}
      nextProject={nextProject}
      category={activeCategory}
    />
  );
}
