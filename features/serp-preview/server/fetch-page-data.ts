import * as cheerio from "cheerio";
import { assertSafeFetchUrl } from "@/features/schema-generator/server/fetch-page";

const MAX_HTML_BYTES = 1_250_000;
const MAX_REDIRECTS = 3;
const FETCH_TIMEOUT_MS = 14_000;

async function readLimitedHtml(response: Response) {
  const declared = Number(response.headers.get("content-length") || 0);
  if (declared > MAX_HTML_BYTES) throw new Error("The page is too large to read safely.");
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
      throw new Error("The page is too large to read safely.");
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

export async function fetchPageSerpData(rawUrl: string): Promise<{
  title: string;
  description: string;
  finalUrl: string;
  jsonLd: unknown[];
}> {
  let current = await assertSafeFetchUrl(rawUrl);
  let html = "";
  let finalUrl = current.toString();

  const signal = AbortSignal.timeout(FETCH_TIMEOUT_MS);
  for (let redirect = 0; redirect <= MAX_REDIRECTS; redirect += 1) {
    const response = await fetch(current, {
      redirect: "manual", signal,
      headers: {
        Accept: "text/html,application/xhtml+xml;q=0.9",
        "User-Agent": "DoItWithAI-SerpPreviewChecker/1.0 (+https://doitwithai.tools)",
      },
    });
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      await response.body?.cancel();
      if (!location) throw new Error("The page returned an invalid redirect.");
      if (redirect === MAX_REDIRECTS) throw new Error("The page redirected too many times.");
      current = await assertSafeFetchUrl(new URL(location, current).toString());
      continue;
    }
    if (!response.ok) throw new Error(`The page returned HTTP ${response.status}.`);
    const contentType = response.headers.get("content-type") || "";
    if (!/text\/html|application\/xhtml\+xml/i.test(contentType)) {
      throw new Error("That URL did not return an HTML page.");
    }
    html = await readLimitedHtml(response);
    finalUrl = current.toString();
    break;
  }

  const $ = cheerio.load(html);
  const title = $("title").first().text().trim() || $('meta[property="og:title"]').attr("content")?.trim() || "";
  const description =
    $('meta[name="description"]').attr("content")?.trim() ||
    $('meta[property="og:description"]').attr("content")?.trim() ||
    "";

  const jsonLd: unknown[] = [];
  $('script[type="application/ld+json"]').each((_, element) => {
    const source = $(element).html()?.trim();
    if (!source || source.length > 300_000) return;
    try {
      jsonLd.push(JSON.parse(source));
    } catch {
      // Malformed existing markup — skip it rather than fail the whole import.
    }
  });

  return { title, description, finalUrl, jsonLd };
}
