import type { Metadata } from "next";
import Link from "next/link";
import {
  CheckCircle2,
  FolderKanban,
  LayoutDashboard,
  Sparkles,
  UserCheck,
} from "lucide-react";
import WriterWorkspace from "@/features/writer-workspace/WriterWorkspace";
import RecentUrlsProvider from "@/features/tool-ui/recent-urls/RecentUrlsProvider";
import ToolFaq from "@/features/tool-ui/ToolFaq";

const pageUrl = "https://doitwithai.tools/ai-content-writer";
const title =
  "AI Content Writer, Blog Writer & Article Studio | DoItWithAI Flagship Platform";
const description =
  "Start with a topic, prompt, outline, or reference URL. Guided onboarding, live step-by-step section drafting, rich-text & inline infographic editor, unified SEO & readability scorecard, social media visual studio, and 1-click multi-format publishing.";

/**
 * Open Testing Mode: Keep false on preview/testing branches so the Founder and QA
 * can test the complete onboarding and studio dashboard without a compulsory login gate.
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
    question: "How does the 2-Phase Onboarding-to-Dashboard workflow work?",
    answer:
      "When you start a new article, the Guided Onboarding Wizard takes your topic, detailed prompt, focus keywords, or custom H2/H3 outline. You can either generate the entire article, inline section infographics, and social pack in one click (with a live 5-stage progress pipeline and shimmer skeletons) or review and customize your outline first before unlocking the full 4-Zone Studio Dashboard.",
  },
  {
    question:
      "Can I choose from multiple Meta Title, Meta Description, and Social Caption variations?",
    answer:
      "Yes. Above the rich-text editor, the Search Appearance bar displays the recommended Meta Title and Meta Description along with 4 selectable AI variations and a live Google SERP preview. Below the editor, the Social & Video and Email Newsletter studios provide one-click selectable caption angles and subject line options alongside customizable visual cards.",
  },
  {
    question: "Where are my projects saved, and do I need to sign in to test?",
    answer:
      "Projects are saved automatically in your browser's local IndexedDB storage, and you can export or import portable .blogproject.json backups at any time. Open preview testing does not require compulsory sign-in.",
  },
  {
    question: "What does the publishing kit contain?",
    answer:
      "You can download individual files at any time or click 'Download everything (.ZIP)' to get your article in PDF, DOCX, HTML, Markdown, and EPUB formats, high-resolution PNG and vector SVG section infographics, social media post captions and visual cards (Facebook, Instagram, LinkedIn, X, Pinterest, Threads, Reddit, Quora, YouTube), an email newsletter (HTML & text), a LinkedIn carousel PDF, and optional MP3 audio narration chapters.",
  },
  {
    question: "How does the unified readiness, readability & SEO score work?",
    answer:
      "The left studio panel computes live local checks across readability (35 pts), section structure (20 pts), meta title & description pixel fit (20 pts), keyword alignment (10 pts), reference presence (10 pts), and section visuals (5 pts), and lets you highlight overly long sentences directly inside the rich-text editor.",
  },
];

export default function AiContentWriterPage() {
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
        ],
        url: pageUrl,
        description,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web browser",
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
            name: "AI Content Writer",
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
    <div className="min-h-screen bg-[#0B1120] px-3 pb-14 pt-5 text-slate-100 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
        }}
      />
      <div className="mx-auto max-w-[1600px]">
        {/* Top Flagship Brand Bar */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-indigo-500/25 bg-gradient-to-r from-[#0F172A] via-[#131F3A] to-[#172554] px-4 py-3 shadow-lg">
          <div className="flex flex-wrap items-center gap-3">
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-2 text-xs text-slate-300"
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
                AI Content Writer Studio
              </span>
            </nav>
            <span className="hidden items-center gap-1.5 rounded-full border border-indigo-400/30 bg-indigo-500/15 px-3 py-0.5 text-[11px] font-bold text-indigo-200 lg:inline-flex">
              <Sparkles className="h-3 w-3 text-amber-300" />
              Unified AI Content Writer · Blog Writer · Article Writer
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
            {!REQUIRE_AUTH_FOR_CONTENT_WRITER_STUDIO && (
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-400/40 bg-emerald-500/20 px-3 py-1 text-emerald-200">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
                Open Testing Mode · No Compulsory Sign-In
              </span>
            )}
            <span className="hidden items-center gap-1.5 rounded-xl border border-indigo-400/30 bg-indigo-500/15 px-3 py-1 text-indigo-200 sm:inline-flex">
              <FolderKanban className="h-3.5 w-3.5" />
              IndexedDB Multi-Project Studio
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
              Optional Sign In
            </Link>
            <a
              href="#writer-help"
              className="px-2 py-1 text-xs font-semibold text-indigo-300 hover:text-white hover:underline"
            >
              How it works ↓
            </a>
          </div>
        </div>

        <RecentUrlsProvider>
          <WriterWorkspace />
        </RecentUrlsProvider>

        <section
          id="writer-help"
          className="mx-auto mt-12 max-w-4xl text-slate-100"
        >
          <ToolFaq faqs={faqs} />
        </section>
      </div>
    </div>
  );
}
