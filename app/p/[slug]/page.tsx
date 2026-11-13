import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicPortfolio } from "@/features/website-builder/public/public-portfolio";
import { getPublicationSnapshot } from "@/features/website-builder/lib/publication-snapshot";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const { slug } = params;
  const item = await getPublicationSnapshot(slug);
  if (!item) return { title: "Website not found — DoItWithAI Studio" };

  const base =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://doitwithai.tools";
  const isPrivateVariant =
    item.document.opportunity.status !== "canonical" &&
    item.document.opportunity.visibility !== "public";

  return {
    title: `${item.document.identity.name} — ${item.document.identity.role}`,
    description: item.document.identity.intro,
    icons: item.document.media.headshotUrl
      ? { icon: item.document.media.headshotUrl }
      : undefined,
    alternates: { canonical: `${base}/p/${slug}` },
    robots: isPrivateVariant
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      title: `${item.document.identity.name} — ${item.document.identity.role}`,
      description: item.document.identity.intro,
      url: `${base}/p/${slug}`,
      images: [
        {
          url: `${base}/p/${slug}/opengraph-image`,
          alt: `${item.document.identity.name} website preview`,
        },
      ],
    },
  };
}

export default async function PublicWebsitePage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;
  const item = await getPublicationSnapshot(slug);
  if (!item) notFound();

  const base =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://doitwithai.tools";
  const sameAs = item.document.content.contact.socials.map(
    (social) => social.url,
  );
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: item.document.identity.name,
    jobTitle: item.document.identity.role,
    description: item.document.identity.intro,
    url: `${base}/p/${slug}`,
    ...(sameAs.length ? { sameAs } : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <PublicPortfolio document={item.document} slug={slug} />
    </>
  );
}
