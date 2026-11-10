import type { Metadata } from "next";
import Link from "next/link";
import OmnichannelMarketingAgentPage from "@/app/agents/omnichannel-marketing-agent/page";

const pageUrl = "https://doitwithai.tools/tools/omnichannel-marketing-agent";
const title =
  "Free Omni-Channel Content Repurposing & Safe Marketing Agent | LinkedIn, X, Reddit & Email";
const description =
  "Turn one published blog post or tool URL into a complete, spam-safe 4-channel distribution campaign: LinkedIn post + carousel outline, X thread, value-first Reddit answer, and newsletter.";

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

export default function ToolOmnichannelMarketingAgentPage() {
  return (
    <>
      <div className="sr-only">
        <Link href="/tools">All AI Tools</Link>
      </div>
      <OmnichannelMarketingAgentPage />
    </>
  );
}
