import { NextResponse, type NextRequest } from "next/server";
import { checkAiToolRateLimit } from "@/lib/ai-tools/rate-limit";
import { BodyError, readBoundedJson } from "@/lib/ai-tools/request-body";
import { robotsFetchInputSchema } from "@/features/robots-generator/schema";
import { fetchRobotsTxt } from "@/features/robots-generator/server/fetch-robots";
import { parseRobotsTxt } from "@/features/robots-generator/generator";

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

function toRobotsUrl(input: string) {
  const withScheme = /^https?:\/\//i.test(input) ? input : `https://${input}`;
  const parsed = new URL(withScheme);
  if (!/\/robots\.txt$/i.test(parsed.pathname)) {
    parsed.pathname = "/robots.txt";
  }
  parsed.search = "";
  parsed.hash = "";
  return parsed.toString();
}

export async function POST(request: NextRequest) {
  let limit;
  try {
    limit = await checkAiToolRateLimit(request, "robots-txt-fetch", {
      dailyLimit: 30,
      burstLimit: 8,
    });
  } catch {
    return errorResponse(
      "The robots.txt fetcher is temporarily unavailable.",
      503,
      "RATE_LIMIT_UNAVAILABLE",
    );
  }
  if (!limit.allowed) {
    return errorResponse(
      "You have reached the current fetch limit. Please try again later.",
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

  const input = robotsFetchInputSchema.safeParse(body);
  if (!input.success) {
    return errorResponse(
      "Enter a valid site or robots.txt URL.",
      422,
      "VALIDATION_ERROR",
    );
  }

  let target: string;
  try {
    target = toRobotsUrl(input.data.siteUrl);
  } catch {
    return errorResponse(
      "That doesn't look like a valid URL.",
      422,
      "VALIDATION_ERROR",
    );
  }

  try {
    const { text, finalUrl } = await fetchRobotsTxt(target);
    const state = parseRobotsTxt(text);
    return NextResponse.json(
      { state, raw: text, finalUrl, meta: { remaining: limit.remaining } },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (cause) {
    return errorResponse(
      cause instanceof Error
        ? cause.message
        : "robots.txt could not be fetched safely.",
      422,
      "FETCH_FAILED",
    );
  }
}
