import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicContentPage } from "@/features/website-builder/public/public-content";
import { getPublicationSnapshot } from "@/features/website-builder/lib/publication-snapshot";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { slug: string; postSlug: string };
}): Promise<Metadata> {
  const item = await getPublicationSnapshot(params.slug);
  const post = item?.document.publishing.posts.find(
    (candidate) =>
      candidate.status === "published" && candidate.slug === params.postSlug,
  );
  if (!item || !post) return { title: "Article not found — DoItWithAI Studio" };

  return {
    title: `${post.title} — ${item.document.identity.name}`,
    description:
      post.excerpt || post.seoDescription || item.document.identity.intro,
  };
}

export default async function PublicBlogPostPage({
  params,
}: {
  params: { slug: string; postSlug: string };
}) {
  const item = await getPublicationSnapshot(params.slug);
  if (!item) notFound();
  const post = item.document.publishing.posts.find(
    (candidate) =>
      candidate.status === "published" && candidate.slug === params.postSlug,
  );
  if (!post) notFound();

  return (
    <PublicContentPage
      document={item.document}
      portfolioSlug={params.slug}
      item={post}
      kind="post"
    />
  );
}
