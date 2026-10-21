import { NextResponse, type NextRequest } from "next/server";
import { checkAiToolRateLimit } from "@/lib/ai-tools/rate-limit";
import { BodyError, readBoundedJson } from "@/lib/ai-tools/request-body";
import { serpImportInputSchema } from "@/features/serp-preview/schema";
import { fetchPageSerpData } from "@/features/serp-preview/server/fetch-page-data";

export const runtime = "nodejs";
export const maxDuration = 25;
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

const cache = new Map<
  string,
  { expires: number; result: Awaited<ReturnType<typeof fetchPageSerpData>> }
>();

export async function POST(request: NextRequest) {
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

  const input = serpImportInputSchema.safeParse(body);
  if (!input.success) {
    return errorResponse("Enter a valid page URL.", 422, "VALIDATION_ERROR");
  }

  let limit;
  try {
    limit = await checkAiToolRateLimit(request, "serp-preview-import", {
      dailyLimit: 100,
      burstLimit: 20,
      refundFailures: true,
      allowPlanLimitFallback: true,
    });
  } catch {
    return errorResponse(
      "The importer is temporarily unavailable.",
      503,
      "RATE_LIMIT_UNAVAILABLE",
    );
  }
  if (!limit.allowed) {
    return errorResponse(
      "The URL import limit was reached. Please try again later, or edit the preview manually.",
      429,
      "RATE_LIMITED",
      {
        "Retry-After": String(limit.retryAfterSeconds),
      },
    );
  }

  try {
    const url = new URL(input.data.pageUrl);
    url.hash = "";
    const key = `${input.data.includeStructuredData}:${url}`;
    const cached = cache.get(key);
    if (cached && cached.expires > Date.now()) {
      await limit.release?.().catch(() => undefined);
      return NextResponse.json(
        { result: cached.result, meta: { cached: true } },
        { headers: { "Cache-Control": "no-store" } },
      );
    }
    const result = await fetchPageSerpData(
      url.toString(),
      input.data.includeStructuredData,
    );
    for (const [entry, value] of cache)
      if (value.expires <= Date.now()) cache.delete(entry);
    if (cache.size >= 60) cache.delete(cache.keys().next().value!);
    if (JSON.stringify(result).length < 400_000)
      cache.set(key, { expires: Date.now() + 300_000, result });
    return NextResponse.json(
      { result, meta: { remaining: limit.remaining } },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (cause) {
    await limit.release?.().catch(() => undefined);
    return errorResponse(
      cause instanceof Error &&
        /^(Enter|Only|Private|URLs|The page|The website|That URL)/.test(
          cause.message,
        )
        ? cause.message
        : "The page did not respond in time. Try quick import or enter the metadata manually.",
      422,
      "IMPORT_FAILED",
    );
  }
}
