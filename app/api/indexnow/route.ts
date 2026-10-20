import { NextResponse } from "next/server";
import { BodyError, readBoundedJson } from "@/lib/ai-tools/request-body";
import { assertSafeFetchUrl } from "@/features/schema-generator/server/fetch-page";
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import {
  INDEXNOW_ENDPOINT,
  MAX_URLS,
  buildPayload,
  describeStatus,
  isValidHost,
  isValidKey,
  keyFileUrl,
  normalizeHost,
  parseUrlList,
} from "@/features/indexnow/indexnowLib";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Best-effort per-instance rate limit. On serverless hosts each instance has its own memory,
// so treat this as a courtesy guard, not a hard limit.
const hits = new Map<string, number[]>();
function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const windowMs = 10 * 60 * 1000;
  const recent = (hits.get(ip) ?? []).filter((time) => now - time < windowMs);
  if (recent.length >= 20) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return false;
}

function isPrivateIp(ip: string): boolean {
  const version = isIP(ip);
  if (version === 4) {
    const [a, b] = ip.split(".").map(Number);
    return (
      a === 0 || a === 10 || a === 127 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 192 && b === 0) ||
      (a === 198 && (b === 18 || b === 19)) ||
      a >= 224
    );
  }
  if (version === 6) {
    const lower = ip.toLowerCase();
    if (lower === "::1" || lower === "::") return true;
    if (/^(fc|fd|fe8|fe9|fea|feb)/.test(lower)) return true;
    if (lower.startsWith("::ffff:")) {
      const mapped = lower.slice(7);
      return mapped.includes(".") ? isPrivateIp(mapped) : true;
    }
    return false;
  }
  return true;
}

async function readLimited(res: Response, maxBytes = 2048): Promise<string> {
  if (!res.body) return "";
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (total < maxBytes) {
    const { done, value } = await reader.read();
    if (done || !value) break;
    chunks.push(value);
    total += value.length;
  }
  await reader.cancel().catch(() => undefined);
  const merged = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.length;
  }
  return new TextDecoder().decode(merged.slice(0, maxBytes));
}

function fail(message: string, status = 400) {
  return NextResponse.json({ ok: false, message }, { status });
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited(ip)) return fail("Too many requests from this connection. Please wait a few minutes.", 429);

  let body: Record<string, unknown>;
  try {
    const parsed = await readBoundedJson(request, 100_000);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return fail("Request must be an object.");
    body = parsed as Record<string, unknown>;
  } catch (error) {
    return fail(error instanceof BodyError ? error.message : "Request body must be valid JSON.", error instanceof BodyError ? error.status : 400);
  }

  const action = body.action;
  const host = normalizeHost(typeof body.host === "string" ? body.host : "");
  const key = typeof body.key === "string" ? body.key.trim() : "";

  if (!isValidHost(host)) return fail("Enter a public domain name such as example.com (no IP addresses or ports).");
  if (!isValidKey(key)) return fail("The key must be 8–128 characters using only letters, numbers, and dashes.");

  if (action === "verify") {
    try {
      const addresses = await lookup(host, { all: true });
      if (addresses.length === 0 || addresses.some((entry) => isPrivateIp(entry.address))) {
        return fail("That host doesn't resolve to a public address.");
      }
      const safeUrl = await assertSafeFetchUrl(keyFileUrl(host, key));
      const res = await fetch(safeUrl, {
        redirect: "manual",
        cache: "no-store",
        signal: AbortSignal.timeout(8000),
        headers: { "user-agent": "DoItWithAITools-IndexNowKeyCheck/1.0", accept: "text/plain,*/*" },
      });

      if (res.status >= 300 && res.status < 400) {
        return NextResponse.json({
          ok: false,
          status: res.status,
          message: "The key file URL redirects. Host the file directly at this exact URL, without a redirect.",
        });
      }
      if (res.status !== 200) {
        return NextResponse.json({
          ok: false,
          status: res.status,
          message: `The key file returned HTTP ${res.status}. Upload it to the site root and try again.`,
        });
      }
      const text = (await readLimited(res)).trim();
      const contentType = res.headers.get("content-type") ?? "";
      if (text === key) {
        return NextResponse.json({ ok: true, status: 200, message: "Key file found and its contents match your key." });
      }
      return NextResponse.json({
        ok: false,
        status: 200,
        message: contentType.includes("html")
          ? "The URL returned an HTML page instead of your key — often a soft 404 or a redirect to the homepage."
          : "The file was found, but its contents don't match the key. It should contain only the key.",
      });
    } catch {
      return fail("Couldn't reach that host to check the key file. Confirm the domain is live over HTTPS.", 502);
    }
  }

  if (action === "submit") {
    const rawUrls = Array.isArray(body.urls) ? body.urls.filter((item): item is string => typeof item === "string") : [];
    if (rawUrls.length === 0) return fail("Add at least one URL to submit.");
    if (rawUrls.length > MAX_URLS) return fail(`Submit at most ${MAX_URLS} URLs at a time.`);

    const parsed = parseUrlList(rawUrls.join("\n"), host);
    if (parsed.valid.length === 0) return fail("None of the URLs belong to the host you entered.");
    if (parsed.wrongHost.length > 0 || parsed.invalid.length > 0) {
      return fail("Every URL must be a valid http(s) URL on exactly the same host.");
    }

    try {
      const res = await fetch(INDEXNOW_ENDPOINT, {
        method: "POST",
        headers: { "content-type": "application/json; charset=utf-8" },
        body: JSON.stringify(buildPayload(host, key, parsed.valid)),
        signal: AbortSignal.timeout(15000),
        cache: "no-store",
      });
      const text = await readLimited(res, 500);
      const described = describeStatus(res.status);
      return NextResponse.json({
        ok: res.status === 200 || res.status === 202,
        status: res.status,
        submitted: parsed.valid.length,
        ...described,
        raw: text,
      });
    } catch {
      return fail("IndexNow didn't respond in time. Try again in a moment.", 502);
    }
  }

  return fail("Unknown action.");
}
