import type { Metadata } from "next";
import Link from "next/link";
import { FileSpreadsheet, RefreshCw, Sparkles, TrendingDown } from "lucide-react";
import ContentDecayRefreshAnalyzerClient from "@/features/content-decay-refresh-analyzer/ContentDecayRefreshAnalyzerClient";
import ToolFaq from "@/features/tool-ui/ToolFaq";
import ToolResources from "@/features/tool-catalog/ToolResources";
import {
  ToolHeroBackground,
  toolHeroHeading,
  toolHeroSurface,
} from "@/features/tool-ui/ToolHero";

const pageUrl = "https://doitwithai.tools/tools/content-decay-refresh-analyzer";
const title =
  "Free Content Decay & GSC Refresh Priority Analyzer | Fix Traffic Drops";
const description =
  "Analyze Google Search Console page comparisons to separate true ranking content decay from AI Overview CTR compression and seasonality. Export CSV & DOCX refresh briefs.";

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
    question: "How does this tool separate true content decay from AI Overview CTR loss?",
    answer:
      "When both your average position worsens (e.g., #2.3 to #6.8) and clicks fall, your page is experiencing True Ranking Decay. When your average position and impressions stay steady (e.g., #1.9 to #2.1) while clicks drop, a new SERP feature or AI Overview is compressing click-through rate.",
  },
  {
    question: "Why shouldn't I rewrite an entire article if it's only suffering SERP CTR compression?",
    answer:
      "If your page already holds Position #1 or #2, overhauling the body structure risks disrupting rankings. Instead, test a stronger Title Tag hook and format your lead H2 answer to capture the Featured Snippet or AI Overview citation.",
  },
  {
    question: "How is the 0–100 Refresh Priority Score calculated?",
    answer:
      "It weights total volume of lost clicks, percentage click drop, magnitude of average position loss, and the presence of outdated year tokens (2021–2025) so you refresh the highest-ROI pages first.",
  },
  {
    question: "Should I change the URL slug when updating an outdated year like '-2024'?",
    answer:
      "Avoid changing an established URL slug unless you configure a permanent 301 redirect and update all internal links. Usually, updating the <title>, H1, body content, and dateModified schema while keeping the evergreen URL is safest.",
  },
  {
    question: "What files can I export?",
    answer:
      "You can download a prioritized CSV refresh queue for project trackers or an editable Word (.docx) Content Refresh Action Plan.",
  },
];

const section = "mx-auto max-w-6xl px-4 py-12 sm:px-6";
const prose = "mt-4 text-base leading-8 text-slate-600 dark:text-slate-300";

export default function ContentDecayRefreshAnalyzerPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "Content Decay & GSC Refresh Priority Analyzer",
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
          { name: "Content Decay & Refresh Analyzer", item: pageUrl },
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
            <span aria-current="page">Content decay analyzer</span>
          </nav>

          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.85fr)]">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#b4c3ff]">
                On-page SEO · Search Console Content Refresh
              </p>
              <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                Content Decay & GSC{" "}
                <span className={toolHeroHeading}>
                  Refresh Priority Analyzer
                </span>
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
                Diagnose why pages lost organic traffic. Separate true ranking
                decay from AI Overview CTR compression and seasonality, then
                export a prioritized content refresh queue.
              </p>
              <div className="mt-7 flex flex-wrap gap-3 text-xs font-semibold text-slate-200">
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  4-category decay diagnosis
                </span>
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  0–100 priority scoring
                </span>
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  CSV & DOCX refresh briefs
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-[#9aabff]/30 bg-[#101b30]/90 p-6 shadow-xl">
              <p className="text-xs font-bold uppercase tracking-wider text-[#b4c3ff]">
                3 Root Causes of Traffic Drops
              </p>
              <ul className="mt-4 space-y-2.5 text-xs text-slate-300">
                <li>
                  <strong className="text-rose-300">1. Ranking Decay:</strong>{" "}
                  Position dropped + clicks fell → Refresh content depth & E-E-A-T.
                </li>
                <li>
                  <strong className="text-amber-300">2. CTR Compression:</strong>{" "}
                  Rank held + clicks fell → Optimize Title & Snippet passage.
                </li>
                <li>
                  <strong className="text-sky-300">3. Demand Shift:</strong>{" "}
                  Impressions fell + rank held → Expand to adjacent queries.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </header>

      <ContentDecayRefreshAnalyzerClient />

      <section
        className={`${section} border-t border-slate-200 dark:border-slate-800`}
      >
        <h2 className="text-3xl font-extrabold">
          Fix the right problem on every declining URL
        </h2>
        <p className={prose}>
          Refreshing an existing URL that slipped from Position #2 to #7 is
          often the fastest way to recover organic traffic. Pairing your GSC
          comparison data with root-cause diagnostics ensures writers spend time
          expanding pages that actually lost rankings rather than breaking pages
          that only need a title rewrite.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            [
              TrendingDown,
              "Root-Cause Triage",
              "Distinguish true competitor ranking overtakes from SERP CTR compression and seasonal search volume shifts.",
            ],
            [
              RefreshCw,
              "Stale Year & Freshness Detection",
              "Automatically spot URLs or titles still carrying 2022–2025 year tokens that depress click-through rates.",
            ],
            [
              FileSpreadsheet,
              "Prioritized Editorial Queue",
              "Rank every URL by recoverable click volume and export a ready-to-assign DOCX or CSV refresh brief.",
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
          Related Search Console & On-Page Tools
        </h2>
        <p className={prose}>
          Combine your content refresh workflow with the{" "}
          <Link
            href="/tools/gsc-ctr-optimizer"
            className="font-semibold text-[#3452d1] underline dark:text-[#9aabff]"
          >
            GSC CTR Benchmark & Click-Loss Calculator
          </Link>
          , find near-page-one quick wins in the{" "}
          <Link
            href="/tools/gsc-striking-distance-finder"
            className="font-semibold text-[#3452d1] underline dark:text-[#9aabff]"
          >
            GSC Striking Distance Finder
          </Link>
          , and check competing URLs on your own domain with the{" "}
          <Link
            href="/tools/keyword-cannibalization-finder"
            className="font-semibold text-[#3452d1] underline dark:text-[#9aabff]"
          >
            Keyword Cannibalization Finder
          </Link>
          .
        </p>
      </section>

      <ToolResources slug="content-decay-refresh-analyzer" />
      <ToolFaq title="Content decay & GSC refresh questions" faqs={faqs} />
    </div>
  );
}
