import {
  ToolHeroBackground,
  toolHeroSurface,
  toolHeroHeading,
} from "@/features/tool-ui/ToolHero";
import ToolResources from "@/features/tool-catalog/ToolResources";
import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Braces,
  CheckCircle2,
  FileDown,
  Network,
  ScanSearch,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import SchemaGeneratorClient from "@/features/schema-generator/components/SchemaGeneratorClient";
import SchemaToolEducation from "@/features/schema-generator/components/SchemaToolEducation";

const pageUrl = "https://doitwithai.tools/tools/schema-markup-generator";

export const metadata: Metadata = {
  title: "AI Schema Markup Generator | Complete JSON-LD",
  description:
    "Build complete, type-specific JSON-LD with optional URL analysis, deterministic checks, connected entities, copy, download, and validation actions.",
  keywords: [
    "schema markup generator",
    "JSON-LD generator",
    "AI schema generator",
    "structured data generator",
    "rich results test",
    "Schema.org validator",
  ],
  alternates: { canonical: pageUrl },
  openGraph: {
    type: "website",
    url: pageUrl,
    title: "AI Schema Markup Generator | Complete JSON-LD",
    description:
      "Create truthful, connected, type-specific JSON-LD with optional page analysis and deterministic readiness checks.",
    siteName: "Do It With AI Tools",
    images: [
      {
        url: "https://doitwithai.tools/ogimage.png",
        width: 1200,
        height: 630,
        alt: "Do It With AI Tools Schema Markup Generator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Schema Markup Generator | Complete JSON-LD",
    description:
      "Build, check, copy, download, and validate type-specific JSON-LD.",
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
    question: "Does this tool use AI to write the final JSON-LD?",
    answer:
      "No. AI is optional and is limited to extracting field suggestions from a page brief or public URL. The final JSON-LD is assembled by deterministic, type-specific TypeScript code after the user reviews the facts.",
  },
  {
    question: "Can the generator fetch a page URL automatically?",
    answer:
      "Yes. URL analysis is optional. Use an accessible public page, then review its extracted details before preparing your markup.",
  },
  {
    question: "Which schema types are included?",
    answer:
      "The first version includes Article, FAQPage, BreadcrumbList, HowTo, Product, Recipe, Event, JobPosting, LocalBusiness, Organization, Person, VideoObject, WebSite, SoftwareApplication, Course, and Service workflows.",
  },
  {
    question: "Does valid schema markup guarantee a Google rich result?",
    answer:
      "No. Valid structured data can create eligibility for supported search features, but Google does not guarantee display. It also does not guarantee rankings, traffic, or AI citations.",
  },
  {
    question: "Why are FAQ and HowTo marked differently?",
    answer:
      "Google normally limits FAQ rich results to well-known authoritative government and health sites, and it retired HowTo rich results. Both types can still be represented using Schema.org vocabulary when they accurately describe visible page content.",
  },
  {
    question: "What is the difference between Validate and Test?",
    answer:
      "Schema.org Validator checks general Schema.org vocabulary and syntax. Google Rich Results Test checks whether the code contains types and properties used by current Google rich-result features.",
  },
  {
    question: "Which file should I download?",
    answer:
      "Download the HTML file when you want a ready-to-paste script tag. Download the .jsonld file when your CMS, framework, or developer workflow expects raw JSON-LD.",
  },
  {
    question: "Should I fill every optional property?",
    answer:
      "Only when the property is relevant, accurate, and visible on the page. A smaller truthful graph is stronger than a larger graph containing fabricated, stale, hidden, or unrelated facts.",
  },
];

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": `${pageUrl}#application`,
      name: "Do It With AI Tools Schema Markup Generator",
      url: pageUrl,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Any",
      browserRequirements: "Requires JavaScript",
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      description: metadata.description,
      featureList: [
        "Sixteen type-specific schema workflows",
        "Optional public URL and page-context analysis",
        "Deterministic JSON-LD graph compiler",
        "Required and recommended property checks",
        "Schema.org and Google testing actions",
        "JSON-LD and HTML downloads",
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
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://doitwithai.tools",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Tools",
          item: "https://doitwithai.tools/tools",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "Schema Markup Generator",
          item: pageUrl,
        },
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
  ],
};

export default function SchemaMarkupGeneratorPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className={`relative overflow-hidden ${toolHeroSurface} text-white`}
      >
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
            <span aria-current="page">Schema Markup Generator</span>
          </nav>

          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.85fr)]">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#b4c3ff]">
                Technical SEO · Deterministic JSON-LD Graph Builder
              </p>
              <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                Schema Markup Generator 
                <span className={toolHeroHeading}>
                  for Validated JSON-LD Graphs
                </span>
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
                Generate complete, spec-compliant JSON-LD structured data for Article, FAQPage, HowTo, Product, LocalBusiness, Organization, Person, SoftwareApplication, and BreadcrumbList.
              </p>
              <div className="mt-7 flex flex-wrap gap-3 text-xs font-semibold text-slate-200">
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  9 Google rich-result types
                </span>
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  Live URL auto-fill & extraction
                </span>
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  Deterministic JSON-LD compiler
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-[#9aabff]/30 bg-[#101b30]/90 p-6 shadow-xl">
              <p className="text-xs font-bold uppercase tracking-wider text-[#b4c3ff]">
                4 Steps to Rich-Result Schema
              </p>
              <ul className="mt-4 space-y-2.5 text-xs text-slate-300">
                <li>
                  <strong className="text-emerald-300">Choose Schema Type:</strong> Select from 9 supported schema.org templates with required fields.
                </li>
                <li>
                  <strong className="text-indigo-300">Auto-Fill from URL:</strong> Extract existing metadata or draft properties from your page brief.
                </li>
                <li>
                  <strong className="text-sky-300">Field Validation:</strong> Verify required and recommended properties before exporting.
                </li>
                <li>
                  <strong className="text-amber-300">Copy or Download:</strong> Export &lt;script type=&quot;application/ld+json&quot;&gt; or raw JSON.
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8">
            <SchemaGeneratorClient />
          </div>
        </div>
      </div>

      <SchemaToolEducation />

      <section className="border-t border-slate-200 bg-white py-20 dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-xs font-extrabold uppercase tracking-[0.17em] text-[#5271ff]">
              Common questions
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl">
              Schema generator FAQ
            </h2>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {faqs.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-2xl border border-slate-200 bg-slate-50 p-5 open:bg-white dark:border-slate-800 dark:bg-slate-900 dark:open:bg-slate-900"
              >
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-sm font-extrabold text-slate-950 dark:text-white">
                  {faq.question}
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-[#5271ff]" />
                </summary>
                <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>
      <ToolResources slug="schema-markup-generator" />
    </>
  );
}
