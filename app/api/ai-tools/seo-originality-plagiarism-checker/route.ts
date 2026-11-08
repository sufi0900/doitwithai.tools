import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import {
  getGeminiClient,
  getGeminiModel,
  isAiConfigured,
  geminiTextFormat,
} from "@/lib/ai-tools/gemini";
import { analyzeOriginalityAndIndexReadiness } from "@/features/seo-originality-plagiarism-checker/SeoOriginalityPlagiarismClient";

export const runtime = "nodejs";
export const maxDuration = 45;
export const dynamic = "force-dynamic";

const originalityAiSchema = z.object({
  humanizedRewrite: z.string().trim().min(40).max(1200),
  shingleDiagnostic: z.string().trim().min(30).max(600),
  cadenceDiagnostic: z.string().trim().min(30).max(600),
  infoGainDiagnostic: z.string().trim().min(30).max(600),
});

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      targetKeyword?: string;
      pageUrl?: string;
      contentType?: string;
      draftText?: string;
      referenceText?: string;
    };

    const params = {
      targetKeyword: (
        body.targetKeyword || "seo tool rapid index checker"
      ).slice(0, 140),
      pageUrl: (
        body.pageUrl ||
        "https://doitwithai.tools/tools/seo-originality-plagiarism-checker"
      ).slice(0, 220),
      contentType: (body.contentType || "Blog Guide").slice(0, 80),
      draftText: (
        body.draftText ||
        "In today's fast-paced digital landscape, delving into AI content creation for SEO that sounds human is more important than ever."
      ).slice(0, 3500),
      referenceText: (body.referenceText || "").slice(0, 2500),
    };

    const basePack = analyzeOriginalityAndIndexReadiness(params);
    const model = getGeminiModel();

    if (isAiConfigured(model)) {
      try {
        const res = await getGeminiClient().generate(
          {
            model,
            max_output_tokens: 1100,
            input: [
              {
                role: "system",
                content:
                  "You are a Senior Technical SEO & Editorial Originality Auditor. Rewrite the user's draft so it eliminates 4-gram shingle duplication and synthetic AI clichés, adds concrete E-E-A-T information gain for rapid Google indexing, and sounds naturally human with varied sentence burstiness.",
              },
              {
                role: "user",
                content: JSON.stringify(params),
              },
            ],
            text: {
              format: geminiTextFormat(
                originalityAiSchema,
                "seo_originality_index_audit",
                { compact: true },
              ),
            },
          },
          { timeout: 18_000 },
        );

        const out = res.output_parsed;
        basePack.cards[0].bodyText = out.shingleDiagnostic;
        basePack.cards[1].bodyText = out.cadenceDiagnostic;
        basePack.cards[2].bodyText = out.infoGainDiagnostic;
        basePack.cards[3].bodyText = out.humanizedRewrite;
        basePack.humanizedRewrite = out.humanizedRewrite;
        return NextResponse.json({ ok: true, pack: basePack });
      } catch {
        return NextResponse.json({ ok: true, pack: basePack });
      }
    }

    return NextResponse.json({ ok: true, pack: basePack });
  } catch {
    const fallback = analyzeOriginalityAndIndexReadiness({
      targetKeyword: "seo tool rapid index checker",
      pageUrl:
        "https://doitwithai.tools/tools/seo-originality-plagiarism-checker",
      contentType: "Blog Guide",
      draftText: "",
      referenceText: "",
    });
    return NextResponse.json({ ok: true, pack: fallback });
  }
}
