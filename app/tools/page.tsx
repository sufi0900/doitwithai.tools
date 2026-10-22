import type { Metadata } from "next";
import Link from "next/link";
import ToolCatalog from "@/features/tool-catalog/ToolCatalog";
import {
  categories,
  categoryPath,
  collectionSchema,
  tools,
} from "@/features/tool-catalog/catalog";
import { topics, getTopicMeta } from "@/features/tool-catalog/discovery";

export const metadata: Metadata = {
  title:
    "Free AI SEO, Content Writing & Digital Marketing Tools | Do It With AI Tools",
  description:
    "Explore free SEO and content writing tools. Improve page titles, analyze site structure, research keywords, and preview search and social results.",
  alternates: { canonical: "https://doitwithai.tools/tools" },
  openGraph: {
    title: "Free AI SEO, Content Writing & Digital Marketing Tools",
    description:
      "Practical tools for On-Page SEO, Technical SEO, Content Writing, Keyword Research, and Social Media workflows.",
    url: "https://doitwithai.tools/tools",
    type: "website",
  },
};

export default function ToolsPage() {
  return (
    <div className="bg-slate-50 pb-20 pt-6 text-slate-900 dark:bg-[#0F1523] dark:text-white sm:pt-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            collectionSchema(
              "AI & Productivity Tools Directory",
              "/tools",
              tools,
            ),
          ).replace(/</g, "\\u003c"),
        }}
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Compact Breadcrumb + Workspace Stats */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5">
            <Link
              href="/"
              className="font-medium transition hover:text-[#5271FF]"
            >
              Home
            </Link>
            <span aria-hidden="true">/</span>
            <span
              aria-current="page"
              className="font-bold text-slate-800 dark:text-slate-200"
            >
              Tools Workspace
            </span>
          </nav>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-[#5271FF]/30 bg-[#5271FF]/10 px-3 py-1 text-[11px] font-bold text-[#4A6CF7] dark:text-[#AEBBFF]">
              {tools.length} Live Tools
            </span>
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-600 dark:border-slate-800 dark:bg-[#161F30] dark:text-slate-300">
              {topics.length} Marketing Disciplines
            </span>
          </div>
        </div>

        {/* Streamlined, High-Impact Hero Header (keeps Tool Finder above the fold) */}
        <header className="relative overflow-hidden rounded-3xl border border-[#5271FF]/25 bg-gradient-to-br from-[#131C31] via-[#18233C] to-[#1E2C4F] p-6 text-white shadow-xl sm:p-8">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#5271FF]/20 blur-3xl"
          />
          <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <p className="inline-flex items-center gap-2 rounded-full border border-[#AEBBFF]/25 bg-white/5 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-[#AEBBFF]">
                Digital Marketing & SEO Workspace
              </p>
              <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
                Less busywork.{" "}
                <span className="bg-gradient-to-r from-[#AEBBFF] via-blue-200 to-cyan-200 bg-clip-text text-transparent">
                  More useful work.
                </span>
              </h1>
              <p className="mt-2.5 text-sm leading-6 text-slate-300 sm:text-base">
                Practical utilities for On-Page SEO, Technical SEO, Content
                Writing, Keyword Research, AI Search (GEO), and Social Media
                workflows. Built for fast human review before publishing.
              </p>
            </div>

            <div className="flex flex-col gap-2.5 lg:items-end">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#AEBBFF]">
                Browse Hub Collections
              </p>
              <div className="flex flex-wrap gap-2">
                {categories
                  .filter((c) =>
                    tools.some((t) => t.categories.includes(c.slug)),
                  )
                  .map((category) => (
                    <Link
                      key={category.slug}
                      href={categoryPath(category.slug)}
                      className="rounded-xl border border-white/[0.15] bg-white/10 px-3.5 py-2 text-xs font-bold text-white backdrop-blur-sm transition hover:border-[#AEBBFF]/50 hover:bg-white/20"
                    >
                      {category.name} (
                      {
                        tools.filter((t) =>
                          t.categories.includes(category.slug),
                        ).length
                      }
                      )
                    </Link>
                  ))}
                <Link
                  href="/tools/categories"
                  className="rounded-xl border border-[#AEBBFF]/30 bg-[#5271FF]/25 px-3.5 py-2 text-xs font-bold text-[#AEBBFF] transition hover:bg-[#5271FF]/40 hover:text-white"
                >
                  All Categories →
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Main Interactive Tool Catalog */}
        <ToolCatalog />

        {/* SEO Category Architecture & Workflow Guide Section */}
        <section
          aria-labelledby="marketing-disciplines-heading"
          className="mt-14 rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#161F30] sm:p-8"
        >
          <div className="max-w-3xl">
            <h2
              id="marketing-disciplines-heading"
              className="text-xl font-extrabold text-slate-900 dark:text-white sm:text-2xl"
            >
              Built for every stage of your SEO and digital marketing workflow
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
              Our workspace is organized by core marketing disciplines so you
              can move from keyword discovery and technical site health to
              on-page optimization and social distribution.
            </p>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {topics.map((topic) => {
              const meta = getTopicMeta(topic.id, topic.name);
              const count = tools.filter((t) =>
                t.topics.includes(topic.id),
              ).length;
              return (
                <div
                  key={topic.id}
                  className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-[#111827]/60"
                >
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {meta.shortName}
                    </h3>
                    <span className="rounded-full bg-[#5271FF]/[0.15] px-2.5 py-0.5 text-[11px] font-bold text-[#4A6CF7] dark:text-[#AEBBFF]">
                      {count} {count === 1 ? "tool" : "tools"}
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-slate-600 dark:text-slate-400">
                    {meta.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <aside className="mt-8 rounded-2xl border border-slate-200/90 bg-white p-6 dark:border-slate-800 dark:bg-[#161F30]">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Tools for doing. Guides for understanding.
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
            Generated output is a starting point, not a promise of rankings.
            Check accuracy, relevance, and your page content before using it.
          </p>
          <div className="mt-4 flex flex-wrap gap-6 text-sm font-semibold text-primary dark:text-[#93B4FF]">
            <Link href="/prompts" className="hover:underline">
              Explore prompt previews →
            </Link>
            <Link href="/ai-seo" className="hover:underline">
              Read SEO guides →
            </Link>
            <Link href="/guides" className="hover:underline">
              Read writing and productivity guides →
            </Link>
            <Link href="/tools/categories" className="hover:underline">
              Browse tool categories →
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
