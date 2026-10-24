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
import GscStrikingDistanceClient from "@/features/gsc-striking-distance/GscStrikingDistanceClient";
import GscStrikingDistanceTutorial from "@/features/gsc-striking-distance/GscStrikingDistanceTutorial";
import GscStrikingDistanceEducation from "@/features/gsc-striking-distance/GscStrikingDistanceEducation";

const pageUrl = "https://doitwithai.tools/tools/gsc-striking-distance-finder";

export const metadata: Metadata = {
  title: "Free Striking Distance Keyword Finder for Search Console",
  description:
    "Upload a Google Search Console CSV and find queries ranking at positions 8–20 with high impressions and low CTR. Runs in your browser ; review your results before making changes.",
  keywords: [
    "striking distance keywords",
    "google search console keyword finder",
    "page 2 keywords",
    "low ctr queries",
    "search console csv analyzer",
    "seo opportunity finder",
  ],
  alternates: { canonical: pageUrl },
  openGraph: {
    type: "website",
    url: pageUrl,
    title: "Free Striking Distance Keyword Finder for Search Console",
    description: "Find page-two and bottom-of-page-one queries worth improving, straight from your Search Console CSV.",
    siteName: "Do It With AI Tools",
    images: [
      {
        url: "https://doitwithai.tools/ogimage.png",
        width: 1200,
        height: 630,
        alt: "Do It With AI Tools Striking Distance Keyword Finder",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Striking Distance Keyword Finder for Search Console",
    description: "Turn a Search Console CSV into a prioritized list of queries to improve.",
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
    question: "Does this connect to my Google Search Console account?",
    answer:
      "No. You export a CSV from Search Console yourself and load it into the tool. Upload your export to review query opportunities.",
  },
  {
    question: "Is my Search Console data uploaded anywhere?",
    answer:
      "No. The file is read and analyzed inside your browser tab. Nothing is sent to a server, and closing the tab discards it.",
  },
  {
    question: "What does \"estimated extra clicks\" mean?",
    answer:
      "It is impressions multiplied by the gap between the target CTR you set and the query's current CTR, never below zero. It is a what-if scenario for prioritizing work, not a forecast of results.",
  },
  {
    question: "Which Search Console export should I use?",
    answer:
      "Open Performance → Search results and download CSV. Upload the original ZIP or an individual Queries or Pages CSV. Select a report from the ZIP. Other performance reports receive a preview. Comparison exports use the first matching period.",
  },
  {
    question: "Why does a query's position here differ from my rank tracker?",
    answer:
      "Search Console reports an average position across every time the result appeared, including different devices and locations. A rank tracker usually checks one location and device at a time, so the numbers rarely match exactly.",
  },
];

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": `${pageUrl}#application`,
      name: "Do It With AI Tools Striking Distance Keyword Finder",
      url: pageUrl,
      applicationCategory: "SEOApplication",
      operatingSystem: "Any",
      browserRequirements: "Requires JavaScript",
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      description: metadata.description,
      featureList: [
        "Find queries ranking at positions 8–20 from a Search Console CSV",
        "Filter by position range, minimum impressions, and excluded brand terms",
        "Editable target CTR and estimated extra clicks",
        "Rule-based next-step suggestions for each query",
        "Page-level summary when the export includes pages",
        "Export the shortlist as CSV",
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
        { "@type": "ListItem", position: 3, name: "Striking Distance Keyword Finder", item: pageUrl },
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
      name: "How to find striking distance keywords with Google Search Console data",
      step: [
        { "@type": "HowToStep", name: "Export your queries from Google Search Console", text: "In Performance → Search results, choose a date range and export the data, then keep the Queries.csv file." },
        { "@type": "HowToStep", name: "Load the CSV into the tool", text: "Drop the file onto the upload box or paste the CSV text. It is analyzed in your browser." },
        { "@type": "HowToStep", name: "Set your position range and minimum impressions", text: "Use positions 8 to 20 and a minimum impression count to focus on queries with real visibility." },
        { "@type": "HowToStep", name: "Exclude branded queries and adjust the target CTR", text: "Remove brand terms and set a realistic target CTR for the estimated extra clicks." },
        { "@type": "HowToStep", name: "Sort the list and pick a few queries", text: "Sort by estimated extra clicks or lowest CTR and choose three to five queries to improve." },
        { "@type": "HowToStep", name: "Update the page and re-check later", text: "Apply the suggested next step, wait a few weeks for recrawling, then export again and compare." },
      ],
    },
  ],
};

export default function GscStrikingDistanceFinderPage() {
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
            <span className="text-blue-200">Striking Distance Keyword Finder</span>
          </nav>

          <div className="mx-auto max-w-5xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.16em] text-blue-100 backdrop-blur">
              <Sparkles className="h-4 w-4 text-cyan-300" /> Search Console SEO
            </div>
            <h1 className="mt-7 text-4xl font-black leading-[1.06] tracking-[-0.045em] sm:text-6xl lg:text-7xl">
              Striking Distance Keywords
              <span className={`block ${toolHeroHeading}`}>
                From Your Own Search Console Data
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
              Load a Search Console export and see which queries already rank around positions 8 to
              20 with plenty of impressions but few clicks. Filter out brand terms, sort by
              opportunity, and get a clear next step for each query.
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
              href="#gsc-striking-distance-finder"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-extrabold text-slate-950 shadow-xl transition hover:-translate-y-0.5 hover:bg-blue-50"
            >
              Find your keywords <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          <div className="mt-14">
            <GscStrikingDistanceClient />
          </div>
        </div>
      </div>

      <GscStrikingDistanceTutorial />
      <GscStrikingDistanceEducation />

      <ToolFaq title="Striking distance keyword finder FAQ" faqs={faqs} />
      <ToolResources slug="gsc-striking-distance-finder" />
    </>
  );
}
