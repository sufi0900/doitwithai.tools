import type { Metadata } from "next";
import Link from "next/link";
import {
  Sparkles,
  CheckCircle2,
  Zap,
  Palette,
  Code2,
  LayoutDashboard,
  UserCheck,
  ShieldCheck,
  FolderKanban,
} from "lucide-react";
import GrandBlogWriterStudio from "@/features/blog-writer-studio/GrandBlogWriterStudio";
import ToolFaq from "@/features/tool-ui/ToolFaq";

const pageUrl = "https://doitwithai.tools/ai-content-writer";
const title =
  "AI Content Writer, Blog Writer & Article Studio | DoItWithAI Flagship Platform";
const description =
  "Our standalone AI Content Writer, AI Blog Writer, and AI Article Writer workspace. Open testing mode active with zero compulsory sign-in: orchestrate 62 SEO engines, 25 Canva/Napkin-style section infographics, 7-entity JSON-LD @graph schema, interactive quizzes, and 6-channel social packs.";

/**
 * Open Testing Mode: Keep false on preview/testing branches (such as
 * `codex/infographic-studio-redesign`) so the Founder and QA can test all 6 stages
 * of the AI Content Writer Studio immediately without a compulsory sign-in gate.
 */
const REQUIRE_AUTH_FOR_CONTENT_WRITER_STUDIO = false;

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "ai content writer",
    "ai blog writer",
    "ai article writer",
    "free ai content writer",
    "free ai blog writer",
    "free ai article writer",
    "ai blog post generator with images",
    "seo content writing platform",
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
      "Why is the AI Content Writer, Blog Writer & Article Studio a standalone platform at /ai-content-writer instead of a single-task tool?",
    answer:
      "Single-task tools solve one isolated check (like counting characters or validating a slug). Our AI Content Writer at /ai-content-writer is a complete multi-project publishing platform and user dashboard that unifies AI Content Writer, AI Blog Writer, and AI Article Writer intents into one canonical workspace—preventing keyword cannibalization while orchestrating 62 backend SEO, visual, schema, and distribution engines.",
  },
  {
    question:
      "Do I need to sign in to test the AI Content Writer Studio on this preview build?",
    answer:
      "No compulsory sign-in is required during open preview testing. All 6 stages and your multi-project IndexedDB workspace are unlocked immediately so you can test keyword clustering, outline generation, long-form drafting, and 25 section infographics without friction, while optional Sign In / Cloud Sync remains available in the top bar.",
  },
  {
    question:
      "Does this single platform cover AI Content Writer, AI Blog Writer, and AI Article Writer workflows?",
    answer:
      "Yes. Whether you are writing a B2B SaaS blog post, a long-form E-E-A-T research article with [S1]/[S2] footnotes, or commercial web content, all three workflows are unified inside this single dashboard with 6 input modes (Keyword Cluster, Topic/Idea, Custom Outline, Competitor URL Outranker, PDF/Transcript Synthesizer, and Custom Prompt).",
  },
  {
    question:
      "How do the 25 Canva & Napkin.ai-style section infographics work inside the dashboard?",
    answer:
      "Every H2 section in your article automatically maps to one of 25 deterministic HTML5 Canvas and vector SVG diagram templates (Process Flows, Versus Battle Cards, Bento KPI Callouts, 2x2 Quadrants, Pyramids, and Checklists). They render in under 20ms at $0 token cost with zero misspelled words and can be edited live inside Stage 4.",
  },
  {
    question: "How are my projects and article history saved?",
    answer:
      "Your multi-project workspace automatically saves in your browser's 500MB+ IndexedDB store (DoItWithAI_BlogStudio_DB) and integrates with your DoItWithAI account dashboard so you can switch between client campaigns, export portable .blogproject.json backups, or download the 8-file Master .ZIP Production Bundle.",
  },
];

export default function RootAiContentWriterPlatformPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["WebApplication", "SoftwareApplication"],
        name: "DoItWithAI Flagship AI Content Writer, Blog Writer & Article Studio",
        alternateName: [
          "AI Content Writer",
          "AI Blog Writer",
          "AI Article Writer",
          "Free AI Blog & Article Writer Studio",
        ],
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
            name: "AI Content Writer Platform",
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

      {/* Standalone SaaS Platform Top Bar & Hero (Outside /tools) */}
      <header className="relative overflow-hidden border-b border-slate-800 bg-gradient-to-br from-[#0B1120] via-[#111C38] to-[#1A2652] text-white">
        <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
          {/* Top SaaS Platform Navigation & User Dashboard Bar */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 backdrop-blur">
            <nav
              aria-label="Breadcrumb"
              className="flex flex-wrap items-center gap-2 text-xs text-slate-300"
            >
              <Link href="/" className="hover:text-white">
                Home
              </Link>
              <span>/</span>
              <span
                aria-current="page"
                className="inline-flex items-center gap-1.5 font-extrabold text-amber-300"
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                AI Content Writer Platform (Flagship Studio)
              </span>
            </nav>

            <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
              {!REQUIRE_AUTH_FOR_CONTENT_WRITER_STUDIO && (
                <span className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-400/40 bg-emerald-500/20 px-3 py-1 text-emerald-200">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
                  Open Testing Mode · No Compulsory Sign-In
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-400/30 bg-indigo-500/15 px-3 py-1 text-indigo-200">
                <FolderKanban className="h-3.5 w-3.5" />
                Multi-Project IndexedDB Dashboard Active
              </span>
              <Link
                href="/do-it-ai"
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/10 px-3 py-1 text-white hover:bg-white/20"
              >
                Command Workspace
              </Link>
              <Link
                href="/auth"
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-3.5 py-1 text-white shadow hover:brightness-110"
              >
                <UserCheck className="h-3.5 w-3.5" />
                Optional Sign In / Cloud Sync
              </Link>
            </div>
          </div>

          <div className="grid items-center gap-8 lg:grid-cols-[1.35fr_0.85fr]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-amber-300">
                <Sparkles className="h-3.5 w-3.5" />
                Unified Flagship Platform · AI Content Writer + AI Blog Writer + AI Article Writer
              </div>

              <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                AI Content Writer:{" "}
                <span className="bg-gradient-to-r from-indigo-300 via-sky-300 to-emerald-300 bg-clip-text text-transparent">
                  Autonomous Blog, Article &amp; 25-Visual Studio
                </span>
              </h1>

              {/* 50-Word Position Zero / AEO Quick Answer Lead */}
              <aside
                aria-label="Quick Answer Summary"
                className="mt-4 max-w-3xl rounded-2xl border border-indigo-400/30 bg-slate-900/75 p-4 text-sm leading-relaxed text-slate-200 shadow-inner"
              >
                <strong className="text-amber-300">
                  Quick Answer (50-Word AEO Definition):
                </strong>{" "}
                The <strong>DoItWithAI Content Writer</strong> (
                <code>doitwithai.tools/ai-content-writer</code>) is a standalone
                AI content, blog, and long-form article production platform that
                transforms any keyword, outline, competitor URL, or PDF into a
                rank-ready publication—orchestrating 62 SEO engines, 25 editable
                Canva/Napkin-style HTML5 Canvas infographics, 7-entity JSON-LD{" "}
                <code>@graph</code> schema, an interactive reader quiz, and a
                6-channel social pack.
              </aside>

              <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold text-slate-200">
                <span className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-1.5">
                  <Zap className="h-3.5 w-3.5 text-amber-300" />
                  ⚡ 1-Click Express Autopilot &amp; 6-Stage Studio Panel
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-1.5">
                  <Palette className="h-3.5 w-3.5 text-emerald-300" />
                  25 Canva &amp; Napkin-Style Section Infographics
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-1.5">
                  <Code2 className="h-3.5 w-3.5 text-sky-300" />
                  7-Entity JSON-LD @graph &amp; 8-File Master .ZIP
                </span>
              </div>
            </div>

            {/* Right: Unified Intent & Architecture Card */}
            <div className="rounded-3xl border border-indigo-400/30 bg-[#0F172A]/90 p-5 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-300">
                  1 Unified Platform · 3 Core Search Intents
                </span>
                <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300">
                  Zero Cannibalization
                </span>
              </div>
              <ul className="mt-3.5 space-y-2.5 text-xs text-slate-200">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                  <span>
                    <strong>AI Content Writer Mode:</strong> Commercial landing
                    guides, AEO 50-word leads, and brand-voice web copy.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                  <span>
                    <strong>AI Blog Writer Mode:</strong> Rank-ready blog posts
                    with H2/H3 trees, 25 inline HTML5 Canvas diagrams &amp;
                    Gutenberg blocks.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                  <span>
                    <strong>AI Article Writer Mode:</strong> Long-form E-E-A-T
                    authority articles with [S1]/[S2] footnotes, PDF synthesis
                    &amp; reader quiz.
                  </span>
                </li>
              </ul>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-3 text-[11px]">
                <span className="inline-flex items-center gap-1 text-slate-400">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  Root Flagship Route: <code>/ai-content-writer</code>
                </span>
                <Link
                  href="/tools/blog-section-infographic-generator"
                  className="rounded-lg bg-emerald-500/20 px-2.5 py-1 font-semibold text-emerald-200 hover:bg-emerald-500/30"
                >
                  Open Standalone 25-Visual Studio →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Flagship Studio Dashboard (Unlocked directly in Open Testing Mode) */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <GrandBlogWriterStudio variant="content-writer" />
      </section>

      {/* Platform FAQs */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="mt-6">
          <ToolFaq faqs={faqs} />
        </div>
      </section>
    </main>
  );
}
