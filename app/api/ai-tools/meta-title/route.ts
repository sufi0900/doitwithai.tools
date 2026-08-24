import { NextResponse, type NextRequest } from "next/server";
import { zodTextFormat } from "openai/helpers/zod";
import { getMetaTitleModel, getOpenAIClient } from "@/lib/ai-tools/openai";
import { checkMetaTitleRateLimit } from "@/lib/ai-tools/rate-limit";
import {
  metaTitleInputSchema,
  metaTitleOutputSchema,
} from "@/features/meta-title-generator/schema";
import {
  buildMetaTitleUserPrompt,
  META_TITLE_SYSTEM_PROMPT,
} from "@/features/meta-title-generator/prompt";
import { LENS_ORDER } from "@/features/meta-title-generator/config";

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

function validateLensOrder(result: unknown) {
  const parsed = metaTitleOutputSchema.parse(result);
  const received = parsed.groups.map((group) => group.lens);
  const valid = LENS_ORDER.every((lens, index) => received[index] === lens);
  if (!valid) throw new Error("The generated lens order was invalid");

  const titles = parsed.groups.flatMap((group) =>
    group.candidates.map((candidate) => candidate.title),
  );
  const normalized = titles.map((title) =>
    title.toLowerCase().replace(/[^a-z0-9]/g, ""),
  );
  if (new Set(normalized).size !== normalized.length) {
    throw new Error("The model returned duplicate title candidates");
  }

  return parsed;
}

export async function POST(request: NextRequest) {
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > 30_000) {
    return errorResponse(
      "The page brief is too large.",
      413,
      "PAYLOAD_TOO_LARGE",
    );
  }

  let limit;
  try {
    limit = await checkMetaTitleRateLimit(request);
  } catch (error) {
    console.error("Meta title rate limiter failed", error);
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

  const inputResult = metaTitleInputSchema.safeParse(rawBody);
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

  const model = getMetaTitleModel();

  const baseRequest = {
    model,
    reasoning: { effort: "low" as const },
    // Five groups of five candidates (25 titles total) plus analysis and
    // editor notes need more headroom than the previous four-group shape.
    max_output_tokens: 6_500,
    input: [
      { role: "system" as const, content: META_TITLE_SYSTEM_PROMPT },
      {
        role: "user" as const,
        content: buildMetaTitleUserPrompt(inputResult.data),
      },
    ],
    text: {
      format: zodTextFormat(metaTitleOutputSchema, "meta_title_generation"),
    },
  };

  try {
    let response;
    try {
      // Give the model a lightweight web search tool so it can ground
      // phrasing decisions (natural keyword placement, existing title
      // conventions for the topic) in real current pages instead of
      // relying only on a rigid template. Not every configured model
      // supports tool use alongside structured Responses output, so this
      // falls back to a tool-free call if the combined request fails.
      response = await getOpenAIClient().responses.parse({
        ...baseRequest,
        tools: [{ type: "web_search" }],
      });
    } catch (toolError) {
      console.warn(
        "Meta title generation with web search failed, retrying without it",
        toolError,
      );
      response = await getOpenAIClient().responses.parse(baseRequest);
    }

    if (!response.output_parsed) {
      throw new Error("No structured output was returned");
    }

    const result = validateLensOrder(response.output_parsed);

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
    console.error("Meta title generation failed", error);
    return errorResponse(
      "We could not complete this title analysis. Please refine the brief and try again.",
      502,
      "GENERATION_FAILED",
    );
  }
}
