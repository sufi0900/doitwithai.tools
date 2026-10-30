import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { readBoundedJson, BodyError } from "@/lib/ai-tools/request-body";
import { checkAiToolRateLimit } from "@/lib/ai-tools/rate-limit";
import {
  fetchPublic,
  publicUrl,
} from "@/features/backlink-verifier/fetch.server";
import { analyzeEeatHtml } from "@/features/eeat-content-auditor/model";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const schema = z.object({
  url: z.string().trim().min(1).max(2048),
  strictness: z.enum(["standard", "ymyl"]).default("standard"),
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
    input = schema.parse(await readBoundedJson(request, 100_000));
    publicUrl(input.url);
  } catch (error) {
    return json(
      {
        error: {
          message:
            error instanceof BodyError
              ? error.message
              : "Enter a valid public HTTP or HTTPS webpage URL.",
        },
      },
      error instanceof BodyError ? error.status : 422,
    );
  }

  let limit: Awaited<ReturnType<typeof checkAiToolRateLimit>>;
  try {
    limit = await checkAiToolRateLimit(request, "eeat-content-auditor", {
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
            "Live URL fetching is temporarily unavailable. Use Pasted HTML mode instead.",
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
            "Live audit rate limit reached. Wait briefly or inspect pasted HTML.",
        },
      },
      429,
      { "Retry-After": String(limit.retryAfterSeconds) },
    );
  }

  try {
    const page = await fetchPublic(input.url, {
      signal: request.signal,
      html: true,
      timeout: 10000,
    });
    if (page.status < 200 || page.status >= 300) {
      await limit.release?.().catch(() => undefined);
      return json(
        {
          error: {
            message: `Target URL returned HTTP ${page.status}. Paste its HTML to audit offline.`,
          },
        },
        422,
      );
    }

    const report = analyzeEeatHtml({
      html: page.html,
      url: page.url,
      strictness: input.strictness,
      mode: "live",
    });

    return json({ report });
  } catch (error) {
    await limit.release?.().catch(() => undefined);
    return json(
      {
        error: {
          message:
            error instanceof Error
              ? error.message
              : "Could not fetch page HTML. Try Pasted HTML mode.",
        },
      },
      502,
    );
  }
}
