import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { readBoundedJson, BodyError } from "@/lib/ai-tools/request-body";
import { checkAiToolRateLimit } from "@/lib/ai-tools/rate-limit";
import {
  fetchPublic,
  publicUrl,
} from "@/features/backlink-verifier/fetch.server";
import { extractAnchorsFromHtml } from "@/features/anchor-text-analyzer/html-extract";
import type { AnchorRow } from "@/features/anchor-text-analyzer/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const schema = z.object({
  urls: z.array(z.string().trim().min(1).max(2048)).min(1).max(5),
  targetDomain: z.string().trim().max(500).default(""),
  brandTerms: z.array(z.string().trim().max(120)).max(15).default([]),
  targetKeywords: z.array(z.string().trim().max(160)).max(25).default([]),
  scope: z
    .enum(["all-links", "external-only", "target-domain-only"])
    .default("all-links"),
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
              : "Provide between 1 and 5 valid public HTTP/HTTPS URLs.",
        },
      },
      error instanceof BodyError ? error.status : 422,
    );
  }

  let limit: Awaited<ReturnType<typeof checkAiToolRateLimit>>;
  try {
    limit = await checkAiToolRateLimit(request, "anchor-text-analyzer", {
      dailyLimit: 80,
      burstLimit: 15,
      refundFailures: true,
      allowPlanLimitFallback: true,
    });
  } catch {
    return json(
      {
        error: {
          message:
            "Live URL fetching is temporarily unavailable. Use CSV/table paste or HTML mode instead.",
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
            "Live page check limit reached. Wait briefly or analyze a CSV/pasted backlink table.",
        },
      },
      429,
      { "Retry-After": String(limit.retryAfterSeconds) },
    );
  }

  const allRows: AnchorRow[] = [];
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
          `${rawUrl}: returned HTTP ${page.status} and could not be parsed.`,
        );
        continue;
      }
      const extracted = extractAnchorsFromHtml({
        html: page.html,
        sourceUrl: page.url,
        targetDomain: input.targetDomain,
        brandTerms: input.brandTerms,
        targetKeywords: input.targetKeywords,
        scope: input.scope,
      });
      allRows.push(...extracted.rows);
    } catch (error) {
      notes.push(
        `${rawUrl}: ${error instanceof Error ? error.message : "Could not fetch page HTML."}`,
      );
    }
  }

  if (!allRows.length) {
    await limit.release?.().catch(() => undefined);
  }

  return json({ rows: allRows, notes });
}
