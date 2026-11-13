import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicBlogIndex } from "@/features/website-builder/public/public-content";
import { getPublicationSnapshot } from "@/features/website-builder/lib/publication-snapshot";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const item = await getPublicationSnapshot(params.slug);
  if (!item) return { title: "Journal not found — DoItWithAI Studio" };
  return {
    title: `Journal — ${item.document.identity.name}`,
    description: `Articles, essays, and insights published by ${item.document.identity.name}.`,
  };
}

export default async function PublicBlogIndexPage({
  params,
}: {
  params: { slug: string };
}) {
  const item = await getPublicationSnapshot(params.slug);
  if (!item) notFound();
  return <PublicBlogIndex document={item.document} portfolioSlug={params.slug} />;
}
