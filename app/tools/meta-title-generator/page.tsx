import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Bot, Gauge, Search, Sparkles, UserRound } from "lucide-react";
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
      applicationCategory: "SEOApplication",
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

<div className="relative overflow-hidden bg-[#182235] pb-20 pt-10 text-white sm:pt-16 lg:pb-28">      
   <div className="pointer-events-none absolute inset-0">
  <div className="absolute -left-36 top-0 h-96 w-96 rounded-full bg-[#5271FF]/30 blur-3xl" />
  <div className="absolute -right-28 top-40 h-80 w-80 rounded-full bg-[#5271FF]/15 blur-3xl" />
  <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(82,113,255,0.14)_1px,transparent_0)] bg-[size:28px_28px] [mask-image:linear-gradient(to_bottom,white,transparent_82%)]" />
</div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
            <span className="text-blue-200">Meta Title Generator</span>
          </nav>

          <div className="mx-auto max-w-5xl text-center">
           <div className="inline-flex items-center gap-2 rounded-full border border-[#5271FF]/40 bg-[#5271FF]/15 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.16em] text-[#AEBBFF] backdrop-blur">
  <Sparkles className="h-4 w-4 text-[#5271FF]" />
  Free AI-assisted SEO tool
</div><h1 className="mt-7 text-4xl font-black leading-[1.08] tracking-[-0.04em] sm:text-6xl lg:text-7xl">
  Free AI Meta Title Generator
  <span className="block bg-gradient-to-r from-[#5271FF] to-[#9AABFF] bg-clip-text text-transparent">
    Compare Ideas Before You Publish
  </span>
</h1>
          <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
  Generate multiple meta title ideas and compare how clearly they represent
  your page, target keyword, and intended audience. Refine your preferred
  option using measurable checks and mobile and desktop search previews.
</p>
            <div className="mt-7 flex flex-wrap justify-center gap-3 text-xs font-bold text-slate-300">
  {[
   [Search, "Page and keyword alignment"],
  [UserRound, "Clear reader-focused wording"],
  [Gauge, "Length and duplication checks"],

  ].map(([Icon, label]) => {
    const FeatureIcon = Icon as typeof Search;

    return (
      <span
        key={label as string}
        className="inline-flex items-center gap-2 rounded-full border border-[#5271FF]/25 bg-[#5271FF]/10 px-3 py-2"
      >
        <FeatureIcon className="h-3.5 w-3.5 text-[#8298FF]" />
        {label as string}
      </span>
    );
  })}
</div>

<a
  href="#meta-title-generator"
  className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#5271FF] px-5 py-3.5 text-sm font-extrabold text-white shadow-xl shadow-[#5271FF]/20 transition hover:-translate-y-0.5 hover:bg-[#4664E8]"
>
Generate meta title ideas
  <ArrowRight className="h-4 w-4" />
</a>
          </div>

          <div className="mt-14">
            <MetaTitleGeneratorClient />
          </div>
        </div>
      </div>

      <ToolEducation />

      <section
        className="mx-auto max-w-5xl px-4 pb-24 sm:px-6 lg:px-8"
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
    </>
  );
}
