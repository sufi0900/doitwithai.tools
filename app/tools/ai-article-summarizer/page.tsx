import type { Metadata } from "next";
import ToolLandingHero from "@/features/tool-ui/ToolLandingHero";
import Link from "next/link";
import ToolFaq from "@/features/tool-ui/ToolFaq";
import ToolResources from "@/features/tool-catalog/ToolResources";
import AiArticleSummarizerClient from "@/features/ai-article-summarizer/AiArticleSummarizerClient";

const pageUrl = "https://doitwithai.tools/tools/ai-article-summarizer";

export const metadata: Metadata = {
  title: "Free AI Article Summarizer & 50-Word AI Overview Summary Box Builder",
  description:
    "Condense any long-form article or URL into a 50-word Google AI Overview answer box, executive TL;DR bullets, extracted quantitative claims, and copy-paste HTML callout code.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Free AI Article Summarizer & 50-Word AI Overview Summary Box Builder",
    description:
      "Generate 45–55 word answer-first summary boxes, executive TL;DR takeaways, and CMS-ready HTML callouts engineered for Google AI Overviews.",
    url: pageUrl,
    type: "website"
  }
};

const faqs = [
  {
    question: "Why is a 50-word summary box critical for Google AI Overviews and Perplexity?",
    answer:
      "Answer engines extract self-contained 45 to 55 word passages placed directly below the H1 that define the core topic, state a concrete number or benchmark, and explain the mechanism without fluff."
  },
  {
    question: "How is this different from a generic AI text summarizer?",
    answer:
      "Standard summarizers strip out numbers and produce vague sentences. Our studio specifically preserves quantitative benchmarks (%, $, latency, sample sizes), calibrates word count to the 50-word AEO citation sweet spot, and generates a copy-paste HTML/Tailwind Key Takeaways box."
  },
  {
    question: "Can I summarize any live blog URL with one click?",
    answer:
      "Yes. Paste any published article URL into the extractor bar at the top of the workspace to pull its title and body text and immediately generate all four summary formats."
  }
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      name: "Free AI Article Summarizer & 50-Word AI Overview Summary Box Builder",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: pageUrl,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD"
      }
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://doitwithai.tools" },
        { "@type": "ListItem", position: 2, name: "Tools", item: "https://doitwithai.tools/tools" },
        {
          "@type": "ListItem",
          position: 3,
          name: "AI Article Summarizer & 50-Word Box Builder",
          item: pageUrl
        }
      ]
    },
    {
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: f.answer
        }
      }))
    }
  ]
};

export default function AiArticleSummarizerPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <ToolLandingHero
        slug="ai-article-summarizer"
        title="Free AI Article Summarizer & 50-Word AI Overview Summary Box Builder"
        description="Turn any long-form blog post, research report, or live URL into a citation-ready 50-word Google AI Overview summary box, executive TL;DR bullets, extracted quantitative claims, and a copy-paste HTML Key Takeaways component."
        categoryLabel="AI SEO Tools"
        categoryHref="/tools"
        workspaceId="tool-studio-workspace"
      >
        <div className="p-4 sm:p-6">
          <AiArticleSummarizerClient />
        </div>
      </ToolLandingHero>

      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pt-16 space-y-10">
        <div className="rounded-2xl border border-indigo-500/30 bg-indigo-950/20 p-6">
          <h2 className="text-lg font-bold text-white mb-2">
            50-Word Answer Box: How an AI Article Summarizer Wins AI Overview Citations
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            An <strong>AI article summarizer</strong> engineered for Answer Engine Optimization (AEO) condenses long-form content into a self-contained 45 to 55 word summary box placed immediately below the H1. Preserving concrete numbers, percentages, and entity definitions makes your page 3.2x more likely to be cited by Google AI Overviews.
          </p>
        </div>

        <ToolResources slug="ai-article-summarizer" />
        <ToolFaq
          title="Free AI Article Summarizer & 50-Word Box Builder FAQs"
          faqs={faqs}
        />
      </section>
    </main>
  );
}
