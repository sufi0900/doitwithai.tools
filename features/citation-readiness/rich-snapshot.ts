import { Parser } from "htmlparser2";
import type { RichDocument } from "../readability/engine/document";
import type { Block, PageLink, PageSnapshot } from "../on-page-analyzer/types";
import { safeSourceUrl } from "../content-evidence/analyze";
export const MAX_EDITOR_TEXT = 160_000;
const escape = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
export function sanitizeArticleHtml(html: string) {
  if (html.length > 750_000)
    throw new Error(
      "Paste a smaller article section, within 750,000 HTML characters.",
    );
  const allowed = new Set(
    "p h1 h2 h3 h4 h5 h6 strong b em i u s ul ol li blockquote pre code br a".split(
      " ",
    ),
  );
  const blocked = new Set(
    "script style iframe object embed svg form input button textarea template img video audio picture head title nav footer aside noscript".split(
      " ",
    ),
  );
  const stack: { name: string; hidden: boolean; output: boolean }[] = [];
  let hidden = 0,
    result = "";
  const parser = new Parser(
    {
      onopentag(name, attrs) {
        const isHidden =
          hidden > 0 ||
          blocked.has(name) ||
          attrs.hidden !== undefined ||
          attrs["aria-hidden"] === "true" ||
          /(?:display\s*:\s*none|visibility\s*:\s*hidden)/i.test(
            attrs.style || "",
          );
        if (isHidden) hidden++;
        const outputName = name === "td" || name === "th" ? "p" : name;
        const output = !isHidden && allowed.has(outputName);
        stack.push({ name: outputName, hidden: isHidden, output });
        if (stack.length > 200)
          throw new Error(
            "This pasted HTML is nested too deeply. Paste the main article section.",
          );
        if (!output) return;
        const href = name === "a" ? safeSourceUrl(attrs.href || "") : null;
        result += `<${outputName}${href ? ` href="${escape(href)}"` : ""}>`;
      },
      ontext(text) {
        if (!hidden) result += escape(text);
      },
      onclosetag() {
        const frame = stack.pop();
        if (!frame) return;
        if (frame.hidden) hidden--;
        if (frame.output && frame.name !== "br") result += `</${frame.name}>`;
      },
    },
    { decodeEntities: true },
  );
  parser.write(html);
  parser.end();
  return result;
}
function blockContent(block: Block, links: PageLink[]): RichDocument[] {
  const matches = links.filter(
    (l) => l.blockId === block.id && l.text && safeSourceUrl(l.href),
  );
  const ranges = matches
    .flatMap((link) => {
      const at = block.text.indexOf(link.text);
      return at >= 0 && block.text.indexOf(link.text, at + 1) < 0
        ? [{ at, end: at + link.text.length, link }]
        : [];
    })
    .sort((a, b) => a.at - b.at);
  const content: RichDocument[] = [];
  let at = 0;
  for (const range of ranges) {
    if (range.at < at) continue;
    if (range.at > at)
      content.push({ type: "text", text: block.text.slice(at, range.at) });
    content.push({
      type: "text",
      text: block.text.slice(range.at, range.end),
      marks: [{ type: "link", attrs: { href: range.link.href } }],
    });
    at = range.end;
  }
  if (at < block.text.length)
    content.push({ type: "text", text: block.text.slice(at) });
  return content;
}
export function snapshotDocument(page: PageSnapshot): RichDocument {
  const content: RichDocument[] = [];
  for (const block of page.blocks) {
    const node: RichDocument = {
      type: /^h[1-6]$/.test(block.tag) ? "heading" : "paragraph",
      content: blockContent(block, page.links),
    };
    if (node.type === "heading") node.attrs = { level: Number(block.tag[1]) };
    if (block.tag === "li") {
      const list = content.at(-1);
      const item = { type: "listItem", content: [node] };
      if (list?.type === "bulletList") list.content!.push(item);
      else content.push({ type: "bulletList", content: [item] });
    } else content.push(node);
  }
  return {
    type: "doc",
    content: content.length ? content : [{ type: "paragraph" }],
  };
}
export function reviewDraft(
  base: PageSnapshot,
  document: RichDocument,
): PageSnapshot {
  const blocks: Block[] = [],
    links: PageLink[] = [];
  let chars = 0,
    nodes = 0,
    listId = 0;
  function walk(node: RichDocument, listItem?: number, depth = 0) {
    if (++nodes > 20_000 || depth > 30)
      throw new Error(
        "The draft is too complex. Review a smaller article section.",
      );
    if (node.type === "listItem") listItem = listId++;
    if (["heading", "paragraph", "codeBlock"].includes(node.type)) {
      const block: Block = {
        id: `review-draft:${blocks.length}`,
        tag:
          node.type === "heading"
            ? `h${Math.max(1, Math.min(6, Number(node.attrs?.level) || 2))}`
            : listItem !== undefined
              ? "li"
              : node.type === "codeBlock"
                ? "pre"
                : "p",
        text: "",
        ...(listItem !== undefined ? { listItem } : {}),
      };
      for (const child of node.content || []) {
        if (++nodes > 20_000)
          throw new Error(
            "The draft is too complex. Review a smaller article section.",
          );
        const text =
          child.type === "text"
            ? child.text || ""
            : child.type === "hardBreak"
              ? " "
              : "";
        block.text += text;
        chars += text.length;
        if (chars > MAX_EDITOR_TEXT)
          throw new Error(
            "Keep the review draft within 160,000 text characters.",
          );
        for (const mark of child.marks || []) {
          const href =
            mark.type === "link" ? safeSourceUrl(mark.attrs?.href || "") : null;
          if (href && links.length < 1000)
            links.push({ href, text, rel: "", blockId: block.id });
        }
      }
      if (block.text.trim()) blocks.push(block);
      if (blocks.length > 1200)
        throw new Error("Keep the review draft within 1,200 content blocks.");
      return;
    }
    for (const child of node.content || []) walk(child, listItem, depth + 1);
  }
  walk(document);
  if (!blocks.length)
    throw new Error("Add article text before reviewing the draft.");
  return {
    ...base,
    blocks,
    links,
    contentEdited: true,
    contentReviewedAt: new Date().toISOString(),
    scope: `${base.scope}; locally edited content`,
    warnings: [
      ...base.warnings,
      "Content is a local review draft. Response metadata and crawler rules, when available, belong to the original import.",
    ],
  };
}
