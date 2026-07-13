import { notFound } from "next/navigation";
import { projects, getProjectBySlug } from "@/content/projects";
import { buildGalleryRows } from "@/lib/imageOrientation";
import ProjectView from "@/components/ProjectView/ProjectView";

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const galleryRows = buildGalleryRows(project.images);

  return <ProjectView project={project} galleryRows={galleryRows} />;
}
