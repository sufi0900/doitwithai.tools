import { NextResponse, type NextRequest } from "next/server";
import { checkAiToolRateLimit } from "@/lib/ai-tools/rate-limit";
import { BodyError, readBoundedJson } from "@/lib/ai-tools/request-body";
import { sitemapFetchInputSchema } from "@/features/llms-txt-generator/schema";
import { fetchSitemapPages } from "@/features/llms-txt-generator/server/fetch-sitemap";

export const runtime = "nodejs";
export const maxDuration = 20;
export const dynamic = "force-dynamic";

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
    limit = await checkAiToolRateLimit(request, "llms-txt-sitemap", {
      dailyLimit: 30,
      burstLimit: 8,
    });
  } catch {
    return errorResponse(
      "The sitemap importer is temporarily unavailable.",
      503,
      "RATE_LIMIT_UNAVAILABLE",
    );
  }
  if (!limit.allowed) {
    return errorResponse(
      "You have reached the current import limit. Please try again later.",
      429,
      "RATE_LIMITED",
      { "Retry-After": String(limit.retryAfterSeconds) },
    );
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

  const input = sitemapFetchInputSchema.safeParse(body);
  if (!input.success) {
    return errorResponse("Enter a valid sitemap URL.", 422, "VALIDATION_ERROR");
  }

  try {
    const result = await fetchSitemapPages(input.data.sitemapUrl);
    return NextResponse.json(
      { ...result, meta: { remaining: limit.remaining } },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (cause) {
    return errorResponse(
      cause instanceof Error
        ? cause.message
        : "The sitemap could not be read safely.",
      422,
      "SITEMAP_FETCH_FAILED",
    );
  }
}
