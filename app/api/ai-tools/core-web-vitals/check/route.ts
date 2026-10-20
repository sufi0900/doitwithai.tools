import { NextResponse, type NextRequest } from "next/server";
import { checkAiToolRateLimit } from "@/lib/ai-tools/rate-limit";
import { BodyError, readBoundedJson } from "@/lib/ai-tools/request-body";
import { pageSpeedInputSchema } from "@/features/core-web-vitals/schema";
import { runPageSpeed } from "@/features/core-web-vitals/server/fetch-pagespeed";

export const runtime = "nodejs";
export const maxDuration = 55;
export const dynamic = "force-dynamic";

function errorResponse(message: string, status: number, code: string, headers?: HeadersInit) {
  return NextResponse.json(
    { error: { message, code } },
    { status, headers: { "Cache-Control": "no-store", ...headers } },
  );
}

export async function POST(request: NextRequest) {
  let limit;
  try {
    limit = await checkAiToolRateLimit(request, "core-web-vitals", { dailyLimit: 15, burstLimit: 4 });
  } catch {
    return errorResponse("The checker is temporarily unavailable.", 503, "RATE_LIMIT_UNAVAILABLE");
  }
  if (!limit.allowed) {
    return errorResponse("You have reached the current check limit. Please try again later.", 429, "RATE_LIMITED", {
      "Retry-After": String(limit.retryAfterSeconds),
    });
  }

  let body: unknown;
  try {
    body = await readBoundedJson(request, 4_000);
  } catch (e) {
    return errorResponse(
      e instanceof BodyError ? e.message : "Cannot read the request.",
      e instanceof BodyError ? e.status : 400,
      "INVALID_BODY",
    );
  }

  const input = pageSpeedInputSchema.safeParse(body);
  if (!input.success) {
    return errorResponse("Enter a valid page URL.", 422, "VALIDATION_ERROR");
  }
  if (!/^https?:\/\//i.test(input.data.url)) {
    return errorResponse("URL should be a full absolute URL starting with https://.", 422, "VALIDATION_ERROR");
  }

  try {
    const result = await runPageSpeed(input.data.url, input.data.strategy);
    return NextResponse.json(
      { result, meta: { remaining: limit.remaining } },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (cause) {
    return errorResponse(
      cause instanceof Error ? cause.message : "The check could not be completed.",
      422,
      "CHECK_FAILED",
    );
  }
}
