import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  geminiTextFormat,
  getGeminiClient,
  getGeminiModel,
  isAiConfigured,
} from "@/lib/ai-tools/gemini";
import { readBoundedJson, BodyError } from "@/lib/ai-tools/request-body";
import {
  fetchPublic,
  publicUrl,
} from "@/features/backlink-verifier/fetch.server";
import {
  buildDeterministicSnippetCandidates,
  inspectHtmlPassagesForSnippets,
} from "@/features/featured-snippet-optimizer/model";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const inputSchema = z.object({
  url: z.string().trim().max(2048).default(""),
  targetQuery: z.string().trim().min(2).max(220),
  coreFacts: z.string().trim().min(10).max(3000),
  audienceOrNiche: z.string().trim().max(180).default(""),
  contentOrHtml: z.string().max(400_000).default(""),
});

const aiSnippetSchema = z.object({
  recommendedHeading: z.string().min(6).max(140),
  paragraphSnippet: z.string().min(160).max(460),
  listIntro: z.string().min(10).max(160),
  listItems: z
    .array(
      z.object({
        lead: z.string().min(4).max(90),
        detail: z.string().min(10).max(220),
      }),
    )
    .min(4)
    .max(6),
  tableHeaders: z.tuple([
    z.string().min(2).max(50),
    z.string().min(2).max(50),
    z.string().min(2).max(50),
  ]),
  tableRows: z
    .array(
      z.tuple([
        z.string().min(2).max(80),
        z.string().min(2).max(120),
        z.string().min(2).max(120),
      ]),
    )
    .min(3)
    .max(5),
  aiOverviewCitationTip: z.string().min(15).max(300),
});

export async function POST(request: NextRequest) {
  let input: z.infer<typeof inputSchema>;
  try {
    input = inputSchema.parse(await readBoundedJson(request, 500_000));
    if (input.url) publicUrl(input.url);
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          message:
            error instanceof BodyError
              ? error.message
              : "Provide a target search query and core facts or a valid public URL.",
        },
      },
      { status: 422 },
    );
  }

  let sourceHtml = input.contentOrHtml;
  if (input.url && !sourceHtml.trim()) {
    try {
      const page = await fetchPublic(input.url, {
        signal: request.signal,
        html: true,
        timeout: 9000,
      });
      if (page.status >= 200 && page.status < 300) {
        sourceHtml = page.html;
      }
    } catch {
      /* fallback to input.coreFacts */
    }
  }

  const passages = inspectHtmlPassagesForSnippets(
    sourceHtml || input.coreFacts,
    input.targetQuery,
  );

  const fallbackCandidates = buildDeterministicSnippetCandidates({
    targetQuery: input.targetQuery,
    coreFacts: input.coreFacts,
    audienceOrNiche: input.audienceOrNiche,
  });

  const model = getGeminiModel("FEATURED_SNIPPET") || getGeminiModel();
  if (!isAiConfigured(model)) {
    return NextResponse.json({
      passages,
      candidates: fallbackCandidates,
      provider: "deterministic",
    });
  }

  try {
    const client = getGeminiClient();
    const res = await client.generate(
      {
        model,
        max_output_tokens: 1800,
        store: false,
        input: [
          {
            role: "system",
            content:
              "You are a Senior On-Page SEO & Google Featured Snippet / AI Overview Architect. Given a target query and core facts, write: (1) an exact question/topic H2 heading, (2) a 45-to-58-word ontological definition paragraph ('[Topic] is...') with zero fluff, (3) a 4-to-5-step ordered list with bold lead-ins, and (4) a 3-column comparison/specification table. Use only facts grounded in the user's input.",
          },
          {
            role: "user",
            content: JSON.stringify({
              targetQuery: input.targetQuery,
              coreFacts: input.coreFacts,
              audienceOrNiche: input.audienceOrNiche,
            }),
          },
        ],
        text: {
          format: geminiTextFormat(aiSnippetSchema, "featured_snippet_pack", {
            compact: true,
          }),
        },
      },
      { timeout: 30000 },
    );

    const parsed = res.output_parsed;
    if (!parsed) {
      return NextResponse.json({
        passages,
        candidates: fallbackCandidates,
        provider: "deterministic",
      });
    }

    const paragraphWordCount = parsed.paragraphSnippet
      .trim()
      .split(/\s+/)
      .filter(Boolean).length;

    return NextResponse.json({
      passages,
      candidates: {
        targetQuery: input.targetQuery,
        ...parsed,
        paragraphWordCount,
      },
      provider: "ai",
    });
  } catch {
    return NextResponse.json({
      passages,
      candidates: fallbackCandidates,
      provider: "deterministic",
    });
  }
}
