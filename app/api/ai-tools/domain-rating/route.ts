import { NextRequest, NextResponse } from "next/server";
import { BodyError, readBoundedJson } from "@/lib/ai-tools/request-body";
import { checkAiToolRateLimit } from "@/lib/ai-tools/rate-limit";
import { normalizeDomain } from "@/features/domain-rating/domain";
import {
  lookupRating,
  RatingError,
} from "@/features/domain-rating/provider.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;
const json = (
  body: unknown,
  status = 200,
  headers: Record<string, string> = {},
) =>
  NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store", ...headers },
  });

export async function POST(request: NextRequest) {
  let domain: string;
  try {
    const input = await readBoundedJson(request, 4096);
    domain = normalizeDomain((input as { domain?: unknown } | null)?.domain);
  } catch (error) {
    return json(
      {
        error: {
          code: "INVALID_INPUT",
          message:
            error instanceof Error
              ? error.message
              : "Enter one website domain.",
        },
      },
      error instanceof BodyError ? error.status : 422,
    );
  }
  // The standalone public use needs license clarification before production release.
  if (
    process.env.VERCEL_ENV === "production" &&
    process.env.DOMAIN_RATING_PUBLIC_ENABLED !== "true"
  )
    return json(
      {
        error: {
          code: "PREVIEW_ONLY",
          message:
            "This checker is in preview and is not available on this deployment yet.",
        },
      },
      503,
    );
  const key = process.env.AHREFS_API_KEY?.trim();
  if (!key)
    return json(
      {
        error: {
          code: "NOT_CONFIGURED",
          message:
            "The rating service is not connected yet. Please return later.",
        },
      },
      503,
    );
  let limit: Awaited<ReturnType<typeof checkAiToolRateLimit>>;
  try {
    limit = await checkAiToolRateLimit(request, "domain-rating", {
      dailyLimit: 30,
      burstLimit: 5,
      refundFailures: true,
    });
  } catch {
    return json(
      {
        error: {
          code: "LIMIT_UNAVAILABLE",
          message: "Checks are temporarily unavailable. Please return later.",
        },
      },
      503,
    );
  }
  if (!limit.allowed)
    return json(
      {
        error: {
          code: "RATE_LIMIT",
          message:
            "Your check allowance was reached. Please wait before checking again.",
        },
      },
      429,
      { "Retry-After": String(limit.retryAfterSeconds) },
    );
  try {
    return json({
      result: await lookupRating(
        domain,
        key,
        AbortSignal.any([request.signal, AbortSignal.timeout(15000)]),
      ),
    });
  } catch (error) {
    await limit.release?.().catch(() => undefined);
    if (error instanceof RatingError)
      return json(
        { error: { code: error.code, message: error.message } },
        error.status,
        error.status === 429 ? { "Retry-After": "60" } : {},
      );
    return json(
      {
        error: {
          code: "CHECK_FAILED",
          message: "The check could not finish. Please try again.",
        },
      },
      503,
    );
  }
}
