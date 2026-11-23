import type { Metadata } from "next";
import Link from "next/link";
import SeoOptimizerAiAgentPage from "@/app/agents/seo-optimizer-ai-agent/page";

const pageUrl = "https://doitwithai.tools/tools/seo-optimizer-ai-agent";
const title =
  "SEO & AEO Page Optimizer AI Agent | 5-Step Intent, Meta, AI Overview & Schema Chain";
const description =
  "Run an autonomous 5-step SEO & Answer Engine Optimization (AEO) AI Agent from 1 topic or URL: classify search intent, craft <580px meta tags, write a 50-word AI Overview Power Answer, audit E-E-A-T entity gaps, and export @graph JSON-LD schema.";

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

export default function ToolSeoOptimizerAiAgentPage() {
  return (
    <>
      <div className="sr-only">
        <Link href="/tools">All AI Tools</Link>
      </div>
      <SeoOptimizerAiAgentPage />
    </>
  );
}
