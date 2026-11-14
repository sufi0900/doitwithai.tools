import type {
  BlogInfographicConfig,
  BlogInfographicNodeItem,
  BlogSectionNode,
} from "@/lib/blog-writer/canonical-state";
import type {
  ArticleSourceSection,
  ArticleSourceBlock,
  ArticleSourceCoverage,
} from "./article-source";
import { sourceId } from "./article-source";

import { PRISM_LAYOUTS, prismLayoutSpec } from "./layout-registry";
import type { PrismLayout } from "./layout-registry";
export { PRISM_LAYOUTS } from "./layout-registry";
export type { PrismLayout } from "./layout-registry";
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

/**
 * Conversational transitions, rhetorical hooks, and second-person filler that
 * cannot stand alone as an educational infographic concept.
 */
const conversationalFiller =
  /^(?:you(?:\s+have|[’']ve)?\s+probably\s+noticed\b|you\s+search\b|we(?:\s+have|[’']ve)?\s+seen\s+a\s+(?:huge|big|major|massive|significant|dramatic)\s+(?:change|shift)\b|in\s+recent\s+years,?\s+we\s+have\s+seen\b|but\s+this\s+does\s+not\s+mean\b|that\s+does\s+not\s+mean\b|does\s+this\s+mean\b|let[’']?s\s+(?:look|take\s+a\s+look|dive|start|explore|break\s+down|be\s+honest)\b|here\s+is\s+(?:why|what|how)\s+that\s+matters\b|think\s+about\s+how\s+you\b|so\s+what\s+does\s+this\s+mean\s+for\s+you\b)/i;

const trailingWeakWords =
  /\s+\b(?:in|on|at|to|for|from|with|by|of|as|into|about|through|over|under|between|among|how|why|what|when|where|who|whom|whose|that|which|is|are|was|were|be|been|being|has|have|had|can|could|will|would|shall|should|may|might|must|do|does|did|not|and|or|but|nor|so|yet|because|although|though|while|if|unless|until|since|than|the|a|an|this|these|those|my|your|his|her|its|our|their|you|we|they|it|he|she|very|more|most|much|many|some|any|each|every|all|both|either|neither)\s*$/i;

const leadingDiscourse =
  /^(?:however|therefore|moreover|furthermore|in addition|for example|for instance|in practice|specifically|ultimately|instead|meanwhile|as a result|on the other hand|at the same time|in short|simply put|first|second|third|finally),\s+/i;

const sentences = (s: string) =>
  clean(s)
    .split(/(?<=[.!?])\s+(?=[\p{Lu}\d])/u)
    .filter(Boolean);

function toHeadlineCase(phrase: string): string {
  const minor = new Set([
    "a",
    "an",
    "the",
    "and",
    "or",
    "but",
    "for",
    "nor",
    "on",
    "at",
    "to",
    "from",
    "by",
    "of",
    "in",
    "with",
    "as",
    "vs",
  ]);
  const words = clean(phrase).split(/\s+/).filter(Boolean);
  return words
    .map((w, idx) => {
      if (/^[A-Z0-9&/-]{2,}$/.test(w)) return w;
      const lower = w.toLowerCase();
      if (idx > 0 && idx < words.length - 1 && minor.has(lower)) return lower;
      return lower
        .split("-")
        .map((part) => part.replace(/^\p{Ll}/u, (c) => c.toUpperCase()))
        .join("-");
    })
    .join(" ");
}

function stripTrailingCliffhangers(raw: string): string {
  let out = clean(raw).replace(/[,;:.!?\s]+$/, "");
  for (let i = 0; i < 6; i++) {
    const next = out.replace(trailingWeakWords, "").replace(/[,;:.!?\s]+$/, "");
    if (next === out || next.split(/\s+/).length < 2) break;
    out = next;
  }
  return out;
}

/**
 * Synthesizes a standalone, self-contained 2–6 word conceptual title and a
 * non-redundant explanatory detail from prose when no H3 heading is present.
 */
function deriveStandaloneConcept(
  text: string,
  candidateSentence: string,
): { title: string; detailOverride?: string } {
  const full = clean(text);

  // 1. Defined concept pattern: "This change is often described as zero-click search because ..."
  const definedMatch = full.match(
    /\b(?:described as|known as|called|termed|referred to as|defined as)\s+["“]?([a-z0-9][\w\s-]{2,36}?)(?:["”.,;]|(?:\s+(?:because|where|when|which|that|since|as|in)\b))/i,
  );
  if (definedMatch) {
    const rawTerm = stripTrailingCliffhangers(definedMatch[1]);
    const termWords = rawTerm.split(/\s+/).filter(Boolean);
    const title = toHeadlineCase(
      termWords.length <= 2 ? `${rawTerm} Behavior` : rawTerm,
    );
    const afterBecause = full.match(
      /\b(?:described as|known as|called|termed|referred to as|defined as)\s+["“]?[a-z0-9][\w\s-]{2,36}?["”]?\s+because\s+(.+)/i,
    );
    if (afterBecause?.[1]) {
      const rest = clean(afterBecause[1]).replace(/^\p{Ll}/u, (c) =>
        c.toUpperCase(),
      );
      return {
        title,
        detailOverride: /[.!?]$/.test(rest) ? rest : `${rest}.`,
      };
    }
    return { title };
  }

  // 2. Quantitative study / benchmark pattern: "Studies from SparkToro, Datos, and Semrush indicate that approximately 58 to 60 percent of Google searches now end without a click..."
  const studyPctMatch = full.match(
    /\b(?:studies|research|data|reports?|surveys?|analysis)\b.*?\b(?:indicate|show|find|reveal|suggest|estimate)s?\s+that\s+(?:approximately\s+|roughly\s+|about\s+|nearly\s+|over\s+|more\s+than\s+)?(\d+(?:\s*(?:to|–|-)\s*\d+)?)\s*(?:percent|%)\s+of\s+([a-z0-9][\w\s-]{3,32}?)(?:[.,;(]|\s+(?:now\s+|currently\s+|already\s+)?(?:end|result|happen|occur|take|use|rely|are|is|were|was)\b)/i,
  );
  if (studyPctMatch) {
    const pct = studyPctMatch[1].replace(/\s*(?:to|-)\s*/i, "–");
    if (/without a click|zero-click/i.test(full)) {
      return { title: `${pct}% Zero-Click Searches` };
    }
    const subj = stripTrailingCliffhangers(studyPctMatch[2]);
    return { title: toHeadlineCase(`${pct}% ${subj}`) };
  }

  // 3. Explicit colon or em-dash delimiter ("Term — Definition" or "Step 1: Action")
  const delimiter = full.match(/\s[—–]\s|:/);
  const colon = delimiter?.index ?? -1;
  if (colon > 3 && colon < 78) {
    const rawPrefix = full.slice(0, colon).trim();
    const rhs = full.slice(colon + (delimiter?.[0].length || 1)).trim();
    if (/has two (?:meanings|parts|pillars|sides)/i.test(rawPrefix)) {
      const subj = rawPrefix
        .replace(/\s+has two (?:meanings|parts|pillars|sides).*$/i, "")
        .trim();
      return {
        title: `${subj || "Core Topic"}: Two Core Meanings`,
        detailOverride: rhs,
      };
    }
    return {
      title: stripTrailingCliffhangers(rawPrefix),
      detailOverride: rhs,
    };
  }

  // 4. Clean clause compression without splitting inside comma-separated proper-noun lists
  const baseSentence = clean(candidateSentence || full).replace(
    leadingDiscourse,
    "",
  );
  // Check if there is a predicate verb ("is", "focuses on", "helps", "requires", "uses", "combines", "allows", "means")
  const subjectMatch = baseSentence.match(
    /^([A-Z0-9][\w\s&/-]{3,42}?)\s+(?:is|are|was|were|focuses\s+on|helps|enables|requires|means|refers\s+to|combines|connects|provides|allows|turns|supports)\b/,
  );
  if (
    subjectMatch &&
    !/^(?:this|that|these|those|it|they|we|you)\b/i.test(subjectMatch[1].trim())
  ) {
    const candidate = stripTrailingCliffhangers(subjectMatch[1]);
    const words = candidate.split(/\s+/).filter(Boolean);
    if (words.length >= 2 && words.length <= 6) {
      return { title: candidate };
    }
  }

  // Otherwise take the first 5–6 meaningful words and strip trailing weak words/cliffhangers
  const clause = baseSentence.split(/[;—–]|,\s+(?:which|while|because|and|so|but)\b/)[0];
  const words = clause.split(/\s+/).filter(Boolean).slice(0, 6);
  const compressed = stripTrailingCliffhangers(words.join(" "));
  return {
    title: compressed || baseSentence.split(/\s+/).slice(0, 4).join(" "),
  };
}

/**
 * Expands a single dual-meaning definition paragraph into two standalone concept blocks
 * when a section has few blocks and no H3 subheadings.
 */
function expandCompoundBlocks(
  blocks: ArticleSourceBlock[],
): { block: ArticleSourceBlock; presetTitle?: string }[] {
  const hasH3 = blocks.some((b) => Boolean(b.heading));
  if (hasH3) return blocks.map((block) => ({ block }));

  const out: { block: ArticleSourceBlock; presetTitle?: string }[] = [];
  for (const block of blocks) {
    const text = clean(block.text);
    const dualMatch = text.match(
      /^([A-Za-z0-9\s&-]{2,35}?)\s+has\s+two\s+(?:meanings|parts|pillars|sides):\s*(using\s+.+?),\s+and\s+(optimizing\s+.+?)(?:\.\s*(.+))?$/i,
    );
    if (dualMatch) {
      const topic = clean(dualMatch[1]);
      const firstMeaning = clean(dualMatch[2]).replace(/^\p{Ll}/u, (c) =>
        c.toUpperCase(),
      );
      const secondMeaning = clean(dualMatch[3]).replace(/^\p{Ll}/u, (c) =>
        c.toUpperCase(),
      );
      const tail = dualMatch[4] ? ` ${clean(dualMatch[4])}` : "";
      out.push({
        presetTitle: /^ai\s+seo$/i.test(topic) ? "AI-Assisted SEO Workflows" : `${topic} Workflows`,
        block: {
          ...block,
          text: `${/[.!?]$/.test(firstMeaning) ? firstMeaning : `${firstMeaning}.`}${tail}`,
        },
      });
      out.push({
        presetTitle: `AI Search Citation Optimization`,
        block: {
          ...block,
          text: `${/[.!?]$/.test(secondMeaning) ? secondMeaning : `${secondMeaning}.`}${tail}`,
        },
      });
      continue;
    }
    out.push({ block });
  }
  return out;
}

export function buildSectionVisual(
  section: ArticleSourceSection,
  sourceUrl?: string,
): { nodes: BlogInfographicNodeItem[]; brief: VisualBrief } {
  let excluded = 0;
  const eligible: ArticleSourceBlock[] = [];
  for (const b of section.blocks) {
    if (b.kind === "heading" || b.kind === "caption") {
      if (b.kind !== "heading") excluded++;
      continue;
    }
    const rawText = clean(b.text);
    if (
      rawText.length < 32 ||
      personal.test(rawText) ||
      norm(rawText) === norm(section.title)
    ) {
      excluded++;
      continue;
    }
    // Strip conversational filler sentences from narrative paragraphs
    if (b.kind === "paragraph") {
      const keptSentences = sentences(rawText).filter(
        (s) =>
          !personal.test(s) &&
          !conversationalFiller.test(s) &&
          clean(s).length >= 28,
      );
      if (!keptSentences.length) {
        excluded++;
        continue;
      }
      eligible.push({
        ...b,
        text: keptSentences.join(" "),
      });
    } else {
      eligible.push(b);
    }
  }

  const headings = [...new Set(eligible.map((b) => b.heading).filter(Boolean))];
  // Prefer an author's explicit concept summary over treating every supporting H3 as a peer.
  const overviewList = eligible.filter(
    (b) =>
      !b.heading && b.kind === "list" && /^.{3,76}\s[—–]\s.{25,}$/.test(b.text),
  );
  const expanded: { block: ArticleSourceBlock; presetTitle?: string }[] =
    overviewList.length < 2 && headings.length < 2
      ? expandCompoundBlocks(eligible)
      : eligible.map((block) => ({ block, presetTitle: undefined }));

  const groups: { title?: string; blocks: ArticleSourceBlock[] }[] =
    overviewList.length >= 2 && overviewList.length <= 6
      ? overviewList.map((b) => ({ blocks: [b] }))
      : headings.length >= 2
        ? headings.map((title) => ({
            title,
            blocks: eligible.filter((b) => b.heading === title),
          }))
        : (expanded.length === 1
            ? sentences(expanded[0].block.text).map((text) => ({
                title: undefined,
                blocks: [{ ...expanded[0].block, text }],
              }))
            : expanded.map((item) => ({
                title: item.presetTitle,
                blocks: [item.block],
              }))
          );

  const points = groups
    .map((group, i) => {
      const first = group.blocks[0];
      const text = clean(first.text);
      const candidates = group.blocks
        .flatMap((b) =>
          sentences(b.text).map((sentence) => ({ sentence, id: b.id })),
        )
        .filter(
          (x) =>
            !personal.test(x.sentence) &&
            !conversationalFiller.test(x.sentence),
        );

      const provisionalHeading = group.title || "";
      const headingWords = new Set(
        provisionalHeading
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
            (/\b(?:focus(?:es)?|uses?|practice|refers?|means?|helps?|designed|indicate|show|is (?:a|the))\b/i.test(
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

      const primarySentence = chosen[0]?.sentence || text;
      const derived = group.title
        ? { title: group.title, detailOverride: undefined }
        : deriveStandaloneConcept(text, primarySentence);

      const title = derived.title
        .replace(/^what (?:is|are)\s+/i, "")
        .replace(/\s+and (?:why|how)\b.*$/i, "")
        .replace(/:\s+using\b.*$/i, "");

      const detail = (
        derived.detailOverride || chosen.map((c) => c.sentence).join(" ")
      ).trim();

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
  const spec = prismLayoutSpec(layout);
  return {
    ...config,
    visualEngine: "prism-antv",
    prismLayout: spec.id,
    aspectRatio: spec.ratio,
    templateSlug: `prism-${spec.id}`,
    templateName: spec.name,
    renderedPngDataUrl: undefined,
    renderedSvgMarkup: undefined,
  };
}
/** Relationships select geometry; raw word count never stretches a fixed template. */
export function recommendPrismLayout(
  brief: VisualBrief,
  points: number,
): PrismLayout {
  if (brief.relationship === "sequence") return "timeline";
  return points > 3 ? "ribbon" : "editorial";
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
  return withPrismLayout(
    {
      ...section.infographicConfig,
      headline: section.h2Text,
      subheadline: "",

      nodes: result.nodes,
      visualBrief: result.brief,
    },
    section.infographicConfig.prismLayout ||
      recommendPrismLayout(result.brief, result.nodes.length),
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
