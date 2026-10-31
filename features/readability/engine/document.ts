/** Tiptap JSON is retained separately from the plain-text analysis projection. */
export type RichDocument = {
  type: string;
  text?: string;
  attrs?: Record<string, any>;
  marks?: Array<{ type: string; attrs?: Record<string, any> }>;
  content?: RichDocument[];
};
export type DocumentBlock = {
  type: "paragraph" | "heading" | "listItem" | "quote" | "codeBlock";
  start: number;
  end: number;
  from: number;
  to: number;
  listItem?: number;
  quote?: number;
};
export type TextRun = { start: number; end: number; from: number; to: number };
export type DocumentProjection = { text: string; blocks: DocumentBlock[]; runs: TextRun[] };

export function plainDocument(text: string): RichDocument {
  return {
    type: "doc",
    content: text.split(/\n\s*\n/).map((paragraph) => ({
      type: "paragraph",
      content: paragraph.split("\n").flatMap((line, i) => [
        ...(i ? [{ type: "hardBreak" }] : []),
        ...(line ? [{ type: "text", text: line }] : []),
      ]),
    })),
  };
}

/** Every text block receives a real boundary, including short unpunctuated list items. */
export function projectDocument(doc: RichDocument): DocumentProjection {
  let text = "";
  const blocks: DocumentBlock[] = [];
  const runs: TextRun[] = [];
  const size = (node: RichDocument): number => node.type === "text"
    ? (node.text?.length ?? 0)
    : node.type === "hardBreak" || node.type === "horizontalRule" ? 1
    : (node.content ?? []).reduce((n, c) => n + size(c), 0) + (node.type === "doc" ? 0 : 2);
  function walk(node: RichDocument, pos: number, listItem?: number, quote?: number) {
    if (node.type === "listItem") listItem = pos;
    if (node.type === "blockquote") quote = pos;
    if (["paragraph", "heading", "codeBlock"].includes(node.type)) {
      if (blocks.length) text += "\n\n";
      const start = text.length;
      let at = pos + 1;
      for (const child of node.content ?? []) {
        const value = child.type === "text" ? child.text ?? "" : child.type === "hardBreak" ? "\n" : "";
        if (value) {
          runs.push({ start: text.length, end: text.length + value.length, from: at, to: at + size(child) });
          text += value;
        }
        at += size(child);
      }
      blocks.push({
        type: node.type === "heading" ? "heading" : node.type === "codeBlock" ? "codeBlock" : listItem !== undefined ? "listItem" : quote !== undefined ? "quote" : "paragraph",
        start, end: text.length, from: pos + 1, to: at, listItem, quote,
      });
      return;
    }
    let at = node.type === "doc" ? 0 : pos + 1;
    for (const child of node.content ?? []) { walk(child, at, listItem, quote); at += size(child); }
  }
  walk(doc, -1);
  return { text, blocks, runs };
}

export function documentPosition(p: DocumentProjection, offset: number, bias: "start" | "end" = "start") {
  const candidates = p.runs.filter((r) => offset >= r.start && offset <= r.end);
  const run = bias === "start" ? candidates[candidates.length - 1] : candidates[0];
  if (run) return run.from + Math.min(offset - run.start, run.to - run.from);
  const block = p.blocks.find((b) => offset >= b.start && offset <= b.end);
  if (block) return block.from;
  const next = p.blocks.find((b) => b.start > offset);
  return bias === "start" ? next?.from ?? p.blocks.at(-1)?.to ?? 1 : p.blocks.filter((b) => b.end < offset).at(-1)?.to ?? 1;
}

export function textPosition(p: DocumentProjection, position: number) {
  const run = p.runs.find((r) => position >= r.from && position <= r.to);
  if (run) return run.start + Math.min(position - run.from, run.end - run.start);
  const block = p.blocks.find((b) => position >= b.from && position <= b.to);
  if (block) return block.start;
  return p.blocks.find((b) => b.from > position)?.start ?? p.text.length;
}

/** Reject scripts and unsafe URL schemes when preserving pasted links. */
export function safeLink(value: unknown): string | null {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    return ["https:", "http:", "mailto:"].includes(url.protocol) ? url.href : null;
  } catch { return null; }
}

/** Minimal changed range keeps unaffected rich-text marks and blocks intact. */
export function changedRange(before: string, after: string) {
  let start = 0;
  while (start < before.length && start < after.length && before[start] === after[start]) start++;
  let end = before.length;
  let tail = after.length;
  while (end > start && tail > start && before[end - 1] === after[tail - 1]) { end--; tail--; }
  return { start, end, replacement: after.slice(start, tail) };
}
