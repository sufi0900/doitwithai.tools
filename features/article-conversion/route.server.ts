import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { readBoundedJson, BodyError } from "@/lib/ai-tools/request-body";
import { checkAiToolRateLimit } from "@/lib/ai-tools/rate-limit";
import { publicUrl } from "../backlink-verifier/fetch.server";
import { importArticle, importImage } from "./import.server";
const schema = z.object({ url: z.string().trim().min(1).max(2048) });
const json = (v: unknown, status = 200, headers: Record<string, string> = {}) =>
  NextResponse.json(v, {
    status,
    headers: { "Cache-Control": "no-store", ...headers },
  });
export async function handleImport(
  req: NextRequest,
  image = false,
  deps = {
    quota: checkAiToolRateLimit,
    article: importArticle,
    image: importImage,
  },
) {
  let url: string;
  try {
    url = publicUrl(schema.parse(await readBoundedJson(req, 4096)).url).href;
  } catch (e) {
    return json(
      {
        error: {
          message:
            e instanceof BodyError
              ? e.message
              : "Enter one public HTTP or HTTPS URL without credentials or a custom port.",
        },
      },
      e instanceof BodyError ? e.status : 422,
    );
  }
  let q: Awaited<ReturnType<typeof checkAiToolRateLimit>>;
  try {
    q = await deps.quota(req, image ? "article-image" : "article-import", {
      dailyLimit: image ? 300 : 50,
      burstLimit: image ? 30 : 10,
      refundFailures: true,
      allowPlanLimitFallback: true,
    });
  } catch {
    return json(
      {
        error: {
          message:
            "URL imports are temporarily unavailable. Paste article text or HTML to continue.",
        },
      },
      503,
    );
  }
  if (!q.allowed)
    return json(
      {
        error: {
          message:
            "The import allowance was reached. Wait or use pasted content.",
        },
      },
      429,
      { "Retry-After": String(q.retryAfterSeconds) },
    );
  try {
    const signal = AbortSignal.any([
      req.signal,
      AbortSignal.timeout(image ? 9000 : 22000),
    ]);
    const r = image
      ? await deps.image(url, signal)
      : await deps.article(url, signal);
    return json(image ? r : { article: r });
  } catch (e) {
    await q.release?.().catch(() => undefined);
    const raw = e instanceof Error ? e.message : "";
    const message = /abort|timeout|timed out/i.test(raw)
      ? "The import timed out or was interrupted. Retry or paste the content."
      : /private|reserved|Local,|unsupported|blocked|publisher|PNG|JPEG|HTML|limit|readable|challenge|redirect|exceeds/i.test(
            raw,
          )
        ? raw
        : "This source could not be imported. Check the URL or paste the content.";
    return json({ error: { message } }, 422);
  }
}
