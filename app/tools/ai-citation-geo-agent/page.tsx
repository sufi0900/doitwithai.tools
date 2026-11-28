import ToolLandingHero from "@/features/tool-ui/ToolLandingHero";
import type { Metadata } from "next";
import Link from "next/link";
import {
  BookOpen,
  Code2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import AiCitationGeoAgentClient from "@/features/ai-citation-geo-agent/AiCitationGeoAgentClient";
import ToolFaq from "@/features/tool-ui/ToolFaq";
import ToolResources from "@/features/tool-catalog/ToolResources";

const pageUrl = "https://doitwithai.tools/tools/ai-citation-geo-agent";
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
      "Generative Engine Optimization (GEO) structures your content so retrieval-augmented generation (RAG) systemsâ€”like Google AI Overviews, Perplexity, and ChatGPT Searchâ€”can extract and cite your facts without hallucination. This agent converts unstructured paragraphs into 50-word definition leads, Markdown comparison tables, and linked entity JSON-LD.",
  },
  {
    question: "Why do AI search engines prefer 45â€“58 word definition leads?",
    answer:
      "RAG pipelines split web pages into semantic retrieval chunks. A self-contained 45â€“58 word paragraph that starts with an explicit '[Topic] is...' definition scores highest on vector similarity and can be quoted directly with source attribution.",
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
          { name: "AI Tools", item: "https://doitwithai.tools/tools" },
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

      <ToolLandingHero
        slug="ai-citation-geo-agent"
        title="Generative Engine Optimization (GEO) & Citation Agent"
        description="Transform unstructured prose into high-density RAG retrieval assets. Generate 50-word direct definition leads, Markdown comparison matrices, empirical practitioner proof passages, and linked sameAs Knowledge Graph schema."
        categoryLabel="AI Search & GEO Agent Â"
        categoryHref="/tools"
        workspaceId="tool-studio-workspace"
      >
        <div className="p-4 sm:p-6">
          <AiCitationGeoAgentClient />
        </div>
      </ToolLandingHero>

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
