import PortableToolHeroBar from "@/features/portable-tool-kit/PortableToolHeroBar";
import ToolFaq from "@/features/tool-ui/ToolFaq";
import { ToolHeroBackground, toolHeroSurface, toolHeroHeading } from "@/features/tool-ui/ToolHero";
import ToolResources from "@/features/tool-catalog/ToolResources";
import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Gauge,
  Sparkles,
} from "lucide-react";
import CoreWebVitalsClient from "@/features/core-web-vitals/CoreWebVitalsClient";
import CoreWebVitalsTutorial from "@/features/core-web-vitals/CoreWebVitalsTutorial";
import CoreWebVitalsEducation from "@/features/core-web-vitals/CoreWebVitalsEducation";

const pageUrl = "https://doitwithai.tools/tools/core-web-vitals-checker";

export const metadata: Metadata = {
  title: "Free Core Web Vitals Checker | Field & Lab Data",
  description:
    "Check a page's real Core Web Vitals ; LCP, CLS, INP ; and Lighthouse scores for Performance, Accessibility, Best Practices, and SEO, pulled live from Google&apos;s PageSpeed Insights.",
  keywords: [
    "core web vitals checker",
    "pagespeed insights",
    "LCP checker",
    "CLS checker",
    "INP checker",
    "lighthouse score",
    "page speed test",
  ],
  alternates: { canonical: pageUrl },
  openGraph: {
    type: "website",
    url: pageUrl,
    title: "Free Core Web Vitals Checker | Field & Lab Data",
    description: "Live Core Web Vitals and Lighthouse scores pulled directly from Google's PageSpeed Insights.",
    siteName: "Do It With AI Tools",
    images: [
      {
        url: "https://doitwithai.tools/ogimage.png",
        width: 1200,
        height: 630,
        alt: "Do It With AI Tools Core Web Vitals Checker",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Core Web Vitals Checker | Field & Lab Data",
    description: "Live Core Web Vitals and Lighthouse scores from Google&apos;s PageSpeed Insights.",
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
    question: "Why does it say no field data is available for my page?",
    answer:
      "Field data comes from the Chrome User Experience Report, which only publishes a URL once Google has collected enough real visitor data for it. New or low-traffic pages often show lab data only ; that's expected, not an error.",
  },
  {
    question: "Why are my mobile and desktop scores so different?",
    answer:
      "Mobile and desktop runs use different test conditions and scoring. One check prepares both reports. Switch devices to view the matching result. Some pages may produce similar scores, so review the measurements and findings as well.",
  },
  {
    question: "Does a perfect score guarantee good rankings?",
    answer:
      "No. Core Web Vitals is one of many ranking factors, and a good score removes a potential disadvantage rather than guaranteeing a boost. Treat this as a diagnostic tool, not a ranking predictor.",
  },
];

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": `${pageUrl}#application`,
      name: "Do It With AI Tools Core Web Vitals Checker",
      url: pageUrl,
      applicationCategory: "SEOApplication",
      operatingSystem: "Any",
      browserRequirements: "Requires JavaScript",
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      description: metadata.description,
      featureList: [
        "Live check via Google's PageSpeed Insights",
        "Separate mobile and desktop reports",
        "Prioritized audit findings with suggested fixes",
        "Downloadable report summary",
        "Real-user field data (LCP, CLS, INP) when available",
        "Lab data fallback for new or low-traffic pages",
        "Lighthouse Performance, Accessibility, Best Practices, and SEO scores",
        "Mobile and desktop comparison",
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
        { "@type": "ListItem", position: 3, name: "Core Web Vitals Checker", item: pageUrl },
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
      name: "How to use the Core Web Vitals Checker",
      step: [
        { "@type": "HowToStep", name: "Paste the exact URL you care about", text: "Core Web Vitals are measured per URL, so check the specific page you care about." },
        { "@type": "HowToStep", name: "Prepare both device reports", text: "Start one check to prepare mobile and desktop reports together. Switch devices to compare the results." },
        { "@type": "HowToStep", name: "Read field data before lab data", text: "Prioritize real-user field data over the simulated lab data when both are available." },
        { "@type": "HowToStep", name: "Fix the worst-rated metric first", text: "Address the single lowest-rated metric before fine-tuning metrics that already pass." },
        { "@type": "HowToStep", name: "Re-check after deploying a fix", text: "Lab data updates immediately; field data reflects a rolling window of real visitors and updates more slowly." },
      ],
    },
  ],
};

export default function CoreWebVitalsCheckerPage() {
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
            <span aria-current="page">Core Web Vitals Checker</span>
          </nav>

          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.85fr)]">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#b4c3ff]">
                Technical SEO · Real-User CrUX & PageSpeed Audit
              </p>
              <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                Core Web Vitals Checker 
                <span className={toolHeroHeading}>
                  for Field & Lab Performance
                </span>
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
                Run a live Google PageSpeed Insights check on any webpage to inspect real-user CrUX metrics (LCP, INP, CLS) alongside mobile and desktop Lighthouse diagnostics.
              </p>
              <div className="mt-7 flex flex-wrap gap-3 text-xs font-semibold text-slate-200">
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  Live CrUX field data
                </span>
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  Mobile & desktop lab scores
                </span>
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  Prioritized fix opportunities
                </span>
              </div>
              <PortableToolHeroBar />
            </div>

            <div className="rounded-2xl border border-[#9aabff]/30 bg-[#101b30]/90 p-6 shadow-xl">
              <p className="text-xs font-bold uppercase tracking-wider text-[#b4c3ff]">
                Core Metrics Evaluated
              </p>
              <ul className="mt-4 space-y-2.5 text-xs text-slate-300">
                <li>
                  <strong className="text-emerald-300">LCP (Loading):</strong> Largest Contentful Paint target of 2.5 seconds or faster.
                </li>
                <li>
                  <strong className="text-indigo-300">INP (Interactivity):</strong> Interaction to Next Paint target at or below 200 ms.
                </li>
                <li>
                  <strong className="text-sky-300">CLS (Visual Stability):</strong> Cumulative Layout Shift target of 0.1 or less.
                </li>
                <li>
                  <strong className="text-amber-300">Lighthouse Audit:</strong> Performance, Accessibility, Best Practices, and SEO checks.
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8">
            <CoreWebVitalsClient />
          </div>
        </div>
      </div>

      <CoreWebVitalsTutorial />
      <CoreWebVitalsEducation />

      <ToolFaq title="Core Web Vitals checker FAQ" faqs={faqs} />
      <ToolResources slug="core-web-vitals-checker" />
    </>
  );
}
