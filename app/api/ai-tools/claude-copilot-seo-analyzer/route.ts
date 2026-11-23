import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import {
  getGeminiClient,
  getGeminiModel,
  isAiConfigured,
  geminiTextFormat,
} from "@/lib/ai-tools/gemini";

export const runtime = "nodejs";
export const maxDuration = 45;
export const dynamic = "force-dynamic";

const upgradeSchema = z.object({
  optimizedTitle: z.string().trim().min(20).max(65),
  optimizedMetaDescription: z.string().trim().min(120).max(162),
  powerAnswerBlock: z.string().trim().min(40).max(500),
  recommendedH2s: z.array(z.string().trim().min(8).max(110)).length(4),
});

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      keyword?: string;
      pageTitle?: string;
      audience?: string;
      draftText?: string;
    };

    const kw = (body.keyword || "claude seo tool").trim().slice(0, 90);
    const title = (body.pageTitle || "").trim().slice(0, 140);
    const audience = (body.audience || "marketers and solo founders").trim().slice(0, 140);
    const draft = (body.draftText || "").trim().slice(0, 1500);

    const model = getGeminiModel();
    if (isAiConfigured(model)) {
      try {
        const res = await getGeminiClient().generate(
          {
            model,
            max_output_tokens: 950,
            input: [
              {
                role: "system",
                content:
                  "You are a Senior SEO Architect. Upgrade the user's page for Claude, Copilot, Gemini, and Google search. Return: (1) a natural, non-stuffed Meta Title under 58 characters, (2) a single flowing sentence Meta Description (145-158 chars, with no period break in the middle), (3) a 50-word Power Answer block, and (4) 4 high-information-gain H2 headings.",
              },
              {
                role: "user",
                content: `Target Keyword: ${kw}\nCurrent Title: ${title}\nAudience: ${audience}\nDraft: ${draft}`,
              },
            ],
            text: {
              format: geminiTextFormat(upgradeSchema, "claude_copilot_seo_upgrade", {
                compact: true,
              }),
            },
          },
          { timeout: 18_000 },
        );
        return NextResponse.json({ ok: true, upgrade: res.output_parsed });
      } catch {
        // Fall through to deterministic upgrade
      }
    }

    const cleanKw = kw.charAt(0).toUpperCase() + kw.slice(1);
    const fallbackUpgrade = {
      optimizedTitle: `${cleanKw}: Free Workflow, Prompts & SEO Guide (2026)`.slice(0, 58),
      optimizedMetaDescription: `Learn how to use ${kw} to audit pages, uncover semantic entity gaps, and structure content for Google AI Overviews and Bing Copilot in minutes.`,
      powerAnswerBlock: `A ${kw} workflow helps ${audience.toLowerCase()} audit on-page E-E-A-T signals, extract missing semantic entities, and format 50-word answer blocks so pages rank across both traditional Google SERPs and AI answer engines.`,
      recommendedH2s: [
        `How ${cleanKw} Compares to Traditional SEO Software`,
        `Step-by-Step ${cleanKw} Workflow for On-Page Audits`,
        `Copy-Paste XML & Markdown Prompts for ${cleanKw}`,
        `Common Mistakes to Avoid When Using AI for SEO`,
      ],
    };

    return NextResponse.json({ ok: true, upgrade: fallbackUpgrade });
  } catch {
    return NextResponse.json(
      { error: "Could not complete multi-model SEO upgrade." },
      { status: 500 },
    );
  }
}
