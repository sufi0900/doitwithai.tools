import type { Metadata } from "next";
import Link from "next/link";
import {
  Sparkles,
  CheckCircle2,
  Layers,
  ShieldCheck,
  Zap,
  Code2,
  Share2,
  Award,
  ArrowRight,
  Palette,
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

const pageUrl = "https://doitwithai.tools/tools/ai-blog-writer";
const title =
  "Free AI Blog Writer: 6-Stage SEO Blog, 25 Visuals & Schema Studio";
const description =
  "Generate rank-ready SEO blog posts with our free AI blog writer—combines a 50-word Position Zero lead, editable H2/H3 sections, 25 Canva/Napkin-style HTML5 Canvas infographics, JSON-LD @graph schema, an interactive reader quiz, and a 6-channel social pack.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "ai blog writer",
    "free ai blog writer",
    "ai blog post generator with images",
    "seo blog writer ai",
    "best ai blog writer",
    "ai blog writer with infographics",
    "answer engine optimization blog writer",
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
      "What makes this Free AI Blog Writer different from single-prompt ChatGPT or paid SEO writers?",
    answer:
      "Single-prompt AI writers output flat walls of generic text without pixel-width checks, visuals, or schema markup. Our Grand AI Blog Writer orchestrates 62 connected SEO, AEO, visual, and distribution engines on a single CanonicalBlogProjectState—generating a <580px meta title, a 50-word Google AI Overview summary lead, editable H2/H3 sections, 25 typo-free HTML5 Canvas & SVG section infographics, validated Article + FAQPage JSON-LD @graph, an embeddable reader quiz, and a 6-channel social campaign.",
  },
  {
    question:
      "How does the 25-template Canva & Napkin.ai-style blog infographic engine work?",
    answer:
      "Instead of using expensive diffusion image APIs that misspell words inside diagrams, every H2 section automatically maps to one of 25 deterministic HTML5 Canvas and vector SVG templates (Process Flows, Versus Battle Cards, Bento KPI Callouts, 2x2 Quadrants, Pyramids, and Checklists). Every diagram renders in under 20ms at $0 token cost with crisp typography and exports to HD PNG, SVG, WebP, or zero-CLS Core Web Vitals HTML.",
  },
  {
    question:
      "Can I switch between 1-Click Express Mode and the 6-Stage Guided Studio?",
    answer:
      "Yes. Click '1-Click Express Full Article + Visuals' in the top command bar to chain outline generation, section drafting, visual diagram mapping, and deterministic SEO fixes automatically, or step through Stages 1 to 6 manually to customize your H2 outline, E-E-A-T proof notes, and per-section Co-Pilot actions.",
  },
  {
    question:
      "Are my blog projects saved automatically if I refresh or close the browser?",
    answer:
      "Yes. Your projects are persisted automatically in your browser via our IndexedDB workspace store (DoItWithAI_BlogStudio_DB) with localStorage index fallback. You can manage multiple client or site articles, duplicate drafts, or export/import portable JSON and Master .ZIP bundles at any time.",
  },
  {
    question: "What files are included in the 1-Click Master .ZIP Bundle?",
    answer:
      "Clicking 'Download Master .ZIP Bundle' generates an 8-file publication archive containing: (1) article.md, (2) article-clean-cwv.html, (3) wordpress-gutenberg-blocks.html, (4) schema-graph.json, (5) seo-scorecard-audit.json, (6) interactive-quiz-widget.html, (7) omnichannel-social-pack.md, and (8) utm-campaign-links.csv.",
  },
];

export default function AiBlogWriterPage() {
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
            name: "Free AI Blog Writer Studio",
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
              Free AI Blog Writer
            </span>
          </nav>

          <div className="grid items-center gap-8 lg:grid-cols-[1.35fr_0.85fr]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-indigo-200">
                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                Flagship 6-Stage AI Blog Writer · 25 Visual Layouts · 62-Tool Engine
              </div>

              <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                Free AI Blog Writer:{" "}
                <span className={toolHeroHeading}>
                  SEO Articles, 25 Canvas Infographics &amp; Schema Studio
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
                An <strong>AI blog writer</strong> is an automated content engineering workspace that transforms a target keyword, competitor URL, outline, or PDF transcript into a rank-ready blog post—combining a 50-word Position Zero answer lead, editable H2/H3 sections, 25 typo-free HTML5 Canvas infographics, validated JSON-LD{" "}
                <code>@graph</code> schema, and an omnichannel social pack.
              </aside>

              <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold text-slate-200">
                <span className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-1.5">
                  <Zap className="h-3.5 w-3.5 text-amber-300" />⚡ 1-Click Express &amp; 6-Stage Guided Modes
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-1.5">
                  <Palette className="h-3.5 w-3.5 text-emerald-300" />
                  25 Canva &amp; Napkin-Style Section Infographics
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-1.5">
                  <Code2 className="h-3.5 w-3.5 text-sky-300" />
                  Article + FAQPage JSON-LD &amp; Master .ZIP Export
                </span>
              </div>

              <PortableToolHeroBar
                slug="ai-blog-writer"
                title={title}
              />
            </div>

            {/* Right: 6-Stage Flagship Deliverables Card */}
            <div className="rounded-3xl border border-indigo-400/30 bg-[#0F172A]/90 p-5 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-300">
                  What Every Blog Project Compiles
                </span>
                <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300">
                  100% Free · Zero Watermarks
                </span>
              </div>
              <ul className="mt-3.5 space-y-2.5 text-xs text-slate-200">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                  <span>
                    <strong>Stage 1–2 (Brief &amp; Outline):</strong> 5 input modes, &lt;580px SERP title, 50-word AI Overview lead &amp; H2/H3 tree.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                  <span>
                    <strong>Stage 3–4 (Drafting, Visuals &amp; Scorecard):</strong> 4-Tier AI drafting, 25 inline HTML5 Canvas diagrams &amp; 0–100 SEO audit.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                  <span>
                    <strong>Stage 5–6 (Schema, Quiz &amp; Social Pack):</strong> JSON-LD <code>@graph</code>, Gutenberg HTML, interactive reader quiz &amp; 8-file <code>.zip</code>.
                  </span>
                </li>
              </ul>
              <div className="mt-4 flex flex-wrap gap-2 border-t border-white/10 pt-3 text-[11px]">
                <Link
                  href="/tools/ai-content-writer"
                  className="rounded-lg bg-white/10 px-2.5 py-1 font-semibold text-indigo-200 hover:bg-white/20"
                >
                  AI Content Writer →
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
        <GrandBlogWriterStudio variant="blog-writer" />
      </section>

      {/* Related Resources & FAQs */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <ToolResources slug="ai-blog-writer" />
        <div className="mt-10">
          <ToolFaq faqs={faqs} />
        </div>
      </section>
    </main>
  );
}
