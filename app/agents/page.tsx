import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Bot,
  Code2,
  Compass,
  Share2,
  ShieldCheck,
  Sparkles,
  Wrench,
} from "lucide-react";
import {
  ToolHeroBackground,
  toolHeroHeading,
  toolHeroSurface,
} from "@/features/tool-ui/ToolHero";

const pageUrl = "https://doitwithai.tools/agents";
const title =
  "Autonomous AI SEO & Digital Marketing Agents | Do It With AI Tools";
const description =
  "Run multi-step autonomous AI SEO, Generative Engine Optimization (GEO), SERP Content Gap, and White-Hat Omni-Channel Marketing Agents with human-in-the-loop control.";

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

const AGENTS = [
  {
    slug: "on-page-ai-seo-repair-agent",
    badge: "On-Page Technical & Editorial Agent",
    name: "Autonomous On-Page AI SEO Repair Agent",
    description:
      "Extract any live webpage URL, diagnose SERP pixel truncation, weak heading hierarchy, and missing schema—then compile a ready-to-deploy HTML <head> patch, 50-word Position Zero lead, and validated JSON-LD @graph.",
    deliverables: [
      "Pixel-checked Title (<580px) & Meta Description",
      "Before/After H1–H2 semantic refactors",
      "Drop-in HTML <head> + JSON-LD @graph patch",
    ],
    icon: Wrench,
  },
  {
    slug: "ai-citation-geo-agent",
    badge: "AI Search & RAG Citation Agent",
    name: "Generative Engine Optimization (GEO) & AI Citation Agent",
    description:
      "Refactor unstructured paragraphs into 45–58 word RAG definition leads, Markdown comparison fact matrices, empirical proof blocks, and disambiguated Person/Organization sameAs JSON-LD for AI Overviews and Perplexity.",
    deliverables: [
      "50-word copula definition lead (<aside>)",
      "Machine-readable Markdown comparison matrix",
      "Person + Organization sameAs Knowledge Graph",
    ],
    icon: Sparkles,
  },
  {
    slug: "serp-content-gap-agent",
    badge: "Competitive Content Outranker Agent",
    name: "Competitor SERP Content Gap & Outranker Agent",
    description:
      "Compare your current H2 outline against top-ranking SERP expectations, isolate missing subtopics and Information Gain opportunities, and automatically draft ready-to-paste H2/H3 Markdown sections + PAA answers.",
    deliverables: [
      "4 ready-to-paste missing H2/H3 Markdown sections",
      "First-hand Information Gain proof injection",
      "Concise People Also Ask (PAA) Q&A blocks",
    ],
    icon: Compass,
  },
  {
    slug: "omnichannel-marketing-agent",
    badge: "White-Hat Distribution Agent",
    name: "Omni-Channel Content Repurposing & Safe Marketing Agent",
    description:
      "Turn one published guide or free tool URL into a synchronized, shadowban-safe 4-channel distribution campaign: LinkedIn post + 6-slide carousel outline, 5-post X thread, value-first Reddit community reply, and newsletter.",
    deliverables: [
      "LinkedIn post + 6-slide carousel breakdown",
      "5-post character-checked X/Twitter thread",
      "90%-value-first Reddit reply + Email newsletter",
    ],
    icon: Share2,
  },
];

export default function AiAgentsHubPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: title,
    description,
    url: pageUrl,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: AGENTS.length,
      itemListElement: AGENTS.map((ag, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        name: ag.name,
        url: `${pageUrl}/${ag.slug}`,
      })),
    },
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
        <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
          <nav
            aria-label="Breadcrumb"
            className="mb-4 flex flex-wrap gap-2 text-xs text-slate-300"
          >
            <Link href="/">Home</Link>
            <span>/</span>
            <span aria-current="page">AI Agents</span>
          </nav>

          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-[#b4c3ff]">
              <Bot size={14} />
              Dedicated Agentic Workspace · Separate from Single-Task Tools
            </p>
            <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
              Autonomous AI SEO &amp;{" "}
              <span className={toolHeroHeading}>
                Digital Marketing Agents
              </span>
            </h1>
            <p className="mt-5 text-base leading-8 text-slate-300">
              While our{" "}
              <Link href="/tools" className="underline hover:text-white">
                90+ AI Tools
              </Link>{" "}
              solve single tasks, our <strong>Autonomous AI Agents</strong>{" "}
              execute complete multi-step workflows—crawling live URLs,
              diagnosing technical and topical gaps, and synthesizing
              ready-to-deploy code patches, RAG matrices, and multi-channel
              campaigns.
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-6 md:grid-cols-2">
          {AGENTS.map((agent) => {
            const Icon = agent.icon;
            return (
              <article
                key={agent.slug}
                className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-lg transition hover:border-[#5271ff] dark:border-slate-800 dark:bg-[#111A2E]"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-xl bg-[#3452d1]/10 px-3 py-1 text-xs font-extrabold text-[#3452d1] dark:bg-[#5271ff]/20 dark:text-[#b4c3ff]">
                      {agent.badge}
                    </span>
                    <Icon className="text-[#5271ff]" size={22} />
                  </div>

                  <h2 className="mt-4 text-xl font-black text-slate-900 dark:text-white">
                    <Link
                      href={`/agents/${agent.slug}`}
                      className="hover:text-[#3452d1] dark:hover:text-[#9aabff]"
                    >
                      {agent.name}
                    </Link>
                  </h2>

                  <p className="mt-2.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    {agent.description}
                  </p>

                  <ul className="mt-4 space-y-1.5 border-t border-slate-200 pt-4 text-xs text-slate-700 dark:border-slate-800 dark:text-slate-300">
                    {agent.deliverables.map((item) => (
                      <li key={item} className="flex items-center gap-2">
                        <ShieldCheck
                          size={14}
                          className="shrink-0 text-emerald-500"
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 pt-2">
                  <Link
                    href={`/agents/${agent.slug}`}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#3452d1] to-[#5271ff] px-5 py-3 text-xs font-extrabold text-white shadow transition hover:brightness-110"
                  >
                    Launch Autonomous Agent
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </main>
    </div>
  );
}
