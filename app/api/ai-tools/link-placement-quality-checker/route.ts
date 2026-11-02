import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { readBoundedJson, BodyError } from "@/lib/ai-tools/request-body";
import { checkAiToolRateLimit } from "@/lib/ai-tools/rate-limit";
import {
  fetchPublic,
  publicUrl,
} from "@/features/backlink-verifier/fetch.server";
import {
  analyzePublisherProspectHtml,
  type ProspectVettingResult,
} from "@/features/link-placement-quality-checker/model";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const schema = z.object({
  urls: z.array(z.string().trim().min(1).max(2048)).min(1).max(5),
  nicheKeywords: z.array(z.string().trim().max(120)).max(20).default([]),
});

const json = (
  value: unknown,
  status = 200,
  headers: Record<string, string> = {},
) =>
  NextResponse.json(value, {
    status,
    headers: { "Cache-Control": "no-store", ...headers },
  });

export async function POST(request: NextRequest) {
  let input: z.infer<typeof schema>;
  try {
    input = schema.parse(await readBoundedJson(request, 250_000));
    for (const u of input.urls) publicUrl(u);
  } catch (error) {
    return json(
      {
        error: {
          message:
            error instanceof BodyError
              ? error.message
              : "Enter between 1 and 5 valid public HTTP/HTTPS prospect URLs.",
        },
      },
      error instanceof BodyError ? error.status : 422,
    );
  }

  let limit: Awaited<ReturnType<typeof checkAiToolRateLimit>>;
  try {
    limit = await checkAiToolRateLimit(
      request,
      "link-placement-quality-checker",
      {
        dailyLimit: 80,
        burstLimit: 15,
        refundFailures: true,
        allowPlanLimitFallback: true,
      },
    );
  } catch {
    return json(
      {
        error: {
          message:
            "Live prospect scanning is temporarily unavailable. Use Pasted HTML mode instead.",
        },
      },
      503,
    );
  }

  if (!limit.allowed) {
    return json(
      {
        error: {
          message:
            "Live scan limit reached. Wait briefly or inspect pasted HTML.",
        },
      },
      429,
      { "Retry-After": String(limit.retryAfterSeconds) },
    );
  }

  const results: ProspectVettingResult[] = [];
  const notes: string[] = [];

  for (const rawUrl of input.urls) {
    try {
      const page = await fetchPublic(rawUrl, {
        signal: request.signal,
        html: true,
        timeout: 10000,
      });
      if (page.status < 200 || page.status >= 300) {
        notes.push(
          `${rawUrl}: returned HTTP ${page.status} and could not be vetted.`,
        );
        continue;
      }
      const analyzed = analyzePublisherProspectHtml({
        html: page.html,
        url: rawUrl,
        finalUrl: page.url,
        httpStatus: page.status,
        headers: page.headers,
        nicheKeywords: input.nicheKeywords,
        method: "live",
      });
      results.push(analyzed);
    } catch (error) {
      notes.push(
        `${rawUrl}: ${error instanceof Error ? error.message : "Could not fetch page HTML."}`,
      );
    }
  }

  if (!results.length) {
    await limit.release?.().catch(() => undefined);
  }

  return json({ results, notes });
}
