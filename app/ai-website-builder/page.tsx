import type { Metadata } from "next";
import Link from "next/link";
import WebsiteBuilderShowcase from "@/features/website-builder/start/WebsiteBuilderShowcase";
import ToolFaq from "@/features/tool-ui/ToolFaq";

const pageUrl = "https://doitwithai.tools/ai-website-builder";
const title =
  "AI Website Builder — 16 Flagship 2D Editorial, 3D WebGL & Voice Studio | DoItWithAI";
const description =
  "Launch your authority blog, personal brand, Ko-fi creator hub, SaaS landing page, or 3D interactive portfolio with Do It AI Agent and 1-click AI Content Writer article sync.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "ai website builder",
    "free ai website builder",
    "ai blog website builder",
    "voice directed website builder",
    "personal brand website builder",
    "3d portfolio website builder",
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
      "Why is the AI Website Builder a standalone root platform at /ai-website-builder instead of inside /tools?",
    answer:
      "Unlike single-purpose micro-utilities in /tools, the DoItWithAI Website Builder (/ai-website-builder) is a full multi-project SaaS website creation and publishing platform—featuring 16 specialized 2D editorial, Classic Blogger, Ko-fi Creator, Frosted Glassmorphism, SaaS, and 3D WebGL templates, live voice direction, Visitor AI Agent Q&A, and 1-click article publishing from /ai-content-writer.",
  },
  {
    question: "How is this connected to the AI Content Writer (/ai-content-writer)?",
    answer:
      "Write long-form E-E-A-T SEO articles, comparison matrices, FAQs, and 25-template section infographics in /ai-content-writer, then publish them directly onto any website created here in one click—automatically updating your live /p/[slug]/blog index and internal link graph.",
  },
  {
    question: "Can I test the Website Studio without signing in first?",
    answer:
      "Yes. Launch the open interactive studio demo at /ai-website-builder/studio/demo immediately in your browser, switch between all 16 templates, customize sections, and claim your draft into your Google workspace whenever you are ready to publish a live /p/[slug] URL.",
  },
  {
    question: "Do I keep full manual control alongside Do It AI Agent?",
    answer:
      "Yes. Every template, background, accent palette, 3D WebGL preset, navigation page, blog post, and case study can be edited manually with full revision history, undo/redo, and staged publishing.",
  },
];

export default function AiWebsiteBuilderPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["WebApplication", "SoftwareApplication"],
        name: "DoItWithAI Flagship AI Website Builder & Publishing Studio",
        alternateName: [
          "AI Website Builder",
          "AI Blog Website Builder",
          "DoItWithAI Website Studio",
        ],
        url: pageUrl,
        description,
        applicationCategory: "WebApplication",
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
            name: "AI Website Builder",
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
    <div className="bg-[#050816] text-slate-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
        }}
      />
      <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-2 text-xs text-slate-400"
        >
          <Link href="/" className="hover:text-white">
            Home
          </Link>
          <span>/</span>
          <span
            aria-current="page"
            className="font-semibold text-indigo-300"
          >
            AI Website Builder Platform
          </span>
        </nav>
      </div>

      <WebsiteBuilderShowcase />
      <ToolFaq title="Flagship AI Website Builder FAQ" faqs={faqs} />
    </div>
  );
}
