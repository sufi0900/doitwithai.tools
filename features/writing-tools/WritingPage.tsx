import Link from "next/link";
import type { Metadata } from "next";
import ToolResources from "@/features/tool-catalog/ToolResources";
import WritingClient from "./WritingClient";
import type { WritingKind } from "./schema";
export const writingPages = {
  "meta-description": { name: "Meta Description Generator", slug: "meta-description-generator", description: "Generate, compare, and edit three page-specific meta descriptions with character checks and an illustrative snippet preview." },
  "h1-heading": { name: "H1 Heading Generator", slug: "h1-heading-generator", description: "Generate and compare three clear H1 headings from your page brief. Review topic wording and edit each option before use." },
};
export function writingMetadata(kind: WritingKind): Metadata {
  const page = writingPages[kind];
  const url = `https://doitwithai.tools/tools/${page.slug}`;
  const image = `https://doitwithai.tools/api/og?${new URLSearchParams({ title: page.name, category: "AI SEO Tool", ctaText: "Compare three options" })}`;
  return { title: `AI ${page.name}`, description: page.description, alternates: { canonical: url }, openGraph: { title: page.name, description: page.description, url, type: "website", images: [{ url: image, width: 1200, height: 630 }] }, twitter: { card: "summary_large_image", title: page.name, description: page.description, images: [image] } };
}
export default function WritingPage({ kind }: { kind: WritingKind }) {
  const page = writingPages[kind];
  const url = `https://doitwithai.tools/tools/${page.slug}`;
  const schema = { "@context": "https://schema.org", "@graph": [
    { "@type": "WebApplication", name: page.name, url, description: page.description, applicationCategory: "BusinessApplication", operatingSystem: "Any", browserRequirements: "Requires JavaScript" },
    { "@type": "BreadcrumbList", itemListElement: [ { name: "Home", item: "https://doitwithai.tools" }, { name: "Tools", item: "https://doitwithai.tools/tools" }, { name: page.name, item: url } ].map((item, index) => ({ "@type": "ListItem", position: index + 1, ...item })) },
  ] };
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
    <section className="bg-slate-950 px-4 pb-16 pt-10 text-white sm:px-6">
      <nav aria-label="Breadcrumb" className="mx-auto mb-10 flex max-w-5xl flex-wrap gap-2 text-sm text-slate-300"><Link href="/">Home</Link><span>/</span><Link href="/tools">Tools</Link><span>/</span><span>{page.name}</span></nav>
      <div className="mx-auto mb-10 max-w-3xl text-center"><p className="font-semibold text-blue-300">AI SEO · Content Writing</p><h1 className="mt-4 text-4xl font-black sm:text-6xl">AI {page.name}</h1><p className="mt-5 leading-7 text-slate-300">{page.description}</p></div>
      <WritingClient kind={kind} />
    </section>
    <section className="mx-auto max-w-5xl px-4 py-12 text-slate-800 dark:text-slate-200"><h2 className="text-2xl font-bold">Review before publishing</h2><div className="mt-5 grid gap-6 sm:grid-cols-2"><div><h3 className="font-bold">Start with an accurate page brief</h3><p className="mt-2 leading-7">Describe content that exists on your page. Check every generated claim, and keep wording useful to your audience.</p></div><div><h3 className="font-bold">Use checks as editing aids</h3><p className="mt-2 leading-7">Character ranges are editorial targets, not Google limits. Keyword checks measure literal wording and cannot assess relevance or performance.</p></div></div>
      <h3 className="mt-7 font-bold">{kind === "meta-description" ? "Will Google show my exact description?" : "Must the H1 differ from the title tag?"}</h3>
      <p className="mt-2 leading-7">{kind === "meta-description" ? "Google primarily creates snippets from page content and may use your meta description. Snippets vary by query and device width. The preview is illustrative." : "They have different roles but can share wording. The H1 is the visible main heading; the title tag describes the page in the browser and search context."}</p>
      <p className="mt-5 leading-7">AI can help draft alternatives. It cannot guarantee rankings, clicks, traffic, or inclusion in AI answers.</p>
      <a className="mt-4 inline-block text-[#5271FF] underline" href={kind === "meta-description" ? "https://developers.google.com/search/docs/appearance/snippet" : "https://developers.google.com/search/docs/appearance/title-link"}>Read Google Search Central guidance</a>
    </section>
    <ToolResources slug={page.slug} />
  </>;
}
