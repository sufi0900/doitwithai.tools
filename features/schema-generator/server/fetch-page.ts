import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import * as cheerio from "cheerio";

const MAX_HTML_BYTES = 1_250_000;
const MAX_REDIRECTS = 3;
const FETCH_TIMEOUT_MS = 10_000;

export type ExtractedPageSignals = {
  finalUrl: string;
  title: string;
  h1: string;
  description: string;
  canonicalUrl: string;
  imageUrl: string;
  author: string;
  datePublished: string;
  dateModified: string;
  inLanguage: string;
  existingSchemaTypes: string[];
  visibleText: string;
};

function isBlockedIpv4(address: string) {
  const parts = address.split(".").map(Number);
  if (parts.length !== 4 || parts.some((part) => !Number.isFinite(part))) {
    return true;
  }
  const [a, b] = parts;
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 0) ||
    (a === 192 && b === 168) ||
    (a === 198 && (b === 18 || b === 19)) ||
    a >= 224
  );
}

function isBlockedIp(address: string) {
  if (isIP(address) === 4) return isBlockedIpv4(address);
  if (isIP(address) !== 6) return true;

  const normalized = address.toLowerCase();
  if (normalized.startsWith("::ffff:")) {
    return isBlockedIpv4(normalized.replace("::ffff:", ""));
  }
  return (
    normalized === "::" ||
    normalized === "::1" ||
    normalized.startsWith("fc") ||
    normalized.startsWith("fd") ||
    /^fe[89ab]/.test(normalized) ||
    normalized.startsWith("2001:db8")
  );
}

export async function assertSafeFetchUrl(rawUrl: string) {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error("Enter a valid public page URL.");
  }

  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    throw new Error("Only http:// and https:// pages can be analyzed.");
  }
  if (parsed.username || parsed.password) {
    throw new Error("URLs containing credentials cannot be analyzed.");
  }
  if (
    parsed.port &&
    !(
      (parsed.protocol === "https:" && parsed.port === "443") ||
      (parsed.protocol === "http:" && parsed.port === "80")
    )
  ) {
    throw new Error("Only standard web ports can be analyzed.");
  }

  const hostname = parsed.hostname.toLowerCase().replace(/\.$/, "");
  if (
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".local") ||
    hostname.endsWith(".internal")
  ) {
    throw new Error("Private or local network URLs cannot be analyzed.");
  }

  const addresses = isIP(hostname)
    ? [{ address: hostname }]
    : await lookup(hostname, { all: true, verbatim: true });
  if (
    !addresses.length ||
    addresses.some(({ address }) => isBlockedIp(address))
  ) {
    throw new Error(
      "Private, reserved, or unresolved network targets are blocked.",
    );
  }

  return parsed;
}

async function readLimitedHtml(response: Response) {
  const declared = Number(response.headers.get("content-length") || 0);
  if (declared > MAX_HTML_BYTES) {
    throw new Error("The fetched page is too large to analyze safely.");
  }
  if (!response.body) return "";

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value) continue;
    size += value.byteLength;
    if (size > MAX_HTML_BYTES) {
      await reader.cancel();
      throw new Error("The fetched page is too large to analyze safely.");
    }
    chunks.push(value);
  }
  const body = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder("utf-8", { fatal: false }).decode(body);
}

function collectSchemaTypes(value: unknown, types: Set<string>) {
  if (!value || typeof value !== "object") return;
  if (Array.isArray(value)) {
    value.forEach((item) => collectSchemaTypes(item, types));
    return;
  }
  const record = value as Record<string, unknown>;
  const type = record["@type"];
  if (typeof type === "string") types.add(type);
  if (Array.isArray(type)) {
    type
      .filter((item): item is string => typeof item === "string")
      .forEach((item) => types.add(item));
  }
  Object.values(record).forEach((item) => collectSchemaTypes(item, types));
}

function meta($: cheerio.CheerioAPI, selectors: string[]) {
  for (const selector of selectors) {
    const content = $(selector).first().attr("content")?.trim();
    if (content) return content;
  }
  return "";
}

export function extractPageSignals(
  html: string,
  finalUrl: string,
): ExtractedPageSignals {
  const $ = cheerio.load(html);
  const types = new Set<string>();
  $('script[type="application/ld+json"]').each((_, element) => {
    const source = $(element).html()?.trim();
    if (!source || source.length > 200_000) return;
    try {
      collectSchemaTypes(JSON.parse(source), types);
    } catch {
      // Invalid existing markup is evidence only; the deterministic compiler does not reuse it.
    }
  });

  const canonicalHref =
    $('link[rel="canonical"]').first().attr("href")?.trim() || "";
  let canonicalUrl = canonicalHref;
  if (canonicalHref) {
    try {
      canonicalUrl = new URL(canonicalHref, finalUrl).toString();
    } catch {
      canonicalUrl = "";
    }
  }

  const imageCandidate = meta($, [
    'meta[property="og:image"]',
    'meta[name="twitter:image"]',
    'meta[property="twitter:image"]',
  ]);
  let imageUrl = imageCandidate;
  if (imageCandidate) {
    try {
      imageUrl = new URL(imageCandidate, finalUrl).toString();
    } catch {
      imageUrl = "";
    }
  }

  const visibleRoot = $("main").first().length
    ? $("main").first().clone()
    : $("article").first().length
      ? $("article").first().clone()
      : $("body").first().clone();
  visibleRoot
    .find("script,style,noscript,svg,nav,footer,header,form,template")
    .remove();
  const visibleText = visibleRoot
    .text()
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 14_000);

  return {
    finalUrl,
    title:
      meta($, ['meta[property="og:title"]', 'meta[name="twitter:title"]']) ||
      $("title").first().text().trim(),
    h1: $("h1").first().text().replace(/\s+/g, " ").trim(),
    description: meta($, [
      'meta[name="description"]',
      'meta[property="og:description"]',
    ]),
    canonicalUrl,
    imageUrl,
    author: meta($, ['meta[name="author"]', 'meta[property="article:author"]']),
    datePublished: meta($, [
      'meta[property="article:published_time"]',
      'meta[name="date"]',
      'meta[name="datePublished"]',
    ]),
    dateModified: meta($, [
      'meta[property="article:modified_time"]',
      'meta[name="last-modified"]',
      'meta[name="dateModified"]',
    ]),
    inLanguage: $("html").attr("lang")?.trim() || "",
    existingSchemaTypes: [...types].slice(0, 40),
    visibleText,
  };
}

export async function fetchPageSignals(rawUrl: string) {
  let current = await assertSafeFetchUrl(rawUrl);

  for (let redirect = 0; redirect <= MAX_REDIRECTS; redirect += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    let response: Response;
    try {
      response = await fetch(current, {
        redirect: "manual",
        signal: controller.signal,
        headers: {
          Accept: "text/html,application/xhtml+xml;q=0.9",
          "User-Agent":
            "DoItWithAI-SchemaAnalyzer/1.0 (+https://doitwithai.tools)",
        },
      });
    } finally {
      clearTimeout(timeout);
    }

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location) throw new Error("The page returned an invalid redirect.");
      if (redirect === MAX_REDIRECTS) {
        throw new Error("The page redirected too many times.");
      }
      current = await assertSafeFetchUrl(new URL(location, current).toString());
      continue;
    }

    if (!response.ok) {
      throw new Error(`The page returned HTTP ${response.status}.`);
    }
    const contentType = response.headers.get("content-type") || "";
    if (!/text\/html|application\/xhtml\+xml/i.test(contentType)) {
      throw new Error("The URL did not return an HTML page.");
    }
    const html = await readLimitedHtml(response);
    return extractPageSignals(html, current.toString());
  }

  throw new Error("The page could not be fetched.");
}
