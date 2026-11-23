import React from "react";
import Link from "next/link";
import { tools } from "@/features/tool-catalog/catalog";
import ToolCard from "@/features/tool-catalog/ToolCard";

const CORE_CLUSTER_GUIDES = [
  {
    href: "/ai-seo/h1-heading",
    badge: "H1 Pillar Guide",
    title: "H1 Tag in SEO: Best Practices, Length & Examples",
    desc: "Learn the 20–70 char & 600px rules, H1 vs. title tag differences, CMS fixes, and AI workflows.",
  },
  {
    href: "/ai-seo/meta-title",
    badge: "Title Tag Guide",
    title: "How to Create Better Meta Titles With AI",
    desc: "Craft 50–60 character title links that win SERP clicks and align with your visible H1.",
  },
  {
    href: "/ai-seo/meta-description",
    badge: "SERP Snippets",
    title: "Write Clearer Meta Descriptions With AI Prompts",
    desc: "Summarize page value within desktop and mobile pixel limits to lift organic CTR.",
  },
  {
    href: "/ai-seo/blog-introduction",
    badge: "First-Fold UX",
    title: "Turn an AI Draft Into a Clear Blog Introduction",
    desc: "Pair your H1 heading with a direct 40–60 word opening answer for readers and AI Overviews.",
  },
  {
    href: "/ai-seo/write-slug-urls",
    badge: "URL Architecture",
    title: "Choose Clear URL Slugs & Keep Links Stable",
    desc: "Structure concise, lowercase URL slugs that align with your title tag and H1 heading.",
  },
  {
    href: "/ai-seo/what-to-do-after-keyword-research",
    badge: "Content Planning",
    title: "What to Do After Keyword Research (10-Step Plan)",
    desc: "Filter raw exports, match search intent, cluster keywords, and map groups to target URLs.",
  },
];

export default function SeoListingHero() {
  const selected = [
    "h1-heading-generator",
    "heading-structure-analyzer",
    "article-outline-generator",
    "meta-title-generator",
    "on-page-ai-seo-analyzer",
    "search-intent-checker",
  ]
    .map((slug) => tools.find((tool) => tool.slug === slug))
    .filter(Boolean);
  const action =
    "inline-flex min-h-11 items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#5271FF]";
  return (
    <section aria-labelledby="ai-seo-heading" className="mb-12 min-w-0">
      <div className="rounded-3xl bg-[#101e43] px-5 py-10 text-white sm:px-10 sm:py-14">
        <p className="text-sm font-semibold text-blue-200">
          LEARN · APPLY · REVIEW
        </p>
        <h1
          id="ai-seo-heading"
          className="mt-4 max-w-3xl text-3xl font-extrabold leading-tight sm:text-5xl"
        >
          AI SEO tools, guides, and prompts
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-8 text-slate-200 sm:text-lg">
          Learn the reasoning, try a practical tool, and adapt a prompt for your
          next content task. Review every suggestion before publishing.
        </p>
        <nav
          aria-label="Explore the SEO hub"
          className="mt-7 flex flex-wrap gap-3"
        >
          <Link
            href="/tools"
            className={action + " bg-[#5271FF] text-white hover:bg-[#405bdc]"}
          >
            Explore SEO tools
          </Link>
          <a
            href="#seo-hub-guides"
            className={action + " border border-blue-200/40 hover:bg-white/10"}
          >
            Read SEO guides
          </a>
          <Link
            href="/ai-seo/h1-heading"
            className={action + " border border-blue-200/40 hover:bg-white/10"}
          >
            H1 Tag SEO Guide
          </Link>
          <Link
            href="/prompts"
            className={action + " border border-blue-200/40 hover:bg-white/10"}
          >
            Browse prompts
          </Link>
        </nav>
      </div>

      <section aria-labelledby="seo-hub-cluster" className="mt-10">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2
              id="seo-hub-cluster"
              className="text-2xl font-bold text-slate-900 dark:text-white"
            >
              Core On-Page SEO Topic Cluster Guides
            </h2>
            <p className="mt-2 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
              Master how your URL slug, meta title tag, visible H1 heading,
              opening answer block, and H2–H3 hierarchy work together.
            </p>
          </div>
        </div>
        <div className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CORE_CLUSTER_GUIDES.map((g) => (
            <Link
              key={g.href}
              href={g.href}
              className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-500 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
            >
              <div>
                <span className="inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                  {g.badge}
                </span>
                <h3 className="mt-3 text-base font-extrabold text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                  {g.title}
                </h3>
                <p className="mt-2 text-xs leading-6 text-slate-600 dark:text-slate-400">
                  {g.desc}
                </p>
              </div>
              <span className="mt-4 inline-flex items-center text-xs font-bold text-blue-600 dark:text-blue-400">
                Read guide →
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="seo-hub-tools" className="mt-10">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2
              id="seo-hub-tools"
              className="text-2xl font-bold text-slate-900 dark:text-white"
            >
              Put the guidance into practice
            </h2>
            <p className="mt-2 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
              Generate reader-first H1 headings, audit your H1–H6 hierarchy,
              plan article outlines, or optimize title tags.
            </p>
          </div>
          <Link
            href="/tools"
            className={
              action +
              " border border-slate-300 text-blue-700 dark:border-slate-600 dark:text-blue-200"
            }
          >
            View all tools
          </Link>
        </div>
        <div className="grid min-w-0 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {selected.map((tool) => (
            <ToolCard key={tool.id} tool={tool} headingLevel={3} />
          ))}
        </div>
      </section>
    </section>
  );
}
