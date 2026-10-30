import * as cheerio from "cheerio";
import { assertSafeFetchUrl } from "@/features/schema-generator/server/fetch-page";

const MAX_XML_BYTES = 3_000_000;
const MAX_REDIRECTS = 3;
const FETCH_TIMEOUT_MS = 10_000;
const MAX_URLS_RETURNED = 60;

async function readLimitedText(response: Response) {
  const declared = Number(response.headers.get("content-length") || 0);
  if (declared > MAX_XML_BYTES) {
    throw new Error("The sitemap is too large to read safely.");
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
    if (size > MAX_XML_BYTES) {
      await reader.cancel();
      throw new Error("The sitemap is too large to read safely.");
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

function titleFromUrl(rawUrl: string) {
  try {
    const { pathname } = new URL(rawUrl);
    const segment = pathname
      .replace(/\/+$/, "")
      .split("/")
      .filter(Boolean)
      .pop();
    if (!segment) return "Home";
    return (
      decodeURIComponent(segment)
        .replace(/\.(html?|php|aspx?)$/i, "")
        .replace(/[-_]+/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .replace(/\b\w/g, (letter) => letter.toUpperCase()) || segment
    );
  } catch {
    return rawUrl;
  }
}

async function fetchXml(rawUrl: string) {
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
        Accept: "application/xml,text/xml,*/*;q=0.5",
        "User-Agent":
          "DoItWithAI-LlmsTxtGenerator/1.0 (+https://doitwithai.tools)",
      },
    });

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location)
        throw new Error("The sitemap returned an invalid redirect.");
      if (redirect === MAX_REDIRECTS)
        throw new Error("The sitemap redirected too many times.");
      current = await assertSafeFetchUrl(new URL(location, current).toString());
      continue;
    }
    if (!response.ok)
      throw new Error(`The sitemap returned HTTP ${response.status}.`);

    const contentType = response.headers.get("content-type") || "";
    if (!/xml|text\/plain/i.test(contentType)) {
      throw new Error(
        "That URL did not return XML. Point this at a sitemap.xml file.",
      );
    }
    return {
      xml: await readLimitedText(response),
      finalUrl: current.toString(),
    };
  }
  throw new Error("The sitemap could not be fetched.");
}

export async function fetchSitemapPages(rawUrl: string) {
  const { xml, finalUrl } = await fetchXml(rawUrl);
  const $ = cheerio.load(xml, { xmlMode: true });

  if ($("sitemapindex").length) {
    throw new Error(
      "That URL is a sitemap index (a list of other sitemaps). Paste one of its child sitemap URLs instead.",
    );
  }

  const urls = $("url > loc")
    .map((_, element) => $(element).text().trim())
    .get()
    .filter(Boolean);

  const unique = [...new Set(urls)];
  const truncated = unique.length > MAX_URLS_RETURNED;
  const pages = unique.slice(0, MAX_URLS_RETURNED).map((url) => ({
    url,
    title: titleFromUrl(url),
  }));

  if (!pages.length) {
    throw new Error("No page URLs were found in that sitemap.");
  }

  return { pages, truncated, sourceUrl: finalUrl };
}
