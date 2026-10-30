import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { BodyError, readBoundedJson } from "@/lib/ai-tools/request-body";
import { checkAiToolRateLimit } from "@/lib/ai-tools/rate-limit";
import { extractHtml } from "@/features/on-page-analyzer/server/extract";
import { importFailure } from "@/features/on-page-analyzer/import-errors";
import { fetchAuditPage } from "@/features/on-page-analyzer/server/fetch";
import type { PageSnapshot } from "@/features/on-page-analyzer/types";
export const runtime = "nodejs";
export const maxDuration = 30;
export const dynamic = "force-dynamic";
const inputSchema = z
  .object({
    url: z
      .string()
      .trim()
      .max(2048)
      .default("")
      .refine((value) => {
        if (!value) return true;
        try {
          const u = new URL(value);
          return /^https?:$/.test(u.protocol) && !u.username && !u.password;
        } catch {
          return false;
        }
      }),
    html: z.string().max(750000).default(""),
  })
  .refine((i) => i.html.trim() || /^https?:\/\//i.test(i.url));
const cache = new Map<string, { until: number; page: PageSnapshot }>();
const pending = new Map<string, Promise<PageSnapshot>>();
const json = (data: unknown, status = 200) =>
  NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });
export async function POST(request: NextRequest) {
  let input: z.infer<typeof inputSchema>;
  try {
    input = inputSchema.parse(await readBoundedJson(request, 1000000));
  } catch (e) {
    return json(
      {
        error: {
          message:
            e instanceof BodyError
              ? e.message
              : "Enter a public page URL or paste HTML up to 750,000 characters.",
        },
      },
      e instanceof BodyError ? e.status : 422,
    );
  }
  if (input.html.trim()) {
    try {
      return json({
        result: extractHtml(
          input.html,
          /^https?:\/\//i.test(input.url) ? input.url : "",
        ),
      });
    } catch {
      return json(
        {
          error: {
            message:
              "This HTML could not be parsed. Try a smaller main content section.",
          },
        },
        422,
      );
    }
  }
  let key: string;
  try {
    const url = new URL(input.url);
    url.hash = "";
    key = url.toString();
  } catch {
    return json({ error: { message: "Enter a valid public URL." } }, 422);
  }
  const cached = cache.get(key);
  if (cached && cached.until > Date.now())
    return json({ result: cached.page, cached: true });
  const running = pending.get(key);
  if (running) {
    try {
      return json({ result: await running, cached: true });
    } catch (e) {
      return json({ error: importFailure(e) }, 422);
    }
  }
  if (pending.size >= 8)
    return json(
      {
        error: {
          message:
            "URL imports are busy right now. Try again shortly or paste HTML.",
        },
      },
      503,
    );
  let limit: Awaited<ReturnType<typeof checkAiToolRateLimit>>;
  try {
    limit = await checkAiToolRateLimit(request, "on-page-audit", {
      dailyLimit: 60,
      burstLimit: 15,
      refundFailures: true,
      allowPlanLimitFallback: true,
    });
  } catch {
    return json(
      {
        error: {
          message:
            "URL imports are temporarily unavailable. Paste HTML to continue your audit.",
        },
      },
      503,
    );
  }
  if (!limit.allowed)
    return NextResponse.json(
      {
        error: {
          message:
            "The URL import limit has been reached. Try later or audit pasted HTML.",
        },
      },
      {
        status: 429,
        headers: {
          "Cache-Control": "no-store",
          "Retry-After": String(limit.retryAfterSeconds),
        },
      },
    );
  const shared = pending.get(key);
  if (shared) {
    await limit.release?.().catch(() => undefined);
    try {
      return json({ result: await shared, cached: true });
    } catch (e) {
      return json({ error: importFailure(e) }, 422);
    }
  }
  if (pending.size >= 8) {
    await limit.release?.().catch(() => undefined);
    return json(
      {
        error: {
          message:
            "URL imports are busy right now. Try again shortly or paste HTML.",
        },
      },
      503,
    );
  }
  try {
    const task = fetchAuditPage(key);
    pending.set(key, task);
    const page = await task;
    for (const [k, v] of cache) if (v.until <= Date.now()) cache.delete(k);
    if (cache.size >= 12) cache.delete(cache.keys().next().value!);
    cache.set(key, { until: Date.now() + 120000, page });
    return json({ result: page, cached: false });
  } catch (e) {
    await limit.release?.().catch(() => undefined);
    return json({ error: importFailure(e) }, 422);
  } finally {
    pending.delete(key);
  }
}
