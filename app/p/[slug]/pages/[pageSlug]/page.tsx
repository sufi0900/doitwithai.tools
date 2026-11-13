import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicContentPage } from "@/features/website-builder/public/public-content";
import { getPublicationSnapshot } from "@/features/website-builder/lib/publication-snapshot";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { slug: string; pageSlug: string };
}): Promise<Metadata> {
  const item = await getPublicationSnapshot(params.slug);
  const page = item?.document.publishing.pages.find(
    (candidate) =>
      candidate.status === "published" && candidate.slug === params.pageSlug,
  );
  if (!item || !page) return { title: "Page not found — DoItWithAI Studio" };

  return {
    title: `${page.title} — ${item.document.identity.name}`,
    description:
      ("seoDescription" in page &&
      typeof page.seoDescription === "string" &&
      page.seoDescription
        ? page.seoDescription
        : undefined) || item.document.identity.intro,
  };
}

export default async function PublicCustomPage({
  params,
}: {
  params: { slug: string; pageSlug: string };
}) {
  const item = await getPublicationSnapshot(params.slug);
  if (!item) notFound();
  const page = item.document.publishing.pages.find(
    (candidate) =>
      candidate.status === "published" && candidate.slug === params.pageSlug,
  );
  if (!page) notFound();

  return (
    <PublicContentPage
      document={item.document}
      portfolioSlug={params.slug}
      item={page}
      kind="page"
    />
  );
}
