import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import {
  getGeminiClient,
  getGeminiModel,
  isAiConfigured,
  geminiTextFormat,
} from "@/lib/ai-tools/gemini";
import { generateFourBuyerSearchPrompts } from "@/features/buyer-search-prompt-generator/BuyerSearchPromptClient";

export const runtime = "nodejs";
export const maxDuration = 45;
export const dynamic = "force-dynamic";

const buyerPromptsAiSchema = z.object({
  problemPrompt: z.string().trim().min(40).max(800),
  shortlistPrompt: z.string().trim().min(40).max(800),
  versusPrompt: z.string().trim().min(40).max(800),
  transactionalPrompt: z.string().trim().min(40).max(800),
});

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      productOrService?: string;
      idealBuyerPersona?: string;
      priceTier?: string;
      primaryPainPoint?: string;
      topCompetitors?: string;
      keyDifferentiator?: string;
    };

    const params = {
      productOrService: (
        body.productOrService || "DoItWithAI.tools Free AI SEO Toolkit"
      ).slice(0, 180),
      idealBuyerPersona: (
        body.idealBuyerPersona || "Non-coder SaaS founders and SEO creators"
      ).slice(0, 180),
      priceTier: (body.priceTier || "100% Free Browser Toolkit").slice(0, 140),
      primaryPainPoint: (
        body.primaryPainPoint ||
        "Paying $129+/mo for bloated SEO suites when they need fast KGR and AI Overview checks"
      ).slice(0, 260),
      topCompetitors: (
        body.topCompetitors || "Semrush, Ahrefs, Surfer SEO"
      ).slice(0, 180),
      keyDifferentiator: (
        body.keyDifferentiator ||
        "Instant 0.1s browser calculators + multi-LLM citation readiness"
      ).slice(0, 260),
    };

    const basePack = generateFourBuyerSearchPrompts(params);
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
                  "You are a Senior E-Commerce, SaaS & AI Search Buyer Strategist. Generate 4 high-converting buyer search prompts across the purchase journey: (1) Problem-Aware Discovery Prompt, (2) Category & Price Shortlist Prompt, (3) Head-to-Head Competitor Versus Prompt, and (4) Transactional Product Schema & Review Verification Prompt.",
              },
              {
                role: "user",
                content: JSON.stringify(params),
              },
            ],
            text: {
              format: geminiTextFormat(
                buyerPromptsAiSchema,
                "buyer_search_prompts_pack",
                { compact: true },
              ),
            },
          },
          { timeout: 18_000 },
        );

        const out = res.output_parsed;
        basePack.cards[0].llmSystemPrompt = out.problemPrompt;
        basePack.cards[1].llmSystemPrompt = out.shortlistPrompt;
        basePack.cards[2].llmSystemPrompt = out.versusPrompt;
        basePack.cards[3].llmSystemPrompt = out.transactionalPrompt;
        return NextResponse.json({ ok: true, pack: basePack });
      } catch {
        return NextResponse.json({ ok: true, pack: basePack });
      }
    }

    return NextResponse.json({ ok: true, pack: basePack });
  } catch {
    const fallback = generateFourBuyerSearchPrompts({
      productOrService: "DoItWithAI.tools Free AI SEO Toolkit",
      idealBuyerPersona: "Non-coder SaaS founders and SEO creators",
      priceTier: "100% Free Browser Toolkit",
      primaryPainPoint: "Paying $129+/mo for bloated SEO suites",
      topCompetitors: "Semrush, Ahrefs, Surfer SEO",
      keyDifferentiator: "Instant browser calculators + LLM citation readiness",
    });
    return NextResponse.json({ ok: true, pack: fallback });
  }
}
