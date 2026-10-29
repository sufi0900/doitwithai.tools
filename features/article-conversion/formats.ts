import { zipStored } from "../outreach-email/docx";
import { safeLink, validate, type Article } from "./model";

export type ConversionFormat =
  | "pdf"
  | "docx"
  | "audio"
  | "video-script"
  | "social-posts"
  | "markdown"
  | "epub"
  | "newsletter"
  | "linkedin-carousel"
  | "podcast-script";

const xmlEscape = (s: string) =>
  s
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\ufffe\uffff]/g, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const stripRefs = (s: string) =>
  s
    .replace(/\s*\[\d+\]/g, "")
    .replace(/\s+/g, " ")
    .trim();

export function countWords(text: string): number {
  const cleaned = text.trim();
  if (!cleaned) return 0;
  return cleaned.split(/\s+/).filter(Boolean).length;
}

export function splitSentences(text: string): string[] {
  const cleaned = stripRefs(text).replace(/^\s*(?:[•▪▸◦–—-]|\d+\.)\s*/, "");
  if (!cleaned) return [];
  const parts = cleaned
    .split(/(?<=[.!?।])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  return parts.length ? parts : [cleaned];
}

function buildMinimalDocx(
  title: string,
  subtitle: string,
  bodyXml: string,
): Uint8Array {
  const w = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";
  const pkg = "http://schemas.openxmlformats.org/package/2006/relationships";
  const decl = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';

  const entries: Record<string, string | Uint8Array> = {
    "[Content_Types].xml":
      `${decl}<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">` +
      `<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>` +
      `<Default Extension="xml" ContentType="application/xml"/>` +
      `<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>` +
      `<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>` +
      `</Types>`,
    "_rels/.rels":
      `${decl}<Relationships xmlns="${pkg}">` +
      `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>` +
      `</Relationships>`,
    "word/_rels/document.xml.rels":
      `${decl}<Relationships xmlns="${pkg}">` +
      `<Relationship Id="rIdStyles" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>` +
      `</Relationships>`,
    "word/styles.xml":
      `${decl}<w:styles xmlns:w="${w}">` +
      `<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:rPr><w:sz w:val="22"/></w:rPr></w:style>` +
      `<w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:rPr><w:b/><w:sz w:val="36"/></w:rPr></w:style>` +
      `<w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:rPr><w:b/><w:sz w:val="28"/></w:rPr></w:style>` +
      `<w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:rPr><w:b/><w:sz w:val="24"/></w:rPr></w:style>` +
      `</w:styles>`,
    "word/document.xml":
      `${decl}<w:document xmlns:w="${w}"><w:body>` +
      `<w:p><w:pPr><w:pStyle w:val="Title"/></w:pPr><w:r><w:t xml:space="preserve">${xmlEscape(title)}</w:t></w:r></w:p>` +
      (subtitle
        ? `<w:p><w:r><w:t xml:space="preserve">${xmlEscape(subtitle)}</w:t></w:r></w:p>`
        : "") +
      bodyXml +
      `<w:sectPr><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="1080" w:right="1080" w:bottom="1080" w:left="1080"/></w:sectPr>` +
      `</w:body></w:document>`,
  };
  return zipStored(entries);
}

const docxParagraph = (text: string, style = "Normal", boldPrefix = "") =>
  `<w:p><w:pPr><w:pStyle w:val="${style}"/></w:pPr>` +
  (boldPrefix
    ? `<w:r><w:rPr><w:b/></w:rPr><w:t xml:space="preserve">${xmlEscape(boldPrefix)}</w:t></w:r>`
    : "") +
  `<w:r><w:t xml:space="preserve">${xmlEscape(text)}</w:t></w:r></w:p>`;

// ============================================================================
// 1. BLOG TO VIDEO SCRIPT
// ============================================================================
export type VideoScene = {
  id: string;
  title: string;
  narration: string;
  visual: string;
  onScreenText: string;
  seconds: number;
  sourceBlockId?: string;
};

export type VideoScriptDraft = {
  mode: "youtube" | "shorts";
  wpm: 120 | 140 | 160;
  hookIndex: number;
  cta: string;
  scenes: VideoScene[];
  totalWords: number;
  totalSeconds: number;
};

export function buildVideoScript(
  article: Article,
  mode: "youtube" | "shorts" = "youtube",
  wpm: 120 | 140 | 160 = 140,
  hookIndex = 0,
  cta = "Read the full article at the source link in the description.",
): VideoScriptDraft {
  const err = validate(article);
  if (err) throw Error(err);

  const readable = article.blocks.filter(
    (b) =>
      ["heading", "paragraph", "list", "quote"].includes(b.kind) &&
      stripRefs(b.text),
  );
  const firstSentences = readable
    .flatMap((b) => splitSentences(b.text))
    .filter((s) => s.length >= 25);

  const hooks = [
    `${article.title}. ${firstSentences[0] || ""}`.trim(),
    firstSentences[0] || article.title,
    `Here is what this article covers about ${article.title}: ${firstSentences[1] || firstSentences[0] || ""}`.trim(),
  ];
  const chosenHook = hooks[hookIndex % hooks.length] || article.title;

  const scenes: VideoScene[] = [];
  const addScene = (
    title: string,
    narration: string,
    visual: string,
    onScreenText: string,
    sourceBlockId?: string,
  ) => {
    const cleanNarration = narration.trim();
    if (!cleanNarration) return;
    const words = countWords(cleanNarration);
    const seconds = Math.max(3, Math.ceil((words / wpm) * 60));
    scenes.push({
      id: `scene-${scenes.length + 1}`,
      title,
      narration: cleanNarration,
      visual,
      onScreenText: onScreenText.slice(0, 120),
      seconds,
      sourceBlockId,
    });
  };

  addScene(
    mode === "shorts" ? "Hook (0–5s)" : "Opening Hook",
    chosenHook,
    "Speaker on camera or title card with source headline.",
    article.title.slice(0, 72),
    readable[0]?.id,
  );

  const maxPoints = mode === "shorts" ? 3 : 8;
  const contentBlocks = readable.filter((b) => b.kind !== "heading");
  const headings = readable.filter((b) => b.kind === "heading");

  for (let i = 0; i < Math.min(maxPoints, contentBlocks.length); i++) {
    const b = contentBlocks[i];
    const sents = splitSentences(b.text);
    const spoken =
      mode === "shorts" ? sents[0] || stripRefs(b.text) : sents.slice(0, 2).join(" ");
    const headingText =
      headings[Math.min(i, headings.length - 1)]?.text ||
      `Key Point ${i + 1}`;
    addScene(
      `Scene ${i + 2} · ${stripRefs(headingText).slice(0, 60)}`,
      spoken,
      b.kind === "list"
        ? "Show bulleted callout graphic matching the spoken point."
        : b.kind === "quote"
          ? "Display pull-quote card on screen."
          : "B-roll or screen recording illustrating this section.",
      stripRefs(spoken).slice(0, 70),
      b.id,
    );
  }

  addScene(
    "Closing & Call to Action",
    cta.trim() || `Review the complete article: ${article.title}.`,
    "End card with source link and attribution.",
    article.source || article.title.slice(0, 70),
  );

  const totalWords = scenes.reduce((n, s) => n + countWords(s.narration), 0);
  const totalSeconds = scenes.reduce((n, s) => n + s.seconds, 0);

  return {
    mode,
    wpm,
    hookIndex,
    cta,
    scenes,
    totalWords,
    totalSeconds,
  };
}

export function videoScriptTxt(
  article: Article,
  draft: VideoScriptDraft,
): string {
  const lines = [
    `VIDEO SCRIPT: ${article.title}`,
    `Format: ${draft.mode === "shorts" ? "Short-Form Vertical (Shorts / Reels)" : "YouTube Long-Form"}`,
    `Speaking Rate Assumption: ${draft.wpm} WPM · Estimated Duration: ${Math.floor(draft.totalSeconds / 60)}m ${draft.totalSeconds % 60}s (${draft.totalWords} words)`,
    article.source ? `Source URL: ${article.source}` : "",
    article.byline ? `Source Attribution: ${article.byline}` : "",
    "",
    "--- SCENES ---",
    "",
  ].filter((l) => l !== "");

  draft.scenes.forEach((s, idx) => {
    lines.push(
      `[${idx + 1}] ${s.title} (~${s.seconds}s)`,
      `NARRATION: ${s.narration}`,
      `VISUAL: ${s.visual}`,
      `ON-SCREEN TEXT: ${s.onScreenText}`,
      "",
    );
  });
  return lines.join("\n");
}

export function videoScriptDocx(
  article: Article,
  draft: VideoScriptDraft,
): Uint8Array {
  const rowsXml = draft.scenes
    .map(
      (s, i) =>
        `<w:tr>` +
        `<w:tc><w:p><w:r><w:rPr><w:b/></w:rPr><w:t xml:space="preserve">${xmlEscape(`${i + 1}. ${s.title} (${s.seconds}s)`)}</w:t></w:r></w:p>` +
        `<w:p><w:r><w:t xml:space="preserve">${xmlEscape(`Visual: ${s.visual}`)}</w:t></w:r></w:p>` +
        `<w:p><w:r><w:t xml:space="preserve">${xmlEscape(`On-Screen: ${s.onScreenText}`)}</w:t></w:r></w:p></w:tc>` +
        `<w:tc><w:p><w:r><w:t xml:space="preserve">${xmlEscape(s.narration)}</w:t></w:r></w:p></w:tc>` +
        `</w:tr>`,
    )
    .join("");

  const tableXml =
    `<w:tbl><w:tblPr><w:tblBorders>` +
    `<w:top w:val="single" w:sz="4" w:color="CBD5E1"/>` +
    `<w:bottom w:val="single" w:sz="4" w:color="CBD5E1"/>` +
    `<w:left w:val="single" w:sz="4" w:color="CBD5E1"/>` +
    `<w:right w:val="single" w:sz="4" w:color="CBD5E1"/>` +
    `<w:insideH w:val="single" w:sz="4" w:color="CBD5E1"/>` +
    `<w:insideV w:val="single" w:sz="4" w:color="CBD5E1"/>` +
    `</w:tblBorders></w:tblPr>` +
    `<w:tr><w:tc><w:p><w:r><w:rPr><w:b/></w:rPr><w:t>Scene &amp; Visual Direction</w:t></w:r></w:p></w:tc>` +
    `<w:tc><w:p><w:r><w:rPr><w:b/></w:rPr><w:t>Spoken Narration</w:t></w:r></w:p></w:tc></w:tr>` +
    rowsXml +
    `</w:tbl>`;

  return buildMinimalDocx(
    `${article.title} — Video Script`,
    `${draft.mode === "shorts" ? "Short-form script" : "Long-form script"} · ${draft.wpm} WPM · ~${draft.totalSeconds}s${article.source ? ` · Source: ${article.source}` : ""}`,
    tableXml,
  );
}

// ============================================================================
// 2. BLOG TO SOCIAL POSTS
// ============================================================================
export type SocialPost = {
  id: string;
  platform: "LinkedIn" | "X / Twitter Thread" | "Facebook" | "Instagram";
  angle: string;
  content: string;
  charLimit: number;
};

export function buildSocialPosts(
  article: Article,
  angle: "takeaways" | "educational" | "discussion" = "takeaways",
  includeSourceLink = true,
): SocialPost[] {
  const err = validate(article);
  if (err) throw Error(err);

  const points = article.blocks
    .filter((b) => ["paragraph", "list", "quote"].includes(b.kind))
    .flatMap((b) => splitSentences(b.text))
    .filter((s) => s.length >= 25)
    .slice(0, 6);

  const headings = article.blocks
    .filter((b) => b.kind === "heading")
    .map((b) => stripRefs(b.text))
    .slice(0, 4);

  const linkLine =
    includeSourceLink && article.source ? `\n\nSource: ${article.source}` : "";

  const bulletList = (points.length ? points.slice(0, 4) : [article.title])
    .map((p) => `• ${p}`)
    .join("\n");

  const lead =
    angle === "discussion"
      ? `How are you approaching ${article.title}?\n\nHere are the core points from our latest breakdown:`
      : angle === "educational"
        ? `A practical breakdown of ${article.title}:`
        : `Key takeaways from "${article.title}":`;

  const linkedin = `${lead}\n\n${bulletList}${headings.length ? `\n\nTopics covered:\n${headings.map((h) => `→ ${h}`).join("\n")}` : ""}${linkLine}`.slice(
    0,
    2900,
  );

  const threadParts = [
    `1/ ${article.title}\n\n${points[0] || "Key takeaways from this article:"}`,
    ...points.slice(1, 5).map((p, idx) => `${idx + 2}/ ${p}`),
    includeSourceLink && article.source
      ? `${Math.min(points.length, 5) + 1}/ Read the full article: ${article.source}`
      : `${Math.min(points.length, 5) + 1}/ Key takeaway: ${points[0] || article.title}`,
  ];

  const facebook = `${article.title}\n\n${points.slice(0, 3).join("\n\n")}${linkLine}`;
  const instagram = `${article.title}\n\n${bulletList}\n\nSave this post for reference.${linkLine}`;

  return [
    {
      id: "linkedin",
      platform: "LinkedIn",
      angle,
      content: linkedin,
      charLimit: 3000,
    },
    {
      id: "x-thread",
      platform: "X / Twitter Thread",
      angle,
      content: threadParts.join("\n\n---\n\n"),
      charLimit: 1400,
    },
    {
      id: "facebook",
      platform: "Facebook",
      angle,
      content: facebook,
      charLimit: 2000,
    },
    {
      id: "instagram",
      platform: "Instagram",
      angle,
      content: instagram,
      charLimit: 2200,
    },
  ];
}

export function socialPostsTxt(article: Article, posts: SocialPost[]): string {
  return [
    `SOCIAL MEDIA DRAFTS: ${article.title}`,
    article.source ? `Source: ${article.source}` : "",
    "",
    ...posts.map(
      (p) =>
        `=== ${p.platform} (${p.content.length} chars) ===\n${p.content}\n`,
    ),
  ]
    .filter((l) => l !== "")
    .join("\n");
}

export function socialPostsCsv(article: Article, posts: SocialPost[]): string {
  const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const rows = [
    ["Platform", "Angle", "Characters", "Post Copy", "Source URL"].join(","),
    ...posts.map((p) =>
      [
        esc(p.platform),
        esc(p.angle),
        String(p.content.length),
        esc(p.content),
        esc(article.source || ""),
      ].join(","),
    ),
  ];
  return rows.join("\r\n") + "\r\n";
}

// ============================================================================
// 3. ARTICLE TO MARKDOWN
// ============================================================================
export function articleToMarkdown(
  article: Article,
  options: { includeFrontmatter?: boolean; includeReferences?: boolean } = {},
): string {
  const err = validate(article);
  if (err) throw Error(err);
  const { includeFrontmatter = true, includeReferences = true } = options;

  const lines: string[] = [];
  if (includeFrontmatter) {
    lines.push("---");
    lines.push(`title: "${article.title.replace(/"/g, '\\"')}"`);
    if (article.byline)
      lines.push(`author: "${article.byline.replace(/"/g, '\\"')}"`);
    if (article.published)
      lines.push(`date: "${article.published.replace(/"/g, '\\"')}"`);
    if (article.source) lines.push(`source: "${article.source}"`);
    lines.push("---", "");
  }

  lines.push(`# ${article.title}`, "");
  if (article.byline || article.published || article.source) {
    const meta = [
      article.byline ? `By ${article.byline}` : "",
      article.published ? `Published ${article.published}` : "",
      article.source ? `[Original source](${article.source})` : "",
    ]
      .filter(Boolean)
      .join(" · ");
    if (meta) lines.push(`*${meta}*`, "");
  }

  for (const b of article.blocks) {
    if (b.kind === "heading") {
      const hashes = "#".repeat(Math.min(6, Math.max(2, b.level || 2)));
      lines.push(`${hashes} ${b.text.trim()}`, "");
    } else if (b.kind === "paragraph") {
      lines.push(b.text.trim(), "");
    } else if (b.kind === "list") {
      const clean = b.text.replace(/^\s*•\s*/, "- ").trim();
      lines.push(clean, "");
    } else if (b.kind === "quote") {
      lines.push(
        b.text
          .trim()
          .split("\n")
          .map((l) => `> ${l}`)
          .join("\n"),
        "",
      );
    } else if (b.kind === "code") {
      lines.push("```", b.text, "```", "");
    } else if (b.kind === "table" && b.cells?.length) {
      const cols = Math.max(...b.cells.map((r) => r.length), 1);
      const padRow = (r: string[]) =>
        `| ${Array.from({ length: cols }, (_, i) => (r[i] || "").replace(/\|/g, "\\|").replace(/\n/g, " ")).join(" | ")} |`;
      lines.push(padRow(b.cells[0]));
      lines.push(`| ${Array.from({ length: cols }, () => "---").join(" | ")} |`);
      for (const row of b.cells.slice(1)) {
        lines.push(padRow(row));
      }
      lines.push("");
    } else if (b.kind === "image" && b.src) {
      lines.push(`![${b.alt || "Article image"}](${b.src})`, "");
    }
  }

  if (includeReferences && article.links.length > 0) {
    lines.push("## References", "");
    article.links.forEach((l, i) => {
      lines.push(`${i + 1}. [${l.label}](${l.url})`);
    });
    lines.push("");
  }

  return lines.join("\n").trim() + "\n";
}

// ============================================================================
// 4. ARTICLE TO EPUB (Valid EPUB 3 Package)
// ============================================================================
export function articleToEpub(
  article: Article,
  options: { theme?: "serif" | "sans"; lang?: string } = {},
): { epubBytes: Uint8Array; xhtml: string } {
  const err = validate(article);
  if (err) throw Error(err);

  const theme = options.theme || "serif";
  const lang = options.lang || "en";
  const bookId = `urn:uuid:diwat-${Date.now()}`;
  const modified = new Date().toISOString().replace(/\.\d+Z$/, "Z");

  const headings: Array<{ id: string; text: string }> = [];
  const bodyParts: string[] = [];

  article.blocks.forEach((b, idx) => {
    if (b.kind === "heading") {
      const hid = `sec-${idx + 1}`;
      const tag = `h${Math.min(4, Math.max(2, b.level || 2))}`;
      headings.push({ id: hid, text: stripRefs(b.text) });
      bodyParts.push(`<${tag} id="${hid}">${xmlEscape(b.text)}</${tag}>`);
    } else if (b.kind === "paragraph") {
      bodyParts.push(`<p>${xmlEscape(b.text)}</p>`);
    } else if (b.kind === "list") {
      bodyParts.push(`<p class="list-item">${xmlEscape(b.text)}</p>`);
    } else if (b.kind === "quote") {
      bodyParts.push(`<blockquote><p>${xmlEscape(b.text)}</p></blockquote>`);
    } else if (b.kind === "code") {
      bodyParts.push(`<pre><code>${xmlEscape(b.text)}</code></pre>`);
    } else if (b.kind === "table" && b.cells?.length) {
      const trs = b.cells
        .map(
          (row, rIdx) =>
            `<tr>${row
              .map((c) =>
                b.header && rIdx === 0
                  ? `<th>${xmlEscape(c)}</th>`
                  : `<td>${xmlEscape(c)}</td>`,
              )
              .join("")}</tr>`,
        )
        .join("");
      bodyParts.push(`<table><tbody>${trs}</tbody></table>`);
    }
  });

  if (article.links.length > 0) {
    bodyParts.push(
      `<h2 id="references">References</h2><ol>` +
        article.links
          .map(
            (l) =>
              `<li><a href="${xmlEscape(safeLink(l.url))}">${xmlEscape(l.label)}</a></li>`,
          )
          .join("") +
        `</ol>`,
    );
  }

  const fontStack =
    theme === "sans"
      ? "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
      : "Georgia, 'Times New Roman', serif";

  const css = [
    `body { font-family: ${fontStack}; line-height: 1.65; margin: 1.2em; color: #111827; }`,
    `h1, h2, h3, h4 { line-height: 1.3; margin-top: 1.4em; color: #1f2937; }`,
    `p { margin: 0.75em 0; }`,
    `.meta { font-size: 0.9em; color: #4b5563; border-bottom: 1px solid #e5e7eb; padding-bottom: 0.8em; margin-bottom: 1.2em; }`,
    `blockquote { border-left: 3px solid #9a3412; padding-left: 1em; font-style: italic; color: #374151; }`,
    `pre { background: #f3f4f6; padding: 0.8em; overflow-x: auto; font-family: monospace; }`,
    `table { border-collapse: collapse; width: 100%; margin: 1em 0; }`,
    `th, td { border: 1px solid #d1d5db; padding: 0.5em; text-align: left; }`,
  ].join("\n");

  const metaLine = [
    article.byline ? `By ${xmlEscape(article.byline)}` : "",
    article.published ? `Published ${xmlEscape(article.published)}` : "",
    article.source
      ? `<a href="${xmlEscape(safeLink(article.source))}">${xmlEscape(article.source)}</a>`
      : "",
  ]
    .filter(Boolean)
    .join(" · ");

  const xhtml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<!DOCTYPE html>\n` +
    `<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="${xmlEscape(lang)}">\n` +
    `<head><meta charset="UTF-8"/><title>${xmlEscape(article.title)}</title><link rel="stylesheet" type="text/css" href="style.css"/></head>\n` +
    `<body>\n` +
    `<h1 id="top">${xmlEscape(article.title)}</h1>\n` +
    (metaLine ? `<p class="meta">${metaLine}</p>\n` : "") +
    bodyParts.join("\n") +
    `\n</body></html>`;

  const navItems = (
    headings.length
      ? headings
      : [{ id: "top", text: article.title }]
  )
    .map(
      (h) =>
        `<li><a href="article.xhtml#${h.id}">${xmlEscape(h.text)}</a></li>`,
    )
    .join("");

  const navXhtml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<!DOCTYPE html>\n` +
    `<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="${xmlEscape(lang)}">\n` +
    `<head><meta charset="UTF-8"/><title>Table of Contents</title></head>\n` +
    `<body><nav epub:type="toc" id="toc"><h1>Contents</h1><ol>${navItems}</ol></nav></body></html>`;

  const opf =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="bookid">\n` +
    `<metadata xmlns:dc="http://purl.org/dc/elements/1.1/">\n` +
    `<dc:identifier id="bookid">${xmlEscape(bookId)}</dc:identifier>\n` +
    `<dc:title>${xmlEscape(article.title)}</dc:title>\n` +
    `<dc:language>${xmlEscape(lang)}</dc:language>\n` +
    (article.byline
      ? `<dc:creator>${xmlEscape(article.byline)}</dc:creator>\n`
      : "") +
    `<meta property="dcterms:modified">${modified}</meta>\n` +
    `</metadata>\n` +
    `<manifest>\n` +
    `<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>\n` +
    `<item id="css" href="style.css" media-type="text/css"/>\n` +
    `<item id="article" href="article.xhtml" media-type="application/xhtml+xml"/>\n` +
    `</manifest>\n` +
    `<spine><itemref idref="article"/></spine>\n` +
    `</package>`;

  const containerXml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">\n` +
    `<rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/epub+xml"/></rootfiles>\n` +
    `</container>`;

  const epubBytes = zipStored({
    mimetype: "application/epub+zip",
    "META-INF/container.xml": containerXml,
    "OEBPS/content.opf": opf,
    "OEBPS/nav.xhtml": navXhtml,
    "OEBPS/style.css": css,
    "OEBPS/article.xhtml": xhtml,
  });

  return { epubBytes, xhtml };
}

// ============================================================================
// 5. BLOG TO NEWSLETTER
// ============================================================================
export type NewsletterDraft = {
  subjectOptions: string[];
  selectedSubject: string;
  preheader: string;
  greeting: string;
  intro: string;
  takeaways: string[];
  sections: Array<{ heading: string; summary: string }>;
  ctaLabel: string;
  ctaUrl: string;
};

export function buildNewsletter(article: Article): NewsletterDraft {
  const err = validate(article);
  if (err) throw Error(err);

  const paragraphs = article.blocks.filter((b) => b.kind === "paragraph");
  const lists = article.blocks.filter((b) => b.kind === "list");
  const headings = article.blocks.filter((b) => b.kind === "heading");

  const firstPara = stripRefs(paragraphs[0]?.text || article.title);
  const takeaways = (
    lists.length
      ? lists.slice(0, 5).map((l) => stripRefs(l.text))
      : paragraphs
          .slice(0, 4)
          .flatMap((p) => splitSentences(p.text).slice(0, 1))
  ).slice(0, 5);

  const sections: Array<{ heading: string; summary: string }> = [];
  for (let i = 0; i < Math.min(4, Math.max(headings.length, 2)); i++) {
    const h = stripRefs(headings[i]?.text || `Highlight ${i + 1}`);
    const p = stripRefs(
      paragraphs[Math.min(i + 1, paragraphs.length - 1)]?.text || firstPara,
    );
    if (p) sections.push({ heading: h, summary: p });
  }

  const subjectOptions = [
    article.title,
    `Key takeaways: ${article.title}`,
    `Inside our latest guide: ${article.title}`,
  ];

  return {
    subjectOptions,
    selectedSubject: subjectOptions[0],
    preheader: firstPara.slice(0, 140),
    greeting: "Hi there,",
    intro: firstPara,
    takeaways,
    sections,
    ctaLabel: "Read the full article",
    ctaUrl: article.source || "https://doitwithai.tools",
  };
}

export function newsletterTxt(
  article: Article,
  draft: NewsletterDraft,
): string {
  return [
    `SUBJECT: ${draft.selectedSubject}`,
    `PREHEADER: ${draft.preheader}`,
    "",
    draft.greeting,
    "",
    draft.intro,
    "",
    "KEY TAKEAWAYS:",
    ...draft.takeaways.map((t) => `• ${t.replace(/^\s*•\s*/, "")}`),
    "",
    ...draft.sections.flatMap((s) => [`### ${s.heading}`, s.summary, ""]),
    `${draft.ctaLabel}: ${draft.ctaUrl}`,
  ].join("\n");
}

export function newsletterHtml(
  article: Article,
  draft: NewsletterDraft,
): string {
  const itemsHtml = draft.takeaways
    .map(
      (t) =>
        `<li style="margin-bottom:8px;">${xmlEscape(t.replace(/^\s*•\s*/, ""))}</li>`,
    )
    .join("");
  const secsHtml = draft.sections
    .map(
      (s) =>
        `<h2 style="font-size:18px;color:#1e293b;margin:20px 0 8px;">${xmlEscape(s.heading)}</h2>` +
        `<p style="margin:0 0 14px;color:#334155;line-height:1.6;">${xmlEscape(s.summary)}</p>`,
    )
    .join("");

  return (
    `<!DOCTYPE html>\n<html lang="en"><head><meta charset="UTF-8"/><title>${xmlEscape(draft.selectedSubject)}</title></head>` +
    `<body style="margin:0;padding:24px;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#0f172a;">` +
    `<div style="display:none;max-height:0;overflow:hidden;">${xmlEscape(draft.preheader)}</div>` +
    `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;padding:32px;">` +
    `<tr><td>` +
    `<p style="margin:0 0 12px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#9a3412;">Newsletter Edition</p>` +
    `<h1 style="margin:0 0 16px;font-size:24px;line-height:1.3;color:#0f172a;">${xmlEscape(article.title)}</h1>` +
    `<p style="margin:0 0 16px;color:#334155;line-height:1.6;">${xmlEscape(draft.greeting)}</p>` +
    `<p style="margin:0 0 20px;color:#334155;line-height:1.6;">${xmlEscape(draft.intro)}</p>` +
    (itemsHtml
      ? `<div style="background:#fff7ed;border-left:4px solid #9a3412;padding:16px;margin:0 0 20px;border-radius:6px;">` +
        `<strong style="display:block;margin-bottom:8px;color:#9a3412;">Key Takeaways</strong>` +
        `<ul style="margin:0;padding-left:20px;color:#334155;line-height:1.6;">${itemsHtml}</ul></div>`
      : "") +
    secsHtml +
    (draft.ctaUrl
      ? `<p style="margin:28px 0 12px;"><a href="${xmlEscape(safeLink(draft.ctaUrl) || "https://doitwithai.tools")}" style="display:inline-block;background:#3452d1;color:#ffffff;text-decoration:none;font-weight:700;padding:12px 22px;border-radius:8px;">${xmlEscape(draft.ctaLabel)}</a></p>`
      : "") +
    `</td></tr></table></body></html>`
  );
}

export function newsletterDocx(
  article: Article,
  draft: NewsletterDraft,
): Uint8Array {
  const body = [
    docxParagraph(draft.selectedSubject, "Heading1", "Subject: "),
    docxParagraph(draft.preheader, "Normal", "Preview text: "),
    docxParagraph(draft.greeting),
    docxParagraph(draft.intro),
    docxParagraph("Key Takeaways", "Heading2"),
    ...draft.takeaways.map((t) =>
      docxParagraph(`• ${t.replace(/^\s*•\s*/, "")}`),
    ),
    ...draft.sections.flatMap((s) => [
      docxParagraph(s.heading, "Heading2"),
      docxParagraph(s.summary),
    ]),
    docxParagraph(`${draft.ctaLabel}: ${draft.ctaUrl}`, "Normal", "CTA: "),
  ].join("");
  return buildMinimalDocx(`${article.title} — Newsletter Draft`, "", body);
}

// ============================================================================
// 6. BLOG TO LINKEDIN CAROUSEL (Multi-page PDF + PNG ZIP)
// ============================================================================
export type CarouselSlide = {
  number: number;
  kind: "cover" | "point" | "cta";
  headline: string;
  body: string;
  footer: string;
};

export function buildLinkedinCarousel(
  article: Article,
  maxSlides = 8,
): CarouselSlide[] {
  const err = validate(article);
  if (err) throw Error(err);

  const footer = article.byline || article.source || "Swipe for more →";
  const slides: CarouselSlide[] = [];

  const firstPara = stripRefs(
    article.blocks.find((b) => b.kind === "paragraph")?.text || "",
  );
  slides.push({
    number: 1,
    kind: "cover",
    headline: article.title.slice(0, 110),
    body: splitSentences(firstPara)[0]?.slice(0, 160) || "A visual breakdown of the key points.",
    footer,
  });

  const headings = article.blocks.filter((b) => b.kind === "heading");
  const contentBlocks = article.blocks.filter((b) =>
    ["paragraph", "list", "quote"].includes(b.kind),
  );

  const count = Math.min(Math.max(4, maxSlides - 2), 8);
  for (let i = 0; i < count && i < contentBlocks.length; i++) {
    const h = stripRefs(headings[i]?.text || `Key Insight ${i + 1}`);
    const bodySent =
      splitSentences(contentBlocks[i].text).slice(0, 2).join(" ") ||
      stripRefs(contentBlocks[i].text);
    slides.push({
      number: slides.length + 1,
      kind: "point",
      headline: h.slice(0, 90),
      body: bodySent.slice(0, 220),
      footer,
    });
  }

  slides.push({
    number: slides.length + 1,
    kind: "cta",
    headline: "Read the complete article",
    body: article.title.slice(0, 140),
    footer: article.source || "Save and share this carousel",
  });

  return slides;
}

const pdfEscape = (s: string) =>
  s
    .replace(/[^\x20-\x7E]/g, (ch) =>
      ch === "—" || ch === "–"
        ? "-"
        : ch === "’" || ch === "‘"
          ? "'"
          : ch === "“" || ch === "”"
            ? '"'
            : ch === "•"
              ? "*"
              : " ",
    )
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");

function wrapPdfLines(text: string, maxChars: number): string[] {
  const words = text.replace(/\s+/g, " ").trim().split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if (!w) continue;
    if ((cur + " " + w).trim().length <= maxChars) {
      cur = (cur + " " + w).trim();
    } else {
      if (cur) lines.push(cur);
      cur = w.slice(0, maxChars);
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

export function carouselPdf(
  slides: CarouselSlide[],
  theme: "coral" | "navy" | "slate" = "coral",
  aspect: "portrait" | "square" = "portrait",
): Uint8Array {
  const width = 540;
  const height = aspect === "portrait" ? 675 : 540;

  const palette =
    theme === "navy"
      ? { bg: "0.06 0.09 0.16", accent: "0.32 0.44 1.0", text: "1 1 1", sub: "0.82 0.87 0.96" }
      : theme === "slate"
        ? { bg: "0.97 0.98 0.99", accent: "0.12 0.16 0.23", text: "0.06 0.09 0.16", sub: "0.28 0.33 0.41" }
        : { bg: "0.16 0.11 0.15", accent: "0.98 0.45 0.09", text: "1 1 1", sub: "0.98 0.88 0.80" };

  const objects: string[] = [];
  const addObj = (body: string) => {
    objects.push(body);
    return objects.length;
  };

  const fontBoldId = addObj(
    `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>`,
  );
  const fontRegId = addObj(
    `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>`,
  );

  const pageIds: number[] = [];
  const pagesRootPlaceholder = addObj("");

  slides.forEach((slide, idx) => {
    const headLines = wrapPdfLines(slide.headline, 30).slice(0, 4);
    const bodyLines = wrapPdfLines(slide.body, 44).slice(0, 7);

    const cmds: string[] = [
      `${palette.bg} rg 0 0 ${width} ${height} re f`,
      `${palette.accent} rg 42 ${height - 54} 72 6 re f`,
      `BT /F1 12 Tf ${palette.accent} rg 42 ${height - 80} Td (${pdfEscape(`SLIDE ${idx + 1} OF ${slides.length}`)}) Tj ET`,
    ];

    let y = height - 130;
    for (const hl of headLines) {
      cmds.push(
        `BT /F1 24 Tf ${palette.text} rg 42 ${y} Td (${pdfEscape(hl)}) Tj ET`,
      );
      y -= 32;
    }

    y -= 18;
    for (const bl of bodyLines) {
      cmds.push(
        `BT /F2 15 Tf ${palette.sub} rg 42 ${y} Td (${pdfEscape(bl)}) Tj ET`,
      );
      y -= 24;
    }

    cmds.push(
      `BT /F2 11 Tf ${palette.sub} rg 42 42 Td (${pdfEscape(slide.footer.slice(0, 65))}) Tj ET`,
    );

    const stream = cmds.join("\n");
    const contentId = addObj(
      `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    );
    const pageId = addObj(
      `<< /Type /Page /Parent ${pagesRootPlaceholder} 0 R /MediaBox [0 0 ${width} ${height}] /Resources << /Font << /F1 ${fontBoldId} 0 R /F2 ${fontRegId} 0 R >> >> /Contents ${contentId} 0 R >>`,
    );
    pageIds.push(pageId);
  });

  objects[pagesRootPlaceholder - 1] =
    `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >>`;
  const catalogId = addObj(
    `<< /Type /Catalog /Pages ${pagesRootPlaceholder} 0 R >>`,
  );

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [];
  objects.forEach((obj, i) => {
    offsets.push(pdf.length);
    pdf += `${i + 1} 0 obj\n${obj}\nendobj\n`;
  });
  const xrefPos = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const off of offsets) {
    pdf += `${String(off).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefPos}\n%%EOF\n`;
  return new TextEncoder().encode(pdf);
}

// ============================================================================
// 7. ARTICLE TO PODCAST SCRIPT
// ============================================================================
export type PodcastSegment = {
  id: string;
  speaker: string;
  topic: string;
  dialogue: string;
  cue: string;
  seconds: number;
};

export type PodcastScriptDraft = {
  format: "solo" | "cohost";
  wpm: 130 | 150 | 170;
  segments: PodcastSegment[];
  totalWords: number;
  totalSeconds: number;
};

export function buildPodcastScript(
  article: Article,
  format: "solo" | "cohost" = "cohost",
  wpm: 130 | 150 | 170 = 150,
): PodcastScriptDraft {
  const err = validate(article);
  if (err) throw Error(err);

  const readable = article.blocks.filter(
    (b) =>
      ["heading", "paragraph", "list", "quote"].includes(b.kind) &&
      stripRefs(b.text),
  );

  const segments: PodcastSegment[] = [];
  const pushSeg = (
    speaker: string,
    topic: string,
    dialogue: string,
    cue: string,
  ) => {
    const clean = dialogue.trim();
    if (!clean) return;
    const words = countWords(clean);
    const seconds = Math.max(4, Math.ceil((words / wpm) * 60));
    segments.push({
      id: `pod-${segments.length + 1}`,
      speaker,
      topic,
      dialogue: clean,
      cue,
      seconds,
    });
  };

  pushSeg(
    format === "cohost" ? "Host A" : "Host",
    "Cold Open & Episode Intro",
    `Welcome back. Today we are unpacking "${article.title}"${article.byline ? `, based on the article by ${article.byline}` : ""}.`,
    "[Intro music fades under]",
  );

  if (format === "cohost") {
    const firstSent =
      splitSentences(readable[0]?.text || "")[0] || article.title;
    pushSeg(
      "Host B",
      "Setting the Context",
      `Here is the core premise from the piece: ${firstSent}`,
      "[Conversational transition]",
    );
  }

  let currentTopic = "Main Discussion";
  let turn = 0;
  for (const b of readable.slice(0, 12)) {
    if (b.kind === "heading") {
      currentTopic = stripRefs(b.text);
      continue;
    }
    const text = splitSentences(b.text).slice(0, 3).join(" ");
    if (!text) continue;
    const speaker =
      format === "solo" ? "Host" : turn % 2 === 0 ? "Host A" : "Host B";
    pushSeg(
      speaker,
      currentTopic,
      text,
      b.kind === "quote" ? "[Read source quote]" : "[Segment beat]",
    );
    turn++;
  }

  pushSeg(
    format === "cohost" ? "Host A" : "Host",
    "Episode Wrap-Up & Source Attribution",
    `That wraps up our review of "${article.title}". ${article.source ? `Check the show notes for the original article link at ${article.source}.` : "Check the show notes for the original source."}`,
    "[Outro theme music]",
  );

  const totalWords = segments.reduce((n, s) => n + countWords(s.dialogue), 0);
  const totalSeconds = segments.reduce((n, s) => n + s.seconds, 0);

  return { format, wpm, segments, totalWords, totalSeconds };
}

export function podcastScriptTxt(
  article: Article,
  draft: PodcastScriptDraft,
): string {
  const lines = [
    `PODCAST SCRIPT: ${article.title}`,
    `Format: ${draft.format === "cohost" ? "Two-Host Conversation (Host A & Host B)" : "Solo Host Episode"}`,
    `Speaking Pace: ${draft.wpm} WPM · Estimated Runtime: ${Math.floor(draft.totalSeconds / 60)}m ${draft.totalSeconds % 60}s (${draft.totalWords} words)`,
    article.source ? `Source Article: ${article.source}` : "",
    "",
    "--- EPISODE SEGMENTS ---",
    "",
  ].filter((l) => l !== "");

  draft.segments.forEach((s, idx) => {
    lines.push(
      `[${idx + 1}] ${s.topic} · ${s.speaker} (~${s.seconds}s) ${s.cue}`,
      `${s.speaker.toUpperCase()}: ${s.dialogue}`,
      "",
    );
  });
  return lines.join("\n");
}

export function podcastScriptDocx(
  article: Article,
  draft: PodcastScriptDraft,
): Uint8Array {
  const body = draft.segments
    .map(
      (s, i) =>
        docxParagraph(`${i + 1}. ${s.topic} (${s.seconds}s) ${s.cue}`, "Heading2") +
        docxParagraph(s.dialogue, "Normal", `${s.speaker}: `),
    )
    .join("");
  return buildMinimalDocx(
    `${article.title} — Podcast Script`,
    `${draft.format === "cohost" ? "Two-Host Script" : "Solo Host Script"} · ${draft.wpm} WPM · ~${Math.ceil(draft.totalSeconds / 60)} min`,
    body,
  );
}
