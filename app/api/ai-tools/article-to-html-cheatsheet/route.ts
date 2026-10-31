import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  geminiTextFormat,
  getGeminiClient,
  getGeminiModel,
  isAiConfigured,
} from "@/lib/ai-tools/gemini";
import { BodyError, readBoundedJson } from "@/lib/ai-tools/request-body";
import {
  fetchPublic,
  publicUrl,
} from "@/features/backlink-verifier/fetch.server";
import { buildDeterministicCheatsheet } from "@/features/article-to-html-cheatsheet/model";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const inputSchema = z.object({
  title: z.string().trim().min(3).max(200),
  sourceUrl: z.string().trim().max(2048).default(""),
  sourceContent: z.string().trim().max(50_000).default(""),
  brandName: z.string().trim().max(120).default("Do It With AI Tools"),
});

const aiCheatsheetSchema = z.object({
  kpis: z
    .array(
      z.object({
        metric: z.string().min(1).max(20),
        label: z.string().min(4).max(45),
      }),
    )
    .min(4)
    .max(4),
  steps: z
    .array(
      z.object({
        stepNumber: z.number().int().min(1).max(8),
        title: z.string().min(4).max(60),
        summary: z.string().min(15).max(180),
      }),
    )
    .min(4)
    .max(6),
  dosList: z.array(z.string().min(10).max(120)).min(3).max(4),
  dontsList: z.array(z.string().min(10).max(120)).min(3).max(4),
});

export async function POST(request: NextRequest) {
  let input: z.infer<typeof inputSchema>;
  try {
    input = inputSchema.parse(await readBoundedJson(request, 150_000));
    if (input.sourceUrl) publicUrl(input.sourceUrl);
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          message:
            error instanceof BodyError
              ? error.message
              : "Provide an article title and source notes or URL.",
        },
      },
      { status: 422 },
    );
  }

  let content = input.sourceContent;
  if (input.sourceUrl && !content.trim()) {
    try {
      const page = await fetchPublic(input.sourceUrl, {
        signal: request.signal,
        html: true,
        timeout: 9000,
      });
      if (page.status >= 200 && page.status < 300) {
        content = page.html
          .replace(/<script[\s\S]*?<\/script>/gi, " ")
          .replace(/<style[\s\S]*?<\/style>/gi, " ")
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 12_000);
      }
    } catch {
      /* fallback to title */
    }
  }

  const fallback = buildDeterministicCheatsheet({
    ...input,
    sourceContent: content || input.sourceContent,
  });

  const model = getGeminiModel("HTML_CHEATSHEET") || getGeminiModel();
  if (!isAiConfigured(model)) {
    return NextResponse.json({
      cheatsheet: fallback,
      provider: "deterministic",
    });
  }

  try {
    const client = getGeminiClient();
    const res = await client.generate(
      {
        model,
        max_output_tokens: 1500,
        store: false,
        input: [
          {
            role: "system",
            content:
              "You are an Executive Information Designer. Distill the user's article into a high-impact 1-Page Cheatsheet containing: (1) 4 punchy KPI benchmark badges, (2) 4 to 6 numbered implementation steps, and (3) 3 Do's and 3 Don'ts.",
          },
          {
            role: "user",
            content: JSON.stringify({
              title: input.title,
              sourceContent: (content || input.sourceContent).slice(0, 10_000),
            }),
          },
        ],
        text: {
          format: geminiTextFormat(aiCheatsheetSchema, "html_cheatsheet_pack", {
            compact: true,
          }),
        },
      },
      { timeout: 25000 },
    );

    if (!res.output_parsed) {
      return NextResponse.json({
        cheatsheet: fallback,
        provider: "deterministic",
      });
    }

    const p = res.output_parsed;
    const rebuilt = buildDeterministicCheatsheet({
      ...input,
      sourceContent: p.steps
        .map((s) => `${s.stepNumber}. ${s.title}: ${s.summary}`)
        .join("\n"),
    });

    return NextResponse.json({
      cheatsheet: {
        ...rebuilt,
        kpis: p.kpis,
        steps: p.steps,
        dosList: p.dosList,
        dontsList: p.dontsList,
      },
      provider: "ai",
    });
  } catch {
    return NextResponse.json({
      cheatsheet: fallback,
      provider: "deterministic",
    });
  }
}
