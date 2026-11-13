import type { Metadata } from "next";
import Link from "next/link";
import WebsiteBuilderShowcase from "@/features/website-builder/start/WebsiteBuilderShowcase";
import ToolFaq from "@/features/tool-ui/ToolFaq";

const pageUrl = "https://doitwithai.tools/tools/ai-website-builder";
const title =
  "AI Website Builder — 16 Flagship 2D & 3D Templates + Voice Agent | DoItWithAI";
const description =
  "Build SEO-ready blogs, SaaS product sites, and 3D interactive portfolios by voice or template with Do It AI Agent. Connected directly to AI Content Writer for 1-click article publishing.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "ai website builder",
    "ai blog website builder",
    "3d portfolio website builder",
    "voice directed website builder",
    "free ai website generator",
    "do it with ai website studio",
  ],
  alternates: { canonical: pageUrl },
  openGraph: {
    title,
    description,
    url: pageUrl,
    siteName: "DoItWithAI.tools",
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
      "How does the AI Website Builder connect with the AI Content Writer Studio?",
    answer:
      "Every website you create shares your unified DoItWithAI workspace session. Inside /ai-content-writer, you can push any completed article directly into your connected website's Blog Manager as a live post or private draft, while pulling your website's published posts into internal link suggestions.",
  },
  {
    question: "What templates are included in the builder?",
    answer:
      "There are 16 specialized templates across 4 categories: Blogging & SEO Media (led by DoItWithAI Editorial Flagship), Personal Brand & Creator, Startup & SaaS Product, and 3D Interactive & Spatial WebGL portfolios.",
  },
  {
    question: "Can I try the Website Studio before signing in?",
    answer:
      "Yes. You can launch the interactive studio demo at /do-it-ai/website-studio/demo immediately in your browser, customize themes and content, and claim your draft into your Google account whenever you are ready to publish a live /p/[slug] URL.",
  },
  {
    question: "What can Do It AI Agent edit by voice or text?",
    answer:
      "Do It AI Agent applies governed structural commands: updating hero copy, switching between all 16 templates, changing obsidian/midnight/ivory color themes and 3D scene motion, creating blog posts or case studies, undoing/redoing revisions, and opening the AI Content Writer Studio.",
  },
];

export default function ToolAiWebsiteBuilderPage() {
  return (
    <div className="bg-[#050816] text-slate-100">
      <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-2 text-xs text-slate-400"
        >
          <Link href="/" className="hover:text-white">
            Home
          </Link>
          <span>/</span>
          <Link href="/tools" className="hover:text-white">
            Tools
          </Link>
          <span>/</span>
          <span className="font-semibold text-indigo-300">
            AI Website Builder
          </span>
        </nav>
      </div>

      <WebsiteBuilderShowcase />
      <ToolFaq title="AI Website Builder Questions" faqs={faqs} />
    </div>
  );
}
