import type { Metadata } from "next";
import Link from "next/link";
import { FileSpreadsheet, Layers, Search, Sparkles } from "lucide-react";
import SemanticEntityGapAnalyzerClient from "@/features/semantic-entity-gap-analyzer/SemanticEntityGapAnalyzerClient";
import ToolFaq from "@/features/tool-ui/ToolFaq";
import ToolResources from "@/features/tool-catalog/ToolResources";
import {
  ToolHeroBackground,
  toolHeroHeading,
  toolHeroSurface,
} from "@/features/tool-ui/ToolHero";

const pageUrl = "https://doitwithai.tools/tools/semantic-entity-gap-analyzer";
const title =
  "Free Semantic Entity & Competitor Content Gap Analyzer | On-Page SEO Tool";
const description =
  "Compare your article against top-ranking competitor URLs or drafts. Extract missing named entities, domain phrases, and H2/H3 subtopics with CSV and DOCX briefs.";

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
    question: "What does the Semantic Entity & Competitor Content Gap Analyzer do?",
    answer:
      "It compares your page or draft against 1 to 3 ranking competitor pages to identify named entities, technical phrases, and H2/H3 subheadings that competitors cover but your content misses.",
  },
  {
    question: "How is semantic entity coverage different from old-school keyword density?",
    answer:
      "Keyword density measures how often a single target keyword repeats, whereas semantic entity analysis checks whether your article covers the related tools, standards, metrics, and subtopics that search engines expect in an authoritative piece on that topic.",
  },
  {
    question: "What are the 4 entity buckets in the report?",
    answer:
      "Terms are grouped into: (1) Missing Critical Gaps (used by competitors, 0 mentions on your page), (2) Under-Used Terms (present on your page at less than 45% of competitor frequency), (3) Well-Covered Core Entities, and (4) Unique to You (terms that give your article original Information Gain).",
  },
  {
    question: "Can I compare unpublished drafts without live URLs?",
    answer:
      "Yes. Use the 'Compare Pasted Drafts / HTML' tab to paste your draft alongside competitor text and run the comparison offline.",
  },
  {
    question: "Should I stuff every missing entity into my article?",
    answer:
      "No. Only add entities and subtopics that genuinely help answer the reader's intent. Adding a short, accurate section or table is always better than forcing isolated words into existing sentences.",
  },
  {
    question: "What files can I download?",
    answer:
      "You can export the full Entity Gap Matrix as a CSV spreadsheet or download an editable Microsoft Word (.docx) Content Optimization Brief for writers.",
  },
];

const section = "mx-auto max-w-6xl px-4 py-12 sm:px-6";
const prose = "mt-4 text-base leading-8 text-slate-600 dark:text-slate-300";

export default function SemanticEntityGapAnalyzerPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "Semantic Entity & Competitor Content Gap Analyzer",
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
          { name: "Semantic Entity Gap Analyzer", item: pageUrl },
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
            <span aria-current="page">Semantic entity gap analyzer</span>
          </nav>

          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.28fr)_minmax(0,0.92fr)]">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#b4c3ff]">
                On-page SEO · Competitor Entity &amp; Topic Coverage
              </p>
              <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                Semantic Entity &amp; Competitor{" "}
                <span className={toolHeroHeading}>
                  Content Gap Analyzer
                </span>
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
                Compare your live page URL or draft against top-ranking
                competitors to find missing named entities, technical phrases,
                and H2/H3 subtopics—plus see where your content brings unique
                differentiation.
              </p>
              <div className="mt-7 flex flex-wrap gap-3 text-xs font-semibold text-slate-200">
                <span className="rounded-lg border border-white/15 bg-white/5 px-3 py-2">
                  Live URL &amp; multi-competitor diff
                </span>
                <span className="rounded-lg border border-white/15 bg-white/5 px-3 py-2">
                  H2/H3 subtopic gap finder
                </span>
                <span className="rounded-lg border border-white/15 bg-white/5 px-3 py-2">
                  CSV &amp; DOCX writer briefs
                </span>
              </div>
            </div>

            {/* High-Contrast Visual Hero Right-Side Card */}
            <div className="rounded-2xl border border-[#7c96ff]/40 bg-gradient-to-br from-[#13203B]/95 via-[#0F182D]/95 to-[#172544]/95 p-6 shadow-2xl ring-1 ring-white/10">
              <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3.5">
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#b4c3ff]">
                    Live Semantic Gap Matrix
                  </p>
                  <p className="mt-0.5 text-sm font-black text-white">
                    4 Entity Comparison Buckets
                  </p>
                </div>
                <span className="rounded-full border border-emerald-400/40 bg-emerald-500/20 px-3 py-1 text-xs font-extrabold text-emerald-300">
                  84% Parity Target
                </span>
              </div>

              <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-rose-300">
                      1. Missing Gaps
                    </span>
                    <span className="rounded bg-rose-500/25 px-1.5 py-0.5 font-mono text-[10px] font-bold text-rose-200">
                      0x on page
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] leading-4 text-slate-200">
                    Critical entities cited by ranking competitors but absent from your page.
                  </p>
                </div>

                <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-amber-300">
                      2. Under-Used
                    </span>
                    <span className="rounded bg-amber-500/25 px-1.5 py-0.5 font-mono text-[10px] font-bold text-amber-200">
                      &lt;45% density
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] leading-4 text-slate-200">
                    Concepts mentioned briefly that need deeper section coverage.
                  </p>
                </div>

                <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-emerald-300">
                      3. Well-Covered
                    </span>
                    <span className="rounded bg-emerald-500/25 px-1.5 py-0.5 font-mono text-[10px] font-bold text-emerald-200">
                      Matched ✓
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] leading-4 text-slate-200">
                    Core topic entities matching top-3 SERP competitor benchmarks.
                  </p>
                </div>

                <div className="rounded-xl border border-indigo-400/30 bg-indigo-500/15 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-indigo-200">
                      4. Unique to You
                    </span>
                    <span className="rounded bg-indigo-500/30 px-1.5 py-0.5 font-mono text-[10px] font-bold text-indigo-100">
                      +Info Gain
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] leading-4 text-slate-200">
                    Original entities and proof points that differentiate your article.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <SemanticEntityGapAnalyzerClient />

      <section
        className={`${section} border-t border-slate-200 dark:border-slate-800`}
      >
        <p className="text-xs font-bold uppercase tracking-wider text-[#5271ff]">
          Close topical authority gaps
        </p>
        <h2 className="mt-3 text-3xl font-extrabold">
          See the exact entities and subheadings top-ranking pages include
        </h2>
        <p className={prose}>
          Modern search engines represent articles as networks of entities and
          subtopics rather than isolated keyword strings. Comparing your draft
          directly against the pages currently ranking at the top of the SERP
          reveals which concepts, metrics, and subheadings readers expect.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            [
              Layers,
              "Entity & Phrase Extraction",
              "Identify capitalized named entities, technical acronyms, and multi-word domain phrases across up to 3 competitors.",
            ],
            [
              Search,
              "Missing Subtopic Discovery",
              "Spot H2 and H3 sections that top competitors use to answer secondary search intents on the same page.",
            ],
            [
              FileSpreadsheet,
              "Ready-to-Assign Writer Briefs",
              "Download a clean DOCX brief or CSV matrix with recommended mention ranges for every gap term.",
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
          Pair with Originality &amp; On-Page Audits
        </h2>
        <p className={prose}>
          After closing entity gaps, measure how much original value your page
          adds in the{" "}
          <Link
            href="/tools/information-gain-auditor"
            className="font-semibold text-[#3452d1] underline dark:text-[#9aabff]"
          >
            Information Gain &amp; Originality Scorer
          </Link>
          , audit your single-term repetition in the{" "}
          <Link
            href="/tools/keyword-density-checker"
            className="font-semibold text-[#3452d1] underline dark:text-[#9aabff]"
          >
            Keyword Density Checker
          </Link>
          , and verify structured entity links with the{" "}
          <Link
            href="/tools/entity-sameas-finder"
            className="font-semibold text-[#3452d1] underline dark:text-[#9aabff]"
          >
            Entity &amp; sameAs Finder
          </Link>
          .
        </p>
      </section>

      <ToolResources slug="semantic-entity-gap-analyzer" />
      <ToolFaq title="Semantic entity & competitor gap questions" faqs={faqs} />
    </div>
  );
}
