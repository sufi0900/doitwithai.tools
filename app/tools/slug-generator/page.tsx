import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BrainCircuit,
  Link2,
  Scissors,
  Search,
  Sparkles,
} from "lucide-react";
import SlugGeneratorClient from "@/features/slug-generator/components/SlugGeneratorClient";
import SlugToolEducation from "@/features/slug-generator/components/SlugToolEducation";

const pageUrl = "https://doitwithai.tools/tools/slug-generator";
const ogUrl = `https://doitwithai.tools/api/og?${new URLSearchParams({
  title: "AI SEO Slug Generator That Understands Your Page",
  category: "Free AI SEO Tool",
  ctaText: "Generate a Smarter Slug",
  features: "Context Analysis,Short URLs,Quality Checks",
}).toString()}`;

export const metadata: Metadata = {
  title: "AI SEO Slug Generator for Short, Context-Aware URLs",
  description:
    "Describe your page and generate short SEO-friendly URL slugs based on topic, keyword, intent, and permanence—not mechanical text conversion.",
  keywords: [
    "SEO slug generator",
    "URL slug generator",
    "AI slug generator",
    "SEO friendly URL generator",
    "short URL slug generator",
    "permalink generator",
  ],
  authors: [{ name: "Sufian Mustafa", url: "https://sufianmustafa.com" }],
  creator: "Sufian Mustafa",
  publisher: "Do It With AI Tools",
  alternates: { canonical: pageUrl },
  openGraph: {
    type: "website",
    url: pageUrl,
    siteName: "Do It With AI Tools",
    title: "AI SEO Slug Generator: Understand First, Shorten Second",
    description:
      "Turn a page brief into concise, keyword-aware, intent-aligned URL slug recommendations with visible reasoning and quality checks.",
    images: [
      {
        url: ogUrl,
        width: 1200,
        height: 630,
        alt: "AI SEO Slug Generator by Do It With AI Tools",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI SEO Slug Generator for Context-Aware URLs",
    description:
      "Generate short URL slugs from page meaning—not by inserting hyphens into your sentence.",
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
    question: "How is this different from a normal slug generator?",
    answer:
      "A normal slugifier reformats the text you enter. This tool treats your input as a page brief, identifies the durable topic and intent, compresses unnecessary detail, and creates several new slug options with explanations and visible checks.",
  },
  {
    question: "Do I need to provide a primary keyword?",
    answer:
      "No. The page context is the only required field. Add a primary keyword when you have completed keyword research and want its essential terms preserved and evaluated explicitly.",
  },
  {
    question: "Should every slug contain three to five words?",
    answer:
      "Three to five meaningful words is this tool's practical working target, not a Google rule. A two-word slug can be stronger when it remains unmistakably clear, while some specialized pages may need more detail.",
  },
  {
    question: "Why does the generator use hyphens instead of underscores?",
    answer:
      "Google recommends hyphens rather than underscores to separate words in URLs because they make concepts easier for users and search engines to identify.",
  },
  {
    question: "Can I change the slug of an existing published page?",
    answer:
      "Only with a clear reason and migration plan. Use a permanent redirect from the old URL, update internal links, canonicals, and sitemaps, and monitor the page after the change.",
  },
  {
    question: "Can an SEO-friendly slug guarantee rankings or AI citations?",
    answer:
      "No. A clean slug is a clarity and organization signal, not a guarantee. Rankings and AI visibility depend on the page, site, query, technical setup, authority, and many other factors.",
  },
];

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": `${pageUrl}#application`,
      name: "Do It With AI Tools SEO Slug Generator",
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
          name: "SEO Slug Generator",
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

export default function SlugUrlGeneratorPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="relative overflow-hidden bg-slate-950 pb-20 pt-10 text-white sm:pt-16 lg:pb-28">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-36 top-0 h-96 w-96 rounded-full bg-[#5271ff]/30 blur-3xl" />
          <div className="absolute -right-28 top-40 h-80 w-80 rounded-full bg-cyan-400/15 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.08)_1px,transparent_0)] bg-[size:28px_28px] [mask-image:linear-gradient(to_bottom,white,transparent_82%)]" />
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
            <span className="text-blue-200">SEO Slug Generator</span>
          </nav>

          <div className="mx-auto max-w-5xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.16em] text-blue-100 backdrop-blur">
              <Sparkles className="h-4 w-4 text-cyan-300" /> Context-aware AI
              SEO tool
            </div>
            <h1 className="mt-7 text-4xl font-black leading-[1.08] tracking-[-0.04em] sm:text-6xl lg:text-7xl">
              AI SEO Slug Generator That
              <span className="block bg-gradient-to-r from-[#7f9aff] via-cyan-300 to-violet-300 bg-clip-text text-transparent">
                Understands Before It Shortens
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
              Describe your page in plain English. The tool identifies the
              durable topic and search intent, removes headline clutter, and
              recommends a concise URL slug instead of copying your sentence
              word for word.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3 text-xs font-bold text-slate-300">
              {[
                [BrainCircuit, "Context analysis"],
                [Scissors, "Meaning-aware compression"],
                [Search, "SEO quality checks"],
              ].map(([Icon, label]) => {
                const FeatureIcon = Icon as typeof Search;
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
              href="#slug-url-generator"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-extrabold text-slate-950 shadow-xl transition hover:-translate-y-0.5 hover:bg-blue-50"
            >
              Generate a smart slug <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          <div className="mt-14">
            <SlugGeneratorClient />
          </div>
        </div>
      </div>

      <SlugToolEducation />

      <section
        className="mx-auto max-w-5xl px-4 pb-24 sm:px-6 lg:px-8"
        aria-labelledby="slug-generator-faqs"
      >
        <div className="text-center">
          <p className="text-xs font-extrabold uppercase tracking-[0.17em] text-[#5271ff]">
            Questions before you lock the URL
          </p>
          <h2
            id="slug-generator-faqs"
            className="mt-3 text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl"
          >
            SEO slug generator FAQs
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
