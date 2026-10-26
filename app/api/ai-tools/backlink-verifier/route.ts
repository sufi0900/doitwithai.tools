import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { readBoundedJson, BodyError } from "@/lib/ai-tools/request-body";
import { checkAiToolRateLimit } from "@/lib/ai-tools/rate-limit";
import { analyzeHtml } from "@/features/backlink-verifier/analyze";
import { publicUrl } from "@/features/backlink-verifier/fetch.server";
import { verifySources } from "@/features/backlink-verifier/verify.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;
const schema = z.object({
  target: z.string().trim().min(1).max(2048),
  mode: z.enum(["domain", "page"]).default("domain"),
  includeSubdomains: z.boolean().default(false),
  expectedAnchor: z.string().trim().max(300).default(""),
  expectedRel: z
    .enum(["any", "unqualified", "nofollow", "sponsored", "ugc"])
    .default("any"),
  sources: z.array(z.string().trim().min(1).max(2048)).min(1).max(5),
  html: z.string().max(750000).optional(),
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
    input = schema.parse(await readBoundedJson(request, 1000000));
    publicUrl(input.target);
    for (const source of input.sources) publicUrl(source);
    if (
      input.html !== undefined &&
      (!input.html.trim() || input.sources.length !== 1)
    )
      return json(
        {
          error: {
            message:
              "Pasted HTML requires one source page URL and non-empty HTML.",
          },
        },
        422,
      );
  } catch (error) {
    return json(
      {
        error: {
          message:
            error instanceof BodyError
              ? error.message
              : "Enter a valid public target and up to five public source URLs per batch.",
        },
      },
      error instanceof BodyError ? error.status : 422,
    );
  }
  if (input.html !== undefined)
    return json({
      reports: [
        analyzeHtml(input.html, input.sources[0], input, {
          method: "pasted",
          complete: true,
        }),
      ],
    });
  let limit: Awaited<ReturnType<typeof checkAiToolRateLimit>>;
  try {
    limit = await checkAiToolRateLimit(request, "backlink-verifier", {
      dailyLimit: 100,
      burstLimit: 20,
      refundFailures: true,
      allowPlanLimitFallback: true,
    });
  } catch {
    return json(
      {
        error: {
          message:
            "Live checks are temporarily unavailable. Use pasted HTML or try again later.",
        },
      },
      503,
    );
  }
  if (!limit.allowed)
    return json(
      {
        error: {
          message:
            "The live-check allowance was reached. Wait and retry, or inspect pasted HTML.",
        },
      },
      429,
      { "Retry-After": String(limit.retryAfterSeconds) },
    );
  try {
    const reports = await verifySources(input.sources, input, request.signal);
    if (reports.every((r) => r.status === "unverified"))
      await limit.release?.().catch(() => undefined);
    return json({ reports });
  } catch (error) {
    await limit.release?.().catch(() => undefined);
    console.error(
      "Backlink batch failed",
      error instanceof Error ? error.name : "Unknown error",
    );
    return json(
      {
        error: {
          message:
            "The batch could not finish. Try fewer sources or pasted HTML.",
        },
      },
      503,
    );
  }
}
