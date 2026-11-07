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
            <span aria-current="page">Hreflang Tag Generator</span>
          </nav>

          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.85fr)]">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#b4c3ff]">
                International SEO · Multi-Language & Regional Tag Builder
              </p>
              <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                Hreflang Tag Generator 
                <span className={toolHeroHeading}>
                  & Live Return-Tag Validator
                </span>
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
                Generate reciprocal hreflang annotations for multi-language and multi-region pages, or fetch a live URL to audit language codes, x-default fallback, and HTML/sitemap output.
              </p>
              <div className="mt-7 flex flex-wrap gap-3 text-xs font-semibold text-slate-200">
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  ISO language & region presets
                </span>
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  Live URL tag inspection
                </span>
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  HTML, HTTP & XML sitemap output
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-[#9aabff]/30 bg-[#101b30]/90 p-6 shadow-xl">
              <p className="text-xs font-bold uppercase tracking-wider text-[#b4c3ff]">
                4 International SEO Safeguards
              </p>
              <ul className="mt-4 space-y-2.5 text-xs text-slate-300">
                <li>
                  <strong className="text-emerald-300">ISO Validation:</strong> Enforces valid ISO 639-1 language and ISO 3166-1 region codes.
                </li>
                <li>
                  <strong className="text-indigo-300">Reciprocal Links:</strong> Ensures every alternate URL includes self and return tags.
                </li>
                <li>
                  <strong className="text-sky-300">x-default Fallback:</strong> Configures a clean fallback URL for unmatched locales.
                </li>
                <li>
                  <strong className="text-amber-300">3 Export Formats:</strong> Outputs HTML &lt;link&gt; tags, HTTP headers, or XML sitemap nodes.
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8">
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
