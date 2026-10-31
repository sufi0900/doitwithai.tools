import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { readBoundedJson, BodyError } from "@/lib/ai-tools/request-body";
import { checkAiToolRateLimit } from "@/lib/ai-tools/rate-limit";
import {
  fetchPublic,
  publicUrl,
} from "@/features/backlink-verifier/fetch.server";
import { auditInternalLinksFromPages } from "@/features/internal-link-anchor-auditor/model";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const schema = z.object({
  urls: z.array(z.string().trim().min(1).max(2048)).min(1).max(5),
  includeNavAndFooter: z.boolean().default(false),
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
    input = schema.parse(await readBoundedJson(request, 200_000));
    for (const u of input.urls) publicUrl(u);
  } catch (error) {
    return json(
      {
        error: {
          message:
            error instanceof BodyError
              ? error.message
              : "Provide between 1 and 5 valid public URLs on your domain.",
        },
      },
      error instanceof BodyError ? error.status : 422,
    );
  }

  let limit: Awaited<ReturnType<typeof checkAiToolRateLimit>>;
  try {
    limit = await checkAiToolRateLimit(
      request,
      "internal-link-anchor-auditor",
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
            "Live page fetching is temporarily unavailable. Use Pasted HTML mode instead.",
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

  const fetchedPages: Array<{ url: string; html: string }> = [];
  for (const rawUrl of input.urls) {
    try {
      const page = await fetchPublic(rawUrl, {
        signal: request.signal,
        html: true,
        timeout: 9000,
      });
      if (page.status >= 200 && page.status < 300 && page.html.trim()) {
        fetchedPages.push({ url: page.url, html: page.html });
      }
    } catch {
      /* skip inaccessible */
    }
  }

  if (!fetchedPages.length) {
    await limit.release?.().catch(() => undefined);
    return json(
      {
        error: {
          message:
            "Could not fetch HTML from the supplied URLs. Use Pasted HTML mode.",
        },
      },
      422,
    );
  }

  const report = auditInternalLinksFromPages(
    fetchedPages,
    input.includeNavAndFooter,
  );
  return json({ report });
}
