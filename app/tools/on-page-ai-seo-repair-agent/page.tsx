import type { Metadata } from "next";
import Link from "next/link";
import OnPageAiSeoRepairAgentPage from "@/app/agents/on-page-ai-seo-repair-agent/page";

const pageUrl = "https://doitwithai.tools/tools/on-page-ai-seo-repair-agent";
const title =
  "Free On-Page AI SEO Repair Agent | Auto-Fix Metadata, Headings & JSON-LD Patch";
const description =
  "Run an autonomous On-Page SEO Repair Agent on any URL. Diagnose pixel truncation, weak headings, and missing schema—then copy a ready-to-deploy HTML <head> and JSON-LD patch.";

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

export default function ToolOnPageAiSeoRepairAgentPage() {
  return (
    <>
      <div className="sr-only">
        <Link href="/tools">All AI Tools</Link>
      </div>
      <OnPageAiSeoRepairAgentPage />
    </>
  );
}
