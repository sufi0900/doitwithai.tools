import type { Metadata } from "next";
import Link from "next/link";
import { Compass, Layers, ShieldCheck, Target } from "lucide-react";
import SerpContentGapAgentClient from "@/features/serp-content-gap-agent/SerpContentGapAgentClient";
import PortableToolHeroBar from "@/features/portable-tool-kit/PortableToolHeroBar";
import ToolFaq from "@/features/tool-ui/ToolFaq";
import ToolResources from "@/features/tool-catalog/ToolResources";
import {
  ToolHeroBackground,
  toolHeroHeading,
  toolHeroSurface,
} from "@/features/tool-ui/ToolHero";

const pageUrl = "https://doitwithai.tools/agents/serp-content-gap-agent";
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
          { name: "AI Agents", item: "https://doitwithai.tools/agents" },
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

      <header
        className={`relative overflow-hidden ${toolHeroSurface} text-white`}
      >
        <ToolHeroBackground />
        <div className="relative mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
          <nav
            aria-label="Breadcrumb"
            className="mb-4 flex flex-wrap gap-2 text-xs text-slate-300"
          >
            <Link href="/">Home</Link>
            <span>/</span>
            <Link href="/agents">AI Agents</Link>
            <span>/</span>
            <span aria-current="page">SERP Content Gap Agent</span>
          </nav>

          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.85fr)]">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#b4c3ff]">
                Competitive SEO Agent · Plug Subtopic Blind Spots &amp; Outrank
              </p>
              <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                Competitor SERP{" "}
                <span className={toolHeroHeading}>
                  Content Gap &amp; Outranker Agent
                </span>
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
                Find what top-ranking pages cover that your draft missed—and
                automatically write the exact H2/H3 sections, Information Gain
                proof blocks, and People Also Ask (PAA) answers needed to
                complete your article.
              </p>
              <div className="mt-7 flex flex-wrap gap-3 text-xs font-semibold text-slate-200">
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  Auto-drafts missing H2/H3 sections
                </span>
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  Information Gain angle injection
                </span>
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  People Also Ask (PAA) Q&amp;A blocks
                </span>
              </div>
              <PortableToolHeroBar slug="serp-content-gap-agent" />
            </div>

            <div className="rounded-2xl border border-[#9aabff]/30 bg-[#101b30]/90 p-6 shadow-xl">
              <p className="text-xs font-bold uppercase tracking-wider text-[#b4c3ff]">
                How the Outranker Agent Works
              </p>
              <ul className="mt-4 space-y-2.5 text-xs text-slate-300">
                <li>
                  <strong className="text-emerald-300">
                    1. Intent Alignment:
                  </strong>{" "}
                  Maps your outline against dominant SERP expectations.
                </li>
                <li>
                  <strong className="text-indigo-300">
                    2. Subtopic Gap Detection:
                  </strong>{" "}
                  Isolates high-priority headings your draft omits.
                </li>
                <li>
                  <strong className="text-sky-300">
                    3. Information Gain Synthesis:
                  </strong>{" "}
                  Weaves your unique practitioner angle into each new section.
                </li>
                <li>
                  <strong className="text-amber-300">
                    4. Ready-to-Paste Markdown:
                  </strong>{" "}
                  Outputs editable H2 blocks and PAA answers in one click.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </header>

      <SerpContentGapAgentClient />

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
          Most articles stall in positions 8–20 because they leave out critical
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
