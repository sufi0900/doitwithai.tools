import type { Node as DocumentNode } from "@tiptap/pm/model";
export const normalizePassage = (value: string) =>
  value.replace(/\s+/g, " ").trim();
export function reviewBlockPositions(doc: DocumentNode) {
  const blocks: { pos: number; size: number; text: string }[] = [];
  doc.descendants((node, pos) => {
    if (!node.isTextblock) return true;
    const text = normalizePassage(
      node.textBetween(0, node.content.size, " ", " "),
    );
    if (text) blocks.push({ pos, size: node.nodeSize, text });
    return false;
  });
  return blocks;
}
export function locateReviewBlock(
  doc: DocumentNode,
  index: number,
  expectedText: string,
) {
  const block = reviewBlockPositions(doc)[index];
  return block && block.text === normalizePassage(expectedText)
    ? block.pos + 1
    : null;
}
