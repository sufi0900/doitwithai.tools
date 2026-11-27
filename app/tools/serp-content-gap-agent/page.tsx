import ToolLandingHero from "@/features/tool-ui/ToolLandingHero";
import type { Metadata } from "next";
import Link from "next/link";
import {
  Compass,
  Layers,
  ShieldCheck,
  Target,
} from "lucide-react";
import SerpContentGapAgentClient from "@/features/serp-content-gap-agent/SerpContentGapAgentClient";
import ToolFaq from "@/features/tool-ui/ToolFaq";
import ToolResources from "@/features/tool-catalog/ToolResources";

const pageUrl = "https://doitwithai.tools/tools/serp-content-gap-agent";
const title =
  "Free Competitor SERP Content Gap & Outranker Agent | Auto-Draft Missing H2s";
const description =
  "Compare your article outline against top SERP competitors, pinpoint missing subtopics and Information Gain gaps, and generate ready-to-paste H2/H3 Markdown sections.";

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
    question:
      "What does the Competitor SERP Content Gap & Outranker Agent do?",
    answer:
      "Instead of just showing a list of missing keywords, this agent compares your current H2 outline against top-ranking SERP subtopics and automatically drafts complete, editable H2/H3 Markdown sections and People Also Ask (PAA) answers so you can plug topical blind spots immediately.",
  },
  {
    question: "How does Information Gain help outrank higher-authority sites?",
    answer:
      "When every top-10 article repeats the same talking points, search and AI engines reward pages that contribute new practitioner data, edge-case troubleshooting, or interactive workflows (Information Gain).",
  },
  {
    question: "Can I import my existing blog post URL to check for gaps?",
    answer:
      "Yes. Paste your published URL into the top extractor bar to pull your current headings and focus keyword into the comparison workspace.",
  },
  {
    question: "Can I edit the generated H2 sections before exporting?",
    answer:
      "Yes. Every drafted gap section renders inside an interactive Markdown editor so you can customize examples before copying or downloading.",
  },
];

const section = "mx-auto max-w-6xl px-4 py-12 sm:px-6";
const prose = "mt-4 text-base leading-8 text-slate-600 dark:text-slate-300";

export default function SerpContentGapAgentPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "Competitor SERP Content Gap & Outranker Agent",
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
          { name: "Home", item: "https://doitwithai.tools" },
          { name: "AI Tools", item: "https://doitwithai.tools/tools" },
          { name: "SERP Content Gap Agent", item: pageUrl },
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
        slug="serp-content-gap-agent"
        title="Competitor SERP Content Gap & Outranker Agent"
        description="Find what top-ranking pages cover that your draft missedâ€”and automatically write the exact H2/H3 sections, Information Gain proof blocks, and People Also Ask (PAA) answers needed to complete your article."
        categoryLabel="Competitive SEO Agent Â"
        categoryHref="/tools"
        workspaceId="tool-studio-workspace"
      >
        <div className="p-4 sm:p-6">
          <SerpContentGapAgentClient />
        </div>
      </ToolLandingHero>

      <section
        className={`${section} border-t border-slate-200 dark:border-slate-800`}
      >
        <p className="text-xs font-bold uppercase tracking-wider text-[#5271ff]">
          Topical completeness + Information Gain
        </p>
        <h2 className="mt-3 text-3xl font-extrabold">
          Turn Page-2 articles into comprehensive, first-page authorities
        </h2>
        <p className={prose}>
          Most articles stall in positions 8â€“20 because they leave out critical
          sub-questions that searchers expect to find on the page. By closing
          foundational SERP gaps and layering in first-hand practitioner proof,
          you give search engines a clear reason to promote your URL.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            [
              Target,
              "Pinpoint Missing Subtopics",
              "Compare your current H2 structure against competitor themes to spot blind spots in seconds.",
            ],
            [
              Layers,
              "Generate Drop-In H2 Sections",
              "Skip writer's block with structured, editable Markdown sections tailored to your target keyword and audience.",
            ],
            [
              Compass,
              "Capture People Also Ask (PAA)",
              "Add concise 40-word Q&A blocks at the bottom of your guide to win long-tail voice and AI search queries.",
            ],
          ].map(([Icon, heading, body]) => {
            const I = Icon as typeof ShieldCheck;
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

      <ToolResources slug="serp-content-gap-agent" />
      <ToolFaq title="SERP Content Gap & Outranker Agent questions" faqs={faqs} />
    </div>
  );
}
