import { load } from "cheerio";

export type TocDepth = 2 | 3 | 4;
export type TocListStyle = "ol" | "ul";

export type TocHeadingItem = {
  index: number;
  level: 2 | 3 | 4;
  text: string;
  slug: string;
  included: boolean;
};

export type TocBuildResult = {
  items: TocHeadingItem[];
  tocHtml: string;
  updatedArticleHtml: string;
  tocMarkdown: string;
  jsonLdSchema: string;
};

export function slugifyHeading(text: string, prefix = ""): string {
  const base = text
    .toLowerCase()
    .replace(/&amp;|&/g, " and ")
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  const clean = base || "section";
  return prefix ? `${prefix}-${clean}` : clean;
}

export function extractTocHeadings(
  inputContent: string,
  maxDepth: TocDepth = 3,
  slugPrefix = "",
): TocHeadingItem[] {
  const isHtml = /<h[1-6][\s>]/i.test(inputContent);
  const rawHeadings: Array<{ level: 2 | 3 | 4; text: string }> = [];

  if (isHtml) {
    const $ = load(inputContent);
    const selector =
      maxDepth === 2 ? "h2" : maxDepth === 3 ? "h2,h3" : "h2,h3,h4";
    $(selector).each((_, el) => {
      const tag = (el.tagName || "h2").toLowerCase();
      const level = (Number.parseInt(tag.replace("h", ""), 10) || 2) as
        | 2
        | 3
        | 4;
      const text = $(el).text().replace(/\s+/g, " ").trim();
      if (text) rawHeadings.push({ level, text });
    });
  } else {
    const lines = inputContent.split(/\r?\n/);
    for (const line of lines) {
      const m = /^(#{2,4})\s+(.+)$/.exec(line.trim());
      if (!m) continue;
      const level = m[1].length as 2 | 3 | 4;
      if (level > maxDepth) continue;
      const text = m[2].replace(/#+\s*$/, "").trim();
      if (text) rawHeadings.push({ level, text });
    }
  }

  const usedSlugs = new Map<string, number>();
  return rawHeadings.map((h, idx) => {
    const baseSlug = slugifyHeading(h.text, slugPrefix);
    const count = usedSlugs.get(baseSlug) || 0;
    usedSlugs.set(baseSlug, count + 1);
    const finalSlug = count === 0 ? baseSlug : `${baseSlug}-${count + 1}`;
    return {
      index: idx + 1,
      level: h.level,
      text: h.text,
      slug: finalSlug,
      included: true,
    };
  });
}

export function buildTocOutputs(params: {
  inputContent: string;
  items: TocHeadingItem[];
  tocTitle: string;
  listStyle: TocListStyle;
  pageUrl: string;
}): TocBuildResult {
  const activeItems = params.items.filter((i) => i.included);
  const tag = params.listStyle;
  const esc = (s: string) =>
    s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  // 1. Semantic HTML <nav>
  const htmlLines: string[] = [
    `<nav aria-label="${esc(params.tocTitle || "Table of contents")}" class="seo-toc">`,
    `  <p class="seo-toc-title"><strong>${esc(params.tocTitle || "Table of Contents")}</strong></p>`,
    `  <${tag}>`,
  ];

  for (const item of activeItems) {
    const indent = item.level === 2 ? "    " : item.level === 3 ? "      " : "        ";
    const levelClass = item.level > 2 ? ` class="toc-level-${item.level}"` : "";
    htmlLines.push(
      `${indent}<li${levelClass}><a href="#${esc(item.slug)}">${esc(item.text)}</a></li>`,
    );
  }
  htmlLines.push(`  </${tag}>`, `</nav>`);
  const tocHtml = htmlLines.join("\n");

  // 2. Markdown TOC
  const mdLines: string[] = [
    `## ${params.tocTitle || "Table of Contents"}`,
    "",
    ...activeItems.map((item, idx) => {
      const indent = "  ".repeat(Math.max(0, item.level - 2));
      const bullet = params.listStyle === "ol" && item.level === 2 ? `${idx + 1}.` : "-";
      return `${indent}${bullet} [${item.text}](#${item.slug})`;
    }),
  ];
  const tocMarkdown = mdLines.join("\n") + "\n";

  // 3. Inject id="..." into article HTML (or convert Markdown headings to HTML with IDs)
  const isHtml = /<h[1-6][\s>]/i.test(params.inputContent);
  let updatedArticleHtml = "";
  if (isHtml) {
    const $ = load(params.inputContent);
    let cursor = 0;
    $("h2,h3,h4").each((_, el) => {
      const matched = params.items[cursor];
      cursor++;
      if (matched) {
        $(el).attr("id", matched.slug);
      }
    });
    updatedArticleHtml = `${tocHtml}\n\n${$("body").html() || $.html()}`;
  } else {
    let cursor = 0;
    const converted = params.inputContent
      .split(/\r?\n/)
      .map((line) => {
        const m = /^(#{2,4})\s+(.+)$/.exec(line.trim());
        if (!m) return line;
        const level = m[1].length;
        const matched = params.items[cursor];
        cursor++;
        const idAttr = matched ? ` id="${esc(matched.slug)}"` : "";
        return `<h${level}${idAttr}>${esc(m[2].trim())}</h${level}>`;
      })
      .join("\n");
    updatedArticleHtml = `${tocHtml}\n\n${converted}`;
  }

  // 4. Jump-Link ItemList JSON-LD Schema
  const cleanBaseUrl = (params.pageUrl.trim() || "https://example.com/article").replace(
    /#.*$/,
    "",
  );
  const schemaObj = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: params.tocTitle || "Table of Contents",
    itemListElement: activeItems.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.text,
      url: `${cleanBaseUrl}#${item.slug}`,
    })),
  };

  return {
    items: params.items,
    tocHtml,
    updatedArticleHtml,
    tocMarkdown,
    jsonLdSchema: JSON.stringify(schemaObj, null, 2),
  };
}
