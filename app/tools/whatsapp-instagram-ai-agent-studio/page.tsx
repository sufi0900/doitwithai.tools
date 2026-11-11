import type { Metadata } from "next";
import Link from "next/link";
import WhatsappInstagramAiAgentStudioPage from "@/app/agents/whatsapp-instagram-ai-agent-studio/page";

const pageUrl =
  "https://doitwithai.tools/tools/whatsapp-instagram-ai-agent-studio";
const title =
  "WhatsApp, Telegram & Instagram DM Sales Agent Studio | ManyChat & n8n JSON Templates";
const description =
  "Build automated conversational Instagram Shop DM, WhatsApp Business, and Telegram flows for price inquiries, booking, objection handling, and community management—with copy-paste ManyChat and n8n JSON templates.";

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

export default function ToolWhatsappInstagramAiAgentStudioPage() {
  return (
    <>
      <div className="sr-only">
        <Link href="/tools">All AI Tools</Link>
      </div>
      <WhatsappInstagramAiAgentStudioPage />
    </>
  );
}
