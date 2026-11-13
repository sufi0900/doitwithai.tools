import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicProjectsIndex } from "@/features/website-builder/public/public-projects-index";
import { getPublicationSnapshot } from "@/features/website-builder/lib/publication-snapshot";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const item = await getPublicationSnapshot(params.slug);
  if (!item) return { title: "Projects not found — DoItWithAI Studio" };
  return {
    title: `Selected Work — ${item.document.identity.name}`,
    description: `Case studies and selected work by ${item.document.identity.name}.`,
  };
}

export default async function PublicProjectsIndexPage({
  params,
}: {
  params: { slug: string };
}) {
  const item = await getPublicationSnapshot(params.slug);
  if (!item) notFound();
  return (
    <PublicProjectsIndex document={item.document} portfolioSlug={params.slug} />
  );
}
