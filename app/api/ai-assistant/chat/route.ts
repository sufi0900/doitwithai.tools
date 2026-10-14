import { NextRequest, NextResponse } from "next/server";
import { readBoundedJson, BodyError } from "@/lib/ai-tools/request-body";
import { siteAssistantRequestSchema } from "@/features/site-assistant/schema";
import { answerSiteAssistant } from "@/features/site-assistant/server/chat";
import {
  getGeminiModel,
  isGeminiConfigured,
  geminiFailure,
} from "@/lib/ai-tools/gemini";
import { checkAiToolRateLimit } from "@/lib/ai-tools/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 45;

function errorResponse(
  message: string,
  status: number,
  code: string,
  headers?: HeadersInit,
) {
  return NextResponse.json(
    { error: { message, code } },
    { status, headers: { "Cache-Control": "no-store", ...headers } },
  );
}

export async function POST(request: NextRequest) {
  let limit;
  try {
    limit = await checkAiToolRateLimit(request, "site-assistant", {
      dailyLimit: Number(process.env.AI_ASSISTANT_DAILY_LIMIT || 25),
      burstLimit: Number(process.env.AI_ASSISTANT_BURST_LIMIT || 8),
    });
  } catch (error) {
    console.error("Site assistant rate limiter failed", error);
    return errorResponse(
      "The assistant is temporarily unavailable. Please try again shortly.",
      503,
      "RATE_LIMIT_UNAVAILABLE",
    );
  }

  if (!limit.allowed) {
    return errorResponse(
      "You have reached the current chat limit. Please try again later or use the contact page.",
      429,
      "RATE_LIMITED",
      { "Retry-After": String(limit.retryAfterSeconds) },
    );
  }

  let body: unknown;
  try {
    body = await readBoundedJson(request, 60_000);
  } catch (error) {
    return errorResponse(
      "Send a valid JSON request within the chat size limit.",
      error instanceof BodyError ? error.status : 400,
      "INVALID_JSON",
    );
  }

  const parsed = siteAssistantRequestSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(
      parsed.error.issues[0]?.message ||
        "Review the conversation and try again.",
      400,
      "INVALID_INPUT",
    );
  }

  if (!isGeminiConfigured(getGeminiModel("SITE_ASSISTANT"))) {
    return errorResponse(
      "The website assistant has not been connected yet.",
      503,
      "AI_NOT_CONFIGURED",
    );
  }

  if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
    return errorResponse(
      "The website content source has not been connected yet.",
      503,
      "KNOWLEDGE_NOT_CONFIGURED",
    );
  }

  try {
    const result = await answerSiteAssistant(parsed.data, request.signal);
    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "no-store",
        "X-RateLimit-Remaining": String(limit.remaining),
      },
    });
  } catch (error) {
    const failure = geminiFailure(error);
    if (failure)
      return errorResponse(failure.message, failure.status, failure.code);
    console.error("Site assistant response failed", {
      code: error instanceof Error ? error.name : "UNKNOWN",
    });
    return errorResponse(
      "I could not complete that answer. Please try again or use the contact page if the issue continues.",
      503,
      "ASSISTANT_UNAVAILABLE",
    );
  }
}
