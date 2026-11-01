import type { Metadata } from "next";
import Link from "next/link";
import { BarChart3, Layers, Sparkles } from "lucide-react";
import DataToChartVisualCardMakerClient from "@/features/data-to-chart-visual-card-maker/DataToChartVisualCardMakerClient";
import ToolFaq from "@/features/tool-ui/ToolFaq";
import ToolResources from "@/features/tool-catalog/ToolResources";
import {
  ToolHeroBackground,
  toolHeroHeading,
  toolHeroSurface,
} from "@/features/tool-ui/ToolHero";
import { PlatformBrandIcon } from "@/features/tool-ui/PlatformBrandIcon";

const pageUrl =
  "https://doitwithai.tools/tools/data-to-chart-visual-card-maker";
const title =
  "Free AI Data to Chart & Stat Visual Card Maker — 6 Editable Templates";
const description =
  "Turn any article statistics, benchmark numbers, or CSV rows into high-contrast 1080x1080 bar charts, donut rings, and 4-card KPI bento dashboards for LinkedIn, X, and blog posts.";

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
    question: "How does the AI Data to Chart Visual Card Maker work?",
    answer:
      "Paste an article URL or a paragraph containing numbers, percentages, or KPIs. The tool extracts the top 4 to 6 metrics and plots them onto an interactive 1080×1080 canvas across 6 chart templates.",
  },
  {
    question: "What chart templates are included?",
    answer:
      "You can switch instantly between: (1) Horizontal Ranking Bars, (2) 4-Card KPI Bento Dashboard, (3) Before vs. After Lift Card, (4) Donut Ring + Legend Card, (5) Benchmark Scorecard Table, and (6) Hero Stat + Insight Spotlight.",
  },
  {
    question: "Can I edit the numbers and labels manually?",
    answer:
      "Yes. Every metric label, percentage/multiplier display value, bar length, and takeaway note can be edited inline with real-time preview.",
  },
];

const section = "mx-auto max-w-6xl px-4 py-12 sm:px-6";
const prose = "mt-4 text-base leading-8 text-slate-600 dark:text-slate-300";

export default function DataToChartVisualCardMakerPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "AI Data to Chart & KPI Visual Card Studio",
        url: pageUrl,
        description,
        applicationCategory: "DesignApplication",
        operatingSystem: "Any",
        isAccessibleForFree: true,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { name: "Home", item: "https://doitwithai.tools" },
          { name: "Tools", item: "https://doitwithai.tools/tools" },
          { name: "Data to Chart Visual Card Maker", item: pageUrl },
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
            <span aria-current="page">Data to Chart Visual Card Maker</span>
          </nav>

          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.85fr)]">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-xs">
                <PlatformBrandIcon
                  slugOrText="data-to-chart-visual-card-maker"
                  size={18}
                />
                <span>Data &amp; KPI Chart Studio · 6 Editable Templates</span>
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#b4c3ff]">
                Content Conversion · Quantitative Visuals &amp; KPI Bento Cards
              </p>
              <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                AI Data &amp; Statistics to{" "}
                <span className={toolHeroHeading}>
                  Visual Chart Card Maker
                </span>
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
                Extract statistics, survey numbers, and ROI benchmarks from any
                article URL or text and plot them onto 1080×1080 ranking bars,
                donut rings, and 4-card KPI bento dashboards.
              </p>
            </div>

            <div className="rounded-2xl border border-[#9aabff]/30 bg-[#101b30]/90 p-6 shadow-xl">
              <p className="text-xs font-bold uppercase tracking-wider text-[#b4c3ff]">
                6 Built-In Data Visualization Layouts
              </p>
              <ul className="mt-4 space-y-2.5 text-xs text-slate-300">
                <li>1. Horizontal Ranking Bars &amp; Donut Breakdown</li>
                <li>2. 4-Card KPI Bento Grid &amp; Before/After Lift</li>
                <li>3. Benchmark Scorecard &amp; Hero Stat Spotlight</li>
                <li>4. 1-Click Chart PNG + Social Caption Package</li>
              </ul>
            </div>
          </div>
        </div>
      </header>

      <DataToChartVisualCardMakerClient />

      <section
        className={`${section} border-t border-slate-200 dark:border-slate-800`}
      >
        <h2 className="text-3xl font-extrabold">
          Turn dry numbers into high-authority data visuals
        </h2>
        <p className={prose}>
          Data-backed graphics earn significantly more saves and citations on
          LinkedIn, X, and blog articles than plain text paragraphs.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            [
              BarChart3,
              "6 Quantitative Templates",
              "Switch between ranking bar charts, 4-card KPI bento grids, donut charts, and before/after lift cards.",
            ],
            [
              Sparkles,
              "Auto-Stat Extraction",
              "Paste any report URL or paragraph and automatically pull out percentages, multipliers, and metrics.",
            ],
            [
              Layers,
              "Chart + Caption Package",
              "Download the 1080×1080 PNG chart alongside a ready-to-post data breakdown caption.",
            ],
          ].map(([Icon, heading, body]) => {
            const I = Icon as typeof BarChart3;
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

      <ToolResources slug="data-to-chart-visual-card-maker" />
      <ToolFaq title="Data to Chart Visual Card Maker FAQs" faqs={faqs} />
    </div>
  );
}
