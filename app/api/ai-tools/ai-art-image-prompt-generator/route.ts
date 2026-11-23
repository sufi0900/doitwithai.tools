import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import {
  getGeminiClient,
  getGeminiModel,
  isAiConfigured,
  geminiTextFormat,
} from "@/lib/ai-tools/gemini";
import { generateArtPromptPack } from "@/features/ai-art-image-prompt-generator/AiArtImagePromptClient";

export const runtime = "nodejs";
export const maxDuration = 45;
export const dynamic = "force-dynamic";

const aiArtSchema = z.object({
  midjourneyPrompt: z.string().trim().min(30).max(800),
  grokPrompt: z.string().trim().min(30).max(800),
  restorationPrompt: z.string().trim().min(30).max(800),
  negativePrompt: z.string().trim().min(15).max(400),
});

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      subject?: string;
      mediumStyle?: string;
      lighting?: string;
      cameraLens?: string;
      colorPalette?: string;
      aspectRatio?: string;
      exactTextOverlay?: string;
    };

    const params = {
      subject: (body.subject || "Futuristic AI creative workspace").slice(0, 300),
      mediumStyle: (body.mediumStyle || "Photorealistic Editorial Render").slice(0, 140),
      lighting: (body.lighting || "Soft volumetric studio rim light").slice(0, 140),
      cameraLens: (body.cameraLens || "50mm f/1.8 prime lens").slice(0, 140),
      colorPalette: (body.colorPalette || "Deep navy, indigo, and emerald").slice(0, 140),
      aspectRatio: (body.aspectRatio || "16:9").slice(0, 20),
      exactTextOverlay: (body.exactTextOverlay || "").slice(0, 80),
    };

    const basePack = generateArtPromptPack(params);
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
                  "You are a senior AI Visual & Restoration Prompt Engineer. Enrich the user's concept into 4 copy-ready prompts: (1) Midjourney v6.1 & Flux Pro prompt with --ar and --v 6.1 flags, (2) Grok Aurora & Ideogram natural-language prompt, (3) 8K Image Restoration & Upscaling prompt, and (4) Negative prompt tokens.",
              },
              {
                role: "user",
                content: JSON.stringify(params),
              },
            ],
            text: {
              format: geminiTextFormat(aiArtSchema, "ai_art_prompt_pack", {
                compact: true,
              }),
            },
          },
          { timeout: 18_000 },
        );

        const out = res.output_parsed;
        basePack.cards[0].promptText = out.midjourneyPrompt;
        basePack.cards[1].promptText = out.grokPrompt;
        basePack.cards[2].promptText = out.restorationPrompt;
        basePack.cards[3].promptText = out.negativePrompt;
        basePack.negativePrompt = out.negativePrompt;
        return NextResponse.json({ ok: true, pack: basePack });
      } catch {
        // Fall through to deterministic pack
      }
    }

    return NextResponse.json({ ok: true, pack: basePack });
  } catch {
    return NextResponse.json(
      { error: "Could not generate art prompt pack." },
      { status: 500 },
    );
  }
}
