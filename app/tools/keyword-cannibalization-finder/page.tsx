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

      <div className={`relative overflow-hidden ${toolHeroSurface} pb-20 pt-10 text-white sm:pt-16 lg:pb-28`}>
        <ToolHeroBackground />

        <div className="relative mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8">
          <nav
            aria-label="Breadcrumb"
            className="mb-10 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-400"
          >
            <Link href="/" className="transition hover:text-white">
              Home
            </Link>
            <span>/</span>
            <Link href="/tools" className="transition hover:text-white">
              Tools
            </Link>
            <span>/</span>
            <span className="text-blue-200">Keyword Cannibalization Finder</span>
          </nav>

          <div className="mx-auto max-w-5xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.16em] text-blue-100 backdrop-blur">
              <Sparkles className="h-4 w-4 text-cyan-300" /> Search Console SEO
            </div>
            <h1 className="mt-7 text-4xl font-black leading-[1.06] tracking-[-0.045em] sm:text-6xl lg:text-7xl">
              Keyword Cannibalization Finder
              <span className={`block ${toolHeroHeading}`}>
                See Which Pages Compete For One Query
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
              Load a Search Console export that lists queries and pages together. The tool finds the
              queries where several of your pages compete, shows the leading page, and suggests a
              next step for each one.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3 text-xs font-bold text-slate-300">
              {[
                [FileSpreadsheet, "Works from a CSV export"],
                [ShieldCheck, "Review and export your results"],
              ].map(([Icon, label]) => {
                const FeatureIcon = Icon as typeof FileSpreadsheet;
                return (
                  <span
                    key={label as string}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-2"
                  >
                    <FeatureIcon className="h-3.5 w-3.5 text-blue-300" />
                    {label as string}
                  </span>
                );
              })}
            </div>
            <a
              href="#keyword-cannibalization-finder"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-extrabold text-slate-950 shadow-xl transition hover:-translate-y-0.5 hover:bg-blue-50"
            >
              Check your pages <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          <div className="mt-14">
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
