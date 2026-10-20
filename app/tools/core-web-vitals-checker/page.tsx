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
      "Mobile testing simulates a mid-range phone on a throttled connection, which is intentionally harsher than desktop testing. A page that scores well on desktop but poorly on mobile usually has real mobile-specific issues worth fixing, since mobile is where most real traffic and ranking evaluation happens.",
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
        { "@type": "HowToStep", name: "Check mobile first", text: "Run the mobile check first, since it reflects most real traffic and ranking evaluation." },
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
            <span className="text-blue-200">Core Web Vitals Checker</span>
          </nav>

          <div className="mx-auto max-w-5xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.16em] text-blue-100 backdrop-blur">
              <Sparkles className="h-4 w-4 text-cyan-300" /> Technical SEO
            </div>
            <h1 className="mt-7 text-4xl font-black leading-[1.06] tracking-[-0.045em] sm:text-6xl lg:text-7xl">
              Core Web Vitals Checker with
              <span className={`block ${toolHeroHeading}`}>
                Real Field Data, Not Just a Lab Score
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
              A live check against Google&apos;s PageSpeed Insights ; LCP, CLS, and INP from real
              visitors when available, plus Lighthouse Performance, Accessibility, Best Practices,
              and SEO scores.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3 text-xs font-bold text-slate-300">
              {[[Gauge, "Live Google PageSpeed data"]].map(([Icon, label]) => {
                const FeatureIcon = Icon as typeof Gauge;
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
              href="#core-web-vitals-checker"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-extrabold text-slate-950 shadow-xl transition hover:-translate-y-0.5 hover:bg-blue-50"
            >
              Check your page <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          <div className="mt-14">
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
