import React, { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Client from "@/features/keyword-research/Client";
import ToolResources from "@/features/tool-catalog/ToolResources";
import {
  ToolHeroBackground,
  toolHeroSurface,
} from "@/features/tool-ui/ToolHero";
const pageUrl = "https://doitwithai.tools/tools/keyword-research-tool";
const description =
  "Explore keyword ideas, long-tail questions, likely intent, and proposed page groups. Import keyword metrics, build a shortlist, and export your research.";
export const metadata: Metadata = {
  title: "Free Keyword Research Tool with AI Ideas",
  description,
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Keyword Research Tool",
    description,
    url: pageUrl,
    type: "website",
  },
  twitter: { card: "summary", title: "Keyword Research Tool", description },
};
const faqs = [
  [
    "Does this tool provide live search volume?",
    "No. Generated ideas do not include measured volume. Upload supported keyword metrics to display supplied figures or ranges without changing their meaning.",
  ],
  [
    "Can I research keywords from a website?",
    "Yes. Enter a public URL. The tool reviews selected text from up to three relevant pages, rather than crawling the entire website.",
  ],
  [
    "Are the questions taken from People Also Ask?",
    "No. Questions in this release are generated suggestions or supplied keywords. They are not presented as observed Google questions.",
  ],
  [
    "Is advertising competition the same as SEO difficulty?",
    "No. Advertising competition concerns paid placements. This tool does not convert it into an organic ranking difficulty score.",
  ],
  [
    "Which files can I import?",
    "Use CSV or TSV files with English headers, up to 500 unique keywords and 100 KB. Keyword Planner-style numeric values and ranges are supported.",
  ],
  [
    "Does a missing volume mean zero searches?",
    "No. Unavailable means no matching supplied value exists. A supplied zero remains distinct from an empty cell.",
  ],
  [
    "Does every keyword need a separate page?",
    "No. Related queries can belong together. Review reader tasks and actual search results before assigning separate pages.",
  ],
  [
    "Can I save my research?",
    "Shortlist keywords within this session. Copy visible keywords or export their research details and supplied metrics before leaving the page.",
  ],
];
export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "WebApplication",
                name: "Keyword Research Tool",
                url: pageUrl,
                description,
                applicationCategory: "BusinessApplication",
                operatingSystem: "Any",
              },
              {
                "@type": "FAQPage",
                mainEntity: faqs.map(([name, text]) => ({
                  "@type": "Question",
                  name,
                  acceptedAnswer: { "@type": "Answer", text },
                })),
              },
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  ["Home", "https://doitwithai.tools"],
                  ["Tools", "https://doitwithai.tools/tools"],
                  ["Keyword Research Tool", pageUrl],
                ].map(([name, item], i) => ({
                  "@type": "ListItem",
                  position: i + 1,
                  name,
                  item,
                })),
              },
            ],
          }).replace(/</g, "\\u003c"),
        }}
      />
      <section
        className={`relative overflow-hidden ${toolHeroSurface} px-4 py-12 sm:px-6`}
      >
        <ToolHeroBackground />
        <div className="relative mx-auto max-w-7xl">
          <nav
            aria-label="Breadcrumb"
            className="mb-6 flex flex-wrap gap-2 text-sm text-blue-100"
          >
            <Link href="/">Home</Link>
            <span>/</span>
            <Link href="/tools">Tools</Link>
            <span>/</span>
            <span aria-current="page">Keyword research</span>
          </nav>
          <div className="mb-8 max-w-3xl">
            <p className="text-sm font-semibold text-blue-200">
              DISCOVER · ORGANIZE · REVIEW
            </p>
            <h1 className="mt-4 text-4xl font-extrabold text-white sm:text-5xl">
              Keyword Research Tool
            </h1>
            <p className="mt-5 text-lg leading-8 text-slate-200">
              Find relevant keyword ideas, explore reader questions, and build a
              practical content shortlist. Add your own metrics when available.
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              Start with a topic or website. Keep generated suggestions separate
              from measured demand, then decide what deserves further research.
            </p>
          </div>
          <Client />
        </div>
      </section>
      <div className="mx-auto max-w-5xl space-y-12 px-4 py-14 sm:px-6">
        <section>
          <h2 className="text-3xl font-bold">
            Move from keyword ideas to useful pages
          </h2>
          <p className="mt-4 text-base leading-8 text-slate-600 dark:text-slate-300">
            A long keyword list only helps when you understand the task behind
            each phrase. This workspace connects ideas with likely intent and
            proposed page groups.
          </p>
          <ol className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              [
                "Choose a specific starting point",
                "Enter a topic, product, service, or public website. Select the market and language you want to investigate.",
              ],
              [
                "Review the ideas",
                "Filter related terms, questions, and inferred intent. Treat each suggestion as a research lead, rather than evidence of search demand.",
              ],
              [
                "Build a shortlist",
                "Save relevant phrases, inspect supplied metrics, and export your selections. Compare real search results before choosing pages to create.",
              ],
            ].map(([title, text], i) => (
              <li
                key={title}
                className="rounded-2xl border border-slate-200 p-5 dark:border-slate-700"
              >
                <span className="text-sm font-semibold text-blue-700 dark:text-blue-200">
                  Step {i + 1}
                </span>
                <h3 className="mt-3 text-lg font-bold">{title}</h3>
                <p className="mt-3 text-base leading-8 text-slate-600 dark:text-slate-300">
                  {text}
                </p>
              </li>
            ))}
          </ol>
        </section>
        <section>
          <h2 className="text-3xl font-bold">
            Understand what the metrics mean
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {[
              [
                "Historical volume",
                "Uploaded monthly volume describes the source’s historical estimate or range. Confirm its location, date range, network, and grouping rules.",
              ],
              [
                "Advertising competition",
                "A competition value from an advertising export concerns paid placements. It does not establish how difficult organic rankings will be.",
              ],
              [
                "Keyword intent",
                "Intent labels describe a likely reader task. Actual search results can reveal mixed purposes that wording alone cannot establish.",
              ],
              [
                "Missing data",
                "An unavailable figure is a missing observation, rather than proof of no demand. Preserve ranges instead of replacing them with invented midpoints.",
              ],
            ].map(([title, text]) => (
              <article
                key={title}
                className="rounded-xl bg-slate-100 p-5 dark:bg-slate-800"
              >
                <h3 className="font-bold">{title}</h3>
                <p className="mt-3 text-base leading-8 text-slate-600 dark:text-slate-300">
                  {text}
                </p>
              </article>
            ))}
          </div>
          <p className="mt-5 text-base leading-8">
            Google explains its historical keyword metrics in the{" "}
            <a
              className="font-semibold text-blue-700 underline dark:text-blue-200"
              href="https://developers.google.com/google-ads/api/docs/keyword-planning/generate-historical-metrics"
            >
              Keyword Planning documentation
            </a>
            . Check your export’s definitions before comparing figures from
            different sources.
          </p>
        </section>
        <section>
          <h2 className="text-3xl font-bold">
            Use questions and long-tail keywords thoughtfully
          </h2>
          <p className="mt-4 text-base leading-8 text-slate-600 dark:text-slate-300">
            Specific questions can reveal the explanation a reader needs. A
            longer phrase does not automatically mean low competition, high
            conversion, or easy rankings.
          </p>
          <p className="mt-4 text-base leading-8 text-slate-600 dark:text-slate-300">
            Use the Questions view to explore possible concerns. Validate useful
            questions through customer conversations, your own search data, or
            actual search results.
          </p>
          <p className="mt-4 text-base leading-8 text-slate-600 dark:text-slate-300">
            For conversational search, adapt a relevant question into a natural
            prompt. The tool does not claim to measure ChatGPT query volumes or
            citation likelihood.
          </p>
        </section>
        <section>
          <h2 className="text-3xl font-bold">
            Research is the start of your content workflow
          </h2>
          <p className="mt-4 text-base leading-8 text-slate-600 dark:text-slate-300">
            Avoid creating several pages that answer the same task. Review
            proposed groups with our clustering tool, then prepare a focused
            content brief.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            {[
              [
                "/tools/target-audience-research-tool",
                "Understand your audience",
              ],
              ["/tools/keyword-clustering-tool", "Review keyword groups"],
              ["/tools/search-intent-checker", "Check reader intent"],
              ["/tools/seo-content-brief-generator", "Plan the content brief"],
            ].map(([href, title]) => (
              <Link
                key={href}
                href={href}
                className="inline-flex min-h-11 items-center rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-blue-700 dark:border-slate-600 dark:text-blue-200"
              >
                {title}
              </Link>
            ))}
          </div>
        </section>
        <section>
          <h2 className="text-3xl font-bold">Keyword research questions</h2>
          <div className="mt-6 divide-y divide-slate-200 rounded-2xl border border-slate-200 px-5 dark:divide-slate-700 dark:border-slate-700">
            {faqs.map(([q, a]) => (
              <details key={q} className="py-5">
                <summary className="cursor-pointer font-bold leading-7">
                  {q}
                </summary>
                <p className="mt-3 text-base leading-8 text-slate-600 dark:text-slate-300">
                  {a}
                </p>
              </details>
            ))}
          </div>
        </section>
      </div>
      <Suspense fallback={null}>
        <ToolResources slug="keyword-research-tool" />
      </Suspense>
    </>
  );
}
