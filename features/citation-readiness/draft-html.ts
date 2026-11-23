import type { Block, PageSnapshot } from "../on-page-analyzer/types";
export const MAX_DRAFT = 150_000;
export function draftBlocks(text: string): Block[] {
  if (text.length > MAX_DRAFT)
    throw new Error(
      "Paste up to 150,000 characters, or review your draft in sections.",
    );
  const blocks: Block[] = [];
  let paragraph: string[] = [];
  const push = (tag: string, value: string) => {
    if (value.trim())
      blocks.push({ id: `draft:${blocks.length}`, tag, text: value.trim() });
  };
  const flush = () => {
    push("p", paragraph.join(" "));
    paragraph = [];
  };
  for (const line of text.replace(/\r\n?/g, "\n").split("\n")) {
    const heading = /^(#{1,6})\s+(.+)$/.exec(line.trim());
    const list = /^(?:[-*+•]\s+|\d+[.)]\s+)(.+)$/.exec(line.trim());
    if (!line.trim() || heading || list) {
      flush();
      if (heading) push(`h${heading[1].length}`, heading[2]);
      if (list) push("li", list[1]);
    } else paragraph.push(line.trim());
  }
  flush();
  return blocks;
}
const escape = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
export function draftHtml(text: string) {
  return (
    "<main>" +
    draftBlocks(text)
      .map((b) =>
        b.tag === "li"
          ? `<ul><li>${escape(b.text)}</li></ul>`
          : `<${b.tag}>${escape(b.text)}</${b.tag}>`,
      )
      .join("") +
    "</main>"
  );
}
export function draftPage(text: string): PageSnapshot {
  const all = draftBlocks(text),
    blocks = all.slice(0, 1200),
    partial = all.length > blocks.length;
  return {
    url: "",
    checkedAt: new Date().toISOString(),
    source: "paste",
    status: null,
    title: blocks.find((b) => b.tag === "h1")?.text || "Pasted draft",
    titleCount: 0,
    description: "",
    descriptionCount: 0,
    canonical: "",
    canonicalCount: 0,
    robots: [],
    language: "",
    viewport: "",
    ogTitle: "",
    ogDescription: "",
    ogImage: "",
    siteName: "",
    blocks,
    links: [],
    images: [],
    schemas: { types: [], valid: 0, invalid: 0, samples: [] },
    author: "",
    modified: "",
    scope: "supplied draft text",
    partial,
    warnings: partial
      ? ["Only the first 1,200 draft blocks were retained."]
      : [],
    bytesRead: 0,
    redirects: 0,
    resources: { robots: "unknown", robotsText: "", llms: "unknown" },
  };
}
