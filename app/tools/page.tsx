import type { Metadata } from "next";
import Link from "next/link";
import ToolCatalog from "@/features/tool-catalog/ToolCatalog";
import { categories, categoryPath, collectionSchema, tools } from "@/features/tool-catalog/catalog";

export const metadata: Metadata = {
  title: "Free AI & Productivity Tools | Do It With AI Tools",
  description: "Browse practical tools for SEO, content, productivity, education, business, and future digital workflows.",
  alternates: { canonical: "https://doitwithai.tools/tools" },
  openGraph: { title: "Free AI & Productivity Tools", description: "Find the right tool for your next digital task.", url: "https://doitwithai.tools/tools", type: "website" },
};

export default function ToolsPage() {
  return <main className="bg-slate-50 pb-24 pt-12 text-slate-900 dark:bg-[#171C28] dark:text-white">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema("AI & Productivity Tools Directory", "/tools", tools)).replace(/</g, "\\u003c") }} />
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <nav aria-label="Breadcrumb" className="mb-8 text-sm text-slate-500 dark:text-slate-300"><Link href="/">Home</Link><span aria-hidden="true"> / </span><span aria-current="page">Tools</span></nav>
      <header className="rounded-3xl border border-blue-400/20 bg-[#182235] p-8 text-white sm:p-12">
        <p className="text-xs font-bold uppercase tracking-widest text-[#AEBBFF]">Your practical tool workspace</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">Less busywork.<br /><span className="text-[#AEBBFF]">More useful work.</span></h1>
        <p className="mt-5 max-w-2xl leading-8 text-slate-300">Find a tool for your next task. Start with SEO and content writing: create better title candidates, readable URLs, and structured data you can review before publishing.</p>
        <div className="mt-7 flex flex-wrap gap-3">{categories.map((category) => <Link key={category.slug} href={categoryPath(category.slug)} className="rounded-full border border-blue-300/30 px-4 py-2 text-sm font-semibold hover:bg-white/10">{category.name}</Link>)}</div>
      </header>
      <ToolCatalog />
      <aside className="mt-12 rounded-2xl border border-slate-200 p-6 dark:border-slate-700"><h2 className="text-xl font-bold">Tools for doing. Guides for understanding.</h2><p className="mt-3 leading-7 text-slate-600 dark:text-slate-300">Generated output is a starting point, not a promise of rankings. Check accuracy, relevance, and your page content before using it.</p><div className="mt-4 flex flex-wrap gap-6 text-primary dark:text-blue-200"><Link href="/ai-seo">Read SEO guides →</Link><Link href="/free-ai-resources">Explore free AI resources →</Link><Link href="/tools/categories">Browse tool categories →</Link></div></aside>
    </div>
  </main>;
}
