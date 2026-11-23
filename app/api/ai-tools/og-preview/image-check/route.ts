import { NextResponse, type NextRequest } from "next/server";
import { checkAiToolRateLimit } from "@/lib/ai-tools/rate-limit";
import { BodyError, readBoundedJson } from "@/lib/ai-tools/request-body";
import { imageCheckInputSchema } from "@/features/og-preview/schema";
import { probeImage } from "@/features/og-preview/server/image-probe";

export const runtime = "nodejs";
export const maxDuration = 20;
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
    limit = await checkAiToolRateLimit(request, "og-preview-image-check", { dailyLimit: 40, burstLimit: 10 });
  } catch {
    return errorResponse("The image checker is temporarily unavailable.", 503, "RATE_LIMIT_UNAVAILABLE");
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

  const input = imageCheckInputSchema.safeParse(body);
  if (!input.success) {
    return errorResponse("Enter a valid image URL.", 422, "VALIDATION_ERROR");
  }

  try {
    const result = await probeImage(input.data.imageUrl);
    return NextResponse.json(
      { result, meta: { remaining: limit.remaining } },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (cause) {
    return errorResponse(
      cause instanceof Error ? cause.message : "The image could not be checked safely.",
      422,
      "IMAGE_CHECK_FAILED",
    );
  }
}
