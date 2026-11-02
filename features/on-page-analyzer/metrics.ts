import {
  analyzeDocument,
  type DocumentAnalysis,
} from "@/features/readability/engine/stats";
import type { DocumentBlock } from "@/features/readability/engine/document";
import type { PageSnapshot } from "./types";
import { words, phraseCount } from "./text";
const readingCache = new WeakMap<PageSnapshot, Map<number, DocumentAnalysis>>();
export function readabilityReport(
  page: PageSnapshot,
  targetGrade = 9,
): DocumentAnalysis {
  const previous = readingCache.get(page)?.get(targetGrade);
  if (previous) return previous;
  let text = "";
  const blocks: DocumentBlock[] = page.blocks.map((b) => {
    if (text) text += "\n\n";
    const start = text.length;
    text += b.text;
    return {
      start,
      end: text.length,
      from: start,
      listItem: b.listItem ?? (b.tag === "li" ? start : undefined),
      to: text.length,
      type: /^h[1-6]$/.test(b.tag)
        ? "heading"
        : b.tag === "li" || b.listItem !== undefined
          ? "listItem"
          : b.tag === "pre"
            ? "codeBlock"
            : b.tag === "blockquote"
              ? "quote"
              : "paragraph",
    };
  });
  const report = analyzeDocument(text, { blocks, targetGrade });
  const entries = readingCache.get(page) || new Map<number, DocumentAnalysis>();
  entries.set(targetGrade, report);
  readingCache.set(page, entries);
  return report;
}
export function keywordReport(
  page: PageSnapshot,
  primary: string,
  secondary = "",
  related = "",
) {
  const body = page.blocks
    .filter((b) => !/^h[1-6]$/.test(b.tag))
    .map((b) => b.text)
    .join("\n");
  const countWords = words(body).length;
  const list = (s: string) =>
    s
      .split(/[,\n;]/)
      .map((v) => v.trim())
      .filter(Boolean)
      .slice(0, 12);
  const seen = new Set<string>();
  return [
    { term: primary.trim(), group: "Primary" },
    ...list(secondary).map((term) => ({ term, group: "Secondary" })),
    ...list(related).map((term) => ({ term, group: "Related" })),
  ]
    .filter(({ term }) => {
      const key = term.toLocaleLowerCase();
      if (!term || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map(({ term, group }) => {
      const count = page.blocks
        .filter((b) => !/^h[1-6]$/.test(b.tag))
        .reduce((n, b) => n + phraseCount(b.text, term), 0);
      const distribution = [0, 1, 2].map((i) =>
        page.blocks
          .slice(
            Math.floor((i * page.blocks.length) / 3),
            Math.floor(((i + 1) * page.blocks.length) / 3),
          )
          .filter((b) => !/^h[1-6]$/.test(b.tag))
          .reduce((n, b) => n + phraseCount(b.text, term), 0),
      );
      return {
        term,
        group,
        count,
        density: countWords ? ((100 * count) / countWords).toFixed(2) : "0.00",
        title: phraseCount(page.title, term),
        h1: page.blocks
          .filter((b) => b.tag === "h1")
          .reduce((n, b) => n + phraseCount(b.text, term), 0),
        headings: page.blocks
          .filter((b) => /^h[2-6]$/.test(b.tag))
          .filter((b) => phraseCount(b.text, term)).length,
        distribution,
      };
    });
}
export function claimPassages(page: PageSnapshot) {
  return page.blocks.filter(
    (b) =>
      !/^h/.test(b.tag) &&
      /\d+(?:\.\d+)?\s?%|\b(?:research shows|studies show|guaranteed|always|never|according to|survey found)\b/i.test(
        b.text,
      ),
  );
}
export function linkReport(page: PageSnapshot) {
  let base: URL | null = null;
  try {
    base = new URL(page.url);
  } catch {}
  return page.links.map((l) => {
    const destination = new URL(l.href);
    const type = !base
      ? "Unknown"
      : destination.origin === base.origin
        ? "Internal"
        : "External";
    return {
      ...l,
      host: destination.hostname,
      type,
      generic:
        !l.text || /^(?:click here|here|read more|learn more)$/i.test(l.text),
      attributes: l.rel.split(/\s+/).filter(Boolean),
    };
  });
}
