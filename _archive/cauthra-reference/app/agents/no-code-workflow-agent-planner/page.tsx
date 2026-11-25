import type { Metadata } from "next";
import Link from "next/link";
import { Code2, GitBranch, Sheet, ShieldCheck } from "lucide-react";
import NoCodeWorkflowAgentPlannerClient from "@/features/no-code-workflow-agent-planner/NoCodeWorkflowAgentPlannerClient";
import PortableToolHeroBar from "@/features/portable-tool-kit/PortableToolHeroBar";
import ToolFaq from "@/features/tool-ui/ToolFaq";
import ToolResources from "@/features/tool-catalog/ToolResources";
import {
  ToolHeroBackground,
  toolHeroHeading,
  toolHeroSurface,
} from "@/features/tool-ui/ToolHero";

const pageUrl =
  "https://doitwithai.tools/agents/no-code-workflow-agent-planner";
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
          { name: "AI Agents", item: "https://doitwithai.tools/agents" },
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
            <span aria-current="page">
              No-Code Workflow &amp; Capacity Planner
            </span>
          </nav>

          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.85fr)]">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#b4c3ff]">
                n8n, Google Sheets, Calendar API &amp; Excel AI Orchestration Studio
              </p>
              <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                No-Code Workflow &amp;{" "}
                <span className={toolHeroHeading}>
                  Capacity Planning AI Agent
                </span>
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
                Describe any repetitive business task—like syncing Google Sheets
                leads to Google Calendar capacity slots and sending AI
                follow-ups—and get a step-by-step no-code agent architecture,
                Excel/Sheets formulas, system prompts, and a downloadable n8n
                workflow blueprint.
              </p>
              <div className="mt-7 flex flex-wrap gap-3 text-xs font-semibold text-slate-200">
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  Sheets &amp; Calendar API Capacity Sync
                </span>
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  Excel AI &amp; Apps Script Formulas
                </span>
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  Downloadable n8n .JSON Blueprint
                </span>
              </div>
              <PortableToolHeroBar slug="no-code-workflow-agent-planner" />
            </div>

            <div className="rounded-2xl border border-[#9aabff]/30 bg-[#101b30]/90 p-6 shadow-xl">
              <p className="text-xs font-bold uppercase tracking-wider text-[#b4c3ff]">
                Plain-English Task → Ready-to-Import n8n + Sheets Blueprint
              </p>
              <ul className="mt-4 space-y-2.5 text-xs text-slate-300">
                <li>
                  <strong className="text-emerald-300">
                    1. 4-Node Agent Architecture:
                  </strong>{" "}
                  Trigger deduplication, Calendar free/busy check, AI reasoning,
                  and writeback.
                </li>
                <li>
                  <strong className="text-indigo-300">
                    2. Sheets &amp; Excel Formulas:
                  </strong>{" "}
                  Copy-paste capacity overload flags and SLA deadline formulas.
                </li>
                <li>
                  <strong className="text-sky-300">
                    3. n8n vs. LangChain Matrix:
                  </strong>{" "}
                  Clear architectural guidance for non-coders and technical ops.
                </li>
                <li>
                  <strong className="text-amber-300">
                    4. Importable n8n JSON:
                  </strong>{" "}
                  One-click workflow blueprint with pre-wired LangChain agent
                  prompts.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </header>

      <NoCodeWorkflowAgentPlannerClient />

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
