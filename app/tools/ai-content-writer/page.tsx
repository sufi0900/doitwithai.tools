import type { Metadata } from "next";
import Link from "next/link";
import {
  Sparkles,
  CheckCircle2,
  Zap,
  Palette,
  Code2,
} from "lucide-react";
import GrandBlogWriterStudio from "@/features/blog-writer-studio/GrandBlogWriterStudio";
import PortableToolHeroBar from "@/features/portable-tool-kit/PortableToolHeroBar";
import ToolFaq from "@/features/tool-ui/ToolFaq";
import ToolResources from "@/features/tool-catalog/ToolResources";
import {
  ToolHeroBackground,
  toolHeroHeading,
  toolHeroSurface,
} from "@/features/tool-ui/ToolHero";

const pageUrl = "https://doitwithai.tools/tools/ai-content-writer";
const title =
  "Free AI Content Writer: 6-Stage SEO, AEO, 25 Visuals & Schema Studio";
const description =
  "Create rank-ready SEO and Answer Engine Optimization (AEO) content with our free AI content writer—chains search intent, <580px meta tags, 50-word AI Overview lead, 25 HTML5 Canvas section infographics, E-E-A-T proof tables, JSON-LD @graph, and a 6-channel social pack.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "ai content writer",
    "free ai content writer",
    "ai seo content writer",
    "human like ai content generator",
    "aeo content studio",
    "ai blog writer",
    "ai article writer",
  ],
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
    question:
      "Why does this AI Content Writer combine 6 guided stages and 25 visual templates instead of a single prompt?",
    answer:
      "Single-prompt AI content writers produce generic paragraphs without checking Google SERP pixel widths, Answer Engine summary leads, visual diagrams, or structured data. Our unified 6-stage workspace connects 47 zero-token deterministic SEO/AEO analyzers with a 4-tier multi-key AI router and 25 Canva/Napkin-style HTML5 Canvas section infographics so your content is ready to rank and earn AI citations immediately.",
  },
  {
    question:
      "How does the 50-word AI Overview Summary Box improve citations in Google AI Mode and Perplexity?",
    answer:
      "Retrieval-Augmented Generation (RAG) answer engines prioritize concise 45–58 word copula definition passages placed immediately below your H1. Stage 1–4 automatically drafts and audits this 50-word Position Zero lead alongside a 3-column Markdown comparison table and verifiable E-E-A-T proof points.",
  },
  {
    question:
      "Can I customize and download the 25 section infographics inside my content?",
    answer:
      "Yes. Every H2 section automatically maps to one of 25 deterministic HTML5 Canvas and vector SVG templates. You can click 'Customize in 25-Template Studio' on any section in Stage 4 to edit text nodes, switch color themes, upload your brand logo, choose an editorial illustration, and export PNG, SVG, WebP, or dimensioned embed HTML.",
  },
  {
    question:
      "What formats can I export when my content is finished?",
    answer:
      "You can copy or download Clean Markdown (.md), Core Web Vitals Semantic HTML5 (.html), WordPress Gutenberg Blocks, standalone JSON-LD @graph Schema, an Interactive Reader Quiz widget, a 6-Channel Social & UTM Campaign Pack, or the complete 8-file Master .ZIP Archive.",
  },
];

export default function AiContentWriterPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: title,
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
            name: "Free AI Content Writer Studio",
            item: pageUrl,
          },
        ],
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
    <main className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#0B1120] dark:text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
        }}
      />

      {/* Compact SSR Hero */}
      <header
        className={`relative overflow-hidden ${toolHeroSurface} text-white`}
      >
        <ToolHeroBackground />
        <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
          <nav
            aria-label="Breadcrumb"
            className="mb-3 flex flex-wrap items-center gap-2 text-xs text-slate-300"
          >
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            <span>/</span>
            <Link href="/tools" className="hover:text-white">
              Tools
            </Link>
            <span>/</span>
            <span aria-current="page" className="font-semibold text-white">
              Free AI Content Writer
            </span>
          </nav>

          <div className="grid items-center gap-8 lg:grid-cols-[1.35fr_0.85fr]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-indigo-200">
                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                Unified SEO, AEO &amp; Visual AI Content Writer · 62-Tool Architecture
              </div>

              <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                Free AI Content Writer:{" "}
                <span className={toolHeroHeading}>
                  SEO, AEO, 25 Visual Diagrams &amp; Distribution Studio
                </span>
              </h1>

              {/* 50-Word Position Zero / AEO Quick Answer Lead */}
              <aside
                aria-label="Quick Answer Summary"
                className="mt-4 max-w-3xl rounded-2xl border border-indigo-400/30 bg-slate-900/65 p-4 text-sm leading-relaxed text-slate-200 shadow-inner"
              >
                <strong className="text-amber-300">
                  Quick Answer (50-Word AEO Definition):
                </strong>{" "}
                An <strong>AI content writer</strong> is a full-stack editorial and SEO production studio that converts a topic brief, competitor URL, or multi-source research into human-sounding web content—integrating pixel-verified metadata, a 50-word AI Overview lead, 25 editable HTML5 Canvas infographics, E-E-A-T proof tables, JSON-LD{" "}
                <code>@graph</code> schema, and omnichannel social campaigns.
              </aside>

              <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold text-slate-200">
                <span className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-1.5">
                  <Zap className="h-3.5 w-3.5 text-amber-300" />
                  15+ Zero-Token Deterministic SEO &amp; Burstiness Checks
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-1.5">
                  <Palette className="h-3.5 w-3.5 text-emerald-300" />
                  25 Canva &amp; Napkin-Style Section Infographics
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-1.5">
                  <Code2 className="h-3.5 w-3.5 text-sky-300" />
                  WordPress Gutenberg + Master .ZIP Archive
                </span>
              </div>

              <PortableToolHeroBar
                slug="ai-content-writer"
                title={title}
              />
            </div>

            {/* Right Card */}
            <div className="rounded-3xl border border-indigo-400/30 bg-[#0F172A]/90 p-5 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-300">
                  6-Stage Content Production Pipeline
                </span>
                <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300">
                  IndexedDB Autosave
                </span>
              </div>
              <ul className="mt-3.5 space-y-2.5 text-xs text-slate-200">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                  <span>
                    <strong>Zero-Fluff E-E-A-T Content:</strong> Injects first-hand proof notes, [S1]/[S2] citations, and burstiness rhythm checks.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                  <span>
                    <strong>Crisp Section Visuals at $0 Token Cost:</strong> Auto-maps every H2 to Process, Comparison, Bento KPI &amp; Checklist diagrams.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                  <span>
                    <strong>Omnichannel Repurposing Built-In:</strong> Compiles LinkedIn, X thread, Reddit value post, newsletter, video script &amp; UTM CSV.
                  </span>
                </li>
              </ul>
              <div className="mt-4 flex flex-wrap gap-2 border-t border-white/10 pt-3 text-[11px]">
                <Link
                  href="/tools/ai-blog-writer"
                  className="rounded-lg bg-white/10 px-2.5 py-1 font-semibold text-indigo-200 hover:bg-white/20"
                >
                  AI Blog Writer →
                </Link>
                <Link
                  href="/tools/ai-article-writer"
                  className="rounded-lg bg-white/10 px-2.5 py-1 font-semibold text-indigo-200 hover:bg-white/20"
                >
                  AI Article Writer →
                </Link>
                <Link
                  href="/tools/blog-section-infographic-generator"
                  className="rounded-lg bg-white/10 px-2.5 py-1 font-semibold text-emerald-200 hover:bg-white/20"
                >
                  25-Template Infographic Studio →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Interactive 6-Stage Flagship Studio */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <GrandBlogWriterStudio variant="content-writer" />
      </section>

      {/* Related Resources & FAQs */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <ToolResources slug="ai-content-writer" />
        <div className="mt-10">
          <ToolFaq faqs={faqs} />
        </div>
      </section>
    </main>
  );
}
