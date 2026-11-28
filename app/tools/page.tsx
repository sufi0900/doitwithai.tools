import type { Metadata } from "next";
import Link from "next/link";
import ToolCatalog from "@/features/tool-catalog/ToolCatalog";
import { collectionSchema, tools } from "@/features/tool-catalog/catalog";

export const metadata: Metadata = {
  title:
    "Free AI SEO, Content Writing & Digital Marketing Tools | Do It With AI Tools",
  description: `Explore ${tools.length}+ free AI tools for SEO, keyword research, content writing, technical schema, and social media marketing. Built for practical workflows and human review.`,
  alternates: { canonical: "https://doitwithai.tools/tools" },
  openGraph: {
    title: "Free AI SEO, Content Writing & Digital Marketing Tools",
    description:
      "Practical AI tools for On-Page SEO, Technical SEO, Content Writing, Keyword Research, and Social Media workflows.",
    url: "https://doitwithai.tools/tools",
    type: "website",
  },
};

const workspaceFaqs = [
  [
    "What can AI do for your SEO and keyword research workflow?",
    "AI tools can group large keyword lists by topic and reader task, classify search intent, draft title tags and meta descriptions, inspect heading hierarchies, and generate structured data. You still verify live search results, real search demand, and page accuracy before publishing.",
  ],
  [
    "How can AI help with content marketing and blog writing?",
    "AI can turn a topic brief into an article outline, suggest clearer H1s and introductions, check readability, and spot missing supporting evidence. Combining AI speed with your own examples and subject expertise keeps content helpful for readers.",
  ],
  [
    "Can AI help with social media marketing and content repurposing?",
    "Yes. Once an article or brief is ready, you can use AI utilities to adapt key takeaways into LinkedIn posts, social threads, short-form video scripts, and visual infographic cards while keeping your tone and factual claims consistent.",
  ],
  [
    "Are these SEO and content writing tools free to use?",
    "Yes. All interactive tools in the workspace run directly in your browser without requiring an account or paid subscription.",
  ],
] as const;

export default function ToolsPage() {
  const fullSchema = {
    "@context": "https://schema.org",
    "@graph": [
      collectionSchema("AI & Productivity Tools Directory", "/tools", tools),
      {
        "@type": "FAQPage",
        "@id": "https://doitwithai.tools/tools#faq",
        mainEntity: workspaceFaqs.map(([question, answer]) => ({
          "@type": "Question",
          name: question,
          acceptedAnswer: { "@type": "Answer", text: answer },
        })),
      },
    ],
  };
  return (
    <div className="min-h-full bg-slate-50 pb-16 pt-5 text-slate-900 dark:bg-[#0F1523] dark:text-white sm:pt-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(fullSchema).replace(/</g, "\\u003c"),
        }}
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="mb-5">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400"
          >
            <Link
              href="/"
              className="font-medium transition hover:text-slate-900 dark:hover:text-white"
            >
              Home
            </Link>
            <span aria-hidden="true">/</span>
            <span
              aria-current="page"
              className="font-medium text-slate-700 dark:text-slate-200"
            >
              Tools
            </span>
          </nav>

          <h1 className="mt-2 text-2xl font-extrabold tracking-[-0.02em] text-slate-900 dark:text-white sm:text-3xl">
            Free AI SEO &amp; Content Writing Tools
          </h1>
          <p className="mt-1.5 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">
            Browse {tools.length} free browser-based utilities for on-page SEO
            audits, keyword research, technical schema checks, AI search (GEO)
            optimization, content writing, and social repurposing — built for
            fast workflows and human review with no account required.
          </p>
        </header>

        {/* Main Interactive Tool Catalog */}
        <ToolCatalog faqs={workspaceFaqs} />
      </div>
    </div>
  );
}
