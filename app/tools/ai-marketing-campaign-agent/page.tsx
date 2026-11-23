import type { Metadata } from "next";
import Link from "next/link";
import AiMarketingCampaignAgentPage from "@/app/agents/ai-marketing-campaign-agent/page";

const pageUrl = "https://doitwithai.tools/tools/ai-marketing-campaign-agent";
const title =
  "Omnichannel Content & Marketing Campaign AI Agent | Work Intake, Capacity Plan, Video & UTM Builder";
const description =
  "Turn one product launch or article brief into a complete marketing campaign: work-intake capacity/sprint plan, LinkedIn post + carousel, X thread, short-form video script, paid traffic ad copy angles, and UTM tracking links.";

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

export default function ToolAiMarketingCampaignAgentPage() {
  return (
    <>
      <div className="sr-only">
        <Link href="/tools">All AI Tools</Link>
      </div>
      <AiMarketingCampaignAgentPage />
    </>
  );
}
