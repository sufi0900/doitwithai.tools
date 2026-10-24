import type { NormalizedDoc } from "./types";

// Pasted drafts have no DOM, so structure is only as good as the Markdown-style
// hints the writer includes: "# " / "## " for headings, "- " / "1. " for list
// items. Plain prose with no such hints still gets scored on paragraph length
// and word count, just with headings and lists read as absent.
export function extractFromText(raw: string): NormalizedDoc {
  const lines = raw.replace(/\r\n/g, "\n").split("\n");
  const headings: NormalizedDoc["headings"] = [];
  const paragraphs: string[] = [];
  let listCount = 0;
  let inList = false;
  let buffer: string[] = [];

  function flushParagraph() {
    const text = buffer.join(" ").trim();
    if (text) paragraphs.push(text);
    buffer = [];
  }

  for (const rawLine of lines) {
    const line = rawLine.trim();
    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    const listMatch = line.match(/^(?:[-*]|\d+\.)\s+/);

    if (headingMatch) {
      flushParagraph();
      if (inList) inList = false;
      headings.push({
        level: headingMatch[1].length,
        text: headingMatch[2].trim(),
      });
      continue;
    }
    if (listMatch) {
      flushParagraph();
      if (!inList) {
        listCount += 1;
        inList = true;
      }
      continue;
    }
    if (!line) {
      flushParagraph();
      inList = false;
      continue;
    }
    inList = false;
    buffer.push(line);
  }
  flushParagraph();

  const h1Count = headings.filter((heading) => heading.level === 1).length;
  const wordCount =
    paragraphs.reduce(
      (sum, paragraph) => sum + paragraph.split(/\s+/).filter(Boolean).length,
      0,
    ) +
    headings.reduce(
      (sum, heading) => sum + heading.text.split(/\s+/).filter(Boolean).length,
      0,
    );

  return {
    source: "text",
    title: headings.find((heading) => heading.level === 1)?.text || "",
    h1Count,
    headings,
    paragraphs,
    listCount,
    tableCount: 0,
    hasAuthor: null,
    hasPublishedDate: null,
    hasModifiedDate: null,
    outboundLinkDomains: null,
    schemaTypes: null,
    hasCanonical: null,
    wordCount,
  };
}
