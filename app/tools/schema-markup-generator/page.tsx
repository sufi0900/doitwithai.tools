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
      "Yes. URL analysis is optional. The server accepts only public HTTP or HTTPS HTML pages, blocks private and local network targets, limits redirects and response size, and treats fetched content as untrusted evidence.",
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

      <div className="relative overflow-hidden bg-slate-950 pb-20 pt-10 text-white sm:pt-16 lg:pb-28">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-36 top-0 h-96 w-96 rounded-full bg-[#5271ff]/30 blur-3xl" />
          <div className="absolute -right-28 top-40 h-80 w-80 rounded-full bg-cyan-400/15 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.08)_1px,transparent_0)] bg-[size:28px_28px] [mask-image:linear-gradient(to_bottom,white,transparent_82%)]" />
        </div>

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
            <span className="text-blue-200">Schema Markup Generator</span>
          </nav>

          <div className="mx-auto max-w-5xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.16em] text-blue-100 backdrop-blur">
              <Sparkles className="h-4 w-4 text-cyan-300" /> AI-assisted,
              deterministically compiled
            </div>
            <h1 className="mt-7 text-4xl font-black leading-[1.06] tracking-[-0.045em] sm:text-6xl lg:text-7xl">
              Schema Markup Generator for
              <span className="block bg-gradient-to-r from-[#7f9aff] via-cyan-300 to-violet-300 bg-clip-text text-transparent">
                Complete, Connected JSON-LD
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
              Choose the page type, provide real context, optionally analyze a
              public URL, and complete only the fields that belong to that
              entity. The tool builds a clean graph you can copy, download,
              validate, and add to your website.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3 text-xs font-bold text-slate-300">
              {[
                [Network, "Connected entity graph"],
                [ScanSearch, "Type-specific checks"],
                [FileDown, "JSON-LD + HTML export"],
                [ShieldCheck, "Visible-content integrity"],
              ].map(([Icon, label]) => {
                const FeatureIcon = Icon as typeof Network;
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
              href="#schema-markup-generator"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-extrabold text-slate-950 shadow-xl transition hover:-translate-y-0.5 hover:bg-blue-50"
            >
              Build schema markup <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          <div className="mt-14">
            <SchemaGeneratorClient />
          </div>
        </div>
      </div>

      <SchemaToolEducation />

      <section className="border-t border-slate-200 bg-white py-20 dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
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
