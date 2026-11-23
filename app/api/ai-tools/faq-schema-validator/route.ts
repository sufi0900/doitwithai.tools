import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import {
  getGeminiClient,
  getGeminiModel,
  isAiConfigured,
  geminiTextFormat,
} from "@/lib/ai-tools/gemini";
import { validateAndOptimizeFaqSchema } from "@/features/faq-schema-validator/FaqSchemaValidatorClient";

export const runtime = "nodejs";
export const maxDuration = 45;
export const dynamic = "force-dynamic";

const faqValidatorAiSchema = z.object({
  aiVisibilityDiagnostic: z.string().trim().min(30).max(650),
  graphSynergyDiagnostic: z.string().trim().min(30).max(650),
});

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      targetKeyword?: string;
      pageUrl?: string;
      schemaComboType?: string;
      rawFaqOrJsonInput?: string;
    };

    const params = {
      targetKeyword: (
        body.targetKeyword ||
        "best seo tools for faq schema markup validation and optimization"
      ).slice(0, 160),
      pageUrl: (
        body.pageUrl || "https://doitwithai.tools/tools/faq-schema-validator"
      ).slice(0, 200),
      schemaComboType: (
        body.schemaComboType || "FAQPage + WebApplication (@graph)"
      ).slice(0, 80),
      rawFaqOrJsonInput: (body.rawFaqOrJsonInput || "").slice(0, 3500),
    };

    const basePack = validateAndOptimizeFaqSchema(params);
    const model = getGeminiModel();

    if (isAiConfigured(model)) {
      try {
        const res = await getGeminiClient().generate(
          {
            model,
            max_output_tokens: 900,
            input: [
              {
                role: "system",
                content:
                  "You are a Senior Schema.org & AI Search Engineer. Provide diagnostics for optimizing the user's FAQPage + Product/WebApplication @graph for Google AI Overviews and Perplexity citations.",
              },
              {
                role: "user",
                content: JSON.stringify(params),
              },
            ],
            text: {
              format: geminiTextFormat(
                faqValidatorAiSchema,
                "faq_schema_validator_pack",
                { compact: true },
              ),
            },
          },
          { timeout: 18_000 },
        );

        const out = res.output_parsed;
        basePack.cards[1].bodyText = out.aiVisibilityDiagnostic;
        basePack.cards[2].bodyText = out.graphSynergyDiagnostic;
        return NextResponse.json({ ok: true, pack: basePack });
      } catch {
        return NextResponse.json({ ok: true, pack: basePack });
      }
    }

    return NextResponse.json({ ok: true, pack: basePack });
  } catch {
    const fallback = validateAndOptimizeFaqSchema({
      targetKeyword: "best faq generator for seo and ai visibility",
      pageUrl: "https://doitwithai.tools/tools/faq-schema-validator",
      schemaComboType: "FAQPage + WebApplication (@graph)",
      rawFaqOrJsonInput: "",
    });
    return NextResponse.json({ ok: true, pack: fallback });
  }
}
