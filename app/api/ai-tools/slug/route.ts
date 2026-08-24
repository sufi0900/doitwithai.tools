import { NextResponse, type NextRequest } from "next/server";
import { zodTextFormat } from "openai/helpers/zod";
import { getOpenAIClient, getSlugGeneratorModel } from "@/lib/ai-tools/openai";
import { checkAiToolRateLimit } from "@/lib/ai-tools/rate-limit";
import { canonicalizeSlug } from "@/features/slug-generator/evaluator";
import {
  slugInputSchema,
  slugOutputSchema,
  type SlugCandidate,
  type SlugOutput,
} from "@/features/slug-generator/schema";
import {
  buildSlugUserPrompt,
  SLUG_SYSTEM_PROMPT,
} from "@/features/slug-generator/prompt";

export const runtime = "nodejs";
export const maxDuration = 45;
export const dynamic = "force-dynamic";

function errorResponse(
  message: string,
  status: number,
  code: string,
  headers?: HeadersInit,
) {
  return NextResponse.json({ error: { message, code } }, { status, headers });
}

function normalizeCandidate(candidate: SlugCandidate): SlugCandidate {
  const slug = canonicalizeSlug(candidate.slug);
  if (!slug) throw new Error("A generated slug was empty after normalization");
  return { ...candidate, slug };
}

function validateAndNormalizeOutput(result: unknown): SlugOutput {
  const parsed = slugOutputSchema.parse(result);
  const normalized: SlugOutput = {
    ...parsed,
    topRecommendation: normalizeCandidate(parsed.topRecommendation),
    alternatives: {
      concise: parsed.alternatives.concise.map(normalizeCandidate),
      keywordAligned:
        parsed.alternatives.keywordAligned.map(normalizeCandidate),
      intentLed: parsed.alternatives.intentLed.map(normalizeCandidate),
    },
  };

  const candidates = [
    normalized.topRecommendation,
    ...normalized.alternatives.concise,
    ...normalized.alternatives.keywordAligned,
    ...normalized.alternatives.intentLed,
  ];
  const semanticSignatures = candidates.map((candidate) =>
    candidate.slug.split("-").sort().join("-"),
  );

  if (new Set(semanticSignatures).size !== semanticSignatures.length) {
    throw new Error("The model returned duplicate slug candidates");
  }

  return slugOutputSchema.parse(normalized);
}

export async function POST(request: NextRequest) {
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > 20_000) {
    return errorResponse(
      "The page brief is too large.",
      413,
      "PAYLOAD_TOO_LARGE",
    );
  }

  let limit;
  try {
    limit = await checkAiToolRateLimit(request, "slug");
  } catch (error) {
    console.error("Slug generator rate limiter failed", error);
    return errorResponse(
      "The generator is temporarily unavailable.",
      503,
      "RATE_LIMIT_UNAVAILABLE",
    );
  }

  if (!limit.allowed) {
    return errorResponse(
      "You have reached the current generation limit. Please try again later.",
      429,
      "RATE_LIMITED",
      {
        "Retry-After": String(limit.retryAfterSeconds),
        "X-RateLimit-Remaining": "0",
      },
    );
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return errorResponse(
      "Send a valid JSON request body.",
      400,
      "INVALID_JSON",
    );
  }

  const inputResult = slugInputSchema.safeParse(rawBody);
  if (!inputResult.success) {
    return NextResponse.json(
      {
        error: {
          message: "Please review the highlighted page-brief fields.",
          code: "VALIDATION_ERROR",
          fields: inputResult.error.flatten().fieldErrors,
        },
      },
      { status: 422 },
    );
  }

  if (!process.env.OPENAI_API_KEY) {
    return errorResponse(
      "The generator has not been connected to its AI provider yet.",
      503,
      "AI_NOT_CONFIGURED",
    );
  }

  const model = getSlugGeneratorModel();

  try {
    const response = await getOpenAIClient().responses.parse({
      model,
      reasoning: { effort: "low" },
      max_output_tokens: 3_500,
      input: [
        { role: "system", content: SLUG_SYSTEM_PROMPT },
        { role: "user", content: buildSlugUserPrompt(inputResult.data) },
      ],
      text: {
        format: zodTextFormat(slugOutputSchema, "seo_slug_generation"),
      },
    });

    if (!response.output_parsed) {
      throw new Error("No structured output was returned");
    }

    const result = validateAndNormalizeOutput(response.output_parsed);

    return NextResponse.json(
      {
        result,
        meta: {
          generatedAt: new Date().toISOString(),
          model,
          remaining: limit.remaining,
        },
      },
      {
        headers: {
          "Cache-Control": "no-store",
          "X-RateLimit-Remaining": String(limit.remaining),
        },
      },
    );
  } catch (error) {
    console.error("Slug generation failed", error);
    return errorResponse(
      "We could not complete this slug analysis. Please refine the brief and try again.",
      502,
      "GENERATION_FAILED",
    );
  }
}
