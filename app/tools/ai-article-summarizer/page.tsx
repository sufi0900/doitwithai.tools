import type { Metadata } from "next";
import Link from "next/link";
import PortableToolHeroBar from "@/features/portable-tool-kit/PortableToolHeroBar";
import ToolFaq from "@/features/tool-ui/ToolFaq";
import ToolResources from "@/features/tool-catalog/ToolResources";
import { ToolHeroBackground, toolHeroHeading, toolHeroSurface } from "@/features/tool-ui/ToolHero";
import AiArticleSummarizerClient from "@/features/ai-article-summarizer/AiArticleSummarizerClient";

const pageUrl = "https://doitwithai.tools/tools/ai-article-summarizer";

export const metadata: Metadata = {
  title: "Free AI Article Summarizer & 50-Word AI Overview Summary Box Builder",
  description:
    "Condense any long-form article or URL into a 50-word Google AI Overview answer box, executive TL;DR bullets, extracted quantitative claims, and copy-paste HTML callout code.",
  alternates: {
    canonical: pageUrl
  },
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

      <section className={`${toolHeroSurface} relative overflow-hidden border-b border-slate-800/80 py-8`}>
        <ToolHeroBackground />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="mb-3 flex items-center gap-2 text-xs text-slate-400">
            <Link href="/" className="hover:text-white">Home</Link>
            <span>/</span>
            <Link href="/tools" className="hover:text-white">Tools</Link>
            <span>/</span>
            <span className="text-indigo-400">AI Article Summarizer & 50-Word Box Builder</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-7 space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300">
                <span>⚡ 45–55 Word AEO Answer Box · TL;DR Bullets · HTML Callout Snippet</span>
              </div>
              <h1 className={`${toolHeroHeading} text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white`}>
                Free AI Article Summarizer &{" "}
                <span className="bg-gradient-to-r from-indigo-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">
                  50-Word AI Overview Summary Box Builder
                </span>
              </h1>
              <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
                Turn any long-form blog post, research report, or live URL into a citation-ready 50-word Google AI Overview summary box, executive TL;DR bullets, extracted quantitative claims, and a copy-paste HTML Key Takeaways component.
              </p>
              <PortableToolHeroBar
                slug="ai-article-summarizer"
                title="AI Article Summarizer & 50-Word Summary Box Builder"
                path="/tools/ai-article-summarizer"
                primaryLabel="Use Tool Now: Build 50-Word Summary Box"
                workspaceId="ai-article-summarizer-workspace"
              />
            </div>

            <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-xl space-y-3">
              <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
                <span className="font-semibold text-indigo-300">🚀 Answer Engine Optimization (AEO)</span>
                <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-emerald-300 font-medium">
                  3.2x Citations
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-slate-950 p-2.5 border border-slate-800">
                  <div className="text-[10px] uppercase text-slate-400">Sweet Spot</div>
                  <div className="text-sm font-extrabold text-emerald-400">45–55 Words</div>
                </div>
                <div className="rounded-xl bg-slate-950 p-2.5 border border-slate-800">
                  <div className="text-[10px] uppercase text-slate-400">Metrics</div>
                  <div className="text-sm font-extrabold text-indigo-400">Preserved</div>
                </div>
                <div className="rounded-xl bg-slate-950 p-2.5 border border-slate-800">
                  <div className="text-[10px] uppercase text-slate-400">CMS Export</div>
                  <div className="text-sm font-extrabold text-cyan-400">HTML + TW</div>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Designed for editors and founders optimizing articles for Google AI Overviews, Perplexity, and ChatGPT Search.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6">
        <AiArticleSummarizerClient />
      </section>

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
