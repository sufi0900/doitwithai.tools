import { NextResponse } from "next/server";
import { buildArticleSummaries } from "@/features/ai-article-summarizer/AiArticleSummarizerClient";

export const runtime = "nodejs";

interface SummarizerRequest {
  articleTitle?: string;
  primaryKeyword?: string;
  articleBody?: string;
  targetWordCount?: number;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SummarizerRequest;
    const title = (body.articleTitle || "Article Summary").trim();
    const keyword = (body.primaryKeyword || "ai article summarizer").trim();
    const text = (body.articleBody || "").trim();
    const targetWords = Math.min(70, Math.max(35, Number(body.targetWordCount) || 50));

    const summary = buildArticleSummaries(title, keyword, text, targetWords);

    return NextResponse.json({
      fiftyWordBox: summary.fiftyWordBox,
      tldrBullets: summary.tldrBullets,
      htmlCalloutSnippet: summary.htmlCalloutSnippet,
      sourceTier: "Verified AEO 50-Word Citation Engine"
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to summarize article." },
      { status: 500 }
    );
  }
}
