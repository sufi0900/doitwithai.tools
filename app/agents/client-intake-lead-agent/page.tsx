import type { Metadata } from "next";
import Link from "next/link";
import { ListChecks, MessageSquare, ShieldCheck, Target } from "lucide-react";
import ClientIntakeLeadAgentClient from "@/features/client-intake-lead-agent/ClientIntakeLeadAgentClient";
import PortableToolHeroBar from "@/features/portable-tool-kit/PortableToolHeroBar";
import ToolFaq from "@/features/tool-ui/ToolFaq";
import ToolResources from "@/features/tool-catalog/ToolResources";
import {
  ToolHeroBackground,
  toolHeroHeading,
  toolHeroSurface,
} from "@/features/tool-ui/ToolHero";

const pageUrl = "https://doitwithai.tools/agents/client-intake-lead-agent";
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
      "The agent creates a weighted 100-point rubric across 4 dimensions: Firmographic & Role Alignment (25 pts), Pain Severity & Urgency (25 pts), Budget Readiness (25 pts), and Technical Fit (25 pts)—automatically routing Tier-A buyers to your calendar.",
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
          { name: "AI Agents", item: "https://doitwithai.tools/agents" },
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
            <span aria-current="page">B2B Buyer-Fit &amp; Client Intake Agent</span>
          </nav>

          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.85fr)]">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#b4c3ff]">
                B2B Lead-Gen, ICP Scoring &amp; Voice/Chat Qualification Studio
              </p>
              <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                B2B Buyer-Fit &amp;{" "}
                <span className={toolHeroHeading}>
                  Client Intake AI Agent
                </span>
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
                Enter your service offer and target buyer—our autonomous sales
                agent generates a 100-point Ideal Buyer Fit (ICP) Scoring
                Rubric, a 5-step interactive Client Intake &amp; Qualification
                Flow, onboarding &amp; AI voice scripts, and a downloadable
                intake bot widget.
              </p>
              <div className="mt-7 flex flex-wrap gap-3 text-xs font-semibold text-slate-200">
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  100-Point ICP Fit Rubric
                </span>
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  5-Step Client Intake Flow
                </span>
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  Voice Scripts + HTML Bot Widget
                </span>
              </div>
              <PortableToolHeroBar slug="client-intake-lead-agent" />
            </div>

            <div className="rounded-2xl border border-[#9aabff]/30 bg-[#101b30]/90 p-6 shadow-xl">
              <p className="text-xs font-bold uppercase tracking-wider text-[#b4c3ff]">
                1 Service Offer → Complete Qualification Engine
              </p>
              <ul className="mt-4 space-y-2.5 text-xs text-slate-300">
                <li>
                  <strong className="text-emerald-300">
                    1. ICP Buyer-Fit Rubric:
                  </strong>{" "}
                  4-pillar scoring matrix with red-flag disqualifiers.
                </li>
                <li>
                  <strong className="text-indigo-300">
                    2. 5-Step Intake Flow:
                  </strong>{" "}
                  Conversational prompts that route Tier-A leads to your calendar.
                </li>
                <li>
                  <strong className="text-sky-300">
                    3. Onboarding &amp; Voice Scripts:
                  </strong>{" "}
                  First-message best practices + AI voice qualification prompt.
                </li>
                <li>
                  <strong className="text-amber-300">
                    4. Embeddable Intake Bot:
                  </strong>{" "}
                  Downloadable HTML/JS qualification calculator widget.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </header>

      <ClientIntakeLeadAgentClient />

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
