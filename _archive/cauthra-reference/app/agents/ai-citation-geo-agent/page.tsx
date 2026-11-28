import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Code2, ShieldCheck, Sparkles } from "lucide-react";
import AiCitationGeoAgentClient from "@/features/ai-citation-geo-agent/AiCitationGeoAgentClient";
import PortableToolHeroBar from "@/features/portable-tool-kit/PortableToolHeroBar";
import ToolFaq from "@/features/tool-ui/ToolFaq";
import ToolResources from "@/features/tool-catalog/ToolResources";
import {
  ToolHeroBackground,
  toolHeroHeading,
  toolHeroSurface,
} from "@/features/tool-ui/ToolHero";

const pageUrl = "https://doitwithai.tools/agents/ai-citation-geo-agent";
const title =
  "Free AI Citation & GEO Agent | Optimize for AI Overviews, Perplexity & RAG";
const description =
  "Refactor unstructured paragraphs into 50-word RAG definition leads, Markdown comparison matrices, quotable data passages, and disambiguated Person/Organization sameAs JSON-LD.";

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
      "What is Generative Engine Optimization (GEO) and how does this agent help?",
    answer:
      "Generative Engine Optimization (GEO) structures your content so retrieval-augmented generation (RAG) systems—like Google AI Overviews, Perplexity, and ChatGPT Search—can extract and cite your facts without hallucination. This agent converts unstructured paragraphs into 50-word definition leads, Markdown comparison tables, and linked entity JSON-LD.",
  },
  {
    question: "Why do AI search engines prefer 45–58 word definition leads?",
    answer:
      "RAG pipelines split web pages into semantic retrieval chunks. A self-contained 45–58 word paragraph that starts with an explicit '[Topic] is...' definition scores highest on vector similarity and can be quoted directly with source attribution.",
  },
  {
    question:
      "How does the Person and Organization sameAs JSON-LD graph improve citations?",
    answer:
      "Connecting your author byline to verified external URLs (LinkedIn, GitHub, Dev.to, Wikidata) inside a unified Schema.org @graph disambiguates your identity in Knowledge Graphs, signaling accountable human expertise.",
  },
  {
    question: "Can I extract an existing blog post URL to upgrade it for GEO?",
    answer:
      "Yes. Paste any live article URL into the top extractor bar to pull its topic and opening paragraphs directly into the GEO refactoring studio.",
  },
];

const section = "mx-auto max-w-6xl px-4 py-12 sm:px-6";
const prose = "mt-4 text-base leading-8 text-slate-600 dark:text-slate-300";

export default function AiCitationGeoAgentPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "Generative Engine Optimization (GEO) & AI Citation Agent",
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
          { name: "AI Citation & GEO Agent", item: pageUrl },
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
            <span aria-current="page">AI Citation &amp; GEO Agent</span>
          </nav>

          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.85fr)]">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#b4c3ff]">
                AI Search &amp; GEO Agent · Perplexity, ChatGPT &amp; AI Overviews
              </p>
              <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                Generative Engine Optimization{" "}
                <span className={toolHeroHeading}>
                  (GEO) &amp; Citation Agent
                </span>
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
                Transform unstructured prose into high-density RAG retrieval
                assets. Generate 50-word direct definition leads, Markdown
                comparison matrices, empirical practitioner proof passages, and
                linked <code>sameAs</code> Knowledge Graph schema.
              </p>
              <div className="mt-7 flex flex-wrap gap-3 text-xs font-semibold text-slate-200">
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  50-word RAG definition leads
                </span>
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  Markdown fact &amp; comparison matrices
                </span>
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  Person + Organization sameAs JSON-LD
                </span>
              </div>
              <PortableToolHeroBar slug="ai-citation-geo-agent" />
            </div>

            <div className="rounded-2xl border border-[#9aabff]/30 bg-[#101b30]/90 p-6 shadow-xl">
              <p className="text-xs font-bold uppercase tracking-wider text-[#b4c3ff]">
                4 Pillars of AI Search Citation
              </p>
              <ul className="mt-4 space-y-2.5 text-xs text-slate-300">
                <li>
                  <strong className="text-emerald-300">
                    Copula Definition Lead:
                  </strong>{" "}
                  45–58 word direct answer passage for zero-click synthesis.
                </li>
                <li>
                  <strong className="text-indigo-300">
                    Structured Fact Matrix:
                  </strong>{" "}
                  Markdown comparison table for grounded LLM extraction.
                </li>
                <li>
                  <strong className="text-sky-300">
                    Practitioner Proof:
                  </strong>{" "}
                  Quantitative first-hand testing metrics (Information Gain).
                </li>
                <li>
                  <strong className="text-amber-300">
                    Entity Disambiguation:
                  </strong>{" "}
                  Unified <code>@graph</code> linking author and verified profiles.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </header>

      <AiCitationGeoAgentClient />

      <section
        className={`${section} border-t border-slate-200 dark:border-slate-800`}
      >
        <p className="text-xs font-bold uppercase tracking-wider text-[#5271ff]">
          Built for Retrieval-Augmented Generation (RAG)
        </p>
        <h2 className="mt-3 text-3xl font-extrabold">
          Make your articles the primary source quoted by AI answer engines
        </h2>
        <p className={prose}>
          AI search engines do not rank pages by backlink volume alone; they
          retrieve specific passages that directly define concepts, compare
          alternatives in clean tables, and verify authorship through structured
          entity graphs.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            [
              Sparkles,
              "Refactor Fluffy Intros into RAG Chunks",
              "Replace generic throat-clearing introductions with self-contained 50-word definition blocks calibrated for vector retrieval.",
            ],
            [
              BookOpen,
              "Synthesize Grounded Fact Matrices",
              "Convert scattered bullet points into structured Markdown comparison tables that LLMs can cite without hallucinating.",
            ],
            [
              Code2,
              "Connect Your Knowledge Graph Identity",
              "Generate a clean Person + Organization + TechArticle JSON-LD @graph with verified sameAs social and directory links.",
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

      <ToolResources slug="ai-citation-geo-agent" />
      <ToolFaq title="AI Citation & GEO Agent questions" faqs={faqs} />
    </div>
  );
}
