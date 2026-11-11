import PortableToolHeroBar from "@/features/portable-tool-kit/PortableToolHeroBar";
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
            <span aria-current="page">Striking Distance Keyword Finder</span>
          </nav>

          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.85fr)]">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#b4c3ff]">
                Search Console SEO · Page-1 Ranking Opportunity Finder
              </p>
              <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                GSC Striking Distance 
                <span className={toolHeroHeading}>
                  Keyword Opportunity Finder
                </span>
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
                Upload your Google Search Console CSV or ZIP export to surface high-impression queries already ranking in positions 8–20 that can reach top results with targeted updates.
              </p>
              <div className="mt-7 flex flex-wrap gap-3 text-xs font-semibold text-slate-200">
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  Supports GSC CSV & ZIP exports
                </span>
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  Custom position & CTR filters
                </span>
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  Prioritized action export
                </span>
              </div>
              <PortableToolHeroBar />
            </div>

            <div className="rounded-2xl border border-[#9aabff]/30 bg-[#101b30]/90 p-6 shadow-xl">
              <p className="text-xs font-bold uppercase tracking-wider text-[#b4c3ff]">
                4 Opportunity Signals Ranked
              </p>
              <ul className="mt-4 space-y-2.5 text-xs text-slate-300">
                <li>
                  <strong className="text-emerald-300">Positions 8–20:</strong> Finds queries sitting on the bottom of Page 1 or top of Page 2.
                </li>
                <li>
                  <strong className="text-indigo-300">Impression Volume:</strong> Highlights queries where searchers already see your URL.
                </li>
                <li>
                  <strong className="text-sky-300">CTR Upside:</strong> Estimates potential click gains from moving into the top 5.
                </li>
                <li>
                  <strong className="text-amber-300">Action Playbook:</strong> Recommends snippet, heading, or section updates per query.
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8">
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
