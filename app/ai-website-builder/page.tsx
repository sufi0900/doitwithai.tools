import type { Metadata } from "next";
import Link from "next/link";
import WebsiteBuilderShowcase from "@/features/website-builder/start/WebsiteBuilderShowcase";
import ToolFaq from "@/features/tool-ui/ToolFaq";

const pageUrl = "https://doitwithai.tools/ai-website-builder";
const title =
  "AI Website Builder — 2D Editorial, 3D WebGL & Voice Studio | DoItWithAI";
const description =
  "Launch your authority blog, startup landing page, or 3D interactive portfolio with Do It AI Agent and 1-click AI Content Writer article sync.";

export const metadata: Metadata = {
  title,
  description,
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
    question: "How is this connected to AI Content Writer?",
    answer:
      "Write long-form SEO articles, infographics, and topic clusters in /ai-content-writer, then publish them directly onto any website created here in one click.",
  },
  {
    question: "Do I keep full manual control alongside Do It AI Agent?",
    answer:
      "Yes. Every template, background, accent palette, 3D WebGL preset, navigation page, blog post, and case study can be edited manually with full revision history, undo/redo, and staged publishing.",
  },
];

export default function AiWebsiteBuilderPage() {
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
          <Link href="/do-it-ai" className="hover:text-white">
            Workspace
          </Link>
          <span>/</span>
          <span className="font-semibold text-indigo-300">
            AI Website Builder
          </span>
        </nav>
      </div>

      <WebsiteBuilderShowcase />
      <ToolFaq title="Flagship Website Builder FAQ" faqs={faqs} />
    </div>
  );
}
