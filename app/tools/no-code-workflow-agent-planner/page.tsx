import type { Metadata } from "next";
import Link from "next/link";
import NoCodeWorkflowAgentPlannerPage from "@/app/agents/no-code-workflow-agent-planner/page";

const pageUrl = "https://doitwithai.tools/tools/no-code-workflow-agent-planner";
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
};

export default function ToolNoCodeWorkflowAgentPlannerPage() {
  return (
    <>
      <div className="sr-only">
        <Link href="/tools">All AI Tools</Link>
      </div>
      <NoCodeWorkflowAgentPlannerPage />
    </>
  );
}
