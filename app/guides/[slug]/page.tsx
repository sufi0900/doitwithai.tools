import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import GuideBody from "@/features/guides/GuideBody";
import { getGuide } from "@/features/guides/data";
import { siteOrigin, tools, toolPath } from "@/features/tool-catalog/catalog";

export const revalidate = 3600;
type Props = { params: { slug: string } };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const guide = await getGuide(params.slug);
  if (!guide) notFound();
  const url = `${siteOrigin}/guides/${guide.slug}`;
  return {
    title: guide.metatitle || guide.title,
    description: guide.metadesc || guide.overview,
    alternates: { canonical: url },
    openGraph: { type: "article", url, title: guide.metatitle || guide.title, description: guide.metadesc || guide.overview, ...(guide.mainImage?.asset?.url ? { images: [{ url: guide.mainImage.asset.url, alt: guide.mainImage.alt || "" }] } : {}) },
  };
}

export default async function GuidePage({ params }: Props) {
  const guide = await getGuide(params.slug);
  if (!guide) notFound();
  const url = `${siteOrigin}/guides/${guide.slug}`;
  const relatedTools = tools.filter((tool) => guide.relatedToolSlugs?.includes(tool.slug));
  const prefixes = { guide: "guides", seo: "ai-seo", blogPost: "blogs" };
  const articles = (guide.relatedArticles || []).filter((article) => article?.slug && prefixes[article._type]);
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Article", "@id": `${url}#article`, headline: guide.title, description: guide.overview, mainEntityOfPage: url, datePublished: guide.publishedAt, dateModified: guide._updatedAt, ...(guide.authorName ? { author: { "@type": "Person", name: guide.authorName } } : {}), ...(guide.mainImage?.asset?.url ? { image: guide.mainImage.asset.url } : {}) },
      { "@type": "BreadcrumbList", itemListElement: [ { "@type": "ListItem", position: 1, name: "Home", item: siteOrigin }, { "@type": "ListItem", position: 2, name: "Guides", item: `${siteOrigin}/guides` }, { "@type": "ListItem", position: 3, name: guide.title, item: url } ] },
    ],
  };
  return <main className="mx-auto max-w-4xl px-4 py-16 text-slate-900 dark:text-white">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
    <nav aria-label="Breadcrumb" className="mb-8 text-sm"><Link href="/">Home</Link><span aria-hidden="true"> / </span><Link href="/guides">Guides</Link><span aria-hidden="true"> / </span><span aria-current="page">{guide.title}</span></nav>
    <article><header><h1 className="text-4xl font-bold leading-tight">{guide.title}</h1><p className="mt-5 text-lg leading-8">{guide.overview}</p>{guide.authorName && <p className="mt-4 text-sm">By {guide.authorName}</p>}<time className="mt-3 block text-sm" dateTime={guide.publishedAt}>{new Date(guide.publishedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })}</time></header>
      {guide.mainImage?.asset?.url && <GuideBody value={[{ ...guide.mainImage, _type: "image", _key: "featured" }]} />}
      <GuideBody value={guide.content} />
    </article>
    {(relatedTools.length > 0 || articles.length > 0) && <aside aria-label="Related resources" className="mt-12 rounded-2xl border border-slate-200 p-6 dark:border-slate-700"><h2 className="text-2xl font-bold">Continue learning and doing</h2><ul className="mt-5 space-y-3">{relatedTools.map((tool) => <li key={tool.id}><Link href={toolPath(tool.slug)} className="text-primary underline dark:text-blue-200">Use the {tool.name}</Link></li>)}{articles.map((article) => <li key={article._id}><Link href={`/${prefixes[article._type]}/${article.slug}`} className="text-primary underline dark:text-blue-200">{article.title}</Link></li>)}</ul></aside>}
  </main>;
}
