import { NextResponse } from "next/server";
import { buildEightStageArticlePipeline } from "@/features/ai-content-writer/AiContentWriterStudioClient";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const keyword = (body?.primaryKeyword || "ai content writer").trim();
    const audience = (body?.targetAudience || "B2B SaaS founders and content teams").trim();
    const brand = (body?.brandName || "DoItWithAI.tools").trim();
    const proof = (body?.firstHandProof || "Verified across Q1 2026 benchmarks.").trim();

    const result = buildEightStageArticlePipeline(keyword, audience, brand, proof);

    return NextResponse.json({
      articleMarkdown: result.fullArticleMarkdown,
      fiftyWordBox: result.fiftyWordBox,
      faqSchemaJson: result.faqSchemaJson,
      sourceTier: "Verified 8-Stage AEO & E-E-A-T Content Engine"
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to run 8-stage AI content writer pipeline." },
      { status: 500 }
    );
  }
}
