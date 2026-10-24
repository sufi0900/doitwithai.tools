import * as cheerio from "cheerio";
import { assertSafeFetchUrl } from "@/features/schema-generator/server/fetch-page";
import type { NormalizedDoc } from "../types";

const MAX_HTML_BYTES = 1_250_000;
const MAX_REDIRECTS = 3;
const FETCH_TIMEOUT_MS = 10_000;
const MAX_PARAGRAPHS = 400;

async function readLimitedHtml(response: Response) {
  const declared = Number(response.headers.get("content-length") || 0);
  if (declared > MAX_HTML_BYTES)
    throw new Error("The fetched page is too large to analyze safely.");
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

function collectSchemaTypes($: cheerio.CheerioAPI) {
  const types = new Set<string>();
  const visit = (value: unknown) => {
    if (!value || typeof value !== "object") return;
    if (Array.isArray(value)) {
      value.forEach(visit);
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
    Object.values(record).forEach(visit);
  };
  $('script[type="application/ld+json"]').each((_, element) => {
    const source = $(element).html()?.trim();
    if (!source || source.length > 200_000) return;
    try {
      visit(JSON.parse(source));
    } catch {
      // Malformed existing markup is a signal, not a blocker — treated as "none found".
    }
  });
  return [...types];
}

async function fetchHtml(rawUrl: string) {
  const deadline = Date.now() + 15_000;
  let current = await assertSafeFetchUrl(rawUrl);

  for (let redirect = 0; redirect <= MAX_REDIRECTS; redirect += 1) {
    const remaining = deadline - Date.now();
    if (remaining <= 0)
      throw new Error("This page took too long to respond. Please try again.");
    const signal = AbortSignal.timeout(Math.min(FETCH_TIMEOUT_MS, remaining));
    const response = await fetch(current, {
      redirect: "manual",
      signal,
      headers: {
        Accept: "text/html,application/xhtml+xml;q=0.9",
        "User-Agent":
          "DoItWithAI-CitationReadiness/1.0 (+https://doitwithai.tools)",
      },
    });

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location) throw new Error("The page returned an invalid redirect.");
      if (redirect === MAX_REDIRECTS)
        throw new Error("The page redirected too many times.");
      current = await assertSafeFetchUrl(new URL(location, current).toString());
      continue;
    }
    if (!response.ok)
      throw new Error(`The page returned HTTP ${response.status}.`);
    const contentType = response.headers.get("content-type") || "";
    if (!/text\/html|application\/xhtml\+xml/i.test(contentType)) {
      throw new Error("The URL did not return an HTML page.");
    }
    return {
      html: await readLimitedHtml(response),
      finalUrl: current.toString(),
    };
  }
  throw new Error("The page could not be fetched.");
}

export async function extractFromUrl(
  rawUrl: string,
): Promise<{ doc: NormalizedDoc; finalUrl: string }> {
  const { html, finalUrl } = await fetchHtml(rawUrl);
  const $ = cheerio.load(html);
  const base = finalUrl;
  const pageHost = new URL(finalUrl).hostname;

  const headings = $("h1,h2,h3,h4,h5,h6")
    .map((_, element) => ({
      level: Number($(element).prop("tagName")?.slice(1) || 1),
      text: $(element).text().replace(/\s+/g, " ").trim(),
    }))
    .get()
    .filter((heading) => heading.text);

  const paragraphs = $("p")
    .map((_, element) => $(element).text().replace(/\s+/g, " ").trim())
    .get()
    .filter(Boolean)
    .slice(0, MAX_PARAGRAPHS);

  const outboundLinkDomains = [
    ...new Set(
      $("a[href]")
        .map((_, element) => $(element).attr("href") || "")
        .get()
        .map((href) => {
          try {
            return new URL(href, base).hostname;
          } catch {
            return "";
          }
        })
        .filter((hostname) => hostname && hostname !== pageHost),
    ),
  ];

  const hasAuthor =
    $('meta[name="author"]').length > 0 ||
    $('meta[property="article:author"]').length > 0 ||
    $('[rel="author"]').length > 0;

  const hasPublishedDate =
    $('meta[property="article:published_time"]').length > 0 ||
    $('meta[name="date"]').length > 0;
  const hasModifiedDate =
    $('meta[property="article:modified_time"]').length > 0 ||
    $('meta[name="last-modified"]').length > 0;

  const doc: NormalizedDoc = {
    source: "url",
    title:
      $('meta[property="og:title"]').attr("content")?.trim() ||
      $("title").first().text().trim(),
    h1Count: headings.filter((heading) => heading.level === 1).length,
    headings,
    paragraphs,
    listCount: $("ul,ol").length,
    tableCount: $("table").length,
    hasAuthor,
    hasPublishedDate,
    hasModifiedDate,
    outboundLinkDomains,
    schemaTypes: collectSchemaTypes($),
    hasCanonical: $('link[rel="canonical"]').length > 0,
    wordCount:
      paragraphs.reduce(
        (sum, paragraph) => sum + paragraph.split(/\s+/).filter(Boolean).length,
        0,
      ) +
      headings.reduce(
        (sum, heading) =>
          sum + heading.text.split(/\s+/).filter(Boolean).length,
        0,
      ),
  };

  return { doc, finalUrl };
}
