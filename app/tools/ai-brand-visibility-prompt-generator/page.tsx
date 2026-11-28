import type { Metadata } from "next";
import ToolLandingHero from "@/features/tool-ui/ToolLandingHero";
import Link from "next/link";
import {
  CheckCircle2,
  Globe,
  Sparkles,
} from "lucide-react";
import AiBrandVisibilityPromptGeneratorClient from "@/features/ai-brand-visibility-prompt-generator/AiBrandVisibilityPromptGeneratorClient";
import ToolFaq from "@/features/tool-ui/ToolFaq";
import ToolResources from "@/features/tool-catalog/ToolResources";

const pageUrl =
  "https://doitwithai.tools/tools/ai-brand-visibility-prompt-generator";
const title =
  "Free Brand AI Search Visibility & GEO Prompt Test Matrix | AI SEO";
const description =
  "Generate a 12-prompt Generative Engine Optimization (GEO) test matrix across 4 buyer stages to audit your brand's Share of Voice in ChatGPT, Perplexity, Gemini, and AI Overviews.";

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
    question: "What is Generative Engine Optimization (GEO) Share of Voice?",
    answer:
      "GEO Share of Voice measures how frequently AI answer engines (ChatGPT, Perplexity, Google AI Overviews, and Gemini) recommend and cite your brand when buyers ask category discovery, best-for use-case, or competitor comparison questions.",
  },
  {
    question: "Why do AI search engines recommend some brands while ignoring others?",
    answer:
      "LLMs synthesize answers from three primary layers: (1) concise ontological definitions and structured HTML tables on your website, (2) machine-readable JSON-LD schema and /llms.txt files, and (3) third-party corroboration across comparison articles, directories, and community threads.",
  },
  {
    question: "How often should we run this 12-prompt GEO audit?",
    answer:
      "Run your core 12 buyer-intent prompts monthly after publishing new comparison pages, updating your /llms.txt file, or earning new digital PR mentions, and export the CSV to track Share of Voice improvements over time.",
  },
  {
    question: "What should I do if my brand is marked 'Missing' on Competitor Comparison prompts?",
    answer:
      "Use our 'X vs. Y' Comparison Page & Feature Matrix Builder to publish a dedicated, criteria-based comparison page on your domain so retrieval-augmented generation (RAG) crawlers have structured facts to cite.",
  },
];

const section = "mx-auto max-w-6xl px-4 py-12 sm:px-6";
const prose = "mt-4 text-base leading-8 text-slate-600 dark:text-slate-300";

export default function AiBrandVisibilityPromptGeneratorPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "Brand AI Search Visibility & GEO Prompt Test Matrix",
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
          { name: "AI Brand Visibility Prompt Matrix", item: pageUrl },
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
        slug="ai-brand-visibility-prompt-generator"
        title="Brand AI Search Visibility & GEO Prompt Matrix"
        description="Generate a 4-stage buyer prompt test matrix for ChatGPT, Perplexity, Google AI Overviews, and Gemini, score your AI Share of Voice, and follow a step-by-step action plan to close citation gaps."
        categoryLabel="AI Search & GEO"
        categoryHref="/tools"
        workspaceId="tool-studio-workspace"
      >
        <div className="p-4 sm:p-6">
          <AiBrandVisibilityPromptGeneratorClient />
        </div>
      </ToolLandingHero>

      <section
        className={`${section} border-t border-slate-200 dark:border-slate-800`}
      >
        <h2 className="text-3xl font-extrabold">
          Measure and grow your brand&apos;s presence inside AI answers
        </h2>
        <p className={prose}>
          Traditional keyword rank trackers only show 10 blue links. Modern
          buyers ask multi-sentence questions in ChatGPT, Perplexity, and Google
          AI Overviews—making prompt-level citation tracking essential.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            [
              Globe,
              "Multi-Engine Coverage",
              "Tailors prompts for ChatGPT/SearchGPT, Perplexity, Google AI Overviews, and Gemini.",
            ],
            [
              CheckCircle2,
              "Share of Voice Calculator",
              "Score each prompt as Cited #1, Mentioned, or Missing to compute your 0–100% AI Share of Voice.",
            ],
            [
              Sparkles,
              "Connected Fix Studios",
              "Links every citation gap directly to our llms.txt Generator, Comparison Builder, and sameAs Finder.",
            ],
          ].map(([Icon, heading, body]) => {
            const I = Icon as typeof Globe;
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

      <ToolResources slug="ai-brand-visibility-prompt-generator" />
      <ToolFaq
        title="Brand AI Search Visibility & GEO Matrix FAQs"
        faqs={faqs}
      />
    </div>
  );
}
