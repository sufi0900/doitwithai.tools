import type { Metadata } from "next";
import Link from "next/link";
import PortableToolHeroBar from "@/features/portable-tool-kit/PortableToolHeroBar";
import ToolFaq from "@/features/tool-ui/ToolFaq";
import ToolResources from "@/features/tool-catalog/ToolResources";
import { ToolHeroBackground, toolHeroHeading, toolHeroSurface } from "@/features/tool-ui/ToolHero";
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
    <main className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      <section className={`${toolHeroSurface} relative overflow-hidden border-b border-slate-800/80 py-8`}>
        <ToolHeroBackground />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="mb-3 flex items-center gap-2 text-xs text-slate-400">
            <Link href="/" className="hover:text-white">Home</Link>
            <span>/</span>
            <Link href="/tools" className="hover:text-white">Tools</Link>
            <span>/</span>
            <span className="text-indigo-400">AI Automation ROI Calculator</span>
          </nav>
          <div className="max-w-3xl space-y-3">
            <h1 className={`${toolHeroHeading} text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white`}>
              Free AI Automation ROI &{" "}
              <span className="bg-gradient-to-r from-indigo-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">
                Manual Task Hours Savings Calculator
              </span>
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Quantify how many manual hours and payroll dollars your team or AI Automation Agency client saves by automating repetitive workflows across n8n, Make, Zapier, and LLM agents.
            </p>
            <PortableToolHeroBar
              slug="ai-automation-roi-calculator"
              title="AI Automation ROI & Manual Task Hours Calculator"
              path="/tools/ai-automation-roi-calculator"
              primaryLabel="Use Tool Now: Calculate Hours & Cost Saved"
              workspaceId="ai-automation-roi-workspace"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6">
        <AiAutomationRoiCalculatorClient />
      </section>

      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pt-16 space-y-10">
        <ToolResources slug="ai-automation-roi-calculator" />
        <ToolFaq title="AI Automation ROI Calculator FAQs" faqs={faqs} />
      </section>
    </main>
  );
}
