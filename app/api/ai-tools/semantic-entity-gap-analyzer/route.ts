import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { readBoundedJson, BodyError } from "@/lib/ai-tools/request-body";
import { checkAiToolRateLimit } from "@/lib/ai-tools/rate-limit";
import {
  fetchPublic,
  publicUrl,
} from "@/features/backlink-verifier/fetch.server";
import { compareSemanticEntityCoverage } from "@/features/semantic-entity-gap-analyzer/model";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const schema = z.object({
  targetKeyword: z.string().trim().max(200).default(""),
  yourUrl: z.string().trim().max(2048).default(""),
  yourContent: z.string().max(400_000).default(""),
  competitorUrls: z.array(z.string().trim().min(1).max(2048)).min(1).max(3),
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
    input = schema.parse(await readBoundedJson(request, 500_000));
    if (input.yourUrl) publicUrl(input.yourUrl);
    for (const u of input.competitorUrls) publicUrl(u);
  } catch (error) {
    return json(
      {
        error: {
          message:
            error instanceof BodyError
              ? error.message
              : "Provide your page URL or draft text and 1 to 3 valid public competitor URLs.",
        },
      },
      error instanceof BodyError ? error.status : 422,
    );
  }

  let limit: Awaited<ReturnType<typeof checkAiToolRateLimit>>;
  try {
    limit = await checkAiToolRateLimit(
      request,
      "semantic-entity-gap-analyzer",
      {
        dailyLimit: 60,
        burstLimit: 12,
        refundFailures: true,
        allowPlanLimitFallback: true,
      },
    );
  } catch {
    return json(
      {
        error: {
          message:
            "Live competitor fetching is temporarily unavailable. Paste competitor text/HTML instead.",
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
            "Live comparison limit reached. Wait briefly or use Pasted Content mode.",
        },
      },
      429,
      { "Retry-After": String(limit.retryAfterSeconds) },
    );
  }

  let yourHtmlOrText = input.yourContent;
  if (input.yourUrl && !yourHtmlOrText.trim()) {
    try {
      const page = await fetchPublic(input.yourUrl, {
        signal: request.signal,
        html: true,
        timeout: 9000,
      });
      if (page.status >= 200 && page.status < 300) {
        yourHtmlOrText = page.html;
      }
    } catch {
      /* handled below */
    }
  }

  if (!yourHtmlOrText.trim()) {
    await limit.release?.().catch(() => undefined);
    return json(
      {
        error: {
          message:
            "Could not fetch your target URL. Paste your draft text or HTML directly.",
        },
      },
      422,
    );
  }

  const competitorDocs: Array<{ htmlOrText: string; url: string }> = [];
  for (const compUrl of input.competitorUrls) {
    try {
      const page = await fetchPublic(compUrl, {
        signal: request.signal,
        html: true,
        timeout: 9000,
      });
      if (page.status >= 200 && page.status < 300 && page.html.trim()) {
        competitorDocs.push({ htmlOrText: page.html, url: page.url });
      }
    } catch {
      /* skip inaccessible competitor */
    }
  }

  if (!competitorDocs.length) {
    await limit.release?.().catch(() => undefined);
    return json(
      {
        error: {
          message:
            "Could not fetch HTML from the supplied competitor URLs. Switch to Pasted Competitor Text mode.",
        },
      },
      422,
    );
  }

  const report = compareSemanticEntityCoverage({
    targetKeyword: input.targetKeyword,
    yourDoc: {
      htmlOrText: yourHtmlOrText,
      url: input.yourUrl || "Your Page",
    },
    competitorDocs,
  });

  return json({ report });
}
