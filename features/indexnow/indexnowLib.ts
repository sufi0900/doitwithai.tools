export const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";
export const KEY_PATTERN = /^[a-zA-Z0-9-]{8,128}$/;
export const MAX_URLS = 1000; // protocol allows 10,000 per request; this tool is deliberately more conservative.

const HOST_PATTERN =
  /^(?=.{4,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+(?:[a-z]{2,63}|xn--[a-z0-9-]{1,59})$/;
const BLOCKED_SUFFIXES = [".local", ".localhost", ".internal", ".lan", ".home", ".corp", ".intranet"];

export function generateKey(length = 32): string {
  const alphabet = "abcdef0123456789"; // 16 symbols, so byte % 16 is unbiased
  const bytes = new Uint8Array(length);
  globalThis.crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => alphabet[byte % 16]).join("");
}

export function isValidKey(key: string): boolean {
  return KEY_PATTERN.test(key);
}

/** Accepts "https://www.example.com/page" or "example.com" and returns the bare lowercase hostname. */
export function normalizeHost(input: string): string {
  let value = input.trim().toLowerCase();
  value = value.replace(/^[a-z][a-z0-9+.-]*:\/\//, "");
  value = value.split(/[/?#]/)[0] ?? "";
  value = value.replace(/\.$/, "");
  return value;
}

export function isValidHost(host: string): boolean {
  if (!HOST_PATTERN.test(host)) return false;
  return !BLOCKED_SUFFIXES.some((suffix) => host.endsWith(suffix));
}

export function keyFileName(key: string): string {
  return `${key}.txt`;
}

export function keyFileUrl(host: string, key: string): string {
  return `https://${host}/${keyFileName(key)}`;
}

export interface ParsedUrls {
  valid: string[];
  wrongHost: string[];
  invalid: string[];
  insecure: number;
  duplicates: number;
}

export function parseUrlList(text: string, host: string): ParsedUrls {
  const result: ParsedUrls = { valid: [], wrongHost: [], invalid: [], insecure: 0, duplicates: 0 };
  const seen = new Set<string>();

  for (const token of text.split(/[\s,]+/).filter(Boolean)) {
    let parsed: URL;
    try {
      parsed = new URL(token);
    } catch {
      result.invalid.push(token);
      continue;
    }
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      result.invalid.push(token);
      continue;
    }
    if (parsed.hostname !== host) {
      result.wrongHost.push(token);
      continue;
    }
    if (seen.has(parsed.href)) {
      result.duplicates += 1;
      continue;
    }
    seen.add(parsed.href);
    if (parsed.protocol === "http:") result.insecure += 1;
    result.valid.push(parsed.href);
  }
  return result;
}

export type Tone = "success" | "warning" | "error";

export function describeStatus(status: number): { tone: Tone; title: string; detail: string } {
  switch (status) {
    case 200:
      return { tone: "success", title: "Submitted (200)", detail: "IndexNow received your URLs." };
    case 202:
      return {
        tone: "success",
        title: "Accepted (202)",
        detail: "Your URLs were received. Key validation is pending, so the search engines will fetch your key file to confirm ownership.",
      };
    case 400:
      return { tone: "error", title: "Bad request (400)", detail: "IndexNow couldn't read the request format. Check the host, key, and URL list." };
    case 403:
      return { tone: "error", title: "Key not valid (403)", detail: "The key file wasn't found at your site's root, or its contents don't match the key. Use \"Check key file\" first." };
    case 422:
      return { tone: "error", title: "Unprocessable (422)", detail: "The URLs don't belong to the submitted host, or the key doesn't meet the expected format." };
    case 429:
      return { tone: "warning", title: "Too many requests (429)", detail: "IndexNow is rate-limiting this request. Wait a while before submitting again." };
    default:
      return { tone: "warning", title: `Unexpected response (${status})`, detail: "IndexNow returned a status this tool doesn't recognise. Try again later or check indexnow.org." };
  }
}

export function buildPayload(host: string, key: string, urls: string[]) {
  return { host, key, urlList: urls };
}

export function buildCurl(host: string, key: string, urls: string[]): string {
  const json = JSON.stringify(buildPayload(host, key, urls), null, 2).replace(/'/g, "'\\''");
  return `curl -X POST "${INDEXNOW_ENDPOINT}" \\\n  -H "Content-Type: application/json; charset=utf-8" \\\n  -d '${json}'`;
}
