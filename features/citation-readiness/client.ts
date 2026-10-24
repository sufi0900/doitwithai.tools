import type { AnalysisResult, NormalizedDoc } from "./types";
import type { PageSnapshot } from "@/features/on-page-analyzer/types";
import { analyzeDocument } from "./analyzer";
import {
  authorsFromSchemas,
  inspectSchemas,
  schemaSources,
} from "@/features/schema-inspector/inspect";
export type UrlAnalysisResult =
  | {
      ok: true;
      result: AnalysisResult;
      doc: { title: string; wordCount: number; finalUrl: string };
      page: PageSnapshot;
    }
  | { ok: false; message: string };
export function citationDocument(page: PageSnapshot): NormalizedDoc {
  const schema = inspectSchemas(schemaSources(page.schemas));
  return {
    source: "url",
    title: page.title,
    h1Count: page.blocks.filter((b) => b.tag === "h1").length,
    headings: page.blocks
      .filter((b) => /^h[1-6]$/.test(b.tag))
      .map((b) => ({ level: Number(b.tag[1]), text: b.text })),
    paragraphs: page.blocks
      .filter((b) => !/^h[1-6]$/.test(b.tag))
      .map((b) => b.text),
    listCount: page.blocks.filter((b) => b.tag === "li").length,
    tableCount: page.blocks.some((b) => b.tag === "td" || b.tag === "th")
      ? 1
      : 0,
    hasAuthor:
      page.author || authorsFromSchemas(page.schemas).length ? true : null,
    hasPublishedDate: schema.items.some((i) =>
      i.properties.some(([k]) => k === "datePublished"),
    )
      ? true
      : null,
    hasModifiedDate:
      page.modified ||
      schema.items.some((i) => i.properties.some(([k]) => k === "dateModified"))
        ? true
        : null,
    outboundLinkDomains: page.url
      ? [
          ...new Set(
            page.links.flatMap((link) => {
              try {
                const target = new URL(link.href),
                  origin = new URL(page.url);
                return /^https?:$/.test(target.protocol) &&
                  target.origin !== origin.origin
                  ? [target.hostname]
                  : [];
              } catch {
                return [];
              }
            }),
          ),
        ]
      : null,
    schemaTypes: page.schemas.types,
    hasCanonical: Boolean(page.canonical),
    wordCount: page.blocks.reduce(
      (n, b) => n + b.text.trim().split(/\s+/).filter(Boolean).length,
      0,
    ),
  };
}
export async function importCitationPage(
  input: { url?: string; html?: string },
  signal?: AbortSignal,
): Promise<UrlAnalysisResult> {
  try {
    const response = await fetch("/api/ai-tools/on-page/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
      signal,
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload?.result || payload.error)
      return {
        ok: false,
        message: payload?.error?.message || "The page could not be analyzed.",
      };
    const page = payload.result as PageSnapshot,
      doc = citationDocument(page);
    return {
      ok: true,
      result: analyzeDocument(doc),
      page,
      doc: { title: doc.title, wordCount: doc.wordCount, finalUrl: page.url },
    };
  } catch {
    return {
      ok: false,
      message:
        "Could not reach the analyzer. Check your connection and try again.",
    };
  }
}

export function analyzeUrl(url: string, signal?: AbortSignal) {
  return importCitationPage({ url }, signal);
}
