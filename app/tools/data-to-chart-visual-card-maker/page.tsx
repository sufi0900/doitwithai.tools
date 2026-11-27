import type { Metadata } from "next";
import ToolLandingHero from "@/features/tool-ui/ToolLandingHero";
import Link from "next/link";
import {
  BarChart3,
  Layers,
  Sparkles,
} from "lucide-react";
import DataToChartVisualCardMakerClient from "@/features/data-to-chart-visual-card-maker/DataToChartVisualCardMakerClient";
import ToolFaq from "@/features/tool-ui/ToolFaq";
import ToolResources from "@/features/tool-catalog/ToolResources";
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

      <ToolLandingHero
        slug="data-to-chart-visual-card-maker"
        title="AI Data & Statistics to Visual Chart Card Maker"
        description="Extract statistics, survey numbers, and ROI benchmarks from any article URL or text and plot them onto 1080×1080 ranking bars, donut rings, and 4-card KPI bento dashboards."
        categoryLabel="Content Conversion"
        categoryHref="/tools"
        workspaceId="tool-studio-workspace"
      >
        <div className="p-4 sm:p-6">
          <DataToChartVisualCardMakerClient />
        </div>
      </ToolLandingHero>

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
