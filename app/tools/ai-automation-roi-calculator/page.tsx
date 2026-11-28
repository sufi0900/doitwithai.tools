import type { Metadata } from "next";
import ToolLandingHero from "@/features/tool-ui/ToolLandingHero";
import Link from "next/link";
import ToolFaq from "@/features/tool-ui/ToolFaq";
import ToolResources from "@/features/tool-catalog/ToolResources";
import AiAutomationRoiCalculatorClient from "@/features/ai-automation-roi-calculator/AiAutomationRoiCalculatorClient";

const pageUrl = "https://doitwithai.tools/tools/ai-automation-roi-calculator";

export const metadata: Metadata = {
  title: "Free AI Automation ROI & Manual Task Hours Savings Calculator (2026)",
  description:
    "Calculate weekly and annual hours saved, net payroll cost reduction, and ROI multiples when automating repetitive manual tasks with AI agents, n8n, Make, or Zapier.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Free AI Automation ROI & Manual Task Hours Savings Calculator",
    description:
      "Model your exact annual payroll savings and ROI multiple from automating manual agency, SaaS, and e-commerce tasks.",
    url: pageUrl,
    type: "website"
  }
};

const faqs = [
  {
    question: "Which manual tasks deliver the highest AI automation ROI first?",
    answer:
      "Inbound lead qualification, CRM/spreadsheet data sync, customer support FAQ triage, and multi-channel content repurposing typically automate 70% to 85% of manual hours with payback in under 14 days."
  }
];

export default function AiAutomationRoiCalculatorPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100 pb-20">
      <ToolLandingHero
        slug="ai-automation-roi-calculator"
        title="Free AI Automation ROI & Manual Task Hours Savings Calculator"
        description="Quantify how many manual hours and payroll dollars your team or AI Automation Agency client saves by automating repetitive workflows across n8n, Make, Zapier, and LLM agents."
        categoryLabel="AI SEO Tools"
        categoryHref="/tools"
        workspaceId="tool-studio-workspace"
      >
        <div className="p-4 sm:p-6">
          <AiAutomationRoiCalculatorClient />
        </div>
      </ToolLandingHero>

      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pt-16 space-y-10">
        <ToolResources slug="ai-automation-roi-calculator" />
        <ToolFaq title="AI Automation ROI Calculator FAQs" faqs={faqs} />
      </section>
    </div>
  );
}
