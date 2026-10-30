import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { BodyError, readBoundedJson } from "@/lib/ai-tools/request-body";
import { checkAiToolRateLimit } from "@/lib/ai-tools/rate-limit";
import {
  fetchPageHeadings,
  type PageHeadings,
} from "@/features/heading-analyzer/server/fetch-headings";

export const runtime = "nodejs";
export const maxDuration = 25;
export const dynamic = "force-dynamic";
const schema = z.object({
  pageUrl: z
    .string()
    .trim()
    .url()
    .max(2048)
    .refine((s) => /^https?:\/\//i.test(s)),
  mainOnly: z.boolean().default(true),
});
const cache = new Map<string, { expires: number; result: PageHeadings }>();
const fail = (message: string, status: number, retryAfter?: number) =>
  NextResponse.json(
    { error: { message } },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
        ...(retryAfter ? { "Retry-After": String(retryAfter) } : {}),
      },
    },
  );

export async function POST(request: NextRequest) {
  let input: z.infer<typeof schema>;
  try {
    const parsed = schema.safeParse(await readBoundedJson(request, 5000));
    if (!parsed.success)
      return fail("Enter a valid public http:// or https:// page URL.", 422);
    input = parsed.data;
  } catch (e) {
    return fail(
      e instanceof BodyError ? e.message : "Cannot read this request.",
      e instanceof BodyError ? e.status : 400,
    );
  }
  let limit: Awaited<ReturnType<typeof checkAiToolRateLimit>>;
  try {
    limit = await checkAiToolRateLimit(request, "heading-analyzer", {
      dailyLimit: 50,
      burstLimit: 10,
      refundFailures: true,
      allowPlanLimitFallback: true,
    });
  } catch {
    return fail(
      "URL checks are temporarily unavailable. You can still analyze pasted HTML or Markdown.",
      503,
    );
  }
  if (!limit.allowed)
    return fail(
      "You have reached the current URL check limit. Try again later or use Paste content.",
      429,
      limit.retryAfterSeconds,
    );
  const url = new URL(input.pageUrl);
  url.hash = "";
  const key = `${input.mainOnly}:${url}`;
  const stored = cache.get(key);
  if (stored && stored.expires > Date.now())
    return NextResponse.json(
      { result: stored.result, cached: true },
      { headers: { "Cache-Control": "no-store" } },
    );
  try {
    const result = await fetchPageHeadings(url.toString(), input.mainOnly);
    for (const [entry, value] of cache)
      if (value.expires <= Date.now()) cache.delete(entry);
    if (cache.size >= 60) cache.delete(cache.keys().next().value!);
    cache.set(key, { expires: Date.now() + 300_000, result });
    return NextResponse.json(
      { result, cached: false },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    await limit.release?.().catch(() => undefined);
    const known =
      e instanceof Error &&
      /^(Enter|Only|Private|URLs|The page|The website|This page)/.test(
        e.message,
      );
    return fail(
      known
        ? e.message
        : "The page could not be read within the time limit. Try Paste content or another public page.",
      422,
    );
  }
}
