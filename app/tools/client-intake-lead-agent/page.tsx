import ToolLandingHero from "@/features/tool-ui/ToolLandingHero";
import type { Metadata } from "next";
import Link from "next/link";
import {
  ListChecks,
  MessageSquare,
  ShieldCheck,
  Target,
} from "lucide-react";
import ClientIntakeLeadAgentClient from "@/features/client-intake-lead-agent/ClientIntakeLeadAgentClient";
import ToolFaq from "@/features/tool-ui/ToolFaq";
import ToolResources from "@/features/tool-catalog/ToolResources";

const pageUrl = "https://doitwithai.tools/tools/client-intake-lead-agent";
const title =
  "B2B Buyer-Fit & Client Intake AI Agent | ICP Scoring Rubric, 5-Step Flow & Voice Scripts";
const description =
  "Enter your B2B service offer and target buyer to generate a 100-point Ideal Buyer Fit (ICP) Scoring Rubric, a 5-step interactive Client Intake & Qualification Flow, onboarding & AI voice scripts, and a downloadable intake bot widget.";

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
    question: "How does the B2B sales research AI agent calculate Ideal Buyer Fit (ICP) scoring?",
    answer:
      "The agent creates a weighted 100-point rubric across 4 dimensions: Firmographic & Role Alignment (25 pts), Pain Severity & Urgency (25 pts), Budget Readiness (25 pts), and Technical Fit (25 pts)â€”automatically routing Tier-A buyers to your calendar.",
  },
  {
    question: "What are the best practices for an AI sales agent onboarding first message?",
    answer:
      "Instead of overwhelming prospects with a 20-field form, the agent opens with a single low-friction question (company URL + role) and promises a tailored buyer-fit scorecard in under 60 seconds.",
  },
  {
    question: "Does this include prompts for reliable AI voice agents for lead qualification?",
    answer:
      "Yes. Inside the 'Voice & Chat Scripts' tab, you get a low-latency (<600ms) consultative AI voice qualification script with opener, pain check, budget guardrail, and SMS booking link transfer.",
  },
  {
    question: "Can I embed the client intake AI agent directly on my agency or SaaS site?",
    answer:
      "Yes. Click 'Download Intake Bot (.HTML)' or copy the self-contained HTML/JS scoring widget to embed an interactive 60-second buyer qualification bot on any landing page.",
  },
];

const section = "mx-auto max-w-6xl px-4 py-12 sm:px-6";
const prose = "mt-4 text-base leading-8 text-slate-600 dark:text-slate-300";

export default function ClientIntakeLeadAgentPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "B2B Buyer-Fit & Client Intake AI Agent",
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
          { name: "B2B Buyer-Fit & Client Intake Agent", item: pageUrl },
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
        slug="client-intake-lead-agent"
        title="B2B Buyer-Fit & Client Intake AI Agent"
        description="Enter your service offer and target buyerâ€”our autonomous sales agent generates a 100-point Ideal Buyer Fit (ICP) Scoring Rubric, a 5-step interactive Client Intake & Qualification Flow, onboarding & AI voice scripts, and a downloadable intake bot widget."
        categoryLabel="AI SEO Tools"
        categoryHref="/tools"
        workspaceId="tool-studio-workspace"
      >
        <div className="p-4 sm:p-6">
          <ClientIntakeLeadAgentClient />
        </div>
      </ToolLandingHero>

      <section
        className={`${section} border-t border-slate-200 dark:border-slate-800`}
      >
        <p className="text-xs font-bold uppercase tracking-wider text-[#5271ff]">
          B2B sales research &amp; automated lead qualification
        </p>
        <h2 className="mt-3 text-3xl font-extrabold">
          Qualify high-intent B2B buyers before they hit your calendar
        </h2>
        <p className={prose}>
          Sales and agency founders lose hours every week on discovery calls
          with unqualified prospects. A structured ICP scoring rubric paired
          with a conversational 5-step intake flow filters for budget, urgency,
          and executive fit automatically.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            [
              Target,
              "Ideal Buyer Fit (ICP) Scoring",
              "Quantify firmographic fit, pain urgency, and budget alignment on a 100-point scale.",
            ],
            [
              ListChecks,
              "5-Step Client Intake Flow",
              "Replace static contact forms with an interactive 60-second qualification dialogue.",
            ],
            [
              MessageSquare,
              "Voice & Chat Qualification Scripts",
              "Deploy tested first-message hooks across website chat, LinkedIn outreach, and AI voice agents.",
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

      <ToolResources slug="client-intake-lead-agent" />
      <ToolFaq title="B2B Buyer-Fit & Client Intake Agent questions" faqs={faqs} />
    </div>
  );
}
