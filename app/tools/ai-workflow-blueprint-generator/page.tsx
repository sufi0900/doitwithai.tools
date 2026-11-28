import type { Metadata } from "next";
import ToolLandingHero from "@/features/tool-ui/ToolLandingHero";
import Link from "next/link";
import ToolFaq from "@/features/tool-ui/ToolFaq";
import ToolResources from "@/features/tool-catalog/ToolResources";
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
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100 pb-20">
      <ToolLandingHero
        slug="ai-workflow-blueprint-generator"
        title="Free AI Workflow Blueprint Generator for Make, Zapier & n8n"
        description="Map your trigger app, AI reasoning prompt, and CRM/Slack destination into a structured node architecture and downloadable JSON blueprint."
        categoryLabel="AI SEO Tools"
        categoryHref="/tools"
        workspaceId="tool-studio-workspace"
      >
        <div className="p-4 sm:p-6">
          <AiWorkflowBlueprintGeneratorClient />
        </div>
      </ToolLandingHero>

      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pt-16 space-y-10">
        <ToolResources slug="ai-workflow-blueprint-generator" />
        <ToolFaq title="AI Workflow Blueprint Generator FAQs" faqs={faqs} />
      </section>
    </div>
  );
}
