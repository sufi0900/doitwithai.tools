import type { Metadata } from "next";
import Link from "next/link";
import PortableToolHeroBar from "@/features/portable-tool-kit/PortableToolHeroBar";
import ToolFaq from "@/features/tool-ui/ToolFaq";
import ToolResources from "@/features/tool-catalog/ToolResources";
import { ToolHeroBackground, toolHeroHeading, toolHeroSurface } from "@/features/tool-ui/ToolHero";
import AiWorkflowBlueprintGeneratorClient from "@/features/ai-workflow-blueprint-generator/AiWorkflowBlueprintGeneratorClient";

const pageUrl = "https://doitwithai.tools/tools/ai-workflow-blueprint-generator";

export const metadata: Metadata = {
  title: "Free AI Workflow Blueprint Generator for Make, Zapier & n8n (2026)",
  description:
    "Design multi-step AI automation workflows across n8n, Make.com, and Zapier with trigger deduplication, structured LLM JSON outputs, and importable node blueprints.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Free AI Workflow Blueprint Generator for Make, Zapier & n8n",
    description:
      "Generate ready-to-import n8n, Make, and Zapier AI agent workflow blueprints in seconds.",
    url: pageUrl,
    type: "website"
  }
};

const faqs = [
  {
    question: "Should I build my AI automation workflow in n8n, Make, or Zapier?",
    answer:
      "Use Zapier for quick 2-step SaaS triggers, Make.com for visual branching and array iteration, and self-hosted or cloud n8n when building stateful multi-agent LLM workflows with custom webhook payloads."
  }
];

export default function AiWorkflowBlueprintGeneratorPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      <section className={`${toolHeroSurface} relative overflow-hidden border-b border-slate-800/80 py-8`}>
        <ToolHeroBackground />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="mb-3 flex items-center gap-2 text-xs text-slate-400">
            <Link href="/" className="hover:text-white">Home</Link>
            <span>/</span>
            <Link href="/tools" className="hover:text-white">Tools</Link>
            <span>/</span>
            <span className="text-indigo-400">AI Workflow Blueprint Generator</span>
          </nav>
          <div className="max-w-3xl space-y-3">
            <h1 className={`${toolHeroHeading} text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white`}>
              Free AI Workflow Blueprint Generator for{" "}
              <span className="bg-gradient-to-r from-indigo-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">
                Make, Zapier & n8n
              </span>
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Map your trigger app, AI reasoning prompt, and CRM/Slack destination into a structured node architecture and downloadable JSON blueprint.
            </p>
            <PortableToolHeroBar
              slug="ai-workflow-blueprint-generator"
              title="AI Workflow Blueprint Generator (Make, Zapier & n8n)"
              path="/tools/ai-workflow-blueprint-generator"
              primaryLabel="Use Tool Now: Build Workflow Blueprint"
              workspaceId="ai-workflow-blueprint-workspace"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6">
        <AiWorkflowBlueprintGeneratorClient />
      </section>

      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pt-16 space-y-10">
        <ToolResources slug="ai-workflow-blueprint-generator" />
        <ToolFaq title="AI Workflow Blueprint Generator FAQs" faqs={faqs} />
      </section>
    </main>
  );
}
