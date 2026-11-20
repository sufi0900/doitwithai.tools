import { NextResponse } from "next/server";
import { synthesizeMultiSourceArticle } from "@/features/source-pdf-to-article-generator/SourcePdfToArticleGeneratorClient";
import { runMultiModelTextFailover } from "@/lib/ai/multi-model-router";

export const runtime = "nodejs";

interface SourceToArticleRequest {
  articleHeadline?: string;
  targetKeyword?: string;
  source1?: string;
  source2?: string;
  source3?: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SourceToArticleRequest;
    const headline = (body.articleHeadline || "Multi-Source Research & E-E-A-T Guide").trim();
    const keyword = (body.targetKeyword || "ai notebooklm source to article generator").trim();
    const s1 = (body.source1 || "").trim();
    const s2 = (body.source2 || "").trim();
    const s3 = (body.source3 || "").trim();

    const deterministic = synthesizeMultiSourceArticle(headline, keyword, s1, s2, s3);

    const prompt = `Synthesize the following three primary sources into an authoritative, E-E-A-T SEO article titled "${headline}" targeting the keyword "${keyword}".
Include a 50-word executive answer box at the top, H2 sections grounded with explicit [S1], [S2], and [S3] inline footnote citations, a markdown comparison table, and a source footnote ledger at the end.

[S1] Research / PDF / NotebookLM Notes:
${s1}

[S2] SME / Founder Interview Transcript:
${s2}

[S3] Benchmark Metrics & Proof:
${s3}`;

    const aiRes = await runMultiModelTextFailover({
      prompt,
      temperature: 0.45,
      maxOutputTokens: 1400,
    });

    return NextResponse.json({
      articleMarkdown: aiRes ? aiRes.text.trim() : deterministic.fullMarkdownArticle,
      citationMatrix: deterministic.citationMatrix,
      sourceTier: aiRes ? aiRes.tier : "Tier 4 · Deterministic Multi-Source Citation Engine"
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to convert source material into article." },
      { status: 500 }
    );
  }
}
