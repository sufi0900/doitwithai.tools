import { Mark, mergeAttributes } from "@tiptap/react";
import { documentPosition, safeLink, type DocumentProjection } from "../engine/document";

export const SafeLink = Mark.create({
  name: "link",
  inclusive: false,
  addAttributes() { return { href: { default: null, parseHTML: (el) => safeLink(el.getAttribute("href")) } }; },
  parseHTML() { return [{ tag: "a[href]", getAttrs: (el) => safeLink((el as HTMLElement).getAttribute("href")) ? {} : false }]; },
  renderHTML({ HTMLAttributes }) {
    const href = safeLink(HTMLAttributes.href);
    return ["a", mergeAttributes({ ...HTMLAttributes, href, target: "_blank", rel: "noopener noreferrer" }), 0];
  },
});

export function replacementEdits(p: DocumentProjection, start: number, end: number, replacement: string) {
  if (start < 0 || end < start || end > p.text.length) return { error: "The selected passage has changed. Select it again." };
  const blocks = p.blocks.filter((b) => b.end > start && b.start < end);
  const pieces = blocks.length > 1 ? replacement.split(/\n\s*\n/) : [replacement];
  if (blocks.length > 1 && pieces.length !== blocks.length) {
    return { error: "This revision changes the number of blocks. Select one paragraph or list item to apply a rewrite while keeping its formatting." };
  }
  return { edits: (blocks.length ? blocks : [{ start, end }]).map((b, i) => ({
    from: documentPosition(p, Math.max(start, b.start), "start"),
    to: documentPosition(p, Math.min(end, b.end), "end"),
    text: pieces[i],
  })) };
}
