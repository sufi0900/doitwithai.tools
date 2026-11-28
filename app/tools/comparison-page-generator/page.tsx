import type { Metadata } from "next";
import ToolLandingHero from "@/features/tool-ui/ToolLandingHero";
import Link from "next/link";
import {
  Code2,
  Scale,
  Trophy,
} from "lucide-react";
import ComparisonPageGeneratorClient from "@/features/comparison-page-generator/ComparisonPageGeneratorClient";
import ToolFaq from "@/features/tool-ui/ToolFaq";
import ToolResources from "@/features/tool-catalog/ToolResources";

const pageUrl = "https://doitwithai.tools/tools/comparison-page-generator";
const title =
  "Free 'X vs. Y' Comparison Page & Feature Matrix Builder | SEO Tool";
const description =
  "Build high-converting 'X vs. Y' comparison articles with a 50-word Featured Snippet verdict, side-by-side HTML/Markdown feature matrix, buyer bullets, and ItemList JSON-LD.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: pageUrl },
  openGraph: {
    title,
    description,
    url: pageUrl,
    type: "website",
    images: ["https://doitwithai.tools/ogimage.png"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["https://doitwithai.tools/ogimage.png"],
  },
};

const faqs = [
  {
    question: "Why do 'X vs. Y' comparison pages have such high conversion rates?",
    answer:
      "Searchers typing '[Brand A] vs [Brand B]' or 'Best [Competitor] alternatives' have already completed top-of-funnel awareness research and are actively deciding which solution to buy or install today.",
  },
  {
    question: "How do I make my comparison page rank in AI Overviews and ChatGPT?",
    answer:
      "AI answer engines strongly favor balanced, criteria-based comparisons over one-sided sales pitches. Acknowledge the specific use cases where Competitor B is a reasonable fit while clearly proving where your solution excels via a structured HTML <table>.",
  },
  {
    question: "Why does the tool generate both HTML <table> and Markdown table formats?",
    answer:
      "Google's table Featured Snippet extractor parses semantic HTML <table> rows directly, while Markdown tables drop cleanly into Next.js MDX, Notion, or GitHub docs.",
  },
  {
    question: "What structured data is included for comparison pages?",
    answer:
      "The Schema tab generates a combined ItemList and FAQPage JSON-LD graph declaring both compared entities and your buyer decision FAQs.",
  },
];

const section = "mx-auto max-w-6xl px-4 py-12 sm:px-6";
const prose = "mt-4 text-base leading-8 text-slate-600 dark:text-slate-300";

export default function ComparisonPageGeneratorPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "'X vs. Y' Comparison Page & Feature Matrix Builder",
        url: pageUrl,
        description,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Any",
        isAccessibleForFree: true,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { name: "Home", item: "https://doitwithai.tools" },
          { name: "Tools", item: "https://doitwithai.tools/tools" },
          { name: "Comparison Page Generator", item: pageUrl },
        ].map((item, i) => ({ "@type": "ListItem", position: i + 1, ...item })),
      },
      {
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: { "@type": "Answer", text: f.answer },
        })),
      },
    ],
  };

  return (
    <div className="bg-white text-slate-900 dark:bg-[#0F1523] dark:text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
        }}
      />

      <ToolLandingHero
        slug="comparison-page-generator"
        title="&ldquo;X vs. Y&rdquo; Comparison Page & Feature Matrix Builder"
        description="Build high-converting, citation-ready comparison pages with a 50-word Featured Snippet verdict box, side-by-side HTML and Markdown feature tables, &ldquo;Choose X if&rdquo; buyer guides, and ItemList JSON-LD schema."
        categoryLabel="Bottom-of-Funnel SEO"
        categoryHref="/tools"
        workspaceId="tool-studio-workspace"
      >
        <div className="p-4 sm:p-6">
          <ComparisonPageGeneratorClient />
        </div>
      </ToolLandingHero>

      <section
        className={`${section} border-t border-slate-200 dark:border-slate-800`}
      >
        <h2 className="text-3xl font-extrabold">
          Capture bottom-of-funnel buyers comparing alternatives
        </h2>
        <p className={prose}>
          Both human buyers and generative AI search engines rely on structured
          comparison tables to decide which product fits a specific budget, team
          size, or technical requirement.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            [
              Trophy,
              "Above-the-Fold Verdict",
              "Answers 'Which is better?' in the first 50 words so readers and AI Overviews get an immediate takeaway.",
            ],
            [
              Scale,
              "Criteria Winner Badges",
              "Evaluates each capability row individually so your comparison reads like an honest benchmark.",
            ],
            [
              Code2,
              "Dual Table + Schema Export",
              "Copy semantic HTML tables, full Markdown articles, or ItemList + FAQPage JSON-LD.",
            ],
          ].map(([Icon, heading, body]) => {
            const I = Icon as typeof Trophy;
            return (
              <div
                key={String(heading)}
                className="rounded-2xl border border-slate-200 p-6 dark:border-slate-700"
              >
                <I aria-hidden className="text-[#5271ff]" size={22} />
                <h3 className="mt-4 text-lg font-bold">{String(heading)}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
                  {String(body)}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <ToolResources slug="comparison-page-generator" />
      <ToolFaq title="Comparison Page & Matrix Builder FAQs" faqs={faqs} />
    </div>
  );
}
