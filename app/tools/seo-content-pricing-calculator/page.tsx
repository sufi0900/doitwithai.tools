import type { Metadata } from "next";
import Link from "next/link";
import PortableToolHeroBar from "@/features/portable-tool-kit/PortableToolHeroBar";
import ToolFaq from "@/features/tool-ui/ToolFaq";
import ToolResources from "@/features/tool-catalog/ToolResources";
import { ToolHeroBackground, toolHeroHeading, toolHeroSurface } from "@/features/tool-ui/ToolHero";
import SeoContentPricingCalculatorClient from "@/features/seo-content-pricing-calculator/SeoContentPricingCalculatorClient";

const pageUrl = "https://doitwithai.tools/tools/seo-content-pricing-calculator";

export const metadata: Metadata = {
  title: "Free AI SEO Content Writing Cost, Per-Article Pricing & ROI Calculator (2026)",
  description:
    "Compare 2025–2026 SEO content writing service pricing per article across agencies, freelance writers, in-house teams, and AI + human E-E-A-T workflows with a 12-month ROI calculator.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "AI SEO Content Writing Cost, Per-Article Pricing & ROI Calculator",
    description:
      "Interactive per-article and per-word SEO content pricing calculator with 4-tier agency vs. AI workflow benchmarks and 12-month organic traffic ROI modeling.",
    url: pageUrl,
    type: "website"
  }
};

const faqs = [
  {
    question: "What is the average SEO content writing service pricing per article in 2025–2026?",
    answer:
      "In 2025–2026, a 2,000-word SEO article costs $450 to $950 from a traditional retainer SEO agency ($0.25–$0.45/word), $250 to $450 from a senior niche freelancer ($0.12–$0.22/word), and $65 to $125 when produced using an AI + human SME editorial studio workflow that combines automated SERP research with 30 minutes of human fact-checking."
  },
  {
    question: "Why is pure 1-click AI content cheaper on paper but risky for ROI?",
    answer:
      "Unedited $2 AI articles often stall in 'Crawled - Currently Not Indexed' because they lack original data, comparison tables, and first-hand E-E-A-T proof. Allocating $50–$95 per article to pair AI drafting with human subject-matter proof and FAQPage schema delivers 80%+ cost savings over agencies while preserving search rankings."
  },
  {
    question: "How many SEO articles per month do we need to see compounding organic traffic?",
    answer:
      "For B2B SaaS and niche publishers, publishing 12 to 25 interlinked, high-information-gain articles per month around a focused topical cluster typically reaches break-even customer acquisition ROI between Months 4 and 6."
  }
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      name: "Free AI SEO Content Writing Cost, Per-Article Pricing & ROI Calculator",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: pageUrl,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD"
      },
      featureList: [
        "Per-Article & Per-Word SEO Pricing Calculator (Agency vs. Freelancer vs. In-House vs. AI)",
        "Subject-Matter Complexity Multiplier (Standard, B2B SaaS, Regulated FinTech/Med/Legal)",
        "12-Month Organic Click & Customer LTV Pipeline Forecaster",
        "1-Click CFO & Editorial Markdown Budget Proposal Generator + CSV Export"
      ]
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://doitwithai.tools" },
        { "@type": "ListItem", position: 2, name: "Tools", item: "https://doitwithai.tools/tools" },
        {
          "@type": "ListItem",
          position: 3,
          name: "SEO Content Pricing & ROI Calculator",
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

export default function SeoContentPricingCalculatorPage() {
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
            <span className="text-indigo-400">SEO Content Pricing & ROI Calculator</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-7 space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300">
                <span>💰 2025–2026 Per-Article Benchmarks · 4-Tier Cost Matrix · 12-Month ROI</span>
              </div>
              <h1 className={`${toolHeroHeading} text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white`}>
                Free AI SEO Content Writing Cost,{" "}
                <span className="bg-gradient-to-r from-indigo-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">
                  Per-Article Pricing & ROI Calculator
                </span>
              </h1>
              <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
                Calculate exact per-article and per-word SEO content writing costs across retainer agencies, senior freelancers, in-house teams, and AI + human E-E-A-T workflows—complete with a 12-month traffic and pipeline ROI forecast.
              </p>
              <PortableToolHeroBar
                slug="seo-content-pricing-calculator"
                title="AI SEO Content Writing Cost & Per-Article Pricing Calculator"
                path="/tools/seo-content-pricing-calculator"
                primaryLabel="Use Tool Now: Calculate Per-Article Cost & ROI"
                workspaceId="seo-pricing-calculator-workspace"
              />
            </div>

            <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-xl space-y-3">
              <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
                <span className="font-semibold text-indigo-300">📊 2,000-Word B2B Article Benchmark</span>
                <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-emerald-300 font-medium">
                  84% Savings
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-slate-950 p-2.5 border border-slate-800">
                  <div className="text-[10px] uppercase text-slate-400">SEO Agency</div>
                  <div className="text-lg font-extrabold text-rose-400">$840/art</div>
                </div>
                <div className="rounded-xl bg-slate-950 p-2.5 border border-slate-800">
                  <div className="text-[10px] uppercase text-slate-400">Freelancer</div>
                  <div className="text-lg font-extrabold text-amber-400">$445/art</div>
                </div>
                <div className="rounded-xl bg-slate-950 p-2.5 border border-emerald-500/30">
                  <div className="text-[10px] uppercase text-emerald-300">AI + SME</div>
                  <div className="text-lg font-extrabold text-emerald-400">$109/art</div>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Adjust monthly volume, word count, SME complexity, and customer LTV below to export a custom budget memo or CSV table.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6">
        <SeoContentPricingCalculatorClient />
      </section>

      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pt-16 space-y-10">
        <div className="rounded-2xl border border-indigo-500/30 bg-indigo-950/20 p-6">
          <h2 className="text-lg font-bold text-white mb-2">
            50-Word Answer Box: AI SEO Content Writing Service Pricing Per Article (2025–2026)
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            In 2025–2026, <strong>SEO content writing service pricing per article</strong> ranges from <strong>$450–$950</strong> at retainer agencies ($0.25–$0.45/word) and <strong>$250–$450</strong> with niche freelancers ($0.12–$0.22/word), down to <strong>$65–$125 per article</strong> when pairing AI research and structured drafting with 30 minutes of human subject-matter expert (SME) verification.
          </p>
        </div>

        <ToolResources slug="seo-content-pricing-calculator" />
        <ToolFaq
          title="Free AI SEO Content Writing Cost & Per-Article Pricing Calculator FAQs"
          faqs={faqs}
        />
      </section>
    </main>
  );
}
