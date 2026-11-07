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
  FileCode2,
  Globe,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import LlmsTxtClient from "@/features/llms-txt-generator/LlmsTxtClient";
import LlmsTxtEducation from "@/features/llms-txt-generator/LlmsTxtEducation";

const pageUrl = "https://doitwithai.tools/tools/llms-txt-generator";

export const metadata: Metadata = {
  title: "Free llms.txt Generator | AI Search & GEO Tool",
  description:
    "Build a spec-compliant llms.txt file for your site: add sections and page links by hand or import them from your sitemap.xml, then review, copy, or download.",
  keywords: [
    "llms.txt generator",
    "llms.txt",
    "generative engine optimization",
    "GEO tool",
    "AI search visibility",
    "AI crawler file",
  ],
  alternates: { canonical: pageUrl },
  openGraph: {
    type: "website",
    url: pageUrl,
    title: "Free llms.txt Generator | AI Search & GEO Tool",
    description:
      "Build a reviewable llms.txt file from your own pages, by hand or imported from a sitemap.xml.",
    siteName: "Do It With AI Tools",
    images: [
      {
        url: "https://doitwithai.tools/ogimage.png",
        width: 1200,
        height: 630,
        alt: "Do It With AI Tools llms.txt Generator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free llms.txt Generator | AI Search & GEO Tool",
    description:
      "Build, review, copy, and download a spec-compliant llms.txt file.",
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
    question: "Can I edit the file before downloading it?",
    answer:
      "Use the supplied controls to prepare your file, review its contents, and download it when ready.",
  },
  {
    question: "Where do I put the downloaded file?",
    answer:
      "Save it as llms.txt at your site's root, for example https://yoursite.com/llms.txt, the same way robots.txt and sitemap.xml live at the root.",
  },
  {
    question: "Does llms.txt guarantee AI citations or traffic?",
    answer:
      "No. llms.txt is a proposed convention, not a confirmed ranking or citation signal for any AI search engine. Treat it as a cheap, reviewable addition alongside real content quality, not a substitute for it.",
  },
  {
    question: "Why does the sitemap import only accept one sitemap file?",
    answer:
      "To keep the fetch fast, safe, and predictable, the importer reads a single urlset sitemap. If you paste a sitemap index (a list of other sitemaps), it will ask you to paste one of the child sitemap URLs instead.",
  },
  {
    question: "Should every page on my site be listed?",
    answer:
      "No. Keep llms.txt to your highest-value, most representative pages. A long, unfiltered list is harder for a model to use well than a short, curated one.",
  },
];

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": `${pageUrl}#application`,
      name: "Do It With AI Tools llms.txt Generator",
      url: pageUrl,
      applicationCategory: "SEOApplication",
      operatingSystem: "Any",
      browserRequirements: "Requires JavaScript",
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      description: metadata.description,
      featureList: [
        "Spec-compliant llms.txt output",
        "Optional sitemap.xml import",
        "Reviewable file generation",
        "Validation checklist",
        "Copy and download",
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
          name: "llms.txt Generator",
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

export default function LlmsTxtGeneratorPage() {
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
            <span aria-current="page">llms.txt Generator</span>
          </nav>

          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.85fr)]">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#b4c3ff]">
                GEO · AI Documentation Index & Markdown Builder
              </p>
              <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                llms.txt Generator for 
                <span className={toolHeroHeading}>
                  AI Crawler-Ready Websites
                </span>
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
                Curate your highest-value documentation, guides, and product URLs—or import them straight from your sitemap.xml—to build a clean, spec-compliant /llms.txt file.
              </p>
              <div className="mt-7 flex flex-wrap gap-3 text-xs font-semibold text-slate-200">
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  1-click sitemap.xml import
                </span>
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  Spec-compliant H1/H2 Markdown
                </span>
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  Copy or download llms.txt
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-[#9aabff]/30 bg-[#101b30]/90 p-6 shadow-xl">
              <p className="text-xs font-bold uppercase tracking-wider text-[#b4c3ff]">
                4 Elements of a Valid llms.txt
              </p>
              <ul className="mt-4 space-y-2.5 text-xs text-slate-300">
                <li>
                  <strong className="text-emerald-300">H1 Project Title:</strong> Starts with a single H1 naming your site or documentation hub.
                </li>
                <li>
                  <strong className="text-indigo-300">Blockquote Summary:</strong> Concise &gt; blockquote describing your product and core audience.
                </li>
                <li>
                  <strong className="text-sky-300">Grouped H2 Sections:</strong> Organizes canonical URLs with 1-line descriptions by topic.
                </li>
                <li>
                  <strong className="text-amber-300">Spec Validation:</strong> Verifies Markdown syntax, HTTPS links, and optional sections.
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8">
            <LlmsTxtClient />
          </div>
        </div>
      </div>

      <LlmsTxtEducation />

      <section className="border-t border-slate-200 bg-white py-20 dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-xs font-extrabold uppercase tracking-[0.17em] text-[#5271ff]">
              Common questions
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl">
              llms.txt generator FAQ
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
      <ToolResources slug="llms-txt-generator" />
    </>
  );
}
