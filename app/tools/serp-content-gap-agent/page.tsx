import type { Metadata } from "next";
import Link from "next/link";
import SerpContentGapAgentPage from "@/app/agents/serp-content-gap-agent/page";

const pageUrl = "https://doitwithai.tools/tools/serp-content-gap-agent";
const title =
  "Free Competitor SERP Content Gap & Outranker Agent | Auto-Draft Missing H2s";
const description =
  "Compare your article outline against top SERP competitors, pinpoint missing subtopics and Information Gain gaps, and generate ready-to-paste H2/H3 Markdown sections.";

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

export default function ToolSerpContentGapAgentPage() {
  return (
    <>
      <div className="sr-only">
        <Link href="/tools">All AI Tools</Link>
      </div>
      <SerpContentGapAgentPage />
    </>
  );
}
