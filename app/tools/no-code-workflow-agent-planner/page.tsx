import ToolLandingHero from "@/features/tool-ui/ToolLandingHero";
import type { Metadata } from "next";
import Link from "next/link";
import {
  Code2,
  GitBranch,
  Sheet,
  ShieldCheck,
} from "lucide-react";
import NoCodeWorkflowAgentPlannerClient from "@/features/no-code-workflow-agent-planner/NoCodeWorkflowAgentPlannerClient";
import ToolFaq from "@/features/tool-ui/ToolFaq";
import ToolResources from "@/features/tool-catalog/ToolResources";

const pageUrl =
  "https://doitwithai.tools/tools/no-code-workflow-agent-planner";
const title =
  "No-Code Workflow & Capacity Planning AI Agent (n8n, Google Sheets, Calendar & Excel)";
const description =
  "Describe any repetitive business task (e.g., syncing Google Sheets leads to Google Calendar capacity & sending AI follow-ups) to generate a step-by-step no-code AI agent architecture, Excel/Sheets formulas, system prompts, and a downloadable n8n JSON workflow blueprint.";

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
      "How do I use the Google Calendar and Sheets API for a capacity planning AI agent?",
    answer:
      "Describe your intake sheet and team size in the planner. The agent designs a 4-node flow that triggers on new Google Sheets rows, queries Google Calendar free/busy availability across your team, assigns the slot via an AI agent node, and writes the event URL back to the sheet.",
  },
  {
    question:
      "How do I choose between n8n vs LangChain for AI agent orchestration?",
    answer:
      "Inside the 'Prompts & n8n vs LC' tab, you get a side-by-side matrix comparing setup speed, OAuth2 API handling, and memory management across visual n8n agents, code-first LangChain graphs, and native Google Sheets/Excel formulas.",
  },
  {
    question: "Does this include formulas for an Excel AI agent or Google Sheets?",
    answer:
      "Yes. The 'Sheets / Excel AI' tab provides copy-paste capacity utilization formulas, SLA deadline calculators (`LET` / `WORKDAY`), and a Google Apps Script webhook snippet.",
  },
  {
    question: "Can I import the generated blueprint directly into n8n?",
    answer:
      "Yes. Click 'Download n8n .JSON' or 'Copy n8n JSON' and paste it directly onto your n8n canvas to instantiate the trigger, Calendar check, LangChain AI Agent, and Sheets writeback nodes.",
  },
];

const section = "mx-auto max-w-6xl px-4 py-12 sm:px-6";
const prose = "mt-4 text-base leading-8 text-slate-600 dark:text-slate-300";

export default function NoCodeWorkflowAgentPlannerPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "No-Code Workflow & Capacity Planning AI Agent (n8n / Sheets)",
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
          { name: "No-Code Workflow & Capacity Planner", item: pageUrl },
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
        slug="no-code-workflow-agent-planner"
        title="No-Code Workflow & Capacity Planning AI Agent"
        description="Describe any repetitive business taskâ€”like syncing Google Sheets leads to Google Calendar capacity slots and sending AI follow-upsâ€”and get a step-by-step no-code agent architecture, Excel/Sheets formulas, system prompts, and a downloadable n8n workflow blueprint."
        categoryLabel="AI SEO Tools"
        categoryHref="/tools"
        workspaceId="tool-studio-workspace"
      >
        <div className="p-4 sm:p-6">
          <NoCodeWorkflowAgentPlannerClient />
        </div>
      </ToolLandingHero>

      <section
        className={`${section} border-t border-slate-200 dark:border-slate-800`}
      >
        <p className="text-xs font-bold uppercase tracking-wider text-[#5271ff]">
          Build AI agents and automate workflows without writing backend code
        </p>
        <h2 className="mt-3 text-3xl font-extrabold">
          Connect Google Sheets, Excel, and Google Calendar to autonomous AI agents
        </h2>
        <p className={prose}>
          Most operations bottlenecks live inside spreadsheets and team
          calendars. By combining n8n visual orchestration with Google Calendar
          availability checks and structured LLM prompts, non-coders can automate
          hours of manual scheduling and follow-up work.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            [
              GitBranch,
              "Visual n8n Agent Architecture",
              "Map triggers, free/busy lookups, AI classification nodes, and error fallbacks before building.",
            ],
            [
              Sheet,
              "Google Sheets & Excel AI Formulas",
              "Drop ready-made capacity utilization and SLA formulas straight into your existing spreadsheets.",
            ],
            [
              Code2,
              "1-Click n8n JSON Import",
              "Download a valid n8n workflow JSON file pre-configured with Google Sheets, Calendar, and AI Agent nodes.",
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

      <ToolResources slug="no-code-workflow-agent-planner" />
      <ToolFaq
        title="No-Code Workflow & Capacity Agent Planner questions"
        faqs={faqs}
      />
    </div>
  );
}
