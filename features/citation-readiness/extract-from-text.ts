import type { NormalizedDoc } from "./types";
import { draftBlocks } from "./draft-html";
export function extractFromText(raw: string): NormalizedDoc {
  const blocks = draftBlocks(raw).slice(0, 1200);
  const headings = blocks
    .filter((b) => /^h[1-6]$/.test(b.tag))
    .map((b) => ({ level: Number(b.tag[1]), text: b.text }));
  return {
    source: "text",
    title: headings.find((h) => h.level === 1)?.text || "",
    h1Count: headings.filter((h) => h.level === 1).length,
    headings,
    paragraphs: blocks.filter((b) => b.tag === "p").map((b) => b.text),
    listCount: blocks.filter((b) => b.tag === "li").length,
    tableCount: 0,
    hasAuthor: null,
    hasPublishedDate: null,
    hasModifiedDate: null,
    outboundLinkDomains: null,
    schemaTypes: null,
    hasCanonical: null,
    wordCount: blocks.reduce(
      (n, b) => n + b.text.split(/\s+/).filter(Boolean).length,
      0,
    ),
  };
}
