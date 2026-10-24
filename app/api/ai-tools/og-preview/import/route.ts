import { NextResponse, type NextRequest } from "next/server";
import { checkAiToolRateLimit } from "@/lib/ai-tools/rate-limit";
import { BodyError, readBoundedJson } from "@/lib/ai-tools/request-body";
import { ogImportInputSchema } from "@/features/og-preview/schema";
import { fetchExistingOgTags } from "@/features/og-preview/server/fetch-og-tags";

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
    limit = await checkAiToolRateLimit(request, "og-preview-import", { dailyLimit: 30, burstLimit: 8 });
  } catch {
    return errorResponse("The importer is temporarily unavailable.", 503, "RATE_LIMIT_UNAVAILABLE");
  }
  if (!limit.allowed) {
    return errorResponse("You have reached the current import limit. Please try again later.", 429, "RATE_LIMITED", {
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

  const input = ogImportInputSchema.safeParse(body);
  if (!input.success) {
    return errorResponse("Enter a valid page URL.", 422, "VALIDATION_ERROR");
  }

  try {
    const { state, finalUrl } = await fetchExistingOgTags(input.data.pageUrl);
    return NextResponse.json(
      { state, finalUrl, meta: { remaining: limit.remaining } },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (cause) {
    return errorResponse(
      cause instanceof Error ? cause.message : "The page could not be read safely.",
      422,
      "IMPORT_FAILED",
    );
  }
}
