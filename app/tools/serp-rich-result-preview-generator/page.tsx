import { ToolHeroBackground, toolHeroHeading, toolHeroSurface } from "@/features/tool-ui/ToolHero";
import ToolResources from "@/features/tool-catalog/ToolResources";
import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  LayoutList,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import SerpPreviewClient from "@/features/serp-preview/SerpPreviewClient";
import SerpPreviewTutorial from "@/features/serp-preview/SerpPreviewTutorial";
import SerpPreviewEducation from "@/features/serp-preview/SerpPreviewEducation";

const pageUrl = "https://doitwithai.tools/tools/serp-rich-result-preview-generator";

export const metadata: Metadata = {
  title: "Free SERP Snippet & Rich Result Preview Generator",
  description:
    "Preview how a page's title, URL, and description would look as a Google search result, and visualize FAQ, HowTo, Review, Product, Recipe, Event, and Breadcrumb rich results from your JSON-LD. Compare your preview before publishing.",
  keywords: [
    "serp preview tool",
    "google search snippet preview",
    "rich result preview",
    "rich snippet checker",
    "structured data preview",
    "FAQ rich result",
  ],
  alternates: { canonical: pageUrl },
  openGraph: {
    type: "website",
    url: pageUrl,
    title: "Free SERP Snippet & Rich Result Preview Generator",
    description: "Preview a Google search snippet and visualize rich results from your JSON-LD structured data.",
    siteName: "Do It With AI Tools",
    images: [
      {
        url: "https://doitwithai.tools/ogimage.png",
        width: 1200,
        height: 630,
        alt: "Do It With AI Tools SERP & Rich Result Preview Generator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free SERP Snippet & Rich Result Preview Generator",
    description: "Preview a search snippet and visualize FAQ, Review, Product, and other rich results from JSON-LD.",
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
    question: "What can I preview?",
    answer:
      "Preview your title, URL, and description, or inspect the structured data you provide. Import a public page to start with its existing metadata. Previews are illustrative, and actual search appearances can differ.",
  },
  {
    question: "Why doesn't my rich result show here even though my JSON-LD is valid?",
    answer:
      "This tool recognizes FAQPage, HowTo, Review, AggregateRating, BreadcrumbList, Article, Product, Recipe, and Event. If your markup uses a different type, or the recognized fields are empty, nothing renders — that doesn't necessarily mean the markup itself is invalid.",
  },
  {
    question: "If it shows a preview here, will Google definitely display the rich result?",
    answer:
      "No. This is an illustrative preview of what your markup describes, not a guarantee. Google applies its own content-quality and policy checks per rich result type, and the final authority is Google's own Rich Results Test and Search Console.",
  },
  {
    question: "Can I use the output from the Schema Markup Generator here?",
    answer:
      "Yes — paste the JSON-LD it generates directly into the Rich Result tab to see how it would render before you publish it.",
  },
];

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": `${pageUrl}#application`,
      name: "Do It With AI Tools SERP & Rich Result Preview Generator",
      url: pageUrl,
      applicationCategory: "SEOApplication",
      operatingSystem: "Any",
      browserRequirements: "Requires JavaScript",
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      description: metadata.description,
      featureList: [
        "Google SERP snippet preview",
        "Rich result preview for FAQ, HowTo, Review, Product, Recipe, Event, Breadcrumb, Article",
        "Import title, description, and JSON-LD from a live URL",
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
        { "@type": "ListItem", position: 3, name: "SERP & Rich Result Preview Generator", item: pageUrl },
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
      name: "How to use the SERP & Rich Result Preview Generator",
      step: [
        { "@type": "HowToStep", name: "Import from a live URL, or start from scratch", text: "Paste a page's URL to import its title, description, and JSON-LD, or fill the fields in manually." },
        { "@type": "HowToStep", name: "Check the SERP snippet tab", text: "Review the title, URL breadcrumb, and description as a mock search result." },
        { "@type": "HowToStep", name: "Paste JSON-LD into the Rich Result tab", text: "Paste a JSON-LD block to see which rich result types it would render." },
        { "@type": "HowToStep", name: "Compare against what's actually on the page", text: "Confirm marked-up content matches what is genuinely visible on the live page." },
        { "@type": "HowToStep", name: "Validate with Google's own tools before relying on it", text: "Run the published URL through Google Search Console's Rich Results Test for the final word on eligibility." },
      ],
    },
  ],
};

export default function SerpPreviewGeneratorPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
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
            <span className="text-blue-200">SERP & Rich Result Preview</span>
          </nav>

          <div className="mx-auto max-w-5xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.16em] text-blue-100 backdrop-blur">
              <Sparkles className="h-4 w-4 text-cyan-300" /> Technical SEO
            </div>
            <h1 className="mt-7 text-4xl font-black leading-[1.06] tracking-[-0.045em] sm:text-6xl lg:text-7xl">
              SERP Snippet & Rich Result
              <span className={`block ${toolHeroHeading}`}>
                Preview Before You Publish
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
              See how a page would look as a Google search result, then paste its JSON-LD to
              visualize FAQ, HowTo, Review, Product, Recipe, Event, and Breadcrumb rich results
              before anything goes live.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3 text-xs font-bold text-slate-300">
              {[
                [LayoutList, "9 rich result types"],
                [ShieldCheck, "Preview before publishing"],
              ].map(([Icon, label]) => {
                const FeatureIcon = Icon as typeof LayoutList;
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
              href="#serp-rich-result-preview"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-extrabold text-slate-950 shadow-xl transition hover:-translate-y-0.5 hover:bg-blue-50"
            >
              Preview your snippet <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          <div className="mt-14">
            <SerpPreviewClient />
          </div>
        </div>
      </div>

      <SerpPreviewTutorial />
      <SerpPreviewEducation />

      <section className="border-t border-slate-200 bg-white py-20 dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-xs font-extrabold uppercase tracking-[0.17em] text-[#5271ff]">
              Common questions
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl">
              SERP & rich result preview FAQ
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
                <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
      <ToolResources slug="serp-rich-result-preview-generator" />
    </>
  );
}
