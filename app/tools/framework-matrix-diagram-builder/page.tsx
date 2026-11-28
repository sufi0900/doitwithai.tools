import type { Metadata } from "next";
import ToolLandingHero from "@/features/tool-ui/ToolLandingHero";
import Link from "next/link";
import {
  GitBranch,
  Layers,
  Sparkles,
} from "lucide-react";
import FrameworkMatrixDiagramBuilderClient from "@/features/framework-matrix-diagram-builder/FrameworkMatrixDiagramBuilderClient";
import ToolFaq from "@/features/tool-ui/ToolFaq";
import ToolResources from "@/features/tool-catalog/ToolResources";
import { PlatformBrandIcon } from "@/features/tool-ui/PlatformBrandIcon";

const pageUrl =
  "https://doitwithai.tools/tools/framework-matrix-diagram-builder";
const title =
  "Free AI 2x2 Matrix, SWOT, Flywheel & Strategic Diagram Builder";
const description =
  "Transform any blog URL, strategy brief, or idea into an editable 2x2 prioritization matrix, SWOT analysis board, circular growth flywheel, 3-pillar architecture, or hub-and-spoke diagram.";

export const metadata: Metadata = {
  title,
  description,
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
    question: "What types of strategic diagrams can I create with this studio?",
    answer:
      "You can switch live between 6 consulting-grade templates: (1) 2×2 Strategy Matrix (Effort vs. Impact), (2) SWOT 4-Quadrant Grid, (3) Circular Growth Flywheel, (4) 3-Pillar Architecture House, (5) Hub & Spoke Topic Cluster Map, and (6) Process Workflow Chain.",
  },
  {
    question: "Can I generate a diagram automatically from a blog post URL?",
    answer:
      "Yes! Paste any article URL at the top of the workspace to extract its core thesis and sub-topics, then switch between any of the 6 diagram templates.",
  },
  {
    question: "What resolution are the exported diagrams?",
    answer:
      "All diagrams render on a crisp 1200×1200 high-DPI canvas and can be downloaded as a PNG or bundled with a companion social media caption.",
  },
];

const section = "mx-auto max-w-6xl px-4 py-12 sm:px-6";
const prose = "mt-4 text-base leading-8 text-slate-600 dark:text-slate-300";

export default function FrameworkMatrixDiagramBuilderPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "AI 2x2 Matrix, SWOT, Flywheel & Strategic Diagram Studio",
        url: pageUrl,
        description,
        applicationCategory: "DesignApplication",
        operatingSystem: "Any",
        isAccessibleForFree: true,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { name: "Home", item: "https://doitwithai.tools" },
          { name: "Tools", item: "https://doitwithai.tools/tools" },
          { name: "Framework Matrix & Diagram Builder", item: pageUrl },
        ].map((item, i) => ({ "@type": "ListItem", position: i + 1, ...item })),
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
    <div className="bg-white text-slate-900 dark:bg-[#0F1523] dark:text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
        }}
      />

      <ToolLandingHero
        slug="framework-matrix-diagram-builder"
        title="AI 2×2 Matrix, SWOT & Strategy Diagram Builder"
        description="Turn complex ideas, SEO topic clusters, and strategy notes into consulting-grade 2×2 matrices, SWOT boards, circular growth flywheels, and 3-pillar architecture visuals."
        categoryLabel="Content Conversion"
        categoryHref="/tools"
        workspaceId="tool-studio-workspace"
      >
        <div className="p-4 sm:p-6">
          <FrameworkMatrixDiagramBuilderClient />
        </div>
      </ToolLandingHero>

      <section
        className={`${section} border-t border-slate-200 dark:border-slate-800`}
      >
        <h2 className="text-3xl font-extrabold">
          Visual mental models that earn executive saves and shares
        </h2>
        <p className={prose}>
          Founders, marketers, and educators consistently earn their highest
          bookmark rates when they package written advice into a clear 2×2
          matrix, circular flywheel, or 3-pillar architecture diagram.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            [
              GitBranch,
              "6 Consulting-Grade Diagrams",
              "Switch between 2×2 matrices, SWOT boards, flywheels, 3-pillar houses, hub-and-spoke maps, and workflows.",
            ],
            [
              Sparkles,
              "Custom Axes & Core Thesis",
              "Customize X/Y axis labels, quadrant badges, central hub titles, and color palettes in real time.",
            ],
            [
              Layers,
              "1200×1200 High-DPI Export",
              "Download crisp diagrams ready for LinkedIn feeds, slide decks, and pillar blog posts.",
            ],
          ].map(([Icon, heading, body]) => {
            const I = Icon as typeof GitBranch;
            return (
              <div
                key={String(heading)}
                className="rounded-2xl border border-slate-200 p-6 dark:border-slate-700"
              >
                <I aria-hidden className="text-[#5271ff]" size={22} />
                <h3 className="mt-4 text-lg font-bold">{String(heading)}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
                  {String(body)}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <ToolResources slug="framework-matrix-diagram-builder" />
      <ToolFaq title="Framework Matrix & Diagram Builder FAQs" faqs={faqs} />
    </div>
  );
}
