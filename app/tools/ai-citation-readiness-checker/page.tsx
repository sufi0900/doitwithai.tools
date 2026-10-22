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
  CheckCircle2,
  ListChecks,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import CitationReadinessClient from "@/features/citation-readiness/CitationReadinessClient";
import CitationReadinessEducation from "@/features/citation-readiness/CitationReadinessEducation";

const pageUrl = "https://doitwithai.tools/tools/ai-citation-readiness-checker";

export const metadata: Metadata = {
  title: "AI Citation Readiness Checker | Free GEO Tool",
  description:
    "Review a page's answer placement, section openings, authorship clues, and supporting evidence. Inspect content readiness without predicting AI citations.",
  keywords: [
    "AI citation checker",
    "answer engine optimization",
    "generative engine optimization",
    "GEO checker",
    "AI Overview readiness",
    "AI search visibility",
  ],
  alternates: { canonical: pageUrl },
  openGraph: {
    type: "website",
    url: pageUrl,
    title: "AI Citation Readiness Checker | Free GEO Tool",
    description:
      "Review page structure, answer clarity, and evidence from a URL or pasted draft.",
    siteName: "Do It With AI Tools",
    images: [
      {
        url: "https://doitwithai.tools/ogimage.png",
        width: 1200,
        height: 630,
        alt: "Do It With AI Tools Citation Readiness Checker",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Citation Readiness Checker | Free GEO Tool",
    description:
      "Review page structure, answer clarity, and supporting evidence with an editable checklist.",
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
    question: "Does this check whether my page has been cited?",
    answer:
      "No. This is a page-structure review, not a citation tracker. It reports which structural checks passed and which need attention.",
  },
  {
    question: "Can I review the results before using them?",
    answer:
      "Yes. Review the output and adjust it for your website before copying, downloading, or publishing it.",
  },
  {
    question: "Why can't some checks run on pasted text?",
    answer:
      "Author bylines, publish dates, outbound links, and JSON-LD only exist in a page's live HTML and metadata. Pasted text is scored on structure and clarity; headings, lists, paragraph length, and opening-sentence patterns; using # and - as lightweight Markdown hints.",
  },
  {
    question: "What does a low score actually mean?",
    answer:
      "It highlights completed structural checks worth reviewing. Optional numbers, question headings, lists, external links, and structured data do not add points. It does not mean the content is inaccurate or low quality, and a high score does not mean it will be cited.",
  },
];

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": `${pageUrl}#application`,
      name: "Do It With AI Tools Citation Readiness Checker",
      url: pageUrl,
      applicationCategory: "SEOApplication",
      operatingSystem: "Any",
      browserRequirements: "Requires JavaScript",
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      description: metadata.description,
      featureList: [
        "12-point structural checklist",
        "Live URL analysis with safe public fetch",
        "Instant client-side scoring for pasted drafts",
        "Category breakdown: answer clarity, structure, evidence, technical",
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
          name: "AI Citation Readiness Checker",
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

export default function CitationReadinessPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div
        className={`relative overflow-hidden ${toolHeroSurface} pb-20 pt-10 text-white sm:pt-16 lg:pb-28`}
      >
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
            <span className="text-blue-200">AI Citation Readiness Checker</span>
          </nav>

          <div className="mx-auto max-w-5xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.16em] text-blue-100 backdrop-blur">
              <Sparkles className="h-4 w-4 text-cyan-300" /> GEO / AI search
              readiness
            </div>
            <h1 className="mt-7 text-4xl font-black leading-[1.06] tracking-[-0.045em] sm:text-6xl lg:text-7xl">
              AI Citation Readiness Checker for
              <span className={`block ${toolHeroHeading}`}>
                Quotable, Structured Pages
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
              Analyze a live URL or paste a draft. A 12-point, fully explainable
              checklist scores direct-answer clarity, scannability, evidence,
              and structured data.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3 text-xs font-bold text-slate-300">
              {[
                [ListChecks, "12 explainable checks"],
                [ShieldCheck, "Review before publishing"],
              ].map(([Icon, label]) => {
                const FeatureIcon = Icon as typeof ListChecks;
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
              href="#ai-citation-readiness-checker"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-extrabold text-slate-950 shadow-xl transition hover:-translate-y-0.5 hover:bg-blue-50"
            >
              Check readiness <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          <div className="mt-14">
            <CitationReadinessClient />
          </div>
        </div>
      </div>

      <CitationReadinessEducation />

      <section className="border-t border-slate-200 bg-white py-20 dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-xs font-extrabold uppercase tracking-[0.17em] text-[#5271ff]">
              Common questions
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl">
              Citation readiness checker FAQ
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
      <ToolResources slug="ai-citation-readiness-checker" />
    </>
  );
}
