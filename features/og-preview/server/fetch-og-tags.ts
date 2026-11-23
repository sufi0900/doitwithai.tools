import * as cheerio from "cheerio";
import { assertSafeFetchUrl } from "@/features/schema-generator/server/fetch-page";
import type { OgState } from "../types";

const MAX_HTML_BYTES = 1_250_000;
const MAX_REDIRECTS = 3;
const FETCH_TIMEOUT_MS = 10_000;

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

export async function fetchExistingOgTags(rawUrl: string): Promise<{ state: Partial<OgState>; finalUrl: string }> {
  let current = await assertSafeFetchUrl(rawUrl);

  let html = "";
  let finalUrl = current.toString();
  const deadline = Date.now() + 15000;
  for (let redirect = 0; redirect <= MAX_REDIRECTS; redirect += 1) {
    const remaining = deadline - Date.now();
    if (remaining <= 0) throw new Error("The page took too long to respond.");
    const response = await fetch(current, {
        redirect: "manual",
        signal: AbortSignal.timeout(Math.min(FETCH_TIMEOUT_MS, remaining)),
        headers: {
          Accept: "text/html,application/xhtml+xml;q=0.9",
          "User-Agent": "DoItWithAI-OgPreviewChecker/1.0 (+https://doitwithai.tools)",
        },
      });
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location) throw new Error("The page returned an invalid redirect.");
      if (redirect === MAX_REDIRECTS) throw new Error("The page redirected too many times.");
      await response.body?.cancel();
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
  const meta = (property: string) =>
    $(`meta[property="${property}"]`).attr("content") || $(`meta[name="${property}"]`).attr("content") || "";

  const state: Partial<OgState> = {
    pageUrl: meta("og:url") || finalUrl,
    siteName: meta("og:site_name"),
    title: meta("og:title") || $("title").first().text().trim(),
    description: meta("og:description") || meta("description"),
    imageUrl: meta("og:image"),
    twitterHandle: meta("twitter:site"),
    twitterCardType: meta("twitter:card") === "summary" ? "summary" : "summary_large_image",
  };

  return { state, finalUrl };
}
