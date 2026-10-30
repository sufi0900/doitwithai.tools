import type { Metadata } from "next";
import Link from "next/link";
import {
  BarChart3,
  CheckCheck,
  FileSpreadsheet,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import AnchorTextAnalyzerClient from "@/features/anchor-text-analyzer/AnchorTextAnalyzerClient";
import ToolFaq from "@/features/tool-ui/ToolFaq";
import ToolResources from "@/features/tool-catalog/ToolResources";
import {
  ToolHeroBackground,
  toolHeroHeading,
  toolHeroSurface,
} from "@/features/tool-ui/ToolHero";

const pageUrl = "https://doitwithai.tools/tools/anchor-text-analyzer";
const title =
  "Free Anchor Text Analyzer & Ratio Calculator | Over-Optimization Audit";
const description =
  "Audit backlink anchor text ratios across 8 semantic categories. Check exact-match over-optimization against page-type benchmarks and export CSV or DOCX reports.";

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
    question: "What does the Anchor Text Distribution & Over-Optimization Analyzer do?",
    answer:
      "It classifies backlinks or webpage links into 8 distinct anchor categories (Branded, Naked URL, Brand + Keyword, Partial Match, Exact Match, Natural Topical, Generic CTA, and Image/Empty), compares your ratios against page-type benchmarks, flags over-optimization footprints, and generates a safe diversification plan.",
  },
  {
    question: "What is a safe exact-match anchor text ratio for SEO?",
    answer:
      "Safe ratios depend on page type. Homepages naturally have under 5–6% exact-match anchors (dominated by branded and naked URLs). Commercial service or product pages typically stay at or under 10%, while editorial guides or free tools can sustain up to 12–14% when surrounded by diverse partial-match and topical phrases.",
  },
  {
    question: "Can I import a Google Search Console or Ahrefs/Semrush CSV export?",
    answer:
      "Yes. Upload any CSV or TSV file—or paste rows directly—from Google Search Console, Ahrefs, Semrush, Moz, or your own outreach tracker. The parser automatically maps Anchor Text, Source URL, Target URL, and Rel columns.",
  },
  {
    question: "Can this tool scan live webpages to extract anchors?",
    answer:
      "Yes. Switch to the 'Scan Live Webpage URLs' tab and enter up to 5 public URLs. The analyzer fetches each page's HTML, extracts visible text and image alt attributes, identifies placement zones (editorial body, nav, sidebar, footer, author bio), and classifies every anchor.",
  },
  {
    question: "How does the tool distinguish Brand + Keyword from Partial Match anchors?",
    answer:
      "When an anchor includes both your brand name (or root domain token) and a target keyword token—such as 'DoItWithAI backlink checker'—it is classified as a Brand + Keyword hybrid rather than a pure commercial partial match.",
  },
  {
    question: "Why are repeated anchors flagged even when total exact-match share is moderate?",
    answer:
      "Repeating the exact same commercial phrase word-for-word across multiple referring domains creates an unnatural link-building footprint. Varying phrasing and word order prevents pattern detection.",
  },
  {
    question: "How are image links handled during anchor analysis?",
    answer:
      "When an <a href> tag wraps an image without visible text, search engines read the image's alt attribute as the anchor text. The live and HTML parsers extract img[alt] automatically and flag empty anchors.",
  },
  {
    question: "What files can I download from the audit?",
    answer:
      "You can download a full link-by-link CSV audit, a category distribution summary CSV, and a native editable Microsoft Word (.docx) executive audit containing your benchmark comparison and diversification plan.",
  },
];

const section = "mx-auto max-w-6xl px-4 py-12 sm:px-6";
const prose = "mt-4 text-base leading-8 text-slate-600 dark:text-slate-300";

export default function AnchorTextAnalyzerPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "Anchor Text Distribution & Over-Optimization Analyzer",
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
          { name: "Anchor Text Analyzer", item: pageUrl },
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
            <span aria-current="page">Anchor text analyzer</span>
          </nav>

          <div className="grid items-center gap-8 lg:grid-cols-[1.35fr_0.85fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#b4c3ff]">
                Off-page SEO · Link Profile Audit
              </p>
              <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                Anchor Text Analyzer &{" "}
                <span className={toolHeroHeading}>
                  Over-Optimization Ratio Calculator
                </span>
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
                Audit your backlink anchor distribution across 8 semantic
                categories. Spot exact-match keyword footprints, compare against
                page-type benchmarks, and generate a safe anchor diversification
                plan.
              </p>
              <div className="mt-7 flex flex-wrap gap-3 text-xs font-semibold text-slate-200">
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  8-category classification
                </span>
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  CSV import + live URL scan
                </span>
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  CSV & DOCX audit exports
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-[#9aabff]/30 bg-[#101b30]/90 p-6 shadow-xl">
              <p className="text-xs font-bold uppercase tracking-wider text-[#b4c3ff]">
                Healthy Commercial Page Target
              </p>
              <div className="mt-4 space-y-3 text-xs">
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-300">Branded + Naked URL</span>
                  <span className="font-bold text-emerald-300">30% – 55%</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-300">Brand + Keyword Hybrid</span>
                  <span className="font-bold text-indigo-300">10% – 22%</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-300">Natural Topical & Partial</span>
                  <span className="font-bold text-sky-300">25% – 50%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Exact Match Keyword</span>
                  <span className="font-bold text-amber-300">Keep ≤ 10%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <AnchorTextAnalyzerClient />

      <section
        className={`${section} border-t border-slate-200 dark:border-slate-800`}
      >
        <p className="text-xs font-bold uppercase tracking-wider text-[#5271ff]">
          Why anchor ratios matter
        </p>
        <h2 className="mt-3 text-3xl font-extrabold">
          Balance topical relevance without triggering over-optimization filters
        </h2>
        <p className={prose}>
          Search engines use anchor text—and the sentence immediately
          surrounding a link—to understand what a target page is about. However,
          when too many referring domains link with the exact same commercial
          keyword phrase, algorithmic link-spam classifiers treat the pattern as
          unnatural manipulation.
        </p>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            [
              FileSpreadsheet,
              "8-Category Semantic Classification",
              "Separate pure Exact Match and Partial Match anchors from safe Brand + Keyword hybrids, Branded citations, Naked URLs, Generic CTAs, and Natural Topical phrases.",
            ],
            [
              ShieldAlert,
              "Page-Type Specific Benchmarks",
              "Audit homepages differently from commercial service pages or deep informational tools so you never apply a one-size-fits-all ratio.",
            ],
            [
              Sparkles,
              "Actionable Diversification Plan",
              "Get concrete anchor text suggestions tailored to your brand and target keywords to dilute an over-optimized profile on your next outreach campaign.",
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

      <section
        className={`${section} border-t border-slate-200 dark:border-slate-800`}
      >
        <h2 className="text-2xl font-extrabold">
          Continue your Off-Page SEO workflow
        </h2>
        <p className={prose}>
          Pair your anchor text distribution audit with our{" "}
          <Link
            href="/tools/backlink-verification-tool"
            className="font-semibold text-[#3452d1] underline dark:text-[#9aabff]"
          >
            Backlink Verification Tool
          </Link>{" "}
          to confirm live link presence, clean up toxic spam footprints using
          the{" "}
          <Link
            href="/tools/disavow-file-generator"
            className="font-semibold text-[#3452d1] underline dark:text-[#9aabff]"
          >
            Google Disavow File Generator
          </Link>
          , or vet new publisher prospects with the{" "}
          <Link
            href="/tools/link-placement-quality-checker"
            className="font-semibold text-[#3452d1] underline dark:text-[#9aabff]"
          >
            Guest Post & Link Placement Quality Checker
          </Link>
          .
        </p>
      </section>

      <ToolResources slug="anchor-text-analyzer" />
      <ToolFaq title="Anchor text analyzer questions" faqs={faqs} />
    </div>
  );
}
