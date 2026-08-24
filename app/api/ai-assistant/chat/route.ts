import { NextRequest, NextResponse } from "next/server";
import { siteAssistantRequestSchema } from "@/features/site-assistant/schema";
import { answerSiteAssistant } from "@/features/site-assistant/server/chat";
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
    body = await request.json();
  } catch {
    return errorResponse("Send a valid JSON request.", 400, "INVALID_JSON");
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

  if (!process.env.OPENAI_API_KEY) {
    return errorResponse(
      "The website assistant has not been connected yet.",
      503,
      "AI_NOT_CONFIGURED",
    );
  }

  if (!process.env.OPENAI_SITE_ASSISTANT_VECTOR_STORE_ID) {
    return errorResponse(
      "The website knowledge base has not been synchronized yet.",
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
    console.error("Site assistant response failed", error);
    return errorResponse(
      "I could not complete that answer. Please try again or use the contact page if the issue continues.",
      503,
      "ASSISTANT_UNAVAILABLE",
    );
  }
}
