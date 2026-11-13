import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicCaseStudy } from "@/features/website-builder/public/public-case-study";
import { projectsForPresentation } from "@/features/website-builder/domain/opportunity";
import { getPublicationSnapshot } from "@/features/website-builder/lib/publication-snapshot";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { slug: string; projectSlug: string };
}): Promise<Metadata> {
  const item = await getPublicationSnapshot(params.slug);
  const project = item
    ? projectsForPresentation(item.document).find(
        (candidate) => candidate.caseStudySlug === params.projectSlug,
      )
    : undefined;
  if (!item || !project) {
    return { title: "Case study not found — DoItWithAI Studio" };
  }

  return {
    title: `${project.title} — ${item.document.identity.name}`,
    description: project.summary || item.document.identity.intro,
  };
}

export default async function PublicCaseStudyPage({
  params,
}: {
  params: { slug: string; projectSlug: string };
}) {
  const item = await getPublicationSnapshot(params.slug);
  if (!item) notFound();
  const project = projectsForPresentation(item.document).find(
    (candidate) => candidate.caseStudySlug === params.projectSlug,
  );
  if (!project) notFound();

  return (
    <PublicCaseStudy
      document={item.document}
      portfolioSlug={params.slug}
      project={project}
    />
  );
}
