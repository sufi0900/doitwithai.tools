import type { Metadata } from "next";
import Link from "next/link";
import ClientIntakeLeadAgentPage from "@/app/agents/client-intake-lead-agent/page";

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
};

export default function ToolClientIntakeLeadAgentPage() {
  return (
    <>
      <div className="sr-only">
        <Link href="/tools">All AI Tools</Link>
      </div>
      <ClientIntakeLeadAgentPage />
    </>
  );
}
