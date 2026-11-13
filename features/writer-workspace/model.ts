import { createNewBlogProjectState } from "@/lib/blog-writer/project-storage-db";
import type { BlogSectionNode } from "@/lib/blog-writer/canonical-state";
import { reviewAlt } from "@/features/alt-text/review";
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
  BriefDirectives,
  FeaturedBannerState,
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
    const cleaned = String(raw || "")
      .trim()
      .replace(/[.,;:'")\]}>]+$/, "");
    const u = new URL(cleaned);
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

const NAMED_BRAND_COLORS: Record<string, string> = {
  indigo: "#5271FF",
  emerald: "#10B981",
  amber: "#F59E0B",
  rose: "#F43F5E",
  slate: "#475569",
};

function resolveBrandColor(rawColor?: string): string {
  if (!rawColor) return "#5271FF";
  const trimmed = rawColor.trim();
  if (/^#[a-f\d]{6}$/i.test(trimmed)) return trimmed;
  return NAMED_BRAND_COLORS[trimmed.toLowerCase()] || "#5271FF";
}

export function workspace(p: Project): WriterWorkspaceState {
  const raw = p.writerWorkspace;
  return {
    version: 1,
    studioUnlocked: raw?.studioUnlocked,
    references: Array.isArray(raw?.references) ? raw.references : [],
    targetWords: raw?.targetWords || 1600,
    language: raw?.language || "English",
    metaDescriptions: raw?.metaDescriptions || [],
    serpTitles: raw?.serpTitles,
    quickAnswerBox: raw?.quickAnswerBox,
    run: raw?.run || { status: "idle", inputHash: "", completed: [] },
    brand: {
      name: raw?.brand?.name || "",
      color: resolveBrandColor(raw?.brand?.color),
      logo:
        /^data:image\/(png|jpeg|webp);base64,[a-zA-Z0-9+/=]+$/.test(
          raw?.brand?.logo || "",
        ) && (raw?.brand?.logo?.length || 0) < 2_000_000
          ? raw?.brand?.logo
          : undefined,
    },
    social: raw?.social || {},
    socialCarousels: raw?.socialCarousels,
    videoScripts: raw?.videoScripts,
    featuredBanner: raw?.featuredBanner,
    sectionAltTexts: raw?.sectionAltTexts,
    research: raw?.research,
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
  const explicitKeyword =
    text
      .match(
        /(?:^|\n)\s*(?:primary |main |focus )?keyword\s*:\s*([^\n,]+)/i,
      )?.[1]
      ?.trim() || "";
  const explicitTopic = text
    .match(/(?:^|\n)\s*(?:topic|title)\s*:\s*([^\n]+)/i)?.[1]
    ?.trim();
  const quotedTopic = text
    .match(
      /(?:on\s+the\s+topic(?:\s+of)?|about|titled|called|covering|topic)\s+["'“”‘’]([^"'“”‘’\n]{3,140})["'“”‘’]/i,
    )?.[1]
    ?.trim();

  const firstLine = lines.find((l) => l.trim() && !/^\s*#/.test(l)) || "";
  const cleanedLine = firstLine
    .replace(/\bhttps?:\/\/[^\s)>"']+/gi, " ")
    .replace(
      /^(?:i\s+want\s+to\s+write|please\s+write|can\s+you\s+write|write|create|draft|generate)\s+(?:an?\s+)?(?:comprehensive\s+|detailed\s+|complete\s+|practical\s+|seo\s+)?(?:article|blog\s*post|guide|post|piece)?\s*(?:for\s+(?:my\s+)?(?:website|site|blog|company|brand)\s*)?(?:on\s+the\s+topic(?:\s+of)?|about|on|for|titled|covering)?\s*/i,
      "",
    )
    .replace(/^write (?:an? )?(?:article|blog post) (?:about|on) /i, "")
    .replace(/^["'“”‘’:\-\s]+|["'“”‘’\s]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();

  const topic = (explicitTopic || quotedTopic || cleanedLine || firstLine.trim())
    .replace(/^write (?:an? )?(?:article|blog post) (?:about|on) /i, "")
    .slice(0, 140);

  return { keyword: explicitKeyword, outline: outline.slice(0, 10), topic };
}

export function parseBriefDirectives(text: string): BriefDirectives {
  const labeledUrl = text.match(
    /(?:^|\n)\s*(?:website|site|domain|target\s*site|brand\s*url|url)\s*:\s*([^\s,\n]+)/i,
  )?.[1];
  const inlineUrl = text.match(/\bhttps?:\/\/[^\s)>"']+/i)?.[0];
  const bareDomain = text.match(
    /(?:for|on|website|site)\s+([a-z0-9-]+(?:\.[a-z0-9-]+)+\.[a-z]{2,})/i,
  )?.[1];
  const rawCandidate = (
    labeledUrl ||
    inlineUrl ||
    (bareDomain ? `https://${bareDomain}` : "")
  )
    .trim()
    .replace(/[.,;:'")\]}>]+$/, "");
  const normalizedUrl = (
    safeUrl(rawCandidate) ||
    safeUrl(
      rawCandidate && !/^https?:\/\//i.test(rawCandidate)
        ? `https://${rawCandidate}`
        : "",
    ) ||
    ""
  ).replace(/\/+$/, "");

  const conclusionMatch = text.match(
    /(?:^|\n|\.)\s*([^.\n]*(?:conclusion|key takeaways|summary|final verdict|wrap[- ]?up)[^.\n]*)/i,
  )?.[1];

  const visualHints: string[] = [];
  for (const line of text.split(/\r?\n/)) {
    if (
      /(?:infographic|diagram|visual|chart|comparison table|table here|flowchart|timeline)/i.test(
        line,
      )
    ) {
      const cleaned = line.trim();
      if (cleaned && visualHints.length < 6) visualHints.push(cleaned);
    }
  }

  const toneOverride = text
    .match(/(?:^|\n)\s*tone\s*:\s*([^\n]+)/i)?.[1]
    ?.trim();

  return {
    websiteUrl: normalizedUrl,
    conclusionStyle: conclusionMatch?.trim() || "",
    visualHints,
    faqRequested: /\b(?:faq|frequently asked|q\s*&\s*a|questions)\b/i.test(text),
    ...(toneOverride ? { toneOverride } : {}),
  };
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
  const wPrev = workspace(p);
  const next: Project = {
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
    faqs: p.faqs || [],
    quizQuestions: p.quizQuestions || [],
    internalLinks: p.internalLinks || [],
    eeatCitations: p.eeatCitations || [],
  };
  next.writerWorkspace = {
    ...wPrev,
    document: undefined,
    metaDescriptions: [
      ...new Set([plan.metaDescription, ...plan.descriptions]),
    ],
    run: {
      status: "idle",
      inputHash: "",
      completed: [],
      stages: wPrev.run?.stages,
    },
  };
  return next;
}

/**
 * Ensures any inline `## ` or `### ` markers that an LLM emitted mid-line
 * (e.g. `...sentence. ## New Heading` or `### Subheading Body text...`) are
 * separated onto clean Markdown heading lines so raw `#` hashes never leak
 * into paragraph nodes.
 */
export function sanitizeMarkdownHeadings(md: string): string {
  if (!md) return "";
  return md
    .replace(/([^\n])\s+(#{2,6}\s+)/g, "$1\n\n$2")
    .replace(/^[ \t]+(#{1,6}\s+)/gm, "$1");
}

/**
 * Splits overly long compound sentences (> 24 words) at natural clause breaks
 * so generated prose stays crisp and avoids triggering red/amber readability
 * walls while leaving normal <=24-word sentences completely unchanged.
 */
export function splitRunOnSentences(text: string): string {
  return text
    .split(/\n/)
    .map((line) => {
      const trimmed = line.trim();
      if (
        !trimmed ||
        /^(?:#{1,6}\s|[-*+]\s|\d+[.)]\s|>|\||```)/.test(trimmed)
      ) {
        return line;
      }
      const sentences = line.match(/[^.!?]+[.!?]+(?:\s+|$)|[^.!?]+$/g) || [line];
      return sentences
        .map((sent) => {
          const words = sent.trim().split(/\s+/).filter(Boolean);
          if (words.length <= 24) return sent.trim();
          const clauseRegex =
            /,\s+(?:which|while|whereas|because|although|since|so\s+that|allowing|enabling|ensuring|making|where|and|but|so)\s+|;\s+|\s+—\s+/gi;
          let bestMatch: RegExpExecArray | null = null;
          let m: RegExpExecArray | null;
          const midChar = Math.floor(sent.length / 2);
          while ((m = clauseRegex.exec(sent))) {
            const leftWords = sent.slice(0, m.index).trim().split(/\s+/).length;
            const rightWords = sent
              .slice(m.index + m[0].length)
              .trim()
              .split(/\s+/).length;
            if (leftWords >= 7 && rightWords >= 6) {
              if (
                !bestMatch ||
                Math.abs(m.index - midChar) < Math.abs(bestMatch.index - midChar)
              ) {
                bestMatch = m;
              }
            }
          }
          if (!bestMatch) return sent.trim();
          const left = sent.slice(0, bestMatch.index).trim().replace(/[,;—]+$/, "");
          const connectorRaw = bestMatch[0]
            .replace(/^[,;—\s]+/, "")
            .trim();
          const rightBody = sent
            .slice(bestMatch.index + bestMatch[0].length)
            .trim();
          let secondSentence = rightBody;
          if (/^(?:which|allowing|enabling|ensuring|making)$/i.test(connectorRaw)) {
            secondSentence = `This ${
              /ing$/i.test(connectorRaw)
                ? connectorRaw.toLowerCase().replace(/ing$/i, "s")
                : ""
            } ${rightBody}`.replace(/\s+/g, " ").trim();
          } else if (/^(?:while|whereas|because|although|since)$/i.test(connectorRaw)) {
            secondSentence = `${
              connectorRaw.charAt(0).toUpperCase() + connectorRaw.slice(1)
            } ${rightBody}`;
          } else if (secondSentence) {
            secondSentence =
              secondSentence.charAt(0).toUpperCase() + secondSentence.slice(1);
          }
          return `${left}. ${secondSentence}`;
        })
        .join(" ");
    })
    .join("\n");
}

export function setSectionBody(
  section: BlogSectionNode,
  markdown: string,
): BlogSectionNode {
  const cleaned = sanitizeMarkdownHeadings(markdown);
  const blocks = cleaned.split(/^###\s+(.+)$/m),
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
    bodyMarkdown: blocks[0].replace(/^##\s+[^\n]+\n?/, "").trim(),
    subHeadings,
    actualWordCount: wordCount(cleaned),
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
    : p.brandSiteUrl && safeUrl(p.brandSiteUrl)
      ? `Source: ${new URL(safeUrl(p.brandSiteUrl)).hostname}`
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
  const sanitized = sanitizeMarkdownHeadings(md);
  const lines = sanitized.split(/\r?\n/),
    out: RichNode[] = [];
  for (let i = 0; i < lines.length;) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed) {
      i++;
      continue;
    }
    if (trimmed.startsWith("```")) {
      const body: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```"))
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
      trimmed.startsWith("|") &&
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
    const h = trimmed.match(/^(#{1,6})\s+(.+)/);
    if (h) {
      out.push({
        type: "heading",
        attrs: { level: h[1].length },
        content: inline(h[2].trim()),
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
    if (/^>\s?/.test(trimmed)) {
      out.push({
        type: "blockquote",
        content: [
          { type: "paragraph", content: inline(trimmed.replace(/^>\s?/, "")) },
        ],
      });
      i++;
      continue;
    }
    const para = [trimmed];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^\s*(?:#{1,6}\s|[-*+]\s|\d+[.)]\s|```|\||>)/.test(lines[i])
    )
      para.push(lines[i++].trim());
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
  if (node.type === "heading") {
    const level = Math.min(6, Math.max(1, node.attrs?.level || 2));
    return `${"#".repeat(level)} ${inside}`;
  }
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

export function defaultFeaturedBanner(p: Project): FeaturedBannerState {
  const w = workspace(p);
  const existing = w.featuredBanner;
  const headline =
    existing?.headline ||
    p.metaPack.h1Title ||
    p.metaPack.metaTitle ||
    p.projectTitle ||
    "Untitled Article";
  const kw = p.keywordCluster.primaryKeyword?.trim();
  const subheadline =
    existing?.subheadline ||
    (p.metaPack.aeoDirectAnswer50Words
      ? p.metaPack.aeoDirectAnswer50Words.split(/(?<=[.!?])\s+/)[0]?.slice(0, 140) || ""
      : p.metaPack.metaDescription.slice(0, 140));
  const altText =
    existing?.altText ||
    `Editorial featured banner illustrating ${headline}${kw ? `, covering ${kw}` : ""}`.slice(0, 125);
  return {
    headline,
    subheadline,
    badge:
      existing?.badge ||
      (kw
        ? kw.toUpperCase().slice(0, 28)
        : w.brand.name
          ? w.brand.name.toUpperCase()
          : "EDITORIAL GUIDE"),
    theme: existing?.theme || w.brand.color || "#5271FF",
    altText,
    altScore: existing?.altScore,
    altVerdict: existing?.altVerdict,
    aspectRatio: "16:9",
    width: 1200,
    height: 630,
    sourceRevision: existing?.sourceRevision,
  };
}

export function buildArticleSchemaJsonLd(p: Project): {
  articleSchema: Record<string, unknown>;
  faqSchema: Record<string, unknown> | null;
  combinedGraph: Record<string, unknown>;
} {
  const url = safeUrl(p.metaPack.canonicalUrl) || safeUrl(p.brandSiteUrl) || "";
  const title =
    p.metaPack.metaTitle || p.metaPack.h1Title || p.projectTitle || "Article";
  const description =
    p.metaPack.metaDescription || p.metaPack.aeoDirectAnswer50Words || "";
  const w = workspace(p);
  const articleSchema: Record<string, unknown> = {
    "@type": "Article",
    headline: title,
    description,
    ...(url ? { mainEntityOfPage: { "@type": "WebPage", "@id": url } } : {}),
    ...(p.keywordCluster.primaryKeyword
      ? {
          keywords: [
            p.keywordCluster.primaryKeyword,
            ...p.keywordCluster.secondaryKeywords,
          ]
            .filter(Boolean)
            .join(", "),
        }
      : {}),
    ...(p.authorName
      ? { author: { "@type": "Person", name: p.authorName } }
      : {}),
    ...(w.brand.name
      ? { publisher: { "@type": "Organization", name: w.brand.name } }
      : {}),
    inLanguage: w.language || "en",
  };
  const faqPairs = (p.faqs || []).filter(
    (f) => f.question?.trim() && f.answer?.trim(),
  );
  const faqSchema = faqPairs.length
    ? {
        "@type": "FAQPage",
        mainEntity: faqPairs.map((f) => ({
          "@type": "Question",
          name: f.question.trim(),
          acceptedAnswer: { "@type": "Answer", text: f.answer.trim() },
        })),
      }
    : null;
  return {
    articleSchema,
    faqSchema,
    combinedGraph: {
      "@context": "https://schema.org",
      "@graph": faqSchema ? [articleSchema, faqSchema] : [articleSchema],
    },
  };
}

export function evaluateAltText(text: string, nearbyHeading = "") {
  const res = reviewAlt(text, "", nearbyHeading, "informative");
  const score = text.trim()
    ? Math.max(
        25,
        Math.min(100, 100 - res.cues.length * 22 - (res.count < 20 ? 15 : 0)),
      )
    : 0;
  const verdict = !text.trim()
    ? "Needs descriptive alt text"
    : res.cues.length === 0
      ? "WCAG & SEO Ready"
      : res.cues[0];
  return { ...res, score, verdict };
}

export function auditClaimVerification(md: string): {
  totalClaims: number;
  citedClaims: number;
  groundingScore: number;
  unverifiedClaims: Array<{ sentence: string; cue: string }>;
} {
  const clean = (md || "").replace(/^#{1,6}\s+[^\n]+$/gm, " ");
  const sentences = clean.match(/[^.!?\n]+[.!?]+/g) || [];
  const unverifiedClaims: Array<{ sentence: string; cue: string }> = [];
  let totalClaims = 0;
  let citedClaims = 0;

  const statPattern = /\b(?:\d+(?:\.\d+)?%|\d+x\b|studies\s+show|research\s+indicates|according\s+to|survey\s+(?:of|found)|report\s+by|benchmark\s+shows)\b/i;
  const linkPattern = /\[[^\]]+\]\(https?:\/\/[^)]+\)/i;

  for (const raw of sentences) {
    const sent = raw.trim();
    if (sent.length < 24) continue;
    const match = sent.match(statPattern);
    if (!match) continue;
    totalClaims += 1;
    if (linkPattern.test(sent)) {
      citedClaims += 1;
    } else if (unverifiedClaims.length < 5) {
      unverifiedClaims.push({
        sentence: sent.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").slice(0, 150),
        cue: `Contains "${match[0]}" without an inline [source](https://...) citation`,
      });
    }
  }

  const groundingScore =
    totalClaims === 0
      ? 100
      : Math.max(25, Math.round((citedClaims / totalClaims) * 100));

  return {
    totalClaims,
    citedClaims,
    groundingScore,
    unverifiedClaims,
  };
}


const AI_CLICHE_PATTERNS: Array<{ pattern: RegExp; replacement: string; label: string }> = [
  {
    pattern: /\b[Ii]n today['’]s fast-paced digital (?:landscape|world|era|age),?\s*/g,
    replacement: "",
    label: "in today's fast-paced digital...",
  },
  {
    pattern: /\b[Ii]n today['’]s digital (?:landscape|world|era|age),?\s*/g,
    replacement: "",
    label: "in today's digital landscape",
  },
  {
    pattern: /\b[Ii]t is (?:important|worth|crucial|essential) to note that\s+/g,
    replacement: "",
    label: "it is important to note that",
  },
  {
    pattern: /\b[Ii]t['’]s worth noting that\s+/g,
    replacement: "",
    label: "it's worth noting that",
  },
  {
    pattern: /\b[Ww]hen it comes to\s+/g,
    replacement: "For ",
    label: "when it comes to",
  },
  {
    pattern: /\b[Ii]n order to\b/g,
    replacement: "to",
    label: "in order to",
  },
  {
    pattern: /\b[Dd]ue to the fact that\b/g,
    replacement: "because",
    label: "due to the fact that",
  },
  {
    pattern: /\b[Dd]elving into\b/g,
    replacement: "Examining",
    label: "delving into",
  },
  {
    pattern: /\b[Dd]elve into\b/g,
    replacement: "explore",
    label: "delve into",
  },
  {
    pattern: /\b[Uu]tiliz(?:e|es|ed|ing)\b/g,
    replacement: "use",
    label: "utilize",
  },
  {
    pattern: /\b[Ll]everag(?:e|es|ed|ing)\b/g,
    replacement: "use",
    label: "leverage",
  },
];

/**
 * Deterministically strips robotic AI throat-clearing clichés, simplifies pompous
 * verbs, separates inline Markdown headings, and splits >24-word compound sentences.
 */
export function stripAiClichesAndPolishRhythm(md: string): string {
  if (!md) return "";
  let text = sanitizeMarkdownHeadings(md);
  for (const rule of AI_CLICHE_PATTERNS) {
    text = text.replace(rule.pattern, rule.replacement);
  }
  // Ensure sentence starts after stripped openers are capitalized cleanly
  text = text.replace(/(^|[.!?]\s+)([a-z])/gm, (_, prefix: string, ch: string) => `${prefix}${ch.toUpperCase()}`);
  return splitRunOnSentences(text);
}

/**
 * Evaluates sentence-length burstiness (variation across short, medium, and long
 * sentences), standard deviation (sigma), monotone runs, and AI cliché presence.
 */
export function auditBurstinessRhythm(md: string): {
  burstinessScore: number;
  stdDev: number;
  shortPct: number;
  mediumPct: number;
  longPct: number;
  monotoneRuns: number;
  clichesFound: string[];
} {
  const clean = (md || "")
    .replace(/^#{1,6}\s+[^\n]+$/gm, " ")
    .replace(/^\s*\|.+\|\s*$/gm, " ")
    .replace(/```[\s\S]*?```/g, " ");
  const rawSentences = clean.match(/[^.!?\n]+[.!?]+/g) || [];
  const lengths = rawSentences
    .map((s) => s.trim().split(/\s+/).filter(Boolean).length)
    .filter((len) => len >= 4);

  const lower = (md || "").toLowerCase();
  const clicheWatchlist = [
    "in today's fast-paced",
    "in today's digital",
    "it is important to note",
    "it is worth noting",
    "delve into",
    "delving into",
    "tapestry",
    "testament to",
    "game-changer",
    "paradigm shift",
  ];
  const clichesFound = clicheWatchlist.filter((phrase) => lower.includes(phrase));

  if (lengths.length === 0) {
    return {
      burstinessScore: 100,
      stdDev: 0,
      shortPct: 35,
      mediumPct: 50,
      longPct: 15,
      monotoneRuns: 0,
      clichesFound,
    };
  }

  const total = lengths.length;
  const shortCount = lengths.filter((n) => n <= 11).length;
  const mediumCount = lengths.filter((n) => n >= 12 && n <= 20).length;
  const longCount = lengths.filter((n) => n >= 21).length;

  const shortPct = Math.round((shortCount / total) * 100);
  const mediumPct = Math.round((mediumCount / total) * 100);
  const longPct = Math.max(0, 100 - shortPct - mediumPct);

  const mean = lengths.reduce((a, b) => a + b, 0) / total;
  const variance =
    lengths.reduce((acc, n) => acc + Math.pow(n - mean, 2), 0) / total;
  const stdDev = Math.round(Math.sqrt(variance) * 10) / 10;

  let monotoneRuns = 0;
  for (let i = 0; i + 2 < lengths.length; i++) {
    const a = lengths[i];
    const b = lengths[i + 1];
    const c = lengths[i + 2];
    if (Math.max(a, b, c) - Math.min(a, b, c) <= 2) {
      monotoneRuns += 1;
      i += 1;
    }
  }

  const sigmaScore = Math.min(100, Math.round((stdDev / 5.2) * 88) + 12);
  const penalty = clichesFound.length * 12 + monotoneRuns * 6;
  const burstinessScore = Math.max(30, Math.min(100, sigmaScore - penalty));

  return {
    burstinessScore,
    stdDev,
    shortPct,
    mediumPct,
    longPct,
    monotoneRuns,
    clichesFound,
  };
}

/**
 * Audits every H2 section for Google Featured Snippet & AI Overview extraction
 * readiness: opening paragraph word count (optimal 35–65 words, targeting the
 * 40–60 word direct-answer window) and structural format signals (lists, tables,
 * callouts, and inline citations).
 */
export function auditSectionSnippetReadiness(p: Project): {
  averageScore: number;
  snippetReadyCount: number;
  totalSections: number;
  sections: Array<{
    id: string;
    h2: string;
    leadWords: number;
    leadStatus: "optimal" | "short" | "long";
    hasList: boolean;
    hasTable: boolean;
    hasCallout: boolean;
    hasCitation: boolean;
    snippetScore: number;
  }>;
} {
  const secItems = (p.sections || []).map((sec) => {
    const fullMd = bodyOf(sec);
    const introBlock = (sec.bodyMarkdown || "").trim();
    const firstPara =
      introBlock
        .split(/\n\s*\n/)
        .map((blk) => blk.trim())
        .find(
          (blk) =>
            blk.length > 0 &&
            !/^(?:#{1,6}\s|[-*+]\s|\d+[.)]\s|\||>)/.test(blk),
        ) || "";
    const leadWords = wordCount(
      firstPara.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1"),
    );
    const leadStatus: "optimal" | "short" | "long" =
      leadWords >= 35 && leadWords <= 65
        ? "optimal"
        : leadWords < 35
          ? "short"
          : "long";
    const hasList = /^\s*(?:[-*+]\s+|\d+[.)]\s+)/m.test(fullMd);
    const hasTable = /^\s*\|.+\|\s*$/m.test(fullMd);
    const hasCallout = /^\s*>\s+/m.test(fullMd);
    const hasCitation = /\[[^\]]+\]\(https?:\/\/[^)]+\)/i.test(fullMd);

    let snippetScore = leadStatus === "optimal" ? 55 : leadWords >= 20 ? 32 : 15;
    if (hasList) snippetScore += 15;
    if (hasTable) snippetScore += 15;
    if (hasCallout) snippetScore += 10;
    if (hasCitation) snippetScore += 15;
    snippetScore = Math.min(100, snippetScore);

    return {
      id: sec.id,
      h2: sec.h2Text || "Untitled Section",
      leadWords,
      leadStatus,
      hasList,
      hasTable,
      hasCallout,
      hasCitation,
      snippetScore,
    };
  });

  const totalSections = secItems.length;
  const snippetReadyCount = secItems.filter(
    (s) => s.leadStatus === "optimal" || s.snippetScore >= 75,
  ).length;
  const averageScore =
    totalSections === 0
      ? 100
      : Math.round(
          secItems.reduce((acc, s) => acc + s.snippetScore, 0) / totalSections,
        );

  return {
    averageScore,
    snippetReadyCount,
    totalSections,
    sections: secItems,
  };
}


const LINK_STOPWORDS = new Set([
  "the", "and", "for", "with", "from", "that", "this", "your", "into", "guide",
  "tool", "tools", "free", "online", "best", "how", "what", "why", "when", "ai",
  "seo", "content", "article", "blog", "studio", "generator", "checker", "analyzer",
]);

/**
 * Scans drafted H2 sections for unlinked sentences that topically match
 * available Verified Internal Links, surfacing a sentence context preview
 * and natural anchor phrase for 1-click contextual interlinking.
 */
export function auditContextualLinkOpportunities(p: Project): Array<{
  url: string;
  title: string;
  anchor: string;
  sectionId: string;
  sectionHeading: string;
  sentencePreview: string;
  matchedPhrase: string;
}> {
  const w = workspace(p);
  const fullMd = articleMarkdown(p);
  const candidates = [
    ...(p.internalLinks || []).map((l) => ({
      url: l.targetUrl,
      title: l.targetTitle || l.anchorText,
      anchor: l.anchorText || l.targetTitle,
    })),
    ...(w.research?.internalLinks || []).map((l) => ({
      url: l.url,
      title: l.title,
      anchor: l.anchorText || l.title,
    })),
  ].filter(
    (item, idx, arr) =>
      Boolean(safeUrl(item.url)) &&
      arr.findIndex((x) => x.url === item.url) === idx &&
      !fullMd.includes(item.url),
  );

  const opportunities: Array<{
    url: string;
    title: string;
    anchor: string;
    sectionId: string;
    sectionHeading: string;
    sentencePreview: string;
    matchedPhrase: string;
  }> = [];

  for (const link of candidates) {
    const rawTokens = `${link.anchor} ${link.title}`
      .toLowerCase()
      .replace(/[^a-z0-9\s-]+/g, " ")
      .split(/\s+/)
      .filter((t) => t.length >= 3 && !LINK_STOPWORDS.has(t));
    const tokens = [...new Set(rawTokens)];

    let bestHit: {
      sectionId: string;
      sectionHeading: string;
      sentencePreview: string;
      matchedPhrase: string;
      score: number;
    } | null = null;

    for (const sec of p.sections || []) {
      const secMd = bodyOf(sec);
      const sentences = secMd.match(/[^.!?\n]+[.!?]+/g) || [];
      for (const rawSent of sentences) {
        const sent = rawSent.trim();
        if (
          sent.length < 30 ||
          /\[[^\]]+\]\(https?:\/\/[^)]+\)/.test(sent) ||
          /^(?:#{1,6}\s|\|)/.test(sent)
        ) {
          continue;
        }
        const lowerSent = sent.toLowerCase();
        const anchorLower = link.anchor.toLowerCase().trim();
        if (anchorLower.length >= 5 && lowerSent.includes(anchorLower)) {
          const idx = lowerSent.indexOf(anchorLower);
          const exactSlice = sent.slice(idx, idx + anchorLower.length);
          bestHit = {
            sectionId: sec.id,
            sectionHeading: sec.h2Text,
            sentencePreview: sent.slice(0, 145),
            matchedPhrase: exactSlice,
            score: 10,
          };
          break;
        }
        const matchedTokens = tokens.filter((tk) => lowerSent.includes(tk));
        if (matchedTokens.length >= 1) {
          const firstTk = matchedTokens[0];
          const phraseMatch = sent.match(
            new RegExp(`\\b([A-Za-z0-9-]+(?:\\s+[A-Za-z0-9-]+){0,2}?\\s*${firstTk}(?:\\s+[A-Za-z0-9-]+){0,1})\\b`, "i"),
          );
          const matchedPhrase = phraseMatch ? phraseMatch[1].trim() : link.anchor;
          const score = matchedTokens.length;
          if (!bestHit || score > bestHit.score) {
            bestHit = {
              sectionId: sec.id,
              sectionHeading: sec.h2Text,
              sentencePreview: sent.slice(0, 145),
              matchedPhrase,
              score,
            };
          }
        }
      }
      if (bestHit && bestHit.score >= 10) break;
    }

    if (bestHit) {
      opportunities.push({
        url: link.url,
        title: link.title,
        anchor: link.anchor,
        sectionId: bestHit.sectionId,
        sectionHeading: bestHit.sectionHeading,
        sentencePreview: bestHit.sentencePreview,
        matchedPhrase: bestHit.matchedPhrase,
      });
    }
  }

  return opportunities.slice(0, 6);
}

/**
 * Deterministically weaves up to `maxToLink` unlinked internal links into
 * matching H2 section sentences (or appends a natural contextual reference bullet
 * when no exact phrase match is present) in 0ms with zero API token cost.
 */
export function autoWeaveContextualInternalLinks(
  p: Project,
  maxToLink = 4,
): { project: Project; linkedCount: number } {
  const opportunities = auditContextualLinkOpportunities(p);
  const w = workspace(p);
  const fullMd = articleMarkdown(p);
  const fallbackLinks = [
    ...(p.internalLinks || []).map((l) => ({
      url: l.targetUrl,
      title: l.targetTitle || l.anchorText,
      anchor: l.anchorText || l.targetTitle,
    })),
    ...(w.research?.internalLinks || []).map((l) => ({
      url: l.url,
      title: l.title,
      anchor: l.anchorText || l.title,
    })),
  ].filter(
    (item, idx, arr) =>
      Boolean(safeUrl(item.url)) &&
      arr.findIndex((x) => x.url === item.url) === idx &&
      !fullMd.includes(item.url),
  );

  if (opportunities.length === 0 && fallbackLinks.length === 0) {
    return { project: p, linkedCount: 0 };
  }

  let linkedCount = 0;
  const usedUrls = new Set<string>();
  const nextSections = p.sections.map((sec, secIdx) => {
    if (linkedCount >= maxToLink) return sec;
    let secMd = bodyOf(sec);
    const secOpps = opportunities.filter(
      (o) => o.sectionId === sec.id && !usedUrls.has(o.url),
    );
    for (const opp of secOpps) {
      if (linkedCount >= maxToLink) break;
      if (
        opp.matchedPhrase &&
        opp.matchedPhrase.length >= 4 &&
        secMd.includes(opp.matchedPhrase) &&
        !secMd.includes(opp.url)
      ) {
        secMd = secMd.replace(
          opp.matchedPhrase,
          `[${opp.matchedPhrase}](${opp.url})`,
        );
        usedUrls.add(opp.url);
        linkedCount += 1;
      }
    }
    if (linkedCount < maxToLink) {
      const candidate = fallbackLinks.find(
        (fl) => !usedUrls.has(fl.url) && !secMd.includes(fl.url),
      );
      if (candidate && secIdx < maxToLink) {
        secMd = `${secMd.trim()}\n\n- **Related Workflow Tool:** Use [${candidate.anchor || candidate.title}](${candidate.url}) to audit and implement this step.`;
        usedUrls.add(candidate.url);
        linkedCount += 1;
      }
    }
    const updated = setSectionBody(sec, secMd);
    try {
      return refreshVisual(updated, p);
    } catch {
      return updated;
    }
  });

  const nextProject = patchWorkspace(
    { ...p, sections: nextSections },
    { document: undefined },
  );
  return { project: nextProject, linkedCount };
}

/**
 * Audits every FAQ item in `p.faqs` against Google People Also Ask (PAA),
 * AI Overviews, and voice-search extraction benchmarks (question-phrased
 * heading + 35 to 60 word self-contained answer).
 */
export function auditFaqPaaReadiness(p: Project): {
  totalFaqs: number;
  optimalCount: number;
  paaReadyScore: number;
  items: Array<{
    id: string;
    question: string;
    words: number;
    isQuestionHeading: boolean;
    status: "optimal" | "short" | "long";
  }>;
} {
  const items = (p.faqs || []).map((faq, idx) => {
    const q = (faq.question || "").trim();
    const a = (faq.answer || "").trim();
    const words = wordCount(a);
    const isQuestionHeading =
      /\?$/.test(q) ||
      /^(?:what|how|why|when|where|which|who|can|does|do|is|are|should|will)\b/i.test(
        q,
      );
    const status: "optimal" | "short" | "long" =
      words >= 30 && words <= 60 ? "optimal" : words < 30 ? "short" : "long";
    return {
      id: faq.id || `faq-${idx}`,
      question: q || `Question #${idx + 1}`,
      words,
      isQuestionHeading,
      status,
    };
  });

  const totalFaqs = items.length;
  const optimalCount = items.filter(
    (it) => it.status === "optimal" && it.isQuestionHeading,
  ).length;
  const paaReadyScore =
    totalFaqs === 0
      ? 0
      : Math.round(
          items.reduce((acc, it) => {
            const lenPts =
              it.status === "optimal" ? 80 : it.words >= 18 ? 50 : 20;
            const qPts = it.isQuestionHeading ? 20 : 0;
            return acc + lenPts + qPts;
          }, 0) / totalFaqs,
        );

  return {
    totalFaqs,
    optimalCount,
    paaReadyScore,
    items,
  };
}


/**
 * V3.5: Audits Google NLP Entity Salience signals (primary entity presence in H1,
 * first-sentence subject position, first 60 words, and H2 section distribution)
 * alongside AEO Question-Heading Ratio (target: 25%–75% of H2 headings phrased as questions).
 */
export function auditEntitySalienceAndQuestions(p: Project): {
  salienceScore: number;
  inH1: boolean;
  inOpeningSentence: boolean;
  inFirst60Words: boolean;
  sectionEntityDistributionPct: number;
  questionH2Count: number;
  totalH2Count: number;
  questionHeadingRatioPct: number;
  questionRatioOptimal: boolean;
} {
  const w = workspace(p);
  const focus = (
    p.keywordCluster?.primaryKeyword ||
    w.research?.primaryKeyword ||
    w.research?.primaryTopic ||
    p.projectTitle ||
    ""
  )
    .trim()
    .toLowerCase();
  const focusTokens = focus
    .split(/[^a-z0-9\p{L}]+/u)
    .filter((t) => t.length >= 3 && !LINK_STOPWORDS.has(t));

  const matchesFocus = (text: string): boolean => {
    const hay = (text || "").toLowerCase();
    if (!focus) return false;
    if (hay.includes(focus)) return true;
    if (!focusTokens.length) return false;
    const hitCount = focusTokens.filter((t) => hay.includes(t)).length;
    return hitCount >= Math.max(1, Math.ceil(focusTokens.length * 0.6));
  };

  const h1Text = `${p.metaPack?.h1Title || ""} ${p.metaPack?.metaTitle || ""} ${p.projectTitle || ""}`;
  const inH1 = matchesFocus(h1Text);

  const introSource =
    (p.metaPack?.aeoDirectAnswer50Words || "").trim() ||
    (p.sections[0] ? bodyOf(p.sections[0]) : "")
      .replace(/^#+\s+[^\n]+\n*/gm, "")
      .trim();
  const firstSentenceMatch = introSource.match(/^[^.!?]+[.!?]?/);
  const firstSentence = firstSentenceMatch ? firstSentenceMatch[0] : introSource;
  const inOpeningSentence = matchesFocus(firstSentence);

  const fullMdPlain = (articleMarkdown(p) || "")
    .replace(/^#+\s+[^\n]+$/gm, " ")
    .replace(/\s+/g, " ")
    .trim();
  const first60Words = fullMdPlain.split(" ").slice(0, 60).join(" ");
  const inFirst60Words = matchesFocus(first60Words) || inOpeningSentence;

  const secondaryTerms = [
    ...(p.keywordCluster?.secondaryKeywords || []),
    ...(w.research?.secondaryKeywords || []),
    ...(w.research?.lsiEntities || []),
  ]
    .map((s) => s.toLowerCase().trim())
    .filter((s) => s.length >= 3);

  const totalH2Count = p.sections.length;
  let sectionsWithEntities = 0;
  let questionH2Count = 0;

  for (const sec of p.sections) {
    const h2 = (sec.h2Text || "").trim();
    const isQuestionH2 =
      /\?$/.test(h2) ||
      /^(?:what|how|why|when|where|which|who|can|does|do|is|are|should|will)\b/i.test(
        h2,
      );
    if (isQuestionH2) questionH2Count += 1;

    const secText = `${h2} ${bodyOf(sec)}`.toLowerCase();
    const hasSecondary = secondaryTerms.some((term) => secText.includes(term));
    if (matchesFocus(secText) || hasSecondary) {
      sectionsWithEntities += 1;
    }
  }

  const sectionEntityDistributionPct =
    totalH2Count === 0
      ? 0
      : Math.round((sectionsWithEntities / totalH2Count) * 100);

  const salienceScore = Math.min(
    100,
    Math.round(
      (inH1 ? 25 : 0) +
        (inOpeningSentence ? 30 : 0) +
        (inFirst60Words ? 20 : 0) +
        sectionEntityDistributionPct * 0.25,
    ),
  );

  const questionHeadingRatioPct =
    totalH2Count === 0
      ? 0
      : Math.round((questionH2Count / totalH2Count) * 100);
  const questionRatioOptimal =
    totalH2Count > 0 &&
    questionHeadingRatioPct >= 25 &&
    questionHeadingRatioPct <= 75;

  return {
    salienceScore,
    inH1,
    inOpeningSentence,
    inFirst60Words,
    sectionEntityDistributionPct,
    questionH2Count,
    totalH2Count,
    questionHeadingRatioPct,
    questionRatioOptimal,
  };
}

/**
 * V3.5: Cross-checks discovered research questions (`questionsToAnswer`) and
 * secondary subtopics (`secondaryKeywords`) against the drafted article and FAQs
 * to surface Information Gain subtopic gaps.
 */
export function auditSubtopicCoverageGaps(p: Project): {
  totalTargets: number;
  coveredCount: number;
  coverageScore: number;
  uncoveredQuestions: string[];
  uncoveredSubtopics: string[];
} {
  const w = workspace(p);
  const mdLower = (articleMarkdown(p) || "").toLowerCase();
  const faqTextLower = (p.faqs || [])
    .map((f) => `${f.question} ${f.answer}`)
    .join(" ")
    .toLowerCase();
  const combinedHaystack = `${mdLower} ${faqTextLower}`;

  const questions = (w.research?.questionsToAnswer || [])
    .map((q) => q.trim())
    .filter(Boolean);
  const subtopics = [
    ...(p.keywordCluster?.secondaryKeywords || []),
    ...(w.research?.secondaryKeywords || []),
  ]
    .map((k) => k.trim())
    .filter((v, idx, arr) => Boolean(v) && arr.indexOf(v) === idx);

  const uncoveredQuestions: string[] = [];
  let coveredQ = 0;

  for (const q of questions) {
    const tokens = q
      .toLowerCase()
      .split(/[^a-z0-9\p{L}]+/u)
      .filter((t) => t.length >= 3 && !LINK_STOPWORDS.has(t));
    if (!tokens.length) {
      coveredQ += 1;
      continue;
    }
    const matched = tokens.filter((t) => combinedHaystack.includes(t)).length;
    if (matched >= Math.max(1, Math.ceil(tokens.length * 0.6))) {
      coveredQ += 1;
    } else {
      uncoveredQuestions.push(q);
    }
  }

  const uncoveredSubtopics: string[] = [];
  let coveredSub = 0;

  for (const sub of subtopics) {
    const lowerSub = sub.toLowerCase();
    if (combinedHaystack.includes(lowerSub)) {
      coveredSub += 1;
    } else {
      const tokens = lowerSub
        .split(/[^a-z0-9\p{L}]+/u)
        .filter((t) => t.length >= 3 && !LINK_STOPWORDS.has(t));
      const matched = tokens.filter((t) => combinedHaystack.includes(t)).length;
      if (tokens.length > 0 && matched >= Math.ceil(tokens.length * 0.7)) {
        coveredSub += 1;
      } else {
        uncoveredSubtopics.push(sub);
      }
    }
  }

  const totalTargets = questions.length + subtopics.length;
  const coveredCount = coveredQ + coveredSub;
  const coverageScore =
    totalTargets === 0 ? 100 : Math.round((coveredCount / totalTargets) * 100);

  return {
    totalTargets,
    coveredCount,
    coverageScore,
    uncoveredQuestions,
    uncoveredSubtopics,
  };
}

/**
 * V3.5: Deterministically normalizes all FAQ items in `p.faqs` so every question
 * ends with `?` and every answer falls inside the 32–56 word Google People Also Ask
 * (PAA) and voice-search extraction window in 0ms.
 */
export function normalizeFaqPaaLengths(p: Project): {
  project: Project;
  normalizedCount: number;
} {
  const w = workspace(p);
  const focus = (
    p.keywordCluster?.primaryKeyword ||
    w.research?.primaryKeyword ||
    p.projectTitle ||
    "this workflow"
  ).trim();
  let normalizedCount = 0;

  const nextFaqs = (p.faqs || []).map((faq) => {
    let q = (faq.question || "").trim();
    if (q && !/\?$/.test(q)) {
      q = `${q.replace(/[.!]+$/, "")}?`;
    }
    let a = (faq.answer || "").replace(/\s+/g, " ").trim();
    const initialWords = wordCount(a);
    let changed = q !== (faq.question || "").trim();

    if (initialWords < 30) {
      const expansionPool = [
        `In practice, teams applying ${focus} should define clear baseline metrics, validate each configuration step against user intent, and review structured outputs regularly to maintain long-term quality and measurable search visibility.`,
        `Documenting repeatable checklists and verifying source citations at every stage ensures ${focus} delivers reliable, audit-ready results across both human readers and generative answer engines.`,
      ];
      for (const extra of expansionPool) {
        if (wordCount(a) >= 35) break;
        a = a ? `${a.replace(/(?<![.!?])$/, ".")} ${extra}` : extra;
      }
      changed = true;
    }

    if (wordCount(a) > 58) {
      const wordsArr = a.split(" ");
      let trimmed = wordsArr.slice(0, 50).join(" ").replace(/[,;:\-–—]+$/, "");
      if (!/[.!?]$/.test(trimmed)) trimmed += ".";
      a = trimmed;
      changed = true;
    }

    if (changed) normalizedCount += 1;
    return {
      ...faq,
      question: q || `How does ${focus} improve workflow outcomes?`,
      answer: a,
    };
  });

  return {
    project: { ...p, faqs: nextFaqs },
    normalizedCount,
  };
}

/**
 * V3.5: Injects uncovered research questions from `workspace(p).research.questionsToAnswer`
 * into `p.faqs` with PAA-optimal (40–52 word) answers in 0ms.
 */
export function injectUncoveredQuestionsIntoFaqs(
  p: Project,
  maxToAdd = 3,
): {
  project: Project;
  addedCount: number;
} {
  const w = workspace(p);
  const gapAudit = auditSubtopicCoverageGaps(p);
  const focus = (
    p.keywordCluster?.primaryKeyword ||
    w.research?.primaryKeyword ||
    p.projectTitle ||
    "this strategy"
  ).trim();
  const existingQuestions = new Set(
    (p.faqs || []).map((f) => f.question.trim().toLowerCase()),
  );

  const candidates = gapAudit.uncoveredQuestions.filter(
    (q) => !existingQuestions.has(q.trim().toLowerCase()),
  );

  const toAdd = candidates.slice(0, maxToAdd).map((rawQ, idx) => {
    const cleanQ = /\?$/.test(rawQ.trim())
      ? rawQ.trim()
      : `${rawQ.trim().replace(/[.!]+$/, "")}?`;
    const answer = `${cleanQ.replace(/\?$/, "")} works best when teams align ${focus} with specific user intent, structured formatting, and verifiable operational metrics. By combining clear decision criteria with regular quality audits, practitioners prevent common implementation bottlenecks and achieve consistent, measurable results across every publishing stage.`;
    return {
      id: `faq-gap-${Date.now()}-${idx}`,
      question: cleanQ,
      answer,
    };
  });

  if (toAdd.length === 0) {
    return { project: p, addedCount: 0 };
  }

  return {
    project: {
      ...p,
      faqs: [...(p.faqs || []), ...toAdd],
    },
    addedCount: toAdd.length,
  };
}
