import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { readBoundedJson, BodyError } from "@/lib/ai-tools/request-body";
import { checkAiToolRateLimit } from "@/lib/ai-tools/rate-limit";
import { publicUrl } from "@/features/backlink-verifier/fetch.server";
import { analyzeMentions } from "@/features/brand-mentions/analyze";
import { verifyMentions } from "@/features/brand-mentions/verify.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;
const schema = z.object({
  brand: z.string().trim().min(2).max(100),
  target: z.string().trim().min(1).max(2048),
  aliases: z.array(z.string().trim().min(2).max(100)).max(5).default([]),
  caseSensitive: z.boolean().default(false),
  includeSubdomains: z.boolean().default(true),
  sources: z.array(z.string().trim().min(1).max(2048)).min(1).max(5),
  html: z.string().min(1).max(750000).optional(),
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
    input.sources.forEach(publicUrl);
    if (
      input.html !== undefined &&
      (input.sources.length !== 1 ||
        !input.html.trim() ||
        Buffer.byteLength(input.html, "utf8") > 750000)
    )
      return json(
        {
          error: {
            message:
              "Supplied HTML needs one source URL and non-empty HTML below 750 KB.",
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
              : "Enter a brand name, a public website URL, and one to five public source page URLs per batch.",
        },
      },
      error instanceof BodyError ? error.status : 422,
    );
  }
  if (input.html !== undefined)
    return json({
      reports: [
        analyzeMentions(input.html, input.sources[0], input, {
          method: "pasted",
        }),
      ],
    });
  let limit: Awaited<ReturnType<typeof checkAiToolRateLimit>>;
  try {
    limit = await checkAiToolRateLimit(request, "brand-mentions", {
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
            "Live checks are temporarily unavailable. Try supplied HTML or return later.",
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
            "The live-check allowance was reached. Wait and retry, or inspect supplied HTML.",
        },
      },
      429,
      { "Retry-After": String(limit.retryAfterSeconds) },
    );
  try {
    const reports = await verifyMentions(
      input.sources,
      input,
      AbortSignal.any([request.signal, AbortSignal.timeout(45000)]),
    );
    if (
      reports.every((r) => r.status === "unverified" || r.status === "own-site")
    )
      await limit.release?.().catch(() => undefined);
    return json({ reports });
  } catch {
    await limit.release?.().catch(() => undefined);
    return json(
      {
        error: {
          message:
            "The batch could not finish. Try fewer pages or supplied HTML.",
        },
      },
      503,
    );
  }
}
