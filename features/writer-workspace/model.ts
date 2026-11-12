import { createNewBlogProjectState } from "@/lib/blog-writer/project-storage-db";
import type { BlogSectionNode } from "@/lib/blog-writer/canonical-state";
import { analyzeReadability } from "@/features/readability/analyzer";
import {
  measureTitlePixelWidth,
  measureMetaDescriptionPixelWidth,
  normalizeSeoSlug,
} from "@/lib/blog-writer/deterministic-analyzers";
import {
  createPrismSample,
  visualFromWriterSection,
} from "@/lib/blog-infographic-studio/visual-brief";
import { brandColors } from "@/lib/blog-infographic-studio/appearance";
import type { Article, Block } from "@/features/article-conversion/model";
import type {
  OutlineItem,
  Plan,
  Project,
  RichNode,
  WriterWorkspaceState,
} from "./types";

export const id = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `writer-${Date.now()}-${Math.random().toString(36).slice(2)}`;
export const hash = (text: string) => {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++)
    h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return (h >>> 0).toString(36);
};
export const wordCount = (s: string) =>
  (s.match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu) || []).length;
export const safeUrl = (raw: unknown) => {
  try {
    const u = new URL(String(raw));
    return /^https?:$/.test(u.protocol) && !u.username && !u.password
      ? u.href
      : "";
  } catch {
    return "";
  }
};
export const escapeHtml = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
export function workspace(p: Project): WriterWorkspaceState {
  const raw = p.writerWorkspace;
  return {
    version: 1,
    references: Array.isArray(raw?.references) ? raw.references : [],
    targetWords: raw?.targetWords || 1600,
    language: raw?.language || "English",
    metaDescriptions: raw?.metaDescriptions || [],
    run: raw?.run || { status: "idle", inputHash: "", completed: [] },
    brand: {
      name: raw?.brand?.name || "",
      color: /^#[a-f\d]{6}$/i.test(raw?.brand?.color || "")
        ? raw!.brand.color
        : "#5271FF",
      logo:
        /^data:image\/(png|jpeg|webp);base64,[a-zA-Z0-9+/=]+$/.test(
          raw?.brand?.logo || "",
        ) && (raw?.brand?.logo?.length || 0) < 2_000_000
          ? raw?.brand?.logo
          : undefined,
    },
    social: raw?.social || {},
    visualRevisions: raw?.visualRevisions || {},
    email: raw?.email,
    document: raw?.document,
  };
}
export function blankProject(): Project {
  const p = createNewBlogProjectState({ template: "blank" });
  return {
    ...p,
    projectTitle: "Untitled article",
    authorName: "",
    authorRoleAndCredentials: "",
    brandSiteUrl: "",
    keywordCluster: {
      ...p.keywordCluster,
      primaryKeyword: "",
      targetAudience: "",
      toneOfVoice: "Authoritative & Human",
    },
    writerWorkspace: workspace(p),
  };
}
export function patchWorkspace(
  p: Project,
  patch: Partial<WriterWorkspaceState>,
): Project {
  return { ...p, writerWorkspace: { ...workspace(p), ...patch } };
}
export function parseBrief(text: string): {
  keyword: string;
  outline: OutlineItem[];
  topic: string;
} {
  const lines = text.split(/\r?\n/),
    outline: OutlineItem[] = [];
  for (const line of lines) {
    const h2 = line.match(/^\s*(?:##\s+|H2\s*[:\-]\s*)(.+)/i),
      h3 = line.match(/^\s*(?:###\s+|H3\s*[:\-]\s*)(.+)/i);
    if (h2) outline.push({ heading: h2[1].trim(), subheadings: [] });
    else if (h3 && outline.length)
      outline[outline.length - 1].subheadings.push(h3[1].trim());
  }
  const keyword =
    text
      .match(
        /(?:^|\n)\s*(?:primary |main |focus )?keyword\s*:\s*([^\n,]+)/i,
      )?.[1]
      ?.trim() || "";
  const topic = (
    text.match(/(?:^|\n)\s*(?:topic|title)\s*:\s*([^\n]+)/i)?.[1] ||
    lines.find((l) => l.trim() && !/^\s*#/.test(l)) ||
    ""
  )
    .trim()
    .replace(/^write (?:an? )?(?:article|blog post) (?:about|on) /i, "")
    .slice(0, 140);
  return { keyword, outline: outline.slice(0, 10), topic };
}
export function inputRevision(p: Project) {
  const w = workspace(p);
  return hash(
    JSON.stringify([
      p.rawUserBriefOrSourceText,
      p.customUserInstructions,
      p.keywordCluster,
      w.references,
      w.targetWords,
      w.language,
      p.sections.map((s) => [
        s.id,
        s.h2Text,
        s.subHeadings.map((h) => h.h3Text),
      ]),
    ]),
  );
}
export const bodyOf = (s: BlogSectionNode) =>
  [
    s.bodyMarkdown,
    ...s.subHeadings.map((h) => `### ${h.h3Text}\n${h.bodyMarkdown}`),
  ]
    .filter(Boolean)
    .join("\n\n");
export function makeSection(item: OutlineItem, index: number): BlogSectionNode {
  const sid = item.id || id();
  return {
    id: sid,
    orderIndex: index + 1,
    h2Text: item.heading,
    anchorId: normalizeSeoSlug(item.heading) || `section-${index + 1}`,
    targetWordCount: item.words || 300,
    actualWordCount: 0,
    searchIntentRole: /step|process|how to|workflow/i.test(item.heading)
      ? "step-by-step"
      : "definition-aeo",
    bodyMarkdown: "",
    subHeadings: item.subheadings.map((h) => ({
      id: id(),
      h3Text: h,
      keyPoints: [],
      bodyMarkdown: "",
    })),
    includeComparisonTable: false,
    includeKeyTakeawayCallout: false,
    keyTakeawayText: "",
    infographicConfig: {
      ...createPrismSample(),
      prismLayout: undefined,
      id: `visual-${sid}`,
      sectionId: sid,
      headline: item.heading,
      subheadline: "",
      nodes: [],
      footerSourceLabel: "Source: article draft",
      altText: item.heading,
    },
  };
}
export function applyPlan(
  p: Project,
  plan: Plan,
  outline: OutlineItem[],
): Project {
  const supplied = outline.length ? outline : plan.sections;
  const next = {
    ...p,
    projectTitle: plan.title,
    metaPack: {
      ...p.metaPack,
      h1Title: plan.title,
      metaTitle: plan.metaTitle,
      metaDescription: plan.metaDescription,
      urlSlug: normalizeSeoSlug(plan.slug),
      aeoDirectAnswer50Words: plan.introduction,
      titleVariations: [...new Set([plan.metaTitle, ...plan.titles])].map(
        (title) => ({
          title,
          pixelWidth: measureTitlePixelWidth(title),
          ctrScore: 0,
          angle: "Suggested alternative",
        }),
      ),
    },
    sections: supplied.map(makeSection),
    faqs: [],
    quizQuestions: [],
    internalLinks: [],
    eeatCitations: [],
  };
  next.writerWorkspace = {
    ...workspace(p),
    document: undefined,
    metaDescriptions: [
      ...new Set([plan.metaDescription, ...plan.descriptions]),
    ],
    run: { status: "idle", inputHash: "", completed: [] },
  };
  return next;
}
export function setSectionBody(
  section: BlogSectionNode,
  markdown: string,
): BlogSectionNode {
  const blocks = markdown.split(/^###\s+(.+)$/m),
    subHeadings =
      blocks.length > 1
        ? blocks
            .slice(1)
            .reduce((out: string[][], x, i) => {
              if (i % 2 === 0) out.push([x, ""]);
              else out[out.length - 1][1] = x;
              return out;
            }, [])
            .map(([h, b], i) => ({
              id: section.subHeadings[i]?.id || id(),
              h3Text: h.trim(),
              keyPoints: [],
              bodyMarkdown: b.trim(),
            }))
        : section.subHeadings.map((h) => ({ ...h, bodyMarkdown: "" }));
  return {
    ...section,
    bodyMarkdown: blocks[0].replace(/^##\s+[^\n]+\n/, "").trim(),
    subHeadings,
    actualWordCount: wordCount(markdown),
  };
}
export function refreshVisual(
  section: BlogSectionNode,
  p: Project,
): BlogSectionNode {
  const w = workspace(p),
    c = visualFromWriterSection(section);
  c.brand = {
    ...section.infographicConfig?.brand,
    logoDataUrl: w.brand.logo || section.infographicConfig?.brand?.logoDataUrl,
    customColors: brandColors(w.brand.color),
  };
  c.signature = {
    ...c.signature,
    name: w.brand.name,
    visible: Boolean(w.brand.name || w.brand.logo),
  };
  c.footerSourceLabel = p.metaPack.canonicalUrl
    ? `Source: ${new URL(safeUrl(p.metaPack.canonicalUrl) || "https://example.com").hostname}`
    : "Source: article draft";
  return { ...section, infographicConfig: c };
}
export function inline(text: string): RichNode[] {
  const out: RichNode[] = [];
  const re = /(\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\))/g;
  let start = 0,
    m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > start)
      out.push({ type: "text", text: text.slice(start, m.index) });
    const value = m[2] || m[3] || m[4] || m[5];
    const mark = m[2]
      ? { type: "bold" }
      : m[3]
        ? { type: "italic" }
        : m[4]
          ? { type: "code" }
          : safeUrl(m[6])
            ? { type: "link", attrs: { href: safeUrl(m[6]) } }
            : null;
    out.push({ type: "text", text: value, ...(mark ? { marks: [mark] } : {}) });
    start = re.lastIndex;
  }
  if (start < text.length) out.push({ type: "text", text: text.slice(start) });
  return out;
}
export function markdownNodes(md: string): RichNode[] {
  const lines = md.split(/\r?\n/),
    out: RichNode[] = [];
  for (let i = 0; i < lines.length;) {
    const line = lines[i];
    if (!line.trim()) {
      i++;
      continue;
    }
    if (line.startsWith("```")) {
      const body: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```"))
        body.push(lines[i++]);
      i++;
      out.push({
        type: "codeBlock",
        content: body.join("\n")
          ? [{ type: "text", text: body.join("\n") }]
          : [],
      });
      continue;
    }
    if (
      line.trim().startsWith("|") &&
      lines[i + 1]?.match(/^\s*\|?[\s:|-]+\|/)
    ) {
      const rows: RichNode[] = [];
      let ri = 0;
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        const row = lines[i++];
        if (/^\s*\|[\s:|-]+\|\s*$/.test(row)) continue;
        rows.push({
          type: "tableRow",
          content: row
            .trim()
            .replace(/^\||\|$/g, "")
            .split("|")
            .map((c) => ({
              type: ri === 0 ? "tableHeader" : "tableCell",
              content: [{ type: "paragraph", content: inline(c.trim()) }],
            })),
        });
        ri++;
      }
      out.push({ type: "table", content: rows });
      continue;
    }
    const h = line.match(/^(#{1,3})\s+(.+)/);
    if (h) {
      out.push({
        type: "heading",
        attrs: { level: h[1].length },
        content: inline(h[2]),
      });
      i++;
      continue;
    }
    if (/^\s*(?:[-*+]\s+|\d+[.)]\s+)/.test(line)) {
      const ordered = /^\s*\d/.test(line),
        items: RichNode[] = [];
      while (i < lines.length && /^\s*(?:[-*+]\s+|\d+[.)]\s+)/.test(lines[i]))
        items.push({
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: inline(
                lines[i++].replace(/^\s*(?:[-*+]\s+|\d+[.)]\s+)/, ""),
              ),
            },
          ],
        });
      out.push({
        type: ordered ? "orderedList" : "bulletList",
        content: items,
      });
      continue;
    }
    if (/^>\s?/.test(line)) {
      out.push({
        type: "blockquote",
        content: [
          { type: "paragraph", content: inline(line.replace(/^>\s?/, "")) },
        ],
      });
      i++;
      continue;
    }
    const para = [line];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^(?:#{1,3}\s|[-*+]\s|\d+[.)]\s|```|\|)/.test(lines[i])
    )
      para.push(lines[i++]);
    out.push({ type: "paragraph", content: inline(para.join(" ")) });
  }
  return out;
}
export function projectDocument(p: Project): RichNode {
  if (workspace(p).document) return workspace(p).document!;
  const content: RichNode[] = [];
  if (p.metaPack.h1Title)
    content.push({
      type: "heading",
      attrs: { level: 1 },
      content: inline(p.metaPack.h1Title),
    });
  content.push(...markdownNodes(p.metaPack.aeoDirectAnswer50Words || ""));
  for (const s of p.sections) {
    content.push(
      {
        type: "heading",
        attrs: { level: 2, sectionId: s.id },
        content: inline(s.h2Text),
      },
      ...markdownNodes(bodyOf(s)),
    );
    if (s.infographicConfig.nodes.length)
      content.push({ type: "sectionVisual", attrs: { sectionId: s.id } });
  }
  return {
    type: "doc",
    content: content.length ? content : [{ type: "paragraph" }],
  };
}
export function textOf(node: RichNode): string {
  if (node.type === "hardBreak") return "\n";
  return (
    node.text ||
    node.content?.map(textOf).join(node.type === "doc" ? "\n\n" : "") ||
    ""
  );
}
export function nodeMarkdown(node: RichNode): string {
  const inside = (node.content || [])
    .map(nodeMarkdown)
    .join(/^(doc|blockquote|listItem)$/.test(node.type) ? "\n\n" : "");
  if (node.type === "text")
    return (node.marks || []).reduce(
      (s, m) =>
        m.type === "bold"
          ? `**${s}**`
          : m.type === "italic"
            ? `*${s}*`
            : m.type === "code"
              ? `\`${s}\``
              : m.type === "link" && safeUrl(m.attrs?.href)
                ? `[${s}](${safeUrl(m.attrs?.href)})`
                : s,
      node.text || "",
    );
  if (node.type === "heading")
    return `${"#".repeat(node.attrs?.level || 2)} ${inside}`;
  if (node.type === "hardBreak") return "\n";
  if (node.type === "sectionVisual") return "";
  if (node.type === "bulletList" || node.type === "orderedList")
    return (node.content || [])
      .map(
        (n, i) =>
          `${node.type === "orderedList" ? `${i + 1}.` : "-"} ${nodeMarkdown(n)}`,
      )
      .join("\n");
  if (node.type === "codeBlock") return `\`\`\`\n${inside}\n\`\`\``;
  if (node.type === "blockquote")
    return inside
      .split("\n")
      .map((l) => `> ${l}`)
      .join("\n");
  if (node.type === "table")
    return (node.content || [])
      .map(
        (r, i) =>
          `| ${(r.content || []).map((c) => nodeMarkdown(c)).join(" | ")} |${i === 0 ? `\n| ${(r.content || []).map(() => "---").join(" | ")} |` : ""}`,
      )
      .join("\n");
  return inside;
}
export function syncDocument(p: Project, document: RichNode): Project {
  const normalized = structuredClone(document);
  const content = normalized.content || [],
    groups: { sid?: string; title: string; nodes: RichNode[] }[] = [],
    intro: RichNode[] = [];
  let title = p.metaPack.h1Title;
  for (const n of content) {
    if (n.type === "heading" && n.attrs?.level === 1) {
      title = textOf(n);
      continue;
    }
    if (n.type === "heading" && n.attrs?.level === 2) {
      groups.push({ sid: n.attrs?.sectionId, title: textOf(n), nodes: [] });
      continue;
    }
    if (n.type === "sectionVisual") continue;
    (groups.length ? groups[groups.length - 1].nodes : intro).push(n);
  }
  const used = new Set<string>();
  const sections = groups.map((g, i) => {
    const old =
      p.sections.find((s) => s.id === g.sid && !used.has(s.id)) ||
      p.sections.find((s) => s.h2Text === g.title && !used.has(s.id));
    const base = old || makeSection({ heading: g.title, subheadings: [] }, i);
    used.add(base.id);
    const heading = content.filter(
      (n) => n.type === "heading" && n.attrs?.level === 2,
    )[i];
    if (heading) heading.attrs = { ...heading.attrs, sectionId: base.id };
    return {
      ...setSectionBody(base, g.nodes.map(nodeMarkdown).join("\n\n")),
      h2Text: g.title,
      orderIndex: i + 1,
    };
  });
  return {
    ...p,
    projectTitle:
      p.projectTitle === "Untitled article" && title ? title : p.projectTitle,
    metaPack: {
      ...p.metaPack,
      h1Title: title,
      aeoDirectAnswer50Words: intro.map(nodeMarkdown).join("\n\n"),
    },
    sections,
    writerWorkspace: { ...workspace(p), document: normalized },
  };
}
export function articleMarkdown(p: Project): string {
  return (projectDocument(p).content || [])
    .map(nodeMarkdown)
    .filter(Boolean)
    .join("\n\n");
}
export const articleRevision = (p: Project) =>
  hash(
    JSON.stringify([
      articleMarkdown(p),
      p.metaPack.metaTitle,
      p.metaPack.metaDescription,
      p.metaPack.urlSlug,
      p.authorName,
      p.brandSiteUrl,
      workspace(p).brand,
    ]),
  );
export function articleModel(p: Project): Article {
  const blocks: Block[] = [];
  let i = 0;
  const walk = (n: RichNode) => {
    if (n.type === "sectionVisual") {
      const section = p.sections.find((s) => s.id === n.attrs?.sectionId);
      if (section?.infographicConfig.nodes.length)
        blocks.push({
          id: `visual-${section.id}`,
          kind: "image",
          included: true,
          text: "",
          src: `writer-visual:${section.id}`,
          alt: section.infographicConfig.altText || section.h2Text,
        });
      return;
    }
    if (n.type === "heading" && n.attrs?.level === 1) return;
    if (n.type === "table") {
      blocks.push({
        id: `b${i++}`,
        kind: "table",
        text: "",
        header: true,
        cells: n.content?.map((r) => (r.content || []).map(textOf)),
      });
      return;
    }
    if (
      [
        "heading",
        "paragraph",
        "codeBlock",
        "blockquote",
        "bulletList",
        "orderedList",
      ].includes(n.type)
    ) {
      blocks.push({
        id: `b${i++}`,
        kind:
          n.type === "heading"
            ? "heading"
            : n.type === "codeBlock"
              ? "code"
              : n.type === "blockquote"
                ? "quote"
                : n.type.endsWith("List")
                  ? "list"
                  : "paragraph",
        text: n.type.endsWith("List")
          ? (n.content || []).map(textOf).join("\n")
          : textOf(n),
        level: n.attrs?.level,
      });
      return;
    }
    n.content?.forEach(walk);
  };
  walk(projectDocument(p));
  return {
    title: p.metaPack.h1Title || p.projectTitle,
    byline: p.authorName,
    published: "",
    source: safeUrl(p.metaPack.canonicalUrl),
    blocks,
    links: workspace(p).references.map((r) => ({
      label: r.title || r.url,
      url: r.url,
    })),
    warnings: [],
    method: "Editable writer document",
    brand: {
      siteName: workspace(p).brand.name,
      themeColor: workspace(p).brand.color,
    },
  };
}
export function readiness(p: Project) {
  const article = articleModel(p),
    text = article.blocks
      .map((b) => b.text || b.cells?.flat().join(" ") || "")
      .join("\n\n"),
    r = analyzeReadability(text),
    words = wordCount(text),
    title = p.metaPack.metaTitle,
    desc = p.metaPack.metaDescription,
    keyword = p.keywordCluster.primaryKeyword.toLowerCase();
  const checks = [
    {
      id: "readability",
      label: "Readable sentences",
      weight: 25,
      ok:
        words > 0 &&
        r.longSentences.length <= Math.max(1, r.sentences.length * 0.2),
      detail: `${r.longSentences.length} sentences over 25 words`,
    },
    {
      id: "paragraphs",
      label: "Scannable paragraphs",
      weight: 10,
      ok: words > 0 && r.longParagraphs.length === 0,
      detail: `${r.longParagraphs.length} paragraphs over 100 words`,
    },
    {
      id: "structure",
      label: "Article structure",
      weight: 20,
      ok:
        Boolean(p.metaPack.h1Title) &&
        p.sections.length >= 2 &&
        p.sections.every((s) => wordCount(bodyOf(s)) >= 40),
      detail: `${p.sections.length} sections; each needs a useful explanation`,
    },
    {
      id: "title",
      label: "Meta title",
      weight: 10,
      ok: title.length > 0 && measureTitlePixelWidth(title) <= 600,
      detail: `${Math.round(measureTitlePixelWidth(title))} estimated pixels`,
    },
    {
      id: "description",
      label: "Meta description",
      weight: 10,
      ok: desc.length >= 80 && desc.length <= 170,
      detail: `${desc.length} characters`,
    },
    {
      id: "keyword",
      label: "Topic alignment",
      weight: 10,
      ok:
        Boolean(keyword) &&
        `${p.metaPack.h1Title} ${text}`.toLowerCase().includes(keyword),
      detail: keyword
        ? `Focus: ${p.keywordCluster.primaryKeyword}`
        : "Add an optional focus keyword to assess this check",
    },
    {
      id: "sources",
      label: "Reference material",
      weight: 10,
      ok: workspace(p).references.some((s) => s.text.length > 80),
      detail: "Source presence only; claims still need human verification",
    },
    {
      id: "visuals",
      label: "Section visuals",
      weight: 5,
      ok: p.sections.some((s) => s.infographicConfig.nodes.length >= 2),
      detail: `${p.sections.filter((s) => s.infographicConfig.nodes.length >= 2).length} image drafts`,
    },
  ];
  return {
    score: words ? checks.reduce((n, c) => n + (c.ok ? c.weight : 0), 0) : 0,
    checks,
    words,
    minutes: Math.max(1, Math.ceil(words / 220)),
    readability: r,
    text,
  };
}
