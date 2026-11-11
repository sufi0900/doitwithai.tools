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

const STOPWORDS = new Set([
  "the",
  "and",
  "for",
  "that",
  "this",
  "with",
  "from",
  "your",
  "are",
  "have",
  "not",
  "can",
  "will",
  "into",
  "more",
  "when",
  "what",
  "how",
  "why",
  "who",
  "where",
  "which",
  "their",
  "they",
  "them",
  "been",
  "has",
  "had",
  "were",
  "was",
  "also",
  "than",
  "then",
  "only",
  "some",
  "such",
  "each",
  "over",
  "both",
  "most",
  "other",
  "about",
  "after",
  "before",
  "between",
  "through",
  "during",
  "without",
  "within",
  "using",
  "used",
  "use",
  "make",
  "made",
  "does",
  "did",
]);

export interface TopicalEntityNgram {
  phrase: string;
  count: number;
  density: string;
  inTitle: boolean;
  inH1: boolean;
  inSubheadings: number;
}

export function extractTopicalEntitiesAndNgrams(
  page: PageSnapshot,
  limit = 10,
): TopicalEntityNgram[] {
  const fullText = [page.title, ...page.blocks.map((b) => b.text)].join(" ");
  const tokenList = fullText
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .map((w) => w.replace(/^-+|-+$/g, ""))
    .filter((w) => w.length >= 3 && !/^\d+$/.test(w));

  const totalWords = Math.max(1, tokenList.length);
  const counts = new Map<string, number>();

  for (let i = 0; i < tokenList.length - 1; i++) {
    const w1 = tokenList[i];
    const w2 = tokenList[i + 1];
    if (!STOPWORDS.has(w1) && !STOPWORDS.has(w2)) {
      const bigram = `${w1} ${w2}`;
      counts.set(bigram, (counts.get(bigram) || 0) + 1);
    }
    if (i < tokenList.length - 2) {
      const w3 = tokenList[i + 2];
      if (!STOPWORDS.has(w1) && !STOPWORDS.has(w3)) {
        const trigram = `${w1} ${w2} ${w3}`;
        counts.set(trigram, (counts.get(trigram) || 0) + 1);
      }
    }
  }

  const h1Blocks = page.blocks.filter((b) => b.tag === "h1");
  const subheadingBlocks = page.blocks.filter((b) => /^h[2-6]$/.test(b.tag));

  return [...counts.entries()]
    .filter(([, c]) => c >= 2)
    .map(([phrase, count]) => {
      const inTitle = phraseCount(page.title, phrase) > 0;
      const inH1 = h1Blocks.some((b) => phraseCount(b.text, phrase) > 0);
      const inSubheadings = subheadingBlocks.filter(
        (b) => phraseCount(b.text, phrase) > 0,
      ).length;
      const score =
        count * (phrase.split(" ").length === 3 ? 1.35 : 1) +
        (inTitle ? 4 : 0) +
        (inH1 ? 3 : 0) +
        inSubheadings * 1.5;
      return {
        phrase,
        count,
        density: ((100 * count) / totalWords).toFixed(2),
        inTitle,
        inH1,
        inSubheadings,
        score,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ score: _score, ...rest }) => rest);
}
