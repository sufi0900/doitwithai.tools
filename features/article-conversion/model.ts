export type Block = {
  id: string;
  kind: "heading" | "paragraph" | "list" | "quote" | "code" | "table" | "image";
  text: string;
  level?: number;
  cells?: string[][];
  header?: boolean;
  src?: string;
  alt?: string;
  included?: boolean;
};
export type Article = {
  title: string;
  byline: string;
  published: string;
  source: string;
  blocks: Block[];
  links: { label: string; url: string }[];
  warnings: string[];
  method: string;
};
export type Settings = {
  size: "a4" | "letter";
  fontSize: number;
  margin: number;
  direction: "auto" | "ltr" | "rtl";
};
export const defaults: Settings = {
  size: "a4",
  fontSize: 11,
  margin: 54,
  direction: "auto",
};
export function safeLink(raw: string, base?: string) {
  try {
    const u = new URL(raw, base || undefined);
    if (
      !/^https?:$/.test(u.protocol) ||
      u.username ||
      u.password ||
      u.port ||
      /^(localhost|127\.|0\.|10\.|192\.168\.|169\.254\.|\[)/i.test(
        u.hostname,
      ) ||
      /\.(local|internal|localhost)$/i.test(u.hostname)
    )
      return "";
    u.hash = "";
    return u.href;
  } catch {
    return "";
  }
}
export const filename = (s: string) =>
  (s
    .normalize("NFKC")
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, " ")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80) || "article") + ".pdf";
export function validate(a: Article) {
  if (!a.title.trim()) return "Add an article title before exporting.";
  if (a.title.length > 300 || a.byline.length > 300 || a.published.length > 100)
    return "Shorten the title, byline, or date.";
  if (
    !a.blocks.some(
      (b) =>
        b.kind !== "image" &&
        (b.text.trim() || b.cells?.some((r) => r.some((c) => c.trim()))),
    )
  )
    return "Keep at least one text section before exporting.";
  if (
    a.blocks.length > 300 ||
    a.blocks.reduce(
      (n, b) => n + b.text.length + (b.cells?.flat().join("").length || 0),
      0,
    ) > 80000
  )
    return "Use up to 80,000 characters and 300 blocks.";
  if (a.blocks.some((b) => b.text.length > 12000))
    return "Split text sections longer than 12,000 characters.";
  if (
    a.blocks.some(
      (b) =>
        b.kind === "table" &&
        (!b.cells?.length ||
          b.cells.length > 100 ||
          b.cells.some((r) => r.length > 8)),
    )
  )
    return "Keep tables within 100 rows and eight columns.";
  return "";
}
export function fromText(text: string, source = ""): Article {
  if (!text.trim() || text.length > 80000)
    throw Error("Paste non-empty article text within 80,000 characters.");
  const blocks: Block[] = text
    .trim()
    .split(/\n\s*\n/)
    .map((text, n) => {
      const h = text.match(/^(#{1,6})\s+(.+)$/);
      return {
        id: `b${n}`,
        kind: h ? "heading" : "paragraph",
        text: h ? h[2] : text.trim(),
        ...(h ? { level: h[1].length } : {}),
      };
    });
  if (blocks.length > 300) throw Error("Use up to 300 paragraphs or headings.");
  return {
    title: "Untitled article",
    byline: "",
    published: "",
    source: safeLink(source),
    blocks,
    links: [],
    warnings: [
      "Plain text retains paragraphs and # headings. Original images, links, tables, and metadata cannot be recovered.",
    ],
    method: "Pasted text",
  };
}
export const exampleHtml = `<html><head><title>A calmer reading workflow</title><meta name="author" content="Example editorial team"><meta property="article:published_time" content="2026-10-01"></head><body><nav>Example navigation</nav><article><h1>A calmer reading workflow</h1><p>This fictional example shows how an article becomes a clean reading copy. Review headings, paragraphs, links, and tables before exporting. Compare the preview with the original whenever you import your own content.</p><h2>Save what matters</h2><p>Start with content you have permission to save. Keep the source context and remove unrelated sections. A readable copy needs enough explanation to remain understandable after the surrounding website has been removed.</p><ul><li>Check the title and source details.</li><li>Remove unrelated recommendations.</li><li>Choose a comfortable paper size.</li></ul><h2>Choose a layout</h2><table><tr><th>Purpose</th><th>Review step</th></tr><tr><td>Offline reading</td><td>Check paragraphs and headings</td></tr><tr><td>Printing</td><td>Choose A4 or Letter</td></tr></table><p>Read about <a href="https://developer.mozilla.org/en-US/docs/Web/HTML">HTML structure</a> when preparing your own reading copy. This is a fictional teaching example, not a research finding.</p><blockquote>Keep enough context for the reading copy to remain useful.</blockquote></article><footer>Example footer</footer></body></html>`;
