import { notFound } from "next/navigation";
import { projects, getProjectBySlug } from "@/content/projects";
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

  return <ProjectView project={project} />;
}
