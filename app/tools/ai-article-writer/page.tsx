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

const pageUrl = "https://doitwithai.tools/tools/ai-article-writer";
const title =
  "Free AI Article Writer: Long-Form E-E-A-T, 25 Visuals & Schema Studio";
const description =
  "Draft authoritative, citation-backed long-form articles with our free AI article writer—combines a 50-word Position Zero answer lead, [S1]/[S2] source footnotes, 25 Canva/Napkin-style HTML5 Canvas diagrams, Article + FAQPage JSON-LD @graph, and an embeddable reader quiz.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "ai article writer",
    "free ai article writer",
    "long form ai article generator",
    "source to article ai writer",
    "eeat article writer",
    "ai blog writer",
    "ai content writer",
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
      "How does this Free AI Article Writer structure long-form E-E-A-T articles?",
    answer:
      "Instead of generating unverified generic prose, our AI Article Writer structures every article around a 50-word Position Zero definition lead, 3 selectable introduction hooks, deep H2/H3 sections with [S1]/[S2]/[S3] source citations, Markdown comparison tables, 25 editable HTML5 Canvas diagrams, and validated Article + FAQPage JSON-LD @graph schema.",
  },
  {
    question:
      "Can I synthesize PDF extracts, interview transcripts, or competitor URLs into an article?",
    answer:
      "Yes. In Stage 1 (Brief & SERP Intent), you can switch between 5 input modes: Keyword & Topic Brief, Custom H2/H3 Outline, Competitor URL Outranker, PDF/Transcript/Notes Synthesizer, and Content Refresh & Decay Optimizer.",
  },
  {
    question:
      "How do the 25 section diagrams enhance long-form article engagement and dwell time?",
    answer:
      "Every H2 heading automatically maps to a responsive HTML5 Canvas and vector SVG diagram—including Process Pipelines, Versus Battle Cards, Bento KPI Callouts, 2x2 Strategic Quadrants, Pyramids, and Checklists. You can customize any diagram in Stage 4 and export zero-CLS semantic <figure> HTML.",
  },
  {
    question:
      "Does the studio include an interactive quiz and omnichannel promotion pack?",
    answer:
      "Yes. Stage 6 compiles a self-contained, zero-dependency HTML/JS Reader Assessment Quiz widget to boost page dwell time and lead capture, alongside a 6-channel social campaign (LinkedIn, X thread, Reddit value post, newsletter, short-form video script, and UTM CSV).",
  },
];

export default function AiArticleWriterPage() {
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
            name: "Free AI Article Writer Studio",
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
              Free AI Article Writer
            </span>
          </nav>

          <div className="grid items-center gap-8 lg:grid-cols-[1.35fr_0.85fr]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-indigo-200">
                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                Long-Form E-E-A-T AI Article Writer · Citations, 25 Visuals &amp; Schema
              </div>

              <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                Free AI Article Writer:{" "}
                <span className={toolHeroHeading}>
                  Long-Form E-E-A-T, 25 Diagrams &amp; Knowledge Graph Studio
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
                An <strong>AI article writer</strong> is a long-form publishing studio that synthesizes keywords, outlines, competitor URLs, or research notes into an authoritative E-E-A-T article—complete with a 50-word Position Zero answer lead, inline{" "}
                <code>[S1]</code>/<code>[S2]</code> citations, 25 HTML5 Canvas section diagrams, validated JSON-LD{" "}
                <code>@graph</code> schema, and an interactive reader quiz.
              </aside>

              <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold text-slate-200">
                <span className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-1.5">
                  <Zap className="h-3.5 w-3.5 text-amber-300" />
                  5 Input Modes: Keyword, Outline, URL, PDF/Notes &amp; Refresh
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-1.5">
                  <Palette className="h-3.5 w-3.5 text-emerald-300" />
                  25 Canva &amp; Napkin-Style Section Diagrams
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-1.5">
                  <Code2 className="h-3.5 w-3.5 text-sky-300" />
                  Interactive Quiz Lead Magnet &amp; 8-File .ZIP Export
                </span>
              </div>

              <PortableToolHeroBar
                slug="ai-article-writer"
                title={title}
              />
            </div>

            {/* Right Card */}
            <div className="rounded-3xl border border-indigo-400/30 bg-[#0F172A]/90 p-5 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-300">
                  Long-Form Article Architecture
                </span>
                <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300">
                  E-E-A-T Verified
                </span>
              </div>
              <ul className="mt-3.5 space-y-2.5 text-xs text-slate-200">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                  <span>
                    <strong>Citation &amp; Proof Architecture:</strong> Supports [S1]/[S2]/[S3] footnotes, practitioner proof notes &amp; entity disambiguation.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                  <span>
                    <strong>70/30 Split Editor &amp; Co-Pilot:</strong> Expand depth, inject E-E-A-T proof, convert paragraphs to tables, or humanize rhythm.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                  <span>
                    <strong>Complete Technical &amp; Quiz Pack:</strong> Exports zero-CLS HTML5, Gutenberg blocks, JSON-LD <code>@graph</code>, and quiz widget.
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
                  href="/tools/ai-content-writer"
                  className="rounded-lg bg-white/10 px-2.5 py-1 font-semibold text-indigo-200 hover:bg-white/20"
                >
                  AI Content Writer →
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
        <GrandBlogWriterStudio variant="article-writer" />
      </section>

      {/* Related Resources & FAQs */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <ToolResources slug="ai-article-writer" />
        <div className="mt-10">
          <ToolFaq faqs={faqs} />
        </div>
      </section>
    </main>
  );
}
