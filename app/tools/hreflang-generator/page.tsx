import ToolFaq from "@/features/tool-ui/ToolFaq";
import { ToolHeroBackground, toolHeroSurface, toolHeroHeading } from "@/features/tool-ui/ToolHero";
import ToolResources from "@/features/tool-catalog/ToolResources";
import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Globe2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import HreflangClient from "@/features/hreflang-generator/HreflangClient";
import HreflangTutorial from "@/features/hreflang-generator/HreflangTutorial";
import HreflangEducation from "@/features/hreflang-generator/HreflangEducation";

const pageUrl = "https://doitwithai.tools/tools/hreflang-generator";

export const metadata: Metadata = {
  title: "Free Hreflang Tag Generator & Validator",
  description:
    "Build reciprocal hreflang tags for your language and region page versions, or check a live page's existing tags. Quick-add common codes, HTML and HTTP header output. ",
  keywords: [
    "hreflang generator",
    "hreflang tag generator",
    "hreflang validator",
    "international SEO",
    "multilingual SEO",
    "x-default",
  ],
  alternates: { canonical: pageUrl },
  openGraph: {
    type: "website",
    url: pageUrl,
    title: "Free Hreflang Tag Generator & Validator",
    description: "Build reciprocal hreflang tags for your language/region page versions, or validate a live page.",
    siteName: "Do It With AI Tools",
    images: [
      {
        url: "https://doitwithai.tools/ogimage.png",
        width: 1200,
        height: 630,
        alt: "Do It With AI Tools Hreflang Tag Generator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Hreflang Tag Generator & Validator",
    description: "Build and validate reciprocal hreflang tags for multilingual and multi-region pages.",
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
    question: "Can I review the results before using them?",
    answer: "Yes. Review the output and highlighted issues before making changes to your website.",
  },
  {
    question: "Why does the tool keep saying \"must be reciprocal\"?",
    answer:
      "hreflang only works when every listed version links to every other version, including itself. If Page A lists Page B but Page B doesn't list Page A back, search engines commonly ignore the relationship. This tool's output is the same block for every page by construction, so copying it onto each version keeps them reciprocal automatically.",
  },
  {
    question: "What's the difference between the HTML and HTTP header output?",
    answer:
      "The HTML <link> tags go in a page's <head> section. The HTTP Link header format does the same job for files where you can't add HTML, like PDFs ; it's set at the server/CDN level instead.",
  },
  {
    question: "Do I need a region code, or is a language code enough?",
    answer:
      "A bare language code like \"en\" or \"ar\" is valid and often the right choice if your content doesn't actually vary by region. Add a region (en-US, ar-AE) only when you have genuinely different content for that specific region.",
  },
];

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": `${pageUrl}#application`,
      name: "Do It With AI Tools Hreflang Tag Generator",
      url: pageUrl,
      applicationCategory: "SEOApplication",
      operatingSystem: "Any",
      browserRequirements: "Requires JavaScript",
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      description: metadata.description,
      featureList: [
        "Deterministic hreflang tag builder",
        "Fetch and validate an existing live page's hreflang tags",
        "Quick-add common language/region codes",
        "HTML <link> and HTTP Link header output",
        "Validation checklist",
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
        { "@type": "ListItem", position: 3, name: "Hreflang Tag Generator", item: pageUrl },
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
      name: "How to use the Hreflang Tag Generator",
      step: [
        { "@type": "HowToStep", name: "Add each language or region version of this page", text: "Add the code and full absolute URL for every language/region version." },
        { "@type": "HowToStep", name: "Add x-default", text: "Add x-default as the fallback for visitors who don't match any listed version." },
        { "@type": "HowToStep", name: "Review the checklist", text: "Check for duplicate codes, invalid formats, non-absolute URLs, and a missing x-default." },
        { "@type": "HowToStep", name: "Copy the exact same block onto every listed page", text: "Paste the identical, self-referencing hreflang block onto every page version so they remain reciprocal." },
        { "@type": "HowToStep", name: "Validate after publishing", text: "Use \"Check a live page\" on a published URL to confirm the tags are live and correct." },
      ],
    },
  ],
};

export default function HreflangGeneratorPage() {
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
            <span className="text-blue-200">Hreflang Tag Generator</span>
          </nav>

          <div className="mx-auto max-w-5xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.16em] text-blue-100 backdrop-blur">
              <Sparkles className="h-4 w-4 text-cyan-300" /> International SEO
            </div>
            <h1 className="mt-7 text-4xl font-black leading-[1.06] tracking-[-0.045em] sm:text-6xl lg:text-7xl">
              Hreflang Tag Generator for
              <span className={`block ${toolHeroHeading}`}>
                Multi-Region, Multi-Language Sites
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
              Build reciprocal hreflang tags for every language and region version of a page, or
              fetch and validate what a live page already has. Quick-add common codes, output as
              HTML or an HTTP header.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3 text-xs font-bold text-slate-300">
              {[
                [Globe2, "Reciprocal by design"],
                [ShieldCheck, "Review and export your results"],
              ].map(([Icon, label]) => {
                const FeatureIcon = Icon as typeof Globe2;
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
              href="#hreflang-generator"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-extrabold text-slate-950 shadow-xl transition hover:-translate-y-0.5 hover:bg-blue-50"
            >
              Build your hreflang tags <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          <div className="mt-14">
            <HreflangClient />
          </div>
        </div>
      </div>

      <HreflangTutorial />
      <HreflangEducation />

      <ToolFaq title="Hreflang generator FAQ" faqs={faqs} />
      <ToolResources slug="hreflang-generator" />
    </>
  );
}
