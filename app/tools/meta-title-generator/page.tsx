import PortableToolHeroBar from "@/features/portable-tool-kit/PortableToolHeroBar";
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
  Bot,
  Gauge,
  Search,
  Sparkles,
  UserRound,
} from "lucide-react";
import MetaTitleGeneratorClient from "@/features/meta-title-generator/components/MetaTitleGeneratorClient";
import ToolEducation from "@/features/meta-title-generator/components/ToolEducation";

const pageUrl = "https://doitwithai.tools/tools/meta-title-generator";
const ogUrl = `https://doitwithai.tools/api/og?${new URLSearchParams({
  title: "Free AI Meta Title Generator with Search and Clarity Checks",
  category: "Free AI SEO Tool",
  ctaText: "Generate Better Meta Titles",
  features: "Pixel Check,Tri-Lens Options,SERP Preview",
}).toString()}`;

export const metadata: Metadata = {
  title: "Free AI Meta Title Generator with Search and Clarity Checks",
  description:
    "Generate and compare meta title candidates across search relevance, reader clarity, and structure using live pixel checks and SERP previews.",
  keywords: [
    "meta title generator",
    "AI meta title generator",
    "SEO title generator",
    "title tag generator",
    "SERP title preview",
    "meta title pixel checker",
  ],
  authors: [{ name: "Sufian Mustafa", url: "https://sufianmustafa.com" }],
  creator: "Sufian Mustafa",
  publisher: "Do It With AI Tools",
  alternates: { canonical: pageUrl },
  openGraph: {
    type: "website",
    url: pageUrl,
    siteName: "Do It With AI Tools",
    title: "Free AI Meta Title Generator with Search and Clarity Checks",
    description:
      "Generate, compare, score, and preview meta titles for Search relevance, reader and context clarity",
    images: [
      {
        url: ogUrl,
        width: 1200,
        height: 630,
        alt: "AI Meta Title Generator by Do It With AI Tools",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Meta Title Generator with Live SERP Preview",
    description:
      "Compare Google, human, AI-readable, and unified meta title options with practical quality checks.",
    images: [ogUrl],
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
  other: {
    "ai-content-declaration": "human-created, ai-assisted",
  },
};

const faqs = [
  {
    question: "What makes this meta title generator different?",
    answer:
      "It generates title ideas using four editorial approaches, explains what each approach prioritizes, highlights three recommendations, and applies measurable character, width, keyword, and similarity checks.  ",
  },
  {
    question: "Does Google use a fixed meta title character limit?",
    answer:
      "No. Google says title links are truncated as needed to fit a device. Character ranges are useful working guidelines, while pixel width and a real preview provide more practical editing context.",
  },
  {
    question: "Can an AI-optimized meta title guarantee a citation?",
    answer:
      "No. Clear entities, answer-oriented wording, and supported format cues may improve machine interpretation, but no title can guarantee rankings, clicks, AI citations, or inclusion in generated answers.",
  },
  {
    question: "Should I publish an AI-generated title without editing it?",
    answer:
      "Treat every generated title as an editorial candidate. Confirm that it accurately matches the page, brand voice, visible heading, evidence, audience, and search intent before publishing.",
  },
];

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": `${pageUrl}#application`,
      name: "Do It With AI Tools Meta Title Generator",
      url: pageUrl,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Any",
      browserRequirements: "Requires JavaScript",
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      description: metadata.description,
      creator: {
        "@type": "Person",
        name: "Sufian Mustafa",
        url: "https://sufianmustafa.com",
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
          name: "Meta Title Generator",
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

export default function MetaTitleGeneratorPage() {
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
            <span aria-current="page">Meta Title Generator</span>
          </nav>

          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.85fr)]">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#b4c3ff]">
                On-Page SEO · Pixel-Calibrated Title Tag Studio
              </p>
              <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                Free AI Meta Title 
                <span className={toolHeroHeading}>
                  Generator & SERP Pixel Lab
                </span>
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
                Generate 25 distinct meta title candidates across 5 optimization lenses, compare ranked recommendations, and test exact desktop and mobile pixel widths in real time.
              </p>
              <div className="mt-7 flex flex-wrap gap-3 text-xs font-semibold text-slate-200">
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  25 titles across 5 lenses
                </span>
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  Live desktop & mobile pixel meter
                </span>
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  1-click URL topic extraction
                </span>
              </div>
              <PortableToolHeroBar />
            </div>

            <div className="rounded-2xl border border-[#9aabff]/30 bg-[#101b30]/90 p-6 shadow-xl">
              <p className="text-xs font-bold uppercase tracking-wider text-[#b4c3ff]">
                5 Optimization Lenses Generated
              </p>
              <ul className="mt-4 space-y-2.5 text-xs text-slate-300">
                <li>
                  <strong className="text-emerald-300">Top 3 Ranked:</strong> Balanced recommendations scored for intent, clarity, and pixel fit.
                </li>
                <li>
                  <strong className="text-indigo-300">SEO & Intent:</strong> Front-loaded primary keyword variations aligned with SERP demand.
                </li>
                <li>
                  <strong className="text-sky-300">Reader Click Appeal:</strong> Outcome-driven hooks designed to earn higher organic CTR.
                </li>
                <li>
                  <strong className="text-amber-300">AI & Compact:</strong> Entity-explicit and ultra-compact (under 48-char) mobile-safe titles.
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8">
            <MetaTitleGeneratorClient />
          </div>
        </div>
      </div>

      <ToolEducation />

      <section
        className="mx-auto max-w-6xl px-4 pb-24 sm:px-6 lg:px-8"
        aria-labelledby="meta-title-faqs"
      >
        <div className="text-center">
          <p className="text-xs font-extrabold uppercase tracking-[0.17em] text-[#5271ff]">
            Questions before you publish
          </p>
          <h2
            id="meta-title-faqs"
            className="mt-3 text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl"
          >
            Meta title generator FAQs
          </h2>
        </div>
        <div className="mt-10 space-y-4">
          {faqs.map((faq) => (
            <details
              key={faq.question}
              className="group rounded-2xl border border-slate-200 bg-white p-5 open:shadow-lg dark:border-slate-800 dark:bg-slate-900 sm:p-6"
            >
              <summary className="cursor-pointer list-none pr-8 text-base font-extrabold text-slate-950 marker:hidden dark:text-white">
                {faq.question}
              </summary>
              <p className="mt-4 border-t border-slate-100 pt-4 text-sm leading-7 text-slate-600 dark:border-slate-800 dark:text-slate-300">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </section>
      <ToolResources slug="meta-title-generator" />
    </>
  );
}
