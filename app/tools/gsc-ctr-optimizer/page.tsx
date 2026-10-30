import type { Metadata } from "next";
import Link from "next/link";
import { BarChart3, MousePointerClick, Sparkles, TrendingUp } from "lucide-react";
import GscCtrOptimizerClient from "@/features/gsc-ctr-optimizer/GscCtrOptimizerClient";
import ToolFaq from "@/features/tool-ui/ToolFaq";
import ToolResources from "@/features/tool-catalog/ToolResources";
import {
  ToolHeroBackground,
  toolHeroHeading,
  toolHeroSurface,
} from "@/features/tool-ui/ToolHero";

const pageUrl = "https://doitwithai.tools/tools/gsc-ctr-optimizer";
const title =
  "Free GSC CTR Benchmark & Snippet Click-Loss Calculator | SEO CTR Tool";
const description =
  "Import your Google Search Console CSV to compare observed CTR against organic position curves, calculate lost monthly clicks, and generate high-CTR title rewrites.";

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
    question: "How does the GSC CTR Benchmark & Click-Loss Calculator work?",
    answer:
      "It compares the observed click-through rate (CTR) of each query or page in your Google Search Console export against mathematical position benchmark curves (Positions 1–20) and calculates how many extra monthly clicks you would capture by bringing underperforming snippets up to benchmark.",
  },
  {
    question: "Why are there 3 different CTR benchmark curves?",
    answer:
      "Organic CTR varies by SERP layout. Standard informational SERPs follow a classic curve (~27.6% at Position #1), SERPs with Google AI Overviews experience compressed click rates (~19.5% at Position #1), and interactive tool queries often earn higher top-3 click share.",
  },
  {
    question: "Which pages should I prioritize for title tag testing?",
    answer:
      "Prioritize pages already ranking in Positions #1 through #6 with high impressions but severe CTR deficits. Because these pages already rank on Page 1, improving their title hook produces immediate traffic gains without waiting for new backlinks.",
  },
  {
    question: "What files can I download?",
    answer:
      "You can export a CSV sorted by recoverable monthly clicks or download an editable Word (.docx) Title & Snippet A/B Test Pack.",
  },
];

const section = "mx-auto max-w-6xl px-4 py-12 sm:px-6";
const prose = "mt-4 text-base leading-8 text-slate-600 dark:text-slate-300";

export default function GscCtrOptimizerPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "GSC CTR Benchmark & Snippet Click-Loss Calculator",
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
          { name: "GSC CTR Optimizer", item: pageUrl },
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
            <span aria-current="page">GSC CTR optimizer</span>
          </nav>

          <div className="grid items-center gap-8 lg:grid-cols-[1.35fr_0.85fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#b4c3ff]">
                On-page SEO · Search Console Click Recovery
              </p>
              <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                GSC CTR Benchmark &{" "}
                <span className={toolHeroHeading}>
                  Snippet Click-Loss Calculator
                </span>
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
                Compare your Google Search Console CTR against organic position
                curves, quantify exact lost monthly clicks, and generate
                high-converting title & meta description test variants.
              </p>
              <div className="mt-7 flex flex-wrap gap-3 text-xs font-semibold text-slate-200">
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  3 SERP CTR benchmark curves
                </span>
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  Exact click-deficit math
                </span>
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  Title rewrite pack (.DOCX / .CSV)
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-[#9aabff]/30 bg-[#101b30]/90 p-6 shadow-xl">
              <p className="text-xs font-bold uppercase tracking-wider text-[#b4c3ff]">
                Top-5 Organic CTR Benchmarks
              </p>
              <div className="mt-4 space-y-2 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span>Position #1 (Standard / AI-Adjusted)</span>
                  <span className="font-bold text-emerald-300">27.6% / 19.5%</span>
                </div>
                <div className="flex justify-between">
                  <span>Position #2</span>
                  <span className="font-bold text-indigo-300">15.8% / 11.4%</span>
                </div>
                <div className="flex justify-between">
                  <span>Position #3</span>
                  <span className="font-bold text-sky-300">11.0% / 8.2%</span>
                </div>
                <div className="flex justify-between">
                  <span>Positions #4 – #5</span>
                  <span className="font-bold text-amber-300">8.4% – 6.3%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <GscCtrOptimizerClient />

      <section
        className={`${section} border-t border-slate-200 dark:border-slate-800`}
      >
        <h2 className="text-3xl font-extrabold">
          Unlock immediate traffic gains from rankings you already hold
        </h2>
        <p className={prose}>
          Ranking #2 with a 1.8% CTR means thousands of searchers are seeing
          your page and clicking a competitor below you. Identifying severe CTR
          deficits and deploying stronger title hooks is the fastest way to grow
          organic clicks without building a single new backlink.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            [
              BarChart3,
              "Position-Curve Modeling",
              "Switch between Standard Non-Branded, AI-Overview Compressed, and High-Intent Tool CTR curves.",
            ],
            [
              TrendingUp,
              "Prioritized By Traffic Upside",
              "Ranks every query or URL by exact recoverable monthly clicks rather than raw percentages alone.",
            ],
            [
              MousePointerClick,
              "3 Title Hook Formulas Per Row",
              "Generates bracketed data hooks, outcome hooks, and question variations ready to preview in SERP simulators.",
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
          Preview & Refine Your Snippets
        </h2>
        <p className={prose}>
          Test pixel widths of your new titles in the{" "}
          <Link
            href="/tools/serp-rich-result-preview-generator"
            className="font-semibold text-[#3452d1] underline dark:text-[#9aabff]"
          >
            SERP & Rich Result Preview
          </Link>
          , craft additional variations in the{" "}
          <Link
            href="/tools/meta-title-generator"
            className="font-semibold text-[#3452d1] underline dark:text-[#9aabff]"
          >
            Meta Title Generator
          </Link>
          , or diagnose multi-month traffic drops in the{" "}
          <Link
            href="/tools/content-decay-refresh-analyzer"
            className="font-semibold text-[#3452d1] underline dark:text-[#9aabff]"
          >
            Content Decay & Refresh Analyzer
          </Link>
          .
        </p>
      </section>

      <ToolResources slug="gsc-ctr-optimizer" />
      <ToolFaq faqs={faqs} />
    </div>
  );
}
