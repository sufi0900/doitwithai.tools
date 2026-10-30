import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { readBoundedJson, BodyError } from "@/lib/ai-tools/request-body";
import { checkAiToolRateLimit } from "@/lib/ai-tools/rate-limit";
import { publicUrl } from "@/features/backlink-verifier/fetch.server";
import { inspectPage } from "@/features/broken-links/inspect.server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;
const schema = z.object({
  source: z.string().trim().min(1).max(2048),
  limit: z.number().int().min(5).max(30).default(15),
  html: z.string().min(1).max(500000).optional(),
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
    input = schema.parse(await readBoundedJson(request, 550000));
    input.source = publicUrl(input.source).href;
    if (
      input.html !== undefined &&
      (!input.html.trim() || Buffer.byteLength(input.html) > 500000)
    )
      throw new Error("Invalid HTML");
  } catch (e) {
    return json(
      {
        error: {
          message:
            e instanceof BodyError
              ? e.message
              : "Enter one public publisher page URL. Supplied HTML must be non-empty and below 500 KB.",
        },
      },
      e instanceof BodyError ? e.status : 422,
    );
  }
  let quota: Awaited<ReturnType<typeof checkAiToolRateLimit>>;
  try {
    quota = await checkAiToolRateLimit(request, "broken-links", {
      dailyLimit: 50,
      burstLimit: 10,
      refundFailures: true,
      allowPlanLimitFallback: true,
    });
  } catch {
    return json(
      {
        error: {
          message:
            "Live link checks are temporarily unavailable. Please return later.",
        },
      },
      503,
    );
  }
  if (!quota.allowed)
    return json(
      {
        error: {
          message:
            "Your live-check allowance was reached. Please wait before trying again.",
        },
      },
      429,
      { "Retry-After": String(quota.retryAfterSeconds) },
    );
  try {
    const report = await inspectPage(
      input.source,
      input.limit,
      input.html,
      AbortSignal.any([request.signal, AbortSignal.timeout(45000)]),
    );
    if (report.error || !report.checkedCount)
      await quota.release?.().catch(() => undefined);
    return json({ report });
  } catch {
    await quota.release?.().catch(() => undefined);
    return json(
      {
        error: {
          message: "This scan could not finish. Try one page or return later.",
        },
      },
      503,
    );
  }
}
