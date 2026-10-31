import * as cheerio from "cheerio";
import { assertSafeFetchUrl } from "@/features/schema-generator/server/fetch-page";

export type ImportedSerpData = {
  title: string;
  description: string;
  finalUrl: string;
  siteName: string;
  faviconUrl: string;
  jsonLd: unknown[];
  warnings: string[];
  partial: boolean;
  bytesRead: number;
};
const MAX_BYTES = 8_000_000;
const HEAD_LIMIT = 512_000;
const SCRIPT_LIMIT = 300_000;

/** Keeps the head and JSON-LD, rather than building a DOM for an entire article. */
export class SerpMetadataCollector {
  private buffer = "";
  private raw = "";
  private isJson = false;
  private script = "";
  private oversized = false;
  private jsonBytes = 0;
  private comment = false;
  head = "";
  headDone = false;
  jsonLd: unknown[] = [];
  warnings = new Set<string>();
  private consume(size: number) {
    const part = this.buffer.slice(0, size);
    this.buffer = this.buffer.slice(size);
    if (!this.headDone) {
      if (this.head.length + part.length > HEAD_LIMIT)
        this.warnings.add(
          "The page head exceeded the reading limit. Some metadata may be missing.",
        );
      this.head += part.slice(0, Math.max(0, HEAD_LIMIT - this.head.length));
    }
    return part;
  }
  write(text: string) {
    this.buffer += text;
    while (this.buffer) {
      if (this.raw) {
        const close = new RegExp(`</${this.raw}\\s*>`, "i").exec(this.buffer);
        const length = close
          ? close.index
          : Math.max(0, this.buffer.length - 32);
        const value = this.consume(length);
        if (this.isJson) {
          if (this.script.length + value.length <= SCRIPT_LIMIT)
            this.script += value;
          else this.oversized = true;
        }
        if (!close) return;
        this.consume(close[0].length);
        if (this.isJson) {
          if (
            this.oversized ||
            this.jsonLd.length >= 40 ||
            this.jsonBytes + this.script.length > SCRIPT_LIMIT
          )
            this.warnings.add(
              "Some large or excess structured data blocks were skipped.",
            );
          else
            try {
              this.jsonLd.push(JSON.parse(this.script));
              this.jsonBytes += this.script.length;
            } catch {
              this.warnings.add(
                "A structured data block contains invalid JSON and could not be previewed.",
              );
            }
        }
        this.raw = "";
        this.script = "";
        this.isJson = false;
        this.oversized = false;
        continue;
      }
      if (this.comment) {
        const end = this.buffer.indexOf("-->");
        if (end < 0) {
          this.consume(Math.max(0, this.buffer.length - 3));
          return;
        }
        this.consume(end + 3);
        this.comment = false;
        continue;
      }
      const start = this.buffer.indexOf("<");
      if (start < 0) {
        this.consume(this.buffer.length);
        return;
      }
      if (start > 0) {
        this.consume(start);
        continue;
      }
      if (this.buffer.startsWith("<!--")) {
        this.consume(4);
        this.comment = true;
        continue;
      }
      const tag = /^<(\/?)([a-z][\w:-]*)\b((?:"[^"]*"|'[^']*'|[^'">])*)>/i.exec(
        this.buffer,
      );
      if (!tag) {
        if (this.buffer.length < 8192 && !this.buffer.includes(">")) return;
        this.consume(1);
        continue;
      }
      this.consume(tag[0].length);
      const name = tag[2].toLowerCase();
      if ((name === "head" && tag[1]) || (name === "body" && !tag[1]))
        this.headDone = true;
      if (!tag[1] && ["script", "style", "title", "textarea"].includes(name)) {
        this.raw = name;
        const type =
          /(?:^|\s)type\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i.exec(tag[3]);
        this.isJson =
          name === "script" &&
          (type?.[1] || type?.[2] || type?.[3] || "").toLowerCase() ===
            "application/ld+json";
      }
    }
  }
  finish() {
    this.write(" ".repeat(33));
    if (this.isJson)
      this.warnings.add(
        "An incomplete structured data block could not be previewed.",
      );
  }
}

export function safeAssetUrl(value: string, base: string) {
  try {
    const url = new URL(value, base);
    return /^https?:$/.test(url.protocol) &&
      !url.username &&
      !url.password &&
      url.origin === new URL(base).origin
      ? url.toString()
      : "";
  } catch {
    return "";
  }
}

export function collectedSerpData(
  collector: SerpMetadataCollector,
  finalUrl: string,
  partial: boolean,
  bytesRead: number,
): ImportedSerpData {
  const $ = cheerio.load(collector.head);
  const meta = (selector: string) =>
    $(selector).first().attr("content")?.trim() || "";
  let siteName = meta('meta[property="og:site_name"]');
  if (!siteName) {
    for (const value of collector.jsonLd) {
      const items = Array.isArray(value)
        ? value
        : [
            value,
            ...(value &&
            typeof value === "object" &&
            Array.isArray((value as any)["@graph"])
              ? (value as any)["@graph"]
              : []),
          ];
      const website = items.find(
        (item) =>
          item &&
          (item["@type"] === "WebSite" ||
            (Array.isArray(item["@type"]) &&
              item["@type"].includes("WebSite"))),
      );
      if (website && typeof website.name === "string") {
        siteName = website.name;
        break;
      }
    }
  }
  return {
    title: (
      $("title").first().text().trim() || meta('meta[property="og:title"]')
    ).slice(0, 1000),
    description: (
      meta('meta[name="description"]') ||
      meta('meta[property="og:description"]')
    ).slice(0, 3000),
    siteName: (siteName || new URL(finalUrl).hostname).slice(0, 200),
    faviconUrl:
      safeAssetUrl(
        $('link[rel~="icon"],link[rel="apple-touch-icon"]')
          .first()
          .attr("href") || "/favicon.ico",
        finalUrl,
      ) || new URL("/favicon.ico", finalUrl).toString(),
    finalUrl,
    jsonLd: collector.jsonLd,
    warnings: [...collector.warnings],
    partial,
    bytesRead,
  };
}

export async function fetchPageSerpData(
  rawUrl: string,
  includeStructuredData = true,
  deps = { safeUrl: assertSafeFetchUrl, fetcher: fetch },
): Promise<ImportedSerpData> {
  let current = await deps.safeUrl(rawUrl);
  const signal = AbortSignal.timeout(18_000);
  for (let redirect = 0; redirect <= 3; redirect++) {
    const response = await deps.fetcher(current, {
      redirect: "manual",
      signal,
      cache: "no-store",
      headers: {
        Accept: "text/html,application/xhtml+xml;q=0.9",
        "User-Agent":
          "DoItWithAI-SerpPreviewChecker/2.0 (+https://doitwithai.tools)",
      },
    });
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      await response.body?.cancel();
      if (!location || redirect === 3)
        throw new Error(
          "The page redirected too many times or returned an invalid redirect.",
        );
      current = await deps.safeUrl(new URL(location, current).toString());
      continue;
    }
    if (!response.ok) {
      await response.body?.cancel();
      throw new Error(
        `The website returned HTTP ${response.status}. Enter the metadata manually if it blocks imports.`,
      );
    }
    if (
      !/text\/html|application\/xhtml\+xml/i.test(
        response.headers.get("content-type") || "",
      )
    ) {
      await response.body?.cancel();
      throw new Error("That URL did not return an HTML webpage.");
    }
    if (!response.body)
      throw new Error("The website returned an empty response.");
    const reader = response.body.getReader(),
      decoder = new TextDecoder(),
      collector = new SerpMetadataCollector();
    let bytes = 0,
      partial = false;
    try {
      while (true) {
        let chunk: ReadableStreamReadResult<Uint8Array>;
        try {
          chunk = await reader.read();
        } catch (e) {
          if (!collector.headDone) throw e;
          partial = includeStructuredData;
          collector.warnings.add(
            "The connection ended early. Available metadata was kept; some structured data may be missing.",
          );
          break;
        }
        if (chunk.done) {
          collector.write(decoder.decode());
          break;
        }
        const remaining = MAX_BYTES - bytes;
        const value = chunk.value.subarray(0, remaining);
        bytes += value.byteLength;
        collector.write(decoder.decode(value, { stream: true }));
        if (!includeStructuredData && collector.headDone) {
          await reader.cancel();
          break;
        }
        if (bytes >= MAX_BYTES) {
          partial = true;
          collector.warnings.add(
            "Metadata was imported from the first 8 MB. Structured data beyond that point was not checked.",
          );
          await reader.cancel();
          break;
        }
      }
      collector.finish();
    } finally {
      reader.releaseLock();
    }
    if (!includeStructuredData)
      collector.warnings.add(
        "Quick import checked the page head only. Enable the structured data scan to inspect markup in the body.",
      );
    return collectedSerpData(collector, current.toString(), partial, bytes);
  }
  throw new Error("The page could not be imported.");
}
