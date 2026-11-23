import type { Metadata } from "next";
import Link from "next/link";
import AiCitationGeoAgentPage from "@/app/agents/ai-citation-geo-agent/page";

const pageUrl = "https://doitwithai.tools/tools/ai-citation-geo-agent";
const title =
  "Free AI Citation & GEO Agent | Optimize for AI Overviews, Perplexity & RAG";
const description =
  "Refactor unstructured paragraphs into 50-word RAG definition leads, Markdown comparison matrices, quotable data passages, and disambiguated Person/Organization sameAs JSON-LD.";

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

export default function ToolAiCitationGeoAgentPage() {
  return (
    <>
      <div className="sr-only">
        <Link href="/tools">All AI Tools</Link>
      </div>
      <AiCitationGeoAgentPage />
    </>
  );
}
