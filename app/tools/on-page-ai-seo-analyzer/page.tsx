import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Layers3,
  ScanLine,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import AnalyzerClient from "@/features/on-page-analyzer/AnalyzerClient";
import ToolResources from "@/features/tool-catalog/ToolResources";
import {
  ToolHeroBackground,
  toolHeroHeading,
  toolHeroSurface,
} from "@/features/tool-ui/ToolHero";
const pageUrl = "https://doitwithai.tools/tools/on-page-ai-seo-analyzer";
const url = pageUrl;
const title = "On-page AI SEO Analyzer | Audit & Improve Your Page";
const description =
  "Audit a page's titles, headings, links, images, technical signals, and structured data. Review evidence, improve selected text, and export proposed changes.";
export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: pageUrl },
  openGraph: {
    title,
    description,
    url,
    type: "website",
    siteName: "Do It With AI Tools",
    images: [
      {
        url: "https://doitwithai.tools/ogimage.png",
        width: 1200,
        height: 630,
        alt: "On-page AI SEO Analyzer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["https://doitwithai.tools/ogimage.png"],
  },
};
const faqs = [
  {
    q: "What does the on-page SEO audit check?",
    a: "It extracts the returned HTML and checks metadata, headings, content blocks, links, image attributes, canonical declarations, directives, and JSON-LD syntax and selected field checks. Coverage and unchecked items appear beside the report. Detailed performance testing is available through the linked specialist tool.",
  },
  {
    q: "Can this tool fix my live website?",
    a: "Changes apply to a working draft inside this tool. Review and export them, publish through your website editor, then run a new URL audit. The tool does not publish changes to your website.",
  },
  {
    q: "What is the difference between Audit and Improve?",
    a: "Audit displays evidence from the imported page. Improve lets you edit selected fields, review suggested alternatives, change heading levels, and export a change list. You can undo individual draft changes.",
  },
  {
    q: "Does the score predict rankings or AI citations?",
    a: "No. It summarizes measured checks across eight weighted categories. Coverage is shown, and incomplete scores remain provisional. Editorial suggestions remain separate. Google rankings, indexing, rich results, and AI citations cannot be guaranteed by a checklist score.",
  },
  {
    q: "Can I analyze long articles or JavaScript websites?",
    a: "The importer reads up to 8 MB and retains bounded text evidence while skipping script content and media downloads. Partial results are marked clearly. It does not execute JavaScript. Paste the rendered HTML when important content is missing.",
  },
  {
    q: "Is llms.txt required for AI search?",
    a: "No. Its availability is optional information and never changes your score. Google states that special AI files and special schema markup are not required for its generative search features.",
  },
  {
    q: "Does one page audit find every website issue?",
    a: "No. Sitewide duplicates, incoming links, orphan pages, cannibalization, and actual indexing status require additional pages or connected search data. Linked destinations are listed without being fetched.",
  },
  {
    q: "Why are some checks marked not checked?",
    a: "Some checks require extra data or a separate test. Missing measurements are not failures. The report keeps completed findings available when another check cannot run.",
  },
];
const areas = [
  [
    "01",
    "Search appearance",
    "Inspect title and description tags, compare proposed wording, and preview how your snippet could look on desktop and mobile.",
  ],
  [
    "02",
    "Heading structure",
    "Explore your full extracted outline. Identify skipped levels and unclear headings, then edit text or heading levels in your draft.",
  ],
  [
    "03",
    "Content and links",
    "Review whole-article readability, keyword coverage, repetition, anchors, and existing internal links. Investigate broader opportunities with the specialist tools.",
  ],
  [
    "04",
    "Technical foundations",
    "Inspect response evidence, robots directives, canonical declarations, language, viewport, and links to dedicated performance tests.",
  ],
  [
    "05",
    "Structured data",
    "Inspect JSON-LD, embedded Microdata, basic Schema.org RDFa, and supported property checks. Correct source drafts and review broader eligibility before publishing.",
  ],
  [
    "06",
    "AI search review",
    "Review authorship clues, claims needing evidence, crawler files, and unanswered editorial questions without invented citation predictions.",
  ],
];
export default function OnPageAnalyzerPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "@id": `${url}#application`,
        name: "On-page AI SEO Analyzer",
        url,
        description,
        applicationCategory: "SEOApplication",
        operatingSystem: "Any",
        isAccessibleForFree: true,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        featureList: [
          "Single-page HTML audit",
          "Evidence and coverage reporting",
          "Audit and Improve modes",
          "Editable draft changes and exports",
          "Heading hierarchy and search preview",
        ],
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://doitwithai.tools",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Tools",
            item: "https://doitwithai.tools/tools",
          },
          {
            "@type": "ListItem",
            position: 3,
            name: "On-page AI SEO Analyzer",
            item: url,
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
        }}
      />
      <section
        className={`relative overflow-hidden ${toolHeroSurface} px-4 pb-16 pt-10 text-white sm:px-6 sm:pt-14`}
      >
        <ToolHeroBackground />
        <div className="relative mx-auto max-w-[1500px]">
          <nav
            className="mb-10 flex flex-wrap items-center gap-2 text-xs font-semibold text-blue-100/80"
            aria-label="Breadcrumb"
          >
            <Link href="/">Home</Link>
            <span>/</span>
            <Link href="/tools">Tools</Link>
            <span>/</span>
            <span>On-page AI SEO Analyzer</span>
          </nav>
          <div className="mx-auto max-w-4xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-300/30 bg-blue-400/10 px-4 py-2 text-xs font-bold tracking-wide text-blue-100">
              <Layers3 size={15} />
              Your complete page review workspace
            </span>
            <h1 className="mt-6 text-4xl font-black leading-[1.08] tracking-[-0.045em] sm:text-6xl">
              On-page AI SEO Analyzer
              <span className={`mt-2 block ${toolHeroHeading}`}>
                Audit. Understand. Improve.
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-blue-100/85">
              See what needs attention, inspect the evidence, and prepare useful
              changes. Bring your page essentials together in one focused
              workspace.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3 text-xs text-blue-100">
              {[
                [ScanLine, "Evidence behind every finding"],
                [Sparkles, "Selected improvements"],
                [ShieldCheck, "Review before publishing"],
              ].map(([Icon, text]) => {
                const I = Icon as typeof ScanLine;
                return (
                  <span
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-2"
                    key={text as string}
                  >
                    <I size={14} />
                    {text as string}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </section>
      <section className="bg-[#f5f7fc] px-3 py-8 dark:bg-[#0c1422] sm:px-6 sm:py-10">
        <div className="mx-auto max-w-[1500px]">
          <AnalyzerClient />
        </div>
      </section>
      <section className="border-t border-slate-200 bg-white px-5 py-20 dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-widest text-[#5271ff] dark:text-blue-300">
              A connected workflow
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
              A page audit that leads somewhere useful
            </h2>
            <p className="mt-5 text-base leading-8 text-slate-600 dark:text-slate-300">
              An audit should help you decide what to do next. Inspect the page,
              review important findings, and prepare changes while keeping the
              original evidence available.
            </p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {areas.map(([n, name, text]) => (
              <article
                key={n}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900"
              >
                <span className="text-xs font-extrabold text-[#5271ff] dark:text-blue-300">
                  {n}
                </span>
                <h3 className="mt-3 text-lg font-extrabold text-slate-950 dark:text-white">
                  {name}
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                  {text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="bg-slate-50 px-5 py-20 dark:bg-[#101a2a]">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">
            From a finding to a verified change
          </h2>
          <ol className="mt-9 grid gap-5 md:grid-cols-4">
            {[
              [
                "Import",
                "Enter a public URL or paste HTML. Add a target phrase and reader context when useful.",
              ],
              [
                "Inspect",
                "Check evidence and coverage. Address verified blockers before spending time on optional improvements.",
              ],
              [
                "Improve",
                "Edit selected text, compare alternatives, and apply approved wording to your working draft.",
              ],
              [
                "Publish and recheck",
                "Export changes, publish through your website editor, and check the updated page after the short cache window.",
              ],
            ].map(([name, text], i) => (
              <li
                className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900"
                key={name}
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#5271ff]/10 font-bold text-[#3959db] dark:text-blue-300">
                  {i + 1}
                </span>
                <h3 className="mt-4 font-extrabold text-slate-950 dark:text-white">
                  {name}
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                  {text}
                </p>
              </li>
            ))}
          </ol>
          <div className="mt-10 rounded-2xl border border-blue-200 bg-blue-50 p-6 dark:border-blue-800 dark:bg-blue-950/30">
            <h3 className="flex items-center gap-2 font-extrabold text-blue-950 dark:text-blue-100">
              <CheckCircle2 size={20} />
              Optimize for people, with clear limits
            </h3>
            <p className="mt-3 text-sm leading-7 text-blue-950/80 dark:text-blue-100/85">
              Your checklist score is a prioritization aid. It does not prove
              indexing, factual accuracy, rich result eligibility, or visibility
              in AI answers.
            </p>
            <a
              className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-blue-800 dark:text-blue-200"
              href="https://developers.google.com/search/docs/appearance/ai-features"
              target="_blank"
              rel="noreferrer"
            >
              Read Google’s AI search guidance <ArrowRight size={15} />
            </a>
          </div>
        </div>
      </section>
      <section className="bg-white px-5 py-20 dark:bg-slate-950">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">
            Questions about your page audit
          </h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {faqs.map((f) => (
              <details
                key={f.q}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900"
              >
                <summary className="cursor-pointer text-sm font-extrabold leading-6 text-slate-950 dark:text-white">
                  {f.q}
                </summary>
                <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>
      <ToolResources slug="on-page-ai-seo-analyzer" />
    </>
  );
}
