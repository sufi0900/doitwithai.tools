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
import Methodology from "@/features/citation-readiness/Methodology";
import CitationReadinessEducation from "@/features/citation-readiness/CitationReadinessEducation";

const pageUrl = "https://doitwithai.tools/tools/ai-citation-readiness-checker";

export const metadata: Metadata = {
  title: "AI Citation Readiness Checker | Free GEO Tool",
  description:
    "Review opening paragraphs, crawler rules, snippet controls, and sourcing cues. Export an evidence-based action plan without predicting AI citations.",
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
    question: "Does this tool detect actual AI citations?",
    answer:
      "No. It reviews extracted content and access evidence. It cannot measure citation likelihood, factual accuracy, authority, or actual indexing.",
  },
  {
    question: "What can I review before publishing?",
    answer:
      "Use the article editor for complete opening paragraphs and editorial cues. Paste HTML for metadata. Published access requires a public URL.",
  },
  {
    question: "Why are some checks not established?",
    answer:
      "Drafts lack live response headers and robots policies. Partial HTML can omit evidence. Missing evidence stays unknown rather than becoming a pass.",
  },
  {
    question: "Do I need special AI markup or a fixed answer length?",
    answer:
      "No special AI schema or fixed answer length guarantees inclusion. Review useful answers, sourcing, technical access, and the needs of your readers.",
  },
  {
    question: "Can I save the review?",
    answer:
      "Export JSON or CSV with action items, scope, and retained opening passages. Reports remain in this session and do not publish website changes.",
  },
  {
    question: "What does audit coverage measure?",
    answer:
      "Coverage shows how many non-optional checks have evidence. Restrictions can still exist at full coverage. It is not a citation probability.",
  },
  {
    question: "Does recording evidence verify a claim?",
    answer:
      "It records your manual decision and updates review progress. AI passage review considers supplied text and notes without independently verifying online facts.",
  },
  {
    question: "When should I open article review?",
    answer:
      "Start with the results dashboard. Open article review to locate highlighted passages, inspect evidence cues, or edit a local draft and update the review.",
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
        "Results-first dashboard with audit coverage and clear evidence states",
        "Live URL analysis with safe public fetch",
        "Separate article review with passage highlights and manual evidence decisions",
        "Search crawler rules, markup inspection, optional performance tests, and exports",
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
            <span aria-current="page">AI Citation Readiness Checker</span>
          </nav>

          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.85fr)]">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#b4c3ff]">
                GEO · AI Search & Answer Engine Readiness
              </p>
              <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                AI Citation Readiness Checker 
                <span className={toolHeroHeading}>
                  for Clarity, Access & Evidence
                </span>
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
                Inspect any public URL or article draft across crawler access, answer-first passage structure, authorship, and verifiable source cues so AI answer engines can cite your page.
              </p>
              <div className="mt-7 flex flex-wrap gap-3 text-xs font-semibold text-slate-200">
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  Crawler & bot access check
                </span>
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  Passage-level citation cues
                </span>
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  Interactive article review
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-[#9aabff]/30 bg-[#101b30]/90 p-6 shadow-xl">
              <p className="text-xs font-bold uppercase tracking-wider text-[#b4c3ff]">
                4 Readiness Pillars Inspected
              </p>
              <ul className="mt-4 space-y-2.5 text-xs text-slate-300">
                <li>
                  <strong className="text-emerald-300">Crawler Access:</strong> Robots meta, canonical alignment, and AI bot reachability.
                </li>
                <li>
                  <strong className="text-indigo-300">Answer Structure:</strong> Direct definition blocks, heading clarity, and scannable lists.
                </li>
                <li>
                  <strong className="text-sky-300">Source Evidence:</strong> Outbound primary citations, statistics, and quoted references.
                </li>
                <li>
                  <strong className="text-amber-300">Editorial Trust:</strong> Named author attribution, timestamps, and structured data.
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8">
            <CitationReadinessClient />
          </div>
        </div>
      </div>

      <Methodology />
      <CitationReadinessEducation />

      <section className="border-t border-slate-200 bg-white py-20 dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
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
