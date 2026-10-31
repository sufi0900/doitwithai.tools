import * as cheerio from "cheerio";
import { assertSafeFetchUrl } from "@/features/schema-generator/server/fetch-page";
import {
  MAX_HEADINGS,
  MAX_HEADING_TEXT,
  type ExtractResult,
  type Heading,
  type Level,
} from "../headingLib";

export type PageHeadings = ExtractResult & {
  title: string;
  finalUrl: string;
  checkedAt: string;
};
const MAX_BYTES = 3_000_000;

export function extractPageHeadings(
  html: string,
  mainOnly: boolean,
): ExtractResult & { title: string } {
  const $ = cheerio.load(html);
  let root = $("body");
  let scope = "the whole page";
  if (mainOnly) {
    const main = $("main").first().length
      ? $("main").first()
      : $("article").first();
    if (main.length) {
      root = main;
      scope = `the <${main.prop("tagName")?.toLowerCase()}> element`;
    }
    scope += " excluding navigation, footer, and sidebar headings";
  }
  const headings: Heading[] = [];
  let totalText = 0;
  root.find('h1,h2,h3,h4,h5,h6,[role="heading"]').each((_, element) => {
    const node = $(element);
    if (node.closest("noscript,template").length) return;
    if (mainOnly && node.closest("nav,footer,aside").length) return;
    if (headings.length >= MAX_HEADINGS)
      throw new Error(
        "This page has over 1,000 headings. Paste the article HTML to analyze a smaller section.",
      );
    const tag = /^h([1-6])$/i.exec(element.tagName);
    const aria = Number(node.attr("aria-level"));
    const level = tag
      ? Number(tag[1])
      : Number.isInteger(aria) && aria >= 1 && aria <= 6
        ? aria
        : 2;
    const clean = (s: string) =>
      s
        .replace(/[\u200B-\u200D\uFEFF]/g, "")
        .replace(/\s+/g, " ")
        .trim();
    const clone = node.clone();
    clone.find("script,style,template").remove();
    let text = clean(clone.text());
    if (!text)
      text = clean(
        node
          .find("img[alt]")
          .map((__, image) => $(image).attr("alt") || "")
          .get()
          .join(" "),
      );
    totalText += text.length;
    if (totalText > MAX_HEADING_TEXT)
      throw new Error(
        "This page has unusually large heading content. Paste a smaller article section instead.",
      );
    const hidden = node
      .parents()
      .addBack()
      .toArray()
      .some((ancestor) => {
        const item = $(ancestor);
        return (
          item.attr("hidden") !== undefined ||
          item.attr("aria-hidden") === "true" ||
          /display:none|visibility:hidden/.test(
            (item.attr("style") || "").toLowerCase().replace(/\s+/g, ""),
          )
        );
      });
    const landmark = node.closest("nav").length
      ? "navigation"
      : node.closest("footer").length
        ? "footer"
        : node.closest("aside").length
          ? "sidebar"
          : null;
    headings.push({
      index: headings.length,
      level: level as Level,
      text,
      hidden,
      landmark,
      line: null,
    });
  });
  return {
    headings,
    scope,
    title: $("title").first().text().trim().slice(0, 300),
  };
}

export async function fetchPageHeadings(
  rawUrl: string,
  mainOnly: boolean,
  deps = { safeUrl: assertSafeFetchUrl, fetcher: fetch },
): Promise<PageHeadings> {
  let current = await deps.safeUrl(rawUrl);
  current.hash = "";
  const signal = AbortSignal.timeout(18_000);
  for (let redirect = 0; redirect <= 3; redirect++) {
    const response = await deps.fetcher(current, {
      redirect: "manual",
      signal,
      cache: "no-store",
      headers: {
        Accept: "text/html,application/xhtml+xml",
        "User-Agent":
          "DoItWithAI-HeadingChecker/1.0 (+https://doitwithai.tools)",
      },
    });
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      await response.body?.cancel();
      if (!location || redirect === 3)
        throw new Error(
          "The page returned an invalid redirect or too many redirects. Try its final public URL.",
        );
      current = await deps.safeUrl(new URL(location, current).toString());
      continue;
    }
    if (!response.ok) {
      await response.body?.cancel();
      throw new Error(
        `The website returned HTTP ${response.status}. Open the page in your browser and use Paste content instead.`,
      );
    }
    if (
      !/text\/html|application\/xhtml\+xml/i.test(
        response.headers.get("content-type") || "",
      )
    ) {
      await response.body?.cancel();
      throw new Error(
        "Enter a webpage URL that returns HTML, rather than a document, image, or feed.",
      );
    }
    const tooLarge =
      "The page exceeds the 3 MB download limit. Use Paste content with the article HTML instead.";
    if (Number(response.headers.get("content-length")) > MAX_BYTES) {
      await response.body?.cancel();
      throw new Error(tooLarge);
    }
    if (!response.body)
      throw new Error(
        "The website returned an empty page. Try Paste content instead.",
      );
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let bytes = 0,
      html = "";
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        bytes += value.byteLength;
        if (bytes > MAX_BYTES) {
          await reader.cancel();
          throw new Error(tooLarge);
        }
        html += decoder.decode(value, { stream: true });
      }
      html += decoder.decode();
    } finally {
      reader.releaseLock();
    }
    return {
      ...extractPageHeadings(html, mainOnly),
      finalUrl: current.toString(),
      checkedAt: new Date().toISOString(),
    };
  }
  throw new Error("The page could not be read. Try Paste content instead.");
}
