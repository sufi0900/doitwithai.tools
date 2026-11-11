import PortableToolHeroBar from "@/features/portable-tool-kit/PortableToolHeroBar";
import {
  ToolHeroBackground,
  toolHeroHeading,
  toolHeroSurface,
} from "@/features/tool-ui/ToolHero";
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

const pageUrl =
  "https://doitwithai.tools/tools/serp-rich-result-preview-generator";

export const metadata: Metadata = {
  title: "Free SERP Snippet & Rich Result Preview Generator",
  description:
    "Preview titles and descriptions with pixel measurements, mobile and desktop layouts, favicon imports, image exports, and a structured data inspector.",
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
    description:
      "Preview a Google search snippet and visualize rich results from your JSON-LD structured data.",
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
    description:
      "Preview a search snippet and visualize FAQ, Review, Product, and other rich results from JSON-LD.",
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
    question: "Does Google use a fixed 600 pixel title limit?",
    answer:
      "No. Google truncates title links to fit the device. This simulator uses a 600 pixel desktop title preset as a practical estimate. Mobile uses a narrower layout with more lines. Font, query, and search features can change the result.",
  },
  {
    question: "Why can the same number of characters have different widths?",
    answer:
      "Letters have different shapes and widths. A capital W uses more space than a lowercase i. The simulator measures text using browser fonts and checks line wrapping. Character counts remain available as a reference.",
  },
  {
    question: "Can I import a long article?",
    answer:
      "Yes. The importer keeps page metadata and selected structured data without downloading images or videos. Quick import stops after the page head. The full scan checks up to 8 MB and reports when later markup may be missing.",
  },
  {
    question: "Are the heatmap and AI Overview real search data?",
    answer:
      "No. These optional layouts illustrate visual emphasis and space above organic results. They do not retrieve an AI answer, predict clicks, or measure eye movement. Country selection provides preview context rather than local ranking data.",
  },
  {
    question: "Can I save or share my preview?",
    answer:
      "Save a PNG image, copy escaped metadata HTML, or copy a share link. Share links contain the preview content, so send them only when that content can be shared. Image exports use a site initial instead of external favicons.",
  },
  {
    question: "What can I preview?",
    answer:
      "Preview your title, URL, and description, or inspect the structured data you provide. Import a public page to start with its existing metadata. Previews are illustrative, and actual search appearances can differ.",
  },
  {
    question:
      "Why doesn't my rich result show here even though my JSON-LD is valid?",
    answer:
      "This tool recognizes FAQPage, HowTo, Review, AggregateRating, BreadcrumbList, Article, Product, Recipe, and Event. If your markup uses a different type, or the recognized fields are empty, nothing renders. That doesn't necessarily mean the markup itself is invalid.",
  },
  {
    question:
      "If it shows a preview here, will Google definitely display the rich result?",
    answer:
      "No. This is an illustrative preview of what your markup describes, not a guarantee. Google applies its own content-quality and policy checks per rich result type, and the final authority is Google's own Rich Results Test and Search Console.",
  },
  {
    question: "Can I use the output from the Schema Markup Generator here?",
    answer:
      "Yes. Paste the JSON-LD it generates directly into the Structured data editor to see how it would render before you publish it.",
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
          name: "SERP & Rich Result Preview Generator",
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
    {
      "@type": "HowTo",
      name: "How to use the SERP & Rich Result Preview Generator",
      step: [
        {
          "@type": "HowToStep",
          name: "Import from a live URL, or start from scratch",
          text: "Paste a page's URL to import its title, description, and JSON-LD, or fill the fields in manually.",
        },
        {
          "@type": "HowToStep",
          name: "Check the SERP snippet tab",
          text: "Review the title, URL breadcrumb, and description as a mock search result.",
        },
        {
          "@type": "HowToStep",
          name: "Paste JSON-LD into the Structured data editor",
          text: "Paste a JSON-LD block to see which rich result types it would render.",
        },
        {
          "@type": "HowToStep",
          name: "Compare against what's actually on the page",
          text: "Confirm marked-up content matches what is genuinely visible on the live page.",
        },
        {
          "@type": "HowToStep",
          name: "Validate with Google's own tools before relying on it",
          text: "Run the published URL through Google Search Console's Rich Results Test for the final word on eligibility.",
        },
      ],
    },
  ],
};

export default function SerpPreviewGeneratorPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
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
            <span aria-current="page">SERP & Rich Result Preview</span>
          </nav>

          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.85fr)]">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#b4c3ff]">
                On-Page & Technical SEO · Google Snippet & Rich Result Lab
              </p>
              <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                SERP Snippet & Rich Result 
                <span className={toolHeroHeading}>
                  Preview Simulator
                </span>
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
                Simulate how your page appears in desktop and mobile Google search results—and paste or build JSON-LD to preview FAQ, Review, Price, HowTo, and Breadcrumb rich results.
              </p>
              <div className="mt-7 flex flex-wrap gap-3 text-xs font-semibold text-slate-200">
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  Desktop & mobile SERP view
                </span>
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  Live pixel truncation meter
                </span>
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  JSON-LD rich result preview
                </span>
              </div>
              <PortableToolHeroBar />
            </div>

            <div className="rounded-2xl border border-[#9aabff]/30 bg-[#101b30]/90 p-6 shadow-xl">
              <p className="text-xs font-bold uppercase tracking-wider text-[#b4c3ff]">
                4 SERP Elements Simulated Live
              </p>
              <ul className="mt-4 space-y-2.5 text-xs text-slate-300">
                <li>
                  <strong className="text-emerald-300">Title Pixel Width:</strong> Measures exact rendered pixel width against desktop/mobile limits.
                </li>
                <li>
                  <strong className="text-indigo-300">Meta Description:</strong> Previews bolded query matches and snippet line wrapping.
                </li>
                <li>
                  <strong className="text-sky-300">Breadcrumb Path:</strong> Shows domain favicon, site name, and URL breadcrumb trail.
                </li>
                <li>
                  <strong className="text-amber-300">Rich Result Enhancements:</strong> Renders star ratings, price/stock badges, and expandable FAQs.
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8">
            <SerpPreviewClient />
          </div>
        </div>
      </div>

      <SerpPreviewTutorial />
      <SerpPreviewEducation />

      <section className="border-t border-slate-200 bg-white py-20 dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
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
                <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>
      <ToolResources slug="serp-rich-result-preview-generator" />
    </>
  );
}
