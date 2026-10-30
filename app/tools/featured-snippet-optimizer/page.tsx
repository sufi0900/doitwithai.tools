import type { Metadata } from "next";
import Link from "next/link";
import { Code2, ListOrdered, Sparkles, Target } from "lucide-react";
import FeaturedSnippetOptimizerClient from "@/features/featured-snippet-optimizer/FeaturedSnippetOptimizerClient";
import ToolFaq from "@/features/tool-ui/ToolFaq";
import ToolResources from "@/features/tool-catalog/ToolResources";
import {
  ToolHeroBackground,
  toolHeroHeading,
  toolHeroSurface,
} from "@/features/tool-ui/ToolHero";

const pageUrl = "https://doitwithai.tools/tools/featured-snippet-optimizer";
const title =
  "Free Featured Snippet & AI Overview Passage Optimizer | Position Zero Tool";
const description =
  "Audit H2/H3 answer passages and generate 45–58 word Position Zero definitions, ordered step lists, and comparison tables for Google Featured Snippets and AI Overviews.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: pageUrl },
  openGraph: {
    title,
    description,
    url: pageUrl,
    type: "website",
    images: ["https://doitwithai.tools/ogimage.png"],
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
    question: "What is the ideal word count for a Google Featured Snippet paragraph?",
    answer:
      "Empirical SERP studies consistently show that Google's paragraph Featured Snippets average between 45 and 58 words (roughly 250–340 characters) placed in a single <p> tag immediately below a question-formatted H2 or H3 heading.",
  },
  {
    question: "Why does the first sentence need an 'ontological' trigger like 'X is...'?",
    answer:
      "Passage extraction systems look for direct, self-contained definitions ('Anchor text optimization is...'). Opening a section with conversational filler like 'In this guide, we will explore...' disqualifies the paragraph from direct answer-box extraction.",
  },
  {
    question: "How do Featured Snippets and Google AI Overviews differ?",
    answer:
      "A Featured Snippet extracts a single verbatim passage, list, or table from one ranking page, whereas an AI Overview synthesizes facts across multiple cited pages. Using clear H2 questions followed by concise, metric-backed answer blocks optimizes your page for both.",
  },
  {
    question: "When should I use an Ordered List (<ol>) vs a Paragraph (<p>) snippet?",
    answer:
      "Use a 45–58 word paragraph for 'What is', 'Why does', and definition queries. Use an <ol> list with bold lead-in steps ('Step 1:...') for 'How to' process queries, and a <table> for comparisons, pricing, or specification breakdowns.",
  },
  {
    question: "Can this tool audit my existing live webpage's headings and paragraphs?",
    answer:
      "Yes. Enter a public URL or paste your HTML draft, and the tool inspects every H2/H3 section to flag paragraphs that are too long, too short, or start with conversational fluff.",
  },
  {
    question: "What files can I download?",
    answer:
      "You can download a complete editable Word (.docx) optimization pack, clean semantic HTML (<section>, <h2>, <p>, <ol>, <table>), or GitHub-Flavored Markdown (.md).",
  },
];

const section = "mx-auto max-w-6xl px-4 py-12 sm:px-6";
const prose = "mt-4 text-base leading-8 text-slate-600 dark:text-slate-300";

export default function FeaturedSnippetOptimizerPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "Featured Snippet & AI Overview Passage Optimizer",
        url: pageUrl,
        description,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Any",
        isAccessibleForFree: true,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { name: "Home", item: "https://doitwithai.tools" },
          { name: "Tools", item: "https://doitwithai.tools/tools" },
          { name: "Featured Snippet Optimizer", item: pageUrl },
        ].map((item, i) => ({ "@type": "ListItem", position: i + 1, ...item })),
      },
      {
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: { "@type": "Answer", text: f.answer },
        })),
      },
    ],
  };

  return (
    <div className="bg-white text-slate-900 dark:bg-[#0F1523] dark:text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
        }}
      />

      <header
        className={`relative overflow-hidden ${toolHeroSurface} text-white`}
      >
        <ToolHeroBackground />
        <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <nav
            aria-label="Breadcrumb"
            className="mb-7 flex flex-wrap gap-2 text-xs text-slate-300"
          >
            <Link href="/">Home</Link>
            <span>/</span>
            <Link href="/tools">Tools</Link>
            <span>/</span>
            <span aria-current="page">Featured snippet optimizer</span>
          </nav>

          <div className="grid items-center gap-8 lg:grid-cols-[1.35fr_0.85fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#b4c3ff]">
                On-page SEO · Position Zero & GEO Passage Engineering
              </p>
              <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                Featured Snippet & AI Overview{" "}
                <span className={toolHeroHeading}>
                  Passage Optimizer
                </span>
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
                Audit your H2/H3 answer passages and generate 45–58 word
                ontological definitions, chronological step lists, and
                comparison tables built for Google Position Zero and AI
                Overviews.
              </p>
              <div className="mt-7 flex flex-wrap gap-3 text-xs font-semibold text-slate-200">
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  45–58 word answer calibration
                </span>
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  Paragraph + List + Table blocks
                </span>
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  DOCX, HTML & Markdown exports
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-[#9aabff]/30 bg-[#101b30]/90 p-6 shadow-xl">
              <p className="text-xs font-bold uppercase tracking-wider text-[#b4c3ff]">
                Position Zero Passage Anatomy
              </p>
              <div className="mt-4 space-y-2.5 font-mono text-xs text-slate-300">
                <p className="text-indigo-300">
                  &lt;h2&gt;What Is [Target Topic]?&lt;/h2&gt;
                </p>
                <p className="rounded-lg bg-slate-950/80 p-3 text-emerald-300">
                  &lt;p&gt;&lt;strong&gt;[Target Topic]&lt;/strong&gt; is a
                  [category] that [core mechanism + metric in 45–58 words with
                  zero fluff].&lt;/p&gt;
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <FeaturedSnippetOptimizerClient />

      <section
        className={`${section} border-t border-slate-200 dark:border-slate-800`}
      >
        <p className="text-xs font-bold uppercase tracking-wider text-[#5271ff]">
          Win Position Zero & AI Citations
        </p>
        <h2 className="mt-3 text-3xl font-extrabold">
          Structure your headings and first paragraphs so search engines can extract them cleanly
        </h2>
        <p className={prose}>
          When a page already ranks on Page 1, winning the Featured Snippet or
          an AI Overview citation comes down to HTML passage structure rather
          than backlinks. Pairing a question H2 directly with a 45–58 word
          definition <code>&lt;p&gt;</code>, an ordered <code>&lt;ol&gt;</code>{" "}
          list, and a summary <code>&lt;table&gt;</code> maximizes your surface
          area across every snippet format.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            [
              Target,
              "45–58 Word Definition Calibration",
              "Eliminate throat-clearing intros and calibrate your lead paragraph to the exact word window Google extracts for Position Zero.",
            ],
            [
              ListOrdered,
              "Multi-Format Snippet Coverage",
              "Generate Paragraph, Ordered Step List, and Comparison Table versions simultaneously so your section qualifies for any SERP layout.",
            ],
            [
              Code2,
              "Copy-Ready Semantic HTML",
              "Export clean, dependency-free HTML or Markdown ready to paste straight into WordPress, Next.js, Sanity, or Webflow.",
            ],
          ].map(([Icon, heading, body]) => {
            const I = Icon as typeof Sparkles;
            return (
              <div
                key={String(heading)}
                className="rounded-2xl border border-slate-200 p-6 dark:border-slate-700"
              >
                <I aria-hidden className="text-[#5271ff]" size={22} />
                <h3 className="mt-4 text-lg font-bold">{String(heading)}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
                  {String(body)}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section
        className={`${section} border-t border-slate-200 dark:border-slate-800`}
      >
        <h2 className="text-2xl font-extrabold">
          Continue optimizing your page structure
        </h2>
        <p className={prose}>
          Check your full heading hierarchy in the{" "}
          <Link
            href="/tools/heading-structure-analyzer"
            className="font-semibold text-[#3452d1] underline dark:text-[#9aabff]"
          >
            Heading Structure Analyzer
          </Link>
          , generate jump-link navigation with the{" "}
          <Link
            href="/tools/table-of-contents-generator"
            className="font-semibold text-[#3452d1] underline dark:text-[#9aabff]"
          >
            SEO Table of Contents Generator
          </Link>
          , or compare your entity coverage against top competitors in the{" "}
          <Link
            href="/tools/semantic-entity-gap-analyzer"
            className="font-semibold text-[#3452d1] underline dark:text-[#9aabff]"
          >
            Semantic Entity & Competitor Gap Analyzer
          </Link>
          .
        </p>
      </section>

      <ToolResources slug="featured-snippet-optimizer" />
      <ToolFaq title="Featured Snippet & AI Overview optimization questions" faqs={faqs} />
    </div>
  );
}
