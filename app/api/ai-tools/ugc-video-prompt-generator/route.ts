import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import {
  getGeminiClient,
  getGeminiModel,
  isAiConfigured,
  geminiTextFormat,
} from "@/lib/ai-tools/gemini";
import { buildVideoPromptPack } from "@/features/ugc-video-prompt-generator/UgcVideoPromptClient";

export const runtime = "nodejs";
export const maxDuration = 45;
export const dynamic = "force-dynamic";

const videoPackSchema = z.object({
  masterVideoPrompt: z.string().trim().min(30).max(800),
  negativePrompt: z.string().trim().min(15).max(400),
  sunoAudioPrompt: z.string().trim().min(20).max(500),
  scenes: z
    .array(
      z.object({
        sceneNumber: z.number().int().min(1).max(4),
        timeWindow: z.string().trim().min(3).max(40),
        stageLabel: z.string().trim().min(5).max(80),
        spokenScript: z.string().trim().min(10).max(350),
        bRollPrompt: z.string().trim().min(20).max(500),
      }),
    )
    .length(4),
});

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      productTopic?: string;
      audience?: string;
      engine?: string;
      aspectRatio?: string;
      cameraStyle?: string;
      lightingStyle?: string;
      audioMood?: string;
    };

    const params = {
      productTopic: (body.productTopic || "AI productivity studio").slice(0, 250),
      audience: (body.audience || "creators and founders").slice(0, 200),
      engine: (body.engine || "OpenAI Sora / Runway Gen-3").slice(0, 80),
      aspectRatio: (body.aspectRatio || "9:16 Vertical").slice(0, 60),
      cameraStyle: (body.cameraStyle || "35mm cinematic tracking").slice(0, 150),
      lightingStyle: (body.lightingStyle || "Natural warm studio light").slice(0, 150),
      audioMood: (body.audioMood || "Upbeat modern electronic groove, 112 BPM").slice(0, 150),
    };

    const model = getGeminiModel();
    if (isAiConfigured(model)) {
      try {
        const res = await getGeminiClient().generate(
          {
            model,
            max_output_tokens: 1400,
            input: [
              {
                role: "system",
                content:
                  "You are a UGC Creative Director and AI Video Prompt Engineer for OpenAI Sora, Runway Gen-3, Google Veo, and Suno v4. Generate a master text-to-video prompt, negative prompt, Suno music prompt, and a 4-scene UGC storyboard (0-3s Hook, 3-10s Problem, 10-22s Demo, 22-30s CTA).",
              },
              {
                role: "user",
                content: JSON.stringify(params),
              },
            ],
            text: {
              format: geminiTextFormat(videoPackSchema, "ugc_video_prompt_pack", {
                compact: true,
              }),
            },
          },
          { timeout: 18_000 },
        );
        return NextResponse.json({ ok: true, pack: res.output_parsed });
      } catch {
        // Fall through to deterministic pack
      }
    }

    return NextResponse.json({
      ok: true,
      pack: buildVideoPromptPack(params),
    });
  } catch {
    return NextResponse.json(
      { error: "Could not generate video prompt pack." },
      { status: 500 },
    );
  }
}
