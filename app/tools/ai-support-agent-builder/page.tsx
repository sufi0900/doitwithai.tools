import ToolLandingHero from "@/features/tool-ui/ToolLandingHero";
import type { Metadata } from "next";
import Link from "next/link";
import {
  Bot,
  Code2,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";
import SupportAgentBuilderClient from "@/features/ai-support-agent-builder/SupportAgentBuilderClient";
import ToolFaq from "@/features/tool-ui/ToolFaq";
import ToolResources from "@/features/tool-catalog/ToolResources";

const pageUrl = "https://doitwithai.tools/tools/ai-support-agent-builder";
const title =
  "No-Code Docs-to-Chatbot Support Agent Builder | RAG Grounding & 1-Click HTML/React Export";
const description =
  "Deploy an AI support agent that answers strictly from internal docs, pricing, and FAQs without a technical team. Test-chat live on screen, set helpdesk escalation boundaries, and export a 1-click HTML or React chatbot.";

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
    question: "How do I build an AI support agent that can answer from internal docs without hallucinating?",
    answer:
      "Paste your verified company FAQs, pricing tiers, or help center docs into the builder. The agent chunks your content into grounded RAG Q&A pairs and generates a strict system prompt that refuses to speculate outside your documented policies.",
  },
  {
    question: "Can I deploy this AI support agent without a technical team?",
    answer:
      "Yes. Once you test the chatbot live on screen, click 'Copy Embed HTML' or 'Download .HTML Widget' and paste the snippet into WordPress, Webflow, Shopify, or any website footerâ€”no backend servers required.",
  },
  {
    question: "Does this support agent integrate with common helpdesks like Zendesk, Intercom, or HubSpot?",
    answer:
      "Yes. You can configure your escalation target so any out-of-scope, billing, or human-requested inquiry immediately routes to your Zendesk, Intercom, HubSpot, or support email workflow.",
  },
  {
    question: "Why is this the best AI user support agent setup for SaaS companies?",
    answer:
      "SaaS teams need instant answers for onboarding, API setup, and pricing while protecting SLA and refund boundaries. You get both a live test sandbox and a clean React/Next.js component export.",
  },
];

const section = "mx-auto max-w-6xl px-4 py-12 sm:px-6";
const prose = "mt-4 text-base leading-8 text-slate-600 dark:text-slate-300";

export default function AiSupportAgentBuilderPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "No-Code Docs-to-Chatbot Support Agent Builder",
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
          { name: "No-Code Support Agent Builder", item: pageUrl },
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
        slug="ai-support-agent-builder"
        title="No-Code Docs-to-Chatbot Support Agent Builder"
        description="Paste your company FAQs, pricing tiers, or internal docsâ€”our autonomous builder structures your RAG knowledge base, enforces strict domain boundaries, lets you test-chat live on screen, and exports a 1-click embeddable HTML or React chatbot."
        categoryLabel="AI SEO Tools"
        categoryHref="/tools"
        workspaceId="tool-studio-workspace"
      >
        <div className="p-4 sm:p-6">
          <SupportAgentBuilderClient />
        </div>
      </ToolLandingHero>

      <section
        className={`${section} border-t border-slate-200 dark:border-slate-800`}
      >
        <p className="text-xs font-bold uppercase tracking-wider text-[#5271ff]">
          Deploy AI agents without a technical team
        </p>
        <h2 className="mt-3 text-3xl font-extrabold">
          Grounded SaaS &amp; helpdesk customer support in minutes
        </h2>
        <p className={prose}>
          Generic chatbots frustrate users when they guess answers. By grounding
          every response in your explicit documentation chunks and routing edge
          cases to your human helpdesk, you resolve repetitive tickets safely.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            [
              Bot,
              "Strict Internal Docs Grounding",
              "Every answer maps back to a verified pricing, onboarding, or policy chunk in your knowledge base.",
            ],
            [
              MessageSquare,
              "Live Sandbox Verification",
              "Test both in-scope customer questions and out-of-scope edge cases right on screen before embedding.",
            ],
            [
              Code2,
              "1-Click HTML & React Export",
              "Copy a self-contained HTML/JS snippet for any CMS or a typed React component for Next.js apps.",
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

      <ToolResources slug="ai-support-agent-builder" />
      <ToolFaq title="No-Code Support Agent Builder questions" faqs={faqs} />
    </div>
  );
}
