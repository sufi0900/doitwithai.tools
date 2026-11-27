import ToolLandingHero from "@/features/tool-ui/ToolLandingHero";
import type { Metadata } from "next";
import Link from "next/link";
import {
  Code2,
  Compass,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import SeoOptimizerAgentClient from "@/features/seo-optimizer-ai-agent/SeoOptimizerAgentClient";
import ToolFaq from "@/features/tool-ui/ToolFaq";
import ToolResources from "@/features/tool-catalog/ToolResources";

const pageUrl = "https://doitwithai.tools/tools/seo-optimizer-ai-agent";
const title =
  "SEO & AEO Page Optimizer AI Agent | 5-Step Intent, Meta, AI Overview & Schema Chain";
const description =
  "Run an autonomous 5-step SEO & Answer Engine Optimization (AEO) AI Agent from 1 topic or URL: classify search intent, craft <580px meta tags, write a 50-word AI Overview Power Answer, audit E-E-A-T entity gaps, and export @graph JSON-LD schema.";

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
    question: "What does the SEO & AEO Page Optimizer AI Agent do in one run?",
    answer:
      "From a single keyword or live URL, the agent executes a 5-step chain: (1) classifies Search & AEO intent, (2) engineers a <580px meta title and single-sentence meta description, (3) drafts a ~50-word AI Overview Power Answer, (4) audits E-E-A-T entity gaps with copy-paste fixes, and (5) outputs linked @graph JSON-LD schema.",
  },
  {
    question: "How does this agent help with AI Agents for AEO content production?",
    answer:
      "Answer Engine Optimization (AEO) requires extractable, fact-dense passages and disambiguated entities. Step 3 and Step 5 format your opening definition and Schema.org @graph specifically for Google AI Overviews, ChatGPT Search, and Perplexity citations.",
  },
  {
    question: "Why does Step 2 enforce a <580px Meta Title limit?",
    answer:
      "Google truncates desktop title tags based on pixel width (~580pxâ€“600px), not just character count. Keeping your front-loaded keyword title below 580px prevents mid-word ellipses in SERPs.",
  },
  {
    question: "Can I use this for agent analytics and AI visibility products?",
    answer:
      "Yes. Whether you are optimizing SaaS product pages, AI visibility analytics tools, or technical guides, the agent adapts intent classification and schema entities to match your exact offer.",
  },
];

const section = "mx-auto max-w-6xl px-4 py-12 sm:px-6";
const prose = "mt-4 text-base leading-8 text-slate-600 dark:text-slate-300";

export default function SeoOptimizerAiAgentPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "SEO & AEO Page Optimizer AI Agent",
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
          { name: "SEO & AEO Page Optimizer Agent", item: pageUrl },
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
        slug="seo-optimizer-ai-agent"
        title="SEO & AEO Page Optimizer AI Agent"
        description="Execute a 5-step optimization chain from a single topic or live URL: classify search intent, engineer &lt;580px meta tags, draft a 50-word AI Overview Power Answer, audit E-E-A-T entity gaps, and export connected @graph JSON-LD schema."
        categoryLabel="AI SEO Tools"
        categoryHref="/tools"
        workspaceId="tool-studio-workspace"
      >
        <div className="p-4 sm:p-6">
          <SeoOptimizerAgentClient />
        </div>
      </ToolLandingHero>

      <section
        className={`${section} border-t border-slate-200 dark:border-slate-800`}
      >
        <p className="text-xs font-bold uppercase tracking-wider text-[#5271ff]">
          AI visibility &amp; AEO content production
        </p>
        <h2 className="mt-3 text-3xl font-extrabold">
          Why a 5-step SEO &amp; AEO chain outperforms single-prompt generators
        </h2>
        <p className={prose}>
          Ranking in traditional SERPs while earning citations in AI Overviews
          requires alignment across intent, pixel-safe metadata, extractable
          opening definitions, verifiable E-E-A-T signals, and structured data.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            [
              Compass,
              "Intent & Query Cluster Alignment",
              "Classifies whether your topic demands an interactive tool, comparison matrix, or step-by-step practitioner playbook.",
            ],
            [
              Sparkles,
              "50-Word AI Overview Power Answer",
              "Places a clean, self-contained definition block at the top of your page so RAG answer engines cite your URL directly.",
            ],
            [
              Code2,
              "E-E-A-T Proof + @graph JSON-LD",
              "Closes experience and authority entity gaps while outputting valid WebPage, Article, and FAQPage structured data.",
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

      <ToolResources slug="seo-optimizer-ai-agent" />
      <ToolFaq title="SEO & AEO Page Optimizer Agent questions" faqs={faqs} />
    </div>
  );
}
