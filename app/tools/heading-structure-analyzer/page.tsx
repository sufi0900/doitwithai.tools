import PortableToolHeroBar from "@/features/portable-tool-kit/PortableToolHeroBar";
import { ToolHeroBackground, toolHeroHeading, toolHeroSurface } from "@/features/tool-ui/ToolHero";
import ToolResources from "@/features/tool-catalog/ToolResources";
import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ListTree,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import HeadingAnalyzerClient from "@/features/heading-analyzer/HeadingAnalyzerClient";
import HeadingAnalyzerTutorial from "@/features/heading-analyzer/HeadingAnalyzerTutorial";
import HeadingAnalyzerEducation from "@/features/heading-analyzer/HeadingAnalyzerEducation";

const pageUrl = "https://doitwithai.tools/tools/heading-structure-analyzer";

export const metadata: Metadata = {
  title: "Free Heading Structure Analyzer: Check H1–H6 Hierarchy",
  description:
    "Check a webpage URL for H1 to H6 hierarchy, skipped levels, duplicate headings, and target phrase placement. Explore a visual outline with practical fixes.",
  keywords: [
    "heading structure checker",
    "h1 h2 h3 checker",
    "heading hierarchy analyzer",
    "seo heading checker",
    "html outline checker",
    "heading tags audit",
  ],
  alternates: { canonical: pageUrl },
  openGraph: {
    type: "website",
    url: pageUrl,
    title: "Free Heading Structure Analyzer: Check H1–H6 Hierarchy",
    description: "See your page's heading outline and fix hierarchy problems before they cost clarity.",
    siteName: "Do It With AI Tools",
    images: [
      {
        url: "https://doitwithai.tools/ogimage.png",
        width: 1200,
        height: 630,
        alt: "Do It With AI Tools Heading Structure Analyzer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Heading Structure Analyzer: Check H1–H6 Hierarchy",
    description: "Check heading hierarchy from a live URL, HTML, or Markdown.",
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
    question: "Should a page have only one H1?",
    answer:
      "Search engines and browsers can handle more than one H1, so it isn't a penalty. A single, clear H1 is still the simplest way to state a page's topic and keep the outline easy to follow, which is why this tool flags multiple H1s as a warning rather than an error.",
  },
  {
    question: "What is a skipped heading level?",
    answer:
      "It's a jump of more than one level when going deeper, such as an H2 followed directly by an H4. It breaks the outline for people who navigate by headings. Going back up, for example from H4 to H2, is fine.",
  },
  {
    question: "Can I check a live URL?",
    answer:
      "Yes. Enter a public webpage URL to check headings in its returned HTML. If headings appear only after JavaScript runs, open Inspect in your browser. Copy the outer HTML of the main element into Paste content to check those headings too.",
  },
  {
    question: "Is my content uploaded anywhere?",
    answer:
      "URL checks send the entered address to our server to retrieve the public page. Pasted HTML and Markdown are analyzed in your browser. Pasted scripts are never executed.",
  },
  {
    question: "Why does the tool skip some headings?",
    answer:
      "Headings that are hidden (with the hidden attribute, aria-hidden, or inline display:none) are flagged and left out of the other checks. With \"main content only\" on, headings in navigation, footers, and sidebars are left out too.",
  },
  {
    question: "Does the tool score my headings for SEO?",
    answer:
      "The dashboard includes a transparent structure score based on six checks. It is not a Google score or ranking prediction. Keyword placement is separate, and the tool cannot judge search intent or topic completeness.",
  },
];

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": `${pageUrl}#application`,
      name: "Do It With AI Tools Heading Structure Analyzer",
      url: pageUrl,
      applicationCategory: "SEOApplication",
      operatingSystem: "Any",
      browserRequirements: "Requires JavaScript",
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      description: metadata.description,
      featureList: [
        "Extract headings from a public URL, pasted HTML, or Markdown",
        "Detect missing, multiple, and empty H1 and other headings",
        "Flag skipped levels, repeated text, hidden, and generic headings",
        "Target phrase placement by heading level and a transparent structure score",
        "Copy the outline as Markdown or download a CSV report",
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
        { "@type": "ListItem", position: 3, name: "Heading Structure Analyzer", item: pageUrl },
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
      name: "How to check your heading structure",
      step: [
        { "@type": "HowToStep", name: "Enter your webpage URL", text: "Enter a public webpage URL, or use Paste content for HTML or Markdown." },
        { "@type": "HowToStep", name: "Choose what to analyze", text: "Analyze main content only, or audit the whole page." },
        { "@type": "HowToStep", name: "Read the outline", text: "Review every heading in order with its level and count." },
        { "@type": "HowToStep", name: "Add a target phrase", text: "Optionally check where your main phrase appears in the headings." },
        { "@type": "HowToStep", name: "Fix errors, then warnings", text: "Resolve missing or empty headings first, then skipped levels and duplicates." },
        { "@type": "HowToStep", name: "Export and re-check", text: "Copy the outline or download the CSV, then re-check after editing." },
      ],
    },
  ],
};

export default function HeadingStructureAnalyzerPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
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
            <span aria-current="page">Heading Structure Analyzer</span>
          </nav>

          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.85fr)]">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#b4c3ff]">
                On-Page SEO · H1–H6 Document Outline & Hierarchy
              </p>
              <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                Heading Structure Analyzer 
                <span className={toolHeroHeading}>
                  & H1–H6 Hierarchy Checker
                </span>
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
                Inspect any live webpage URL, raw HTML, or Markdown draft to audit H1–H6 nesting, catch skipped heading levels or duplicates, and verify target phrase placement.
              </p>
              <div className="mt-7 flex flex-wrap gap-3 text-xs font-semibold text-slate-200">
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  Live URL, HTML & Markdown
                </span>
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  Skipped-level & H1 checks
                </span>
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  Visual outline & CSV export
                </span>
              </div>
              <PortableToolHeroBar />
            </div>

            <div className="rounded-2xl border border-[#9aabff]/30 bg-[#101b30]/90 p-6 shadow-xl">
              <p className="text-xs font-bold uppercase tracking-wider text-[#b4c3ff]">
                6 Heading Checks Performed
              </p>
              <ul className="mt-4 space-y-2.5 text-xs text-slate-300">
                <li>
                  <strong className="text-emerald-300">H1 Clarity:</strong> Detects missing, empty, or multiple H1 tags across the page.
                </li>
                <li>
                  <strong className="text-indigo-300">Level Nesting:</strong> Flags skipped hierarchy jumps such as H2 directly to H4.
                </li>
                <li>
                  <strong className="text-sky-300">Duplicate Copy:</strong> Spots repeated or generic headings that weaken scanability.
                </li>
                <li>
                  <strong className="text-amber-300">Keyword Coverage:</strong> Highlights where your target phrase appears across H1–H3s.
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8">
            <HeadingAnalyzerClient />
          </div>
        </div>
      </div>

      <HeadingAnalyzerTutorial />
      <HeadingAnalyzerEducation />

      <section className="border-t border-slate-200 bg-white py-20 dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-xs font-extrabold uppercase tracking-[0.17em] text-[#5271ff]">
              Common questions
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl">
              Heading structure analyzer FAQ
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
      <ToolResources slug="heading-structure-analyzer" />
    </>
  );
}
