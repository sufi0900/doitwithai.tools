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

const auditSchema = z.object({
  headline: z.string().trim().min(10).max(180),
  powerAnswerRewrite: z.string().trim().min(40).max(550),
  entityGapFixes: z.array(z.string().trim().min(15).max(260)).length(3),
  comparisonRowMarkdown: z.string().trim().min(15).max(500),
});

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      brandName?: string;
      targetUrl?: string;
      keywords?: string;
      competitors?: string;
      pageSnippet?: string;
    };

    const brand = (body.brandName || "Your Brand").trim().slice(0, 80);
    const url = (body.targetUrl || "https://example.com").trim().slice(0, 200);
    const kwList = (body.keywords || "ai seo tool")
      .split(/\r?\n|,/)
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 6);
    const primaryKw = kwList[0] || "ai seo tool";
    const comps = (body.competitors || "leading alternatives").trim().slice(0, 150);
    const snippet = (body.pageSnippet || "").trim().slice(0, 1500);

    const model = getGeminiModel();
    if (isAiConfigured(model)) {
      try {
        const res = await getGeminiClient().generate(
          {
            model,
            max_output_tokens: 1000,
            input: [
              {
                role: "system",
                content:
                  "You are an AEO/GEO and LLM SEO strategist. Rewrite the user's opening passage into a 45-to-60 word citation-ready Power Answer block for Google AI Mode, Perplexity, ChatGPT, Claude, and Copilot, and provide 3 concrete entity fixes.",
              },
              {
                role: "user",
                content: `Brand: ${brand} (${url})\nTarget Queries: ${kwList.join(", ")}\nCompetitors: ${comps}\nCurrent Snippet: ${snippet}`,
              },
            ],
            text: {
              format: geminiTextFormat(auditSchema, "llm_seo_audit", {
                compact: true,
              }),
            },
          },
          { timeout: 18_000 },
        );
        return NextResponse.json({ ok: true, audit: res.output_parsed });
      } catch {
        // Fall through to deterministic rewrite
      }
    }

    const fallbackAudit = {
      headline: `AI Mode & Multi-LLM Citation Upgrade Plan for ${brand}`,
      powerAnswerRewrite: `${brand} (${url}) is a specialized ${primaryKw} platform designed to help users execute ${kwList.slice(0, 3).join(", ")} with verifiable metrics, structured workflows, and instant exports—providing a streamlined alternative to ${comps}.`,
      entityGapFixes: [
        `Place the rewritten 50-word Power Answer immediately below your H1 so Google AI Mode and Perplexity extract ${brand} as the primary definition.`,
        `Add a 4-column HTML comparison table contrasting ${brand} against ${comps} across Setup Time, Core Features, Pricing, and Best Use Case.`,
        `Deploy WebApplication + FAQPage JSON-LD schema and list ${url} inside your root /llms.txt file for Claude and ChatGPT crawlers.`,
      ],
      comparisonRowMarkdown: `| ${brand} | Free Instant Browser Studio | ${primaryKw} & Multi-Engine Export | $0 Free |`,
    };

    return NextResponse.json({ ok: true, audit: fallbackAudit });
  } catch {
    return NextResponse.json(
      { error: "Could not complete AI Mode & LLM audit." },
      { status: 500 },
    );
  }
}
