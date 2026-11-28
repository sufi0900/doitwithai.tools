import ToolResources from "@/features/tool-catalog/ToolResources";
import ToolLandingHero from "@/features/tool-ui/ToolLandingHero";
import type { Metadata } from "next";
import Link from "next/link";
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
      applicationCategory: "BusinessApplication",
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

      <ToolLandingHero
        slug="slug-generator"
        title="AI SEO Slug Generator for Clean, Durable URLs"
        description="Transform long article titles or page briefs into concise, hyphenated, lowercase URL slugs stripped of stop-words and date clutter—with redirect safety checks."
        categoryLabel="On-Page SEO"
        categoryHref="/tools"
        workspaceId="tool-studio-workspace"
      >
        <div className="p-4 sm:p-6">
          <SlugGeneratorClient />
        </div>
      </ToolLandingHero>

      <SlugToolEducation />

      <section
        className="mx-auto max-w-6xl px-4 pb-24 sm:px-6 lg:px-8"
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
      <ToolResources slug="slug-generator" />
    </>
  );
}
