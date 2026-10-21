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
            <span className="text-blue-200">Heading Structure Analyzer</span>
          </nav>

          <div className="mx-auto max-w-5xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.16em] text-blue-100 backdrop-blur">
              <Sparkles className="h-4 w-4 text-cyan-300" /> On-page SEO
            </div>
            <h1 className="mt-7 text-4xl font-black leading-[1.06] tracking-[-0.045em] sm:text-6xl lg:text-7xl">
              Heading Structure Analyzer
              <span className={`block ${toolHeroHeading}`}>
                Check Your H1–H6 Hierarchy
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
              Enter a website or article URL to explore its heading hierarchy. Find missing H1s,
              skipped levels, and repeated headings. See practical fixes and target phrase placement
              in one visual dashboard.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3 text-xs font-bold text-slate-300">
              {[
                [ListTree, "URL, HTML, and Markdown"],
                [ShieldCheck, "No login required"],
              ].map(([Icon, label]) => {
                const FeatureIcon = Icon as typeof ListTree;
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
              href="#heading-structure-analyzer"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-extrabold text-slate-950 shadow-xl transition hover:-translate-y-0.5 hover:bg-blue-50"
            >
              Analyze your headings <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          <div className="mt-14">
            <HeadingAnalyzerClient />
          </div>
        </div>
      </div>

      <HeadingAnalyzerTutorial />
      <HeadingAnalyzerEducation />

      <section className="border-t border-slate-200 bg-white py-20 dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
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
