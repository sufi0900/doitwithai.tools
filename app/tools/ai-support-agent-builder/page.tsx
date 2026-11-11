import type { Metadata } from "next";
import Link from "next/link";
import AiSupportAgentBuilderPage from "@/app/agents/ai-support-agent-builder/page";

const pageUrl = "https://doitwithai.tools/tools/ai-support-agent-builder";
const title =
  "No-Code Docs-to-Chatbot Support Agent Builder | RAG Grounding & 1-Click HTML/React Export";
const description =
  "Deploy an AI support agent that answers strictly from internal docs, pricing, and FAQs without a technical team. Test-chat live on screen, set helpdesk escalation boundaries, and export a 1-click HTML or React chatbot.";

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

export default function ToolAiSupportAgentBuilderPage() {
  return (
    <>
      <div className="sr-only">
        <Link href="/tools">All AI Tools</Link>
      </div>
      <AiSupportAgentBuilderPage />
    </>
  );
}
