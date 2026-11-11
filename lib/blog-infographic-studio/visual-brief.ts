import type {
  BlogInfographicConfig,
  BlogInfographicNodeItem,
  BlogSectionNode,
  InfographicAspectRatio,
} from "@/lib/blog-writer/canonical-state";
import type {
  ArticleSourceSection,
  ArticleSourceBlock,
  ArticleSourceCoverage,
} from "./article-source";
import { sourceId } from "./article-source";

export const PRISM_LAYOUTS = [
  {
    id: "editorial",
    name: "Editorial atlas",
    description:
      "Oversized pictograms, numbered badges, and structured editorial cards.",
  },
  {
    id: "constellation",
    name: "Connected concepts",
    description:
      "A central concept hub surrounded by related ideas and structured explanations.",
  },
  {
    id: "ribbon",
    name: "Illustrated bands",
    description:
      "Alternating topic illustrations and full-width color bands for a scannable summary.",
  },
  {
    id: "pipeline",
    name: "Step-by-step spine",
    description:
      "Connected numbered stages along a vertical process spine for workflows and how-to guides.",
  },
  {
    id: "bento",
    name: "Bento concept grid",
    description:
      "Two-column architectural cards with topic badges and structured explanations.",
  },
  {
    id: "versus",
    name: "Side-by-side comparison",
    description:
      "Balanced two-column comparison matrix for contrasting approaches or trade-offs.",
  },
  {
    id: "pyramid",
    name: "Layered hierarchy",
    description:
      "Tiered foundation-to-apex layers showing how core principles support execution.",
  },
  {
    id: "spotlight",
    name: "Executive callout cards",
    description:
      "High-contrast numbered editorial cards with bold accent bars and topic pictograms.",
  },
  {
    id: "checklist",
    name: "Verification board",
    description:
      "Structured audit and verification cards with check-ring badges and clear takeaways.",
  },
] as const;

export type PrismLayout = (typeof PRISM_LAYOUTS)[number]["id"];

export interface VisualBrief {
  sourceUrl?: string;
  sectionId: string;
  relationship: "concepts" | "sequence";
  sourceBlocks: ArticleSourceBlock[];
  excludedBlocks: number;
  omittedPoints: number;
  warnings: string[];
  articleCoverage?: ArticleSourceCoverage;
}

/**
 * Determines the pre-built intrinsic aspect ratio for a given Editorial Collection
 * layout and node set so users never need to manually adjust format dimensions.
 */
export function getPrebuiltPrismAspectRatio(
  layout: PrismLayout,
  nodes: BlogInfographicNodeItem[] = [],
): InfographicAspectRatio {
  const count = nodes.length;
  if (count <= 3) return "4:5";
  const totalChars = nodes.reduce(
    (sum, n) => sum + (n.title?.length || 0) + (n.detail?.length || 0),
    0,
  );
  const isTwoColumnLayout =
    layout === "bento" || layout === "versus" || layout === "checklist";
  if (isTwoColumnLayout) {
    return count >= 6 && totalChars > 720 ? "9:16" : "4:5";
  }
  if (layout === "constellation") {
    return count >= 5 || totalChars > 520 ? "9:16" : "4:5";
  }
  return count >= 5 || totalChars > 540 ? "9:16" : "4:5";
}

export function autoRecommendPrismLayout(
  headline: string,
  nodes: BlogInfographicNodeItem[] = [],
): PrismLayout {
  const combined =
    `${headline} ${nodes.map((n) => `${n.title} ${n.detail}`).join(" ")}`.toLowerCase();
  if (/\b(vs\.?|versus|compare|comparison|difference|trade-off|pros|cons)\b/.test(combined)) {
    return "versus";
  }
  if (/\b(step|how to|process|pipeline|workflow|stage|roadmap|sequence)\b/.test(combined)) {
    return "pipeline";
  }
  if (/\b(checklist|verify|verification|audit|launch|criteria|rule|faq|question)\b/.test(combined)) {
    return "checklist";
  }
  if (/\b(pyramid|hierarchy|tier|layer|foundation|stack|maturity)\b/.test(combined)) {
    return "pyramid";
  }
  if (nodes.length >= 4 && nodes.length % 2 === 0) {
    return "bento";
  }
  if (nodes.length === 3) {
    return "constellation";
  }
  return "editorial";
}

const clean = (s: string) =>
  s
    .replace(/\*\*|__|`/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
const personal =
  /^(?:i[’']?m |i am |my name |i (?:wrote|created|built|tested|started)|as (?:a |the )?founder|subscribe |join (?:our|my)|click here|in this (?:article|guide),? (?:i|we) (?:will|share))/i;
const sentences = (s: string) =>
  clean(s)
    .split(/(?<=[.!?])\s+(?=[\p{Lu}\d])/u)
    .filter(Boolean);

export function buildSectionVisual(
  section: ArticleSourceSection,
  sourceUrl?: string,
): { nodes: BlogInfographicNodeItem[]; brief: VisualBrief } {
  let excluded = 0;
  const eligible = section.blocks.filter((b) => {
    const okay =
      b.kind !== "heading" &&
      b.kind !== "caption" &&
      clean(b.text).length >= 32 &&
      !personal.test(clean(b.text)) &&
      norm(b.text) !== norm(section.title);
    if (!okay && b.kind !== "heading") excluded++;
    return okay;
  });
  const headings = [...new Set(eligible.map((b) => b.heading).filter(Boolean))];
  // Prefer an author's explicit concept summary over treating every supporting H3 as a peer.
  const overviewList = eligible.filter(
    (b) =>
      !b.heading && b.kind === "list" && /^.{3,76}\s[—–]\s.{25,}$/.test(b.text),
  );
  const groups: { title?: string; blocks: ArticleSourceBlock[] }[] =
    overviewList.length >= 2 && overviewList.length <= 6
      ? overviewList.map((b) => ({ blocks: [b] }))
      : headings.length >= 2
        ? headings.map((title) => ({
            title,
            blocks: eligible.filter((b) => b.heading === title),
          }))
        : (eligible.length === 1
            ? sentences(eligible[0].text).map((text) => ({
                ...eligible[0],
                text,
              }))
            : eligible
          ).map((b) => ({ blocks: [b] }));
  const points = groups
    .map((group, i) => {
      const first = group.blocks[0];
      const text = clean(first.text);
      const delimiter = text.match(/\s[—–]\s|:/);
      const colon = delimiter?.index ?? -1;
      const split = colon > 3 && colon < 78;
      const originalTitle =
        group.title ||
        (split
          ? text.slice(0, colon)
          : text
              .split(/[,;—–]/)[0]
              .split(/\s+/)
              .slice(0, 8)
              .join(" ")
              .replace(/[.!?:]$/, ""));
      const title = originalTitle
        .replace(/^what (?:is|are)\s+/i, "")
        .replace(/\s+and (?:why|how)\b.*$/i, "")
        .replace(/:\s+using\b.*$/i, "");
      const candidates = group.blocks
        .flatMap((b) =>
          sentences(b.text).map((sentence) => ({ sentence, id: b.id })),
        )
        .filter((x) => !personal.test(x.sentence));
      // Extract complete supported sentences; never turn a heading or a publication year into a finding.
      const headingWords = new Set(
        title
          .toLowerCase()
          .split(/\W+/)
          .filter((w) => w.length > 3),
      );
      const ranked = candidates
        .filter(
          (c) =>
            !/[:;]$|\b(?:including|such as|covering)[.:]?$/i.test(c.sentence),
        )
        .map((c) => ({
          ...c,
          score:
            (/\b(?:focus(?:es)?|uses?|practice|refers?|means?|helps?|designed|is (?:a|the))\b/i.test(
              c.sentence,
            )
              ? 10
              : 0) +
            Math.min(c.sentence.length, 150) / 40 +
            [...headingWords].filter((w) =>
              c.sentence.toLowerCase().includes(w),
            ).length *
              2 -
            Math.max(0, c.sentence.length - 240) / 15,
        }))
        .sort((a, b) => b.score - a.score);
      const chosen = (
        ranked.length
          ? ranked
          : candidates.filter((c) => !/[:;]$/.test(c.sentence))
      ).slice(0, 1);
      const detail =
        split && !group.title
          ? text.slice(colon + (delimiter?.[0].length || 1)).trim()
          : chosen.map((c) => c.sentence).join(" ");
      return {
        id: `point-${sourceId(`${section.id}:${i}:${title}`)}`,
        badge:
          title.match(/^([A-Z]{2,5})\b/)?.[1] || String(i + 1).padStart(2, "0"),
        title: clean(title),
        detail: detail.replace(/^\p{Ll}/u, (c) => c.toUpperCase()),
        metricValue: "",
        sourceBlockIds: [...new Set(chosen.map((c) => c.id))],
      };
    })
    .filter((n) => n.title && n.detail && norm(n.title) !== norm(n.detail));
  const nodes = points.slice(0, 6);
  const omittedPoints = Math.max(0, points.length - nodes.length);
  const warnings: string[] = [];
  if (section.role !== "content")
    warnings.push(
      "This section appears to be an introduction or promotional material. Choose a substantive section for an educational infographic.",
    );
  if (nodes.length < 2)
    warnings.push(
      "Not enough explanatory source text was found. Paste the section body or choose another section.",
    );
  if (omittedPoints)
    warnings.push(
      `${omittedPoints} additional source points remain in the source panel. Split this section into another infographic if needed.`,
    );
  if (eligible.some((b) => b.kind === "table"))
    warnings.push(
      "Table content is preserved as text. This pilot does not infer chart values or units from tables.",
    );
  return {
    nodes,
    brief: {
      sectionId: section.id,
      sourceUrl,
      relationship:
        /step[- ]by[- ]step|^step\s*\d|workflow|process|how to /i.test(
          section.title,
        )
          ? "sequence"
          : "concepts",
      sourceBlocks: section.blocks,
      excludedBlocks: excluded,
      omittedPoints,
      warnings,
    },
  };
}

export function sectionFromText(
  title: string,
  text: string,
  id = `text-${sourceId(text)}`,
): ArticleSourceSection {
  let heading = "";
  const blocks = text
    .split(/\n+/)
    .map((s, i) => {
      const m = s.match(/^#{2,4}\s+(.+)/);
      if (m) heading = clean(m[1]);
      const value = clean(s.replace(/^\s*(?:[-*•]|\d+[.)])\s+/, ""));
      return {
        id: `text-${sourceId(`${id}:${i}:${value}`)}`,
        kind: m ? ("heading" as const) : ("paragraph" as const),
        text: m ? heading : value,
        heading: heading || undefined,
      };
    })
    .filter((b) => b.text);
  return { id, title, blocks, role: "content" };
}

export function withPrismLayout(
  config: BlogInfographicConfig,
  layout: PrismLayout,
): BlogInfographicConfig {
  const spec = PRISM_LAYOUTS.find((l) => l.id === layout) || PRISM_LAYOUTS[0];
  const prebuiltRatio = getPrebuiltPrismAspectRatio(
    spec.id,
    config.nodes || [],
  );
  return {
    ...config,
    visualEngine: "prism-antv",
    prismLayout: spec.id,
    templateSlug: `prism-${spec.id}`,
    templateName: spec.name,
    aspectRatio: prebuiltRatio,
    renderedPngDataUrl: undefined,
    renderedSvgMarkup: undefined,
  };
}

/** Direct writer adapter. It consumes section bodies, never re-scrapes generated article HTML. */
export function visualFromWriterSection(
  section: BlogSectionNode,
): BlogInfographicConfig {
  const text = [
    section.bodyMarkdown,
    ...section.subHeadings
      .filter((s) => s.bodyMarkdown.trim())
      .map((s) => `### ${s.h3Text}\n${s.bodyMarkdown}`),
  ]
    .filter(Boolean)
    .join("\n\n");
  const result = buildSectionVisual(
    sectionFromText(section.h2Text, text, section.id),
  );
  const chosenLayout =
    section.infographicConfig.prismLayout ||
    autoRecommendPrismLayout(section.h2Text, result.nodes);
  return withPrismLayout(
    {
      ...section.infographicConfig,
      headline: section.h2Text,
      subheadline: "",
      nodes: result.nodes,
      visualBrief: result.brief,
    },
    chosenLayout,
  );
}

export function createPrismSample(): BlogInfographicConfig {
  return {
    id: "prism-example",
    sectionId: "sample-framework",
    templateId: 19,
    templateSlug: "prism-editorial",
    templateName: "Editorial atlas",
    visualEngine: "prism-antv",
    prismLayout: "editorial",
    headline: "Three sides of AI SEO",
    subheadline: "Different jobs. One clearer search strategy.",
    paletteId: "blue-trust",
    aspectRatio: "4:5",
    footerSourceLabel: "DoItWithAI.tools · Illustrative framework",
    altText:
      "Three complementary approaches: answer engine optimization, generative engine optimization and AI-assisted SEO.",
    nodes: [
      {
        id: "answer",
        badge: "AEO",
        title: "Answer the question",
        detail:
          "Answer engine optimization makes useful answers easy to find and understand. Lead with a direct explanation, then add context.",
        icon: "answer",
      },
      {
        id: "evidence",
        badge: "GEO",
        title: "Make the answer supportable",
        detail:
          "Generative engine optimization focuses on content that can inform AI-generated answers. Use original explanations and verifiable sources.",
        icon: "evidence",
      },
      {
        id: "assist",
        badge: "AI",
        title: "Improve the workflow",
        detail:
          "AI-assisted SEO supports research, drafting and analysis. Review its output for accuracy and usefulness before publishing.",
        icon: "workflow",
      },
    ],
  };
}
