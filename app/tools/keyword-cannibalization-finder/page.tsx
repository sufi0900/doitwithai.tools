import ToolFaq from "@/features/tool-ui/ToolFaq";
import { ToolHeroBackground, toolHeroSurface, toolHeroHeading } from "@/features/tool-ui/ToolHero";
import ToolResources from "@/features/tool-catalog/ToolResources";
import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  FileSpreadsheet,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import KeywordCannibalizationClient from "@/features/keyword-cannibalization/KeywordCannibalizationClient";
import KeywordCannibalizationTutorial from "@/features/keyword-cannibalization/KeywordCannibalizationTutorial";
import KeywordCannibalizationEducation from "@/features/keyword-cannibalization/KeywordCannibalizationEducation";

const pageUrl = "https://doitwithai.tools/tools/keyword-cannibalization-finder";

export const metadata: Metadata = {
  title: "Free Keyword Cannibalization Finder for Search Console Data",
  description:
    "Upload a Query + Page CSV from Google Search Console and find queries where several of your pages compete. See the leading page, impression split, and a suggested next step. Runs in your browser ; review before publishing.",
  keywords: [
    "keyword cannibalization checker",
    "keyword cannibalization tool",
    "find cannibalized keywords",
    "search console cannibalization",
    "duplicate keyword targeting",
    "seo content audit tool",
  ],
  alternates: { canonical: pageUrl },
  openGraph: {
    type: "website",
    url: pageUrl,
    title: "Free Keyword Cannibalization Finder for Search Console Data",
    description: "Find queries where your own pages compete, and decide which page should own each one.",
    siteName: "Do It With AI Tools",
    images: [
      {
        url: "https://doitwithai.tools/ogimage.png",
        width: 1200,
        height: 630,
        alt: "Do It With AI Tools Keyword Cannibalization Finder",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Keyword Cannibalization Finder for Search Console Data",
    description: "Turn a Query + Page CSV into a clear list of competing pages.",
    images: ["https://doitwithai.tools/ogimage.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  other: { "ai-content-declaration": "human-created, ai-assisted" },
};

const faqs = [
  {
    question: "Which file do I need to use this tool?",
    answer:
      "Upload a Search Console CSV or ZIP for a performance preview. To compare competing pages, use a combined Query + Page CSV. Alternatively, upload query exports filtered to individual pages and assign each page URL. Separate overall Queries and Pages totals cannot establish overlap.",
  },
  {
    question: "Is my Search Console data uploaded anywhere?",
    answer:
      "No. The file is read and analyzed inside your browser tab. Nothing is sent to a server, and closing the tab discards it.",
  },
  {
    question: "Does a query ranking with two of my pages always mean a problem?",
    answer:
      "No. Search engines sometimes show two results from one site, and two pages can serve different intents. This tool highlights where pages overlap so you can review them, not to prove an error.",
  },
  {
    question: "What does \"split impressions\" mean?",
    answer:
      "It is the number of impressions that go to the competing pages other than the leader ; the page with the most clicks for that query. A larger number means more of the query's visibility is spread across your pages.",
  },
  {
    question: "Why isn't a query I expected showing up?",
    answer:
      "A page only counts as competing if it passes your minimum impressions and minimum share settings. Lower those thresholds, or turn off exclusions, to widen the net.",
  },
  {
    question: "Does the tool tell me which pages to delete?",
    answer:
      "No. It gives rule-based suggestions such as merging, differentiating, or fixing internal links. You should always review the pages and their intent before changing or removing anything.",
  },
];

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": `${pageUrl}#application`,
      name: "Do It With AI Tools Keyword Cannibalization Finder",
      url: pageUrl,
      applicationCategory: "SEOApplication",
      operatingSystem: "Any",
      browserRequirements: "Requires JavaScript",
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      description: metadata.description,
      featureList: [
        "Find queries where two or more of your pages compete",
        "Leading page, position, impressions, clicks, and share for each competing page",
        "Adjustable thresholds and brand-term exclusion",
        "Treats URL parameters and trailing slashes as the same page",
        "Rule-based suggested next steps",
        "Page pairs that compete most often",
        "Export the report as CSV",
      ],
      creator: {
        "@type": "Person",
        name: "Sufian Mustafa",
        url: "https://doitwithai.tools/author/sufian-mustafa",
      },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://doitwithai.tools" },
        { "@type": "ListItem", position: 2, name: "Tools", item: "https://doitwithai.tools/tools" },
        { "@type": "ListItem", position: 3, name: "Keyword Cannibalization Finder", item: pageUrl },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: { "@type": "Answer", text: faq.answer },
      })),
    },
    {
      "@type": "HowTo",
      name: "How to find keyword cannibalization with Search Console data",
      step: [
        { "@type": "HowToStep", name: "Get a combined Query + Page export", text: "Export a CSV that contains Query, Page, Clicks, Impressions, and Position columns." },
        { "@type": "HowToStep", name: "Load the CSV into the tool", text: "Drop the file onto the upload box or paste the CSV text. It is analyzed in your browser." },
        { "@type": "HowToStep", name: "Set what counts as a competing page", text: "Adjust the minimum impressions and share, and exclude brand terms." },
        { "@type": "HowToStep", name: "Review the queries with the most split impressions", text: "Open each query to compare the leading page with the pages competing against it." },
        { "@type": "HowToStep", name: "Choose one action per query", text: "Merge and redirect, re-target the weaker page, or fix internal links." },
        { "@type": "HowToStep", name: "Re-export and compare after a few weeks", text: "Check whether a single page now takes a larger share of impressions." },
      ],
    },
  ],
};

export default function KeywordCannibalizationFinderPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className={`relative overflow-hidden ${toolHeroSurface} text-white`}>
        <ToolHeroBackground />

        <div className="relative mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
          <nav
            aria-label="Breadcrumb"
            className="mb-4 flex flex-wrap gap-2 text-xs text-slate-300"
          >
            <Link href="/">Home</Link>
            <span>/</span>
            <Link href="/tools">Tools</Link>
            <span>/</span>
            <span aria-current="page">Keyword Cannibalization Finder</span>
          </nav>

          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.85fr)]">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#b4c3ff]">
                Search Console SEO · Competing URL & Split-Click Detector
              </p>
              <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                Keyword Cannibalization 
                <span className={toolHeroHeading}>
                  & Competing Page Finder
                </span>
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
                Import a Google Search Console query-and-page export to spot search terms where multiple URLs on your domain split impressions and clicks—plus see which page leads.
              </p>
              <div className="mt-7 flex flex-wrap gap-3 text-xs font-semibold text-slate-200">
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  Supports GSC CSV & ZIP files
                </span>
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  Impression-split severity score
                </span>
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  Consolidation & redirect tips
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-[#9aabff]/30 bg-[#101b30]/90 p-6 shadow-xl">
              <p className="text-xs font-bold uppercase tracking-wider text-[#b4c3ff]">
                4 Cannibalization Signals Audited
              </p>
              <ul className="mt-4 space-y-2.5 text-xs text-slate-300">
                <li>
                  <strong className="text-emerald-300">Impression Split:</strong> Measures how impressions are divided across competing URLs.
                </li>
                <li>
                  <strong className="text-indigo-300">Click Dilution:</strong> Identifies secondary pages siphoning clicks from your main URL.
                </li>
                <li>
                  <strong className="text-sky-300">Position Conflict:</strong> Highlights queries where Google flips between two different pages.
                </li>
                <li>
                  <strong className="text-amber-300">Resolution Plan:</strong> Suggests differentiating intent, merging, or 301 redirecting.
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8">
            <KeywordCannibalizationClient />
          </div>
        </div>
      </div>

      <KeywordCannibalizationTutorial />
      <KeywordCannibalizationEducation />

      <ToolFaq title="Keyword cannibalization finder FAQ" faqs={faqs} />
      <ToolResources slug="keyword-cannibalization-finder" />
    </>
  );
}
