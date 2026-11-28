import type { Metadata } from "next";
import Link from "next/link";
import ToolCatalog from "@/features/tool-catalog/ToolCatalog";
import { collectionSchema, tools } from "@/features/tool-catalog/catalog";
import { topics, getTopicMeta } from "@/features/tool-catalog/discovery";

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
    <div className="bg-slate-50 pb-20 text-slate-900 dark:bg-[#0F1523] dark:text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(fullSchema).replace(/</g, "\\u003c"),
        }}
      />
      <header className="border-b border-white/10 bg-[#14171D] text-white">
        <div className="mx-auto max-w-7xl px-4 pb-7 pt-5 sm:px-6 sm:pb-8 sm:pt-6 lg:px-8">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-xs text-slate-400"
          >
            <Link href="/" className="font-medium transition hover:text-white">
              Home
            </Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page" className="font-medium text-slate-200">
              Tools
            </span>
          </nav>

          <h1 className="mt-2.5 text-2xl font-extrabold tracking-[-0.02em] text-white sm:text-3xl">
            Free AI SEO &amp; Content Writing Tools
          </h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-300">
            Run free on-page SEO audits, keyword research, technical schema
            checks, AI search (GEO) checks, and content conversion tools — built
            for fast human review.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
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

        <section
          aria-labelledby="workspace-faq-heading"
          className="mt-8 rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#161F30] sm:p-8"
        >
          <h2
            id="workspace-faq-heading"
            className="text-xl font-extrabold text-slate-900 dark:text-white sm:text-2xl"
          >
            How AI supports your SEO, content, and social media work
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">
            Practical answers on what AI tools can handle quickly and where human review makes the difference.
          </p>
          <div className="mt-6 divide-y divide-slate-200 dark:divide-slate-800">
            {workspaceFaqs.map(([question, answer]) => (
              <details key={question} className="py-4">
                <summary className="cursor-pointer text-sm font-bold leading-6 text-slate-900 dark:text-white sm:text-base">
                  {question}
                </summary>
                <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
                  {answer}
                </p>
              </details>
            ))}
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
