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
import {
  BACKGROUND_PATTERNS,
  CARD_STYLES,
  brandColors,
  extractHeadlineHighlightPhrases,
  normalizeSignature,
} from "./appearance";
import type { WebsiteBrandHint } from "./brand-source";
import { BLOG_INFOGRAPHIC_PALETTES } from "./palettes";
import { assignDistinctSectionIcons } from "./skills/semantic-iconography";
import {
  decontextualizeProse,
  stripTrailingCliffhangers as stripCopyCliffhangers,
  synthesizeStandaloneTitleAndDetail,
} from "./skills/standalone-copywriter";
import {
  classifySectionArchetype,
  isFaqHeadingOrSection,
} from "./skills/topic-intelligence";
import { runInfographicQaCritic } from "./skills/visual-qa-critic";

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

const sentences = (s: string) =>
  clean(s)
    .split(/(?<=[.!?])\s+(?=[\p{Lu}\d])/u)
    .filter(Boolean);

function stripTrailingCliffhangers(raw: string): string {
  return stripCopyCliffhangers(raw);
}

/**
 * Synthesizes a standalone, self-contained 2–5 word conceptual title and a
 * non-redundant explanatory detail from prose when no H3 heading is present.
 */
function deriveStandaloneConcept(
  text: string,
  candidateSentence: string,
  presetTitle?: string,
  isFaq = false,
): { title: string; detailOverride?: string } {
  const result = synthesizeStandaloneTitleAndDetail(
    text,
    candidateSentence,
    presetTitle,
    { isFaq },
  );
  return {
    title: result.title,
    detailOverride: result.detail,
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
        presetTitle: /^ai\s+seo$/i.test(topic)
          ? "AI-Assisted SEO Workflows"
          : `${topic} Workflows`,
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
  const isFaq = isFaqHeadingOrSection(section.title, section.blocks);
  let excluded = 0;
  const eligible: ArticleSourceBlock[] = [];
  for (const b of section.blocks) {
    if (b.kind === "heading" || b.kind === "caption") {
      if (b.kind !== "heading") excluded++;
      continue;
    }
    const rawText = decontextualizeProse(clean(b.text));
    if (
      rawText.length < 24 ||
      personal.test(rawText) ||
      norm(rawText) === norm(section.title)
    ) {
      excluded++;
      continue;
    }
    if (b.kind === "paragraph") {
      const keptSentences = sentences(rawText).filter(
        (s) =>
          !personal.test(s) &&
          !conversationalFiller.test(s) &&
          clean(s).length >= 24,
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
      eligible.push({ ...b, text: rawText });
    }
  }

  const headings = [...new Set(eligible.map((b) => b.heading).filter(Boolean))];
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
        : expanded.length === 1
          ? sentences(expanded[0].block.text).map((text) => ({
              title: undefined,
              blocks: [{ ...expanded[0].block, text }],
            }))
          : expanded.map((item) => ({
              title: item.presetTitle,
              blocks: [item.block],
            }));

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
      const derived = deriveStandaloneConcept(
        text,
        primarySentence,
        group.title,
        isFaq,
      );

      const rawTitle = clean(derived.title).replace(/:\s+using\b.*$/i, "");
      const title =
        isFaq || rawTitle.endsWith("?")
          ? rawTitle
          : stripTrailingCliffhangers(
              rawTitle.replace(/\s+and (?:why|how)\b.*$/i, ""),
            );

      const detail = (
        derived.detailOverride || chosen.map((c) => c.sentence).join(" ")
      ).trim();

      return {
        id: `point-${sourceId(`${section.id}:${i}:${title}`)}`,
        badge: isFaq
          ? `Q${i + 1}`
          : title.match(/^([A-Z]{2,5})\b/)?.[1] ||
            String(i + 1).padStart(2, "0"),
        title: clean(title),
        detail: detail.replace(/^\p{Ll}/u, (c) => c.toUpperCase()),
        metricValue: "",
        sourceBlockIds: [...new Set(chosen.map((c) => c.id))],
      };
    })
    .filter((n) => n.title && n.detail && norm(n.title) !== norm(n.detail));
  const nodes = assignDistinctSectionIcons(points.slice(0, 6), section.title);
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

/**
 * Generates a complete, visually diverse suite of section infographics across all
 * substantive sections of an extracted article, cycling layouts, procedural SVG
 * background shaders, card styles, and 2-tone headline highlights.
 */
export function buildAllArticleSectionVisuals(
  sections: ArticleSourceSection[],
  options: {
    sourceUrl?: string;
    domain?: string;
    coverage?: ArticleSourceCoverage;
    baseConfig?: BlogInfographicConfig;
    brandTheme?: WebsiteBrandHint;
  } = {},
): BlogInfographicConfig[] {
  const base = options.baseConfig || createPrismSample();
  const contentCandidates = sections
    .filter(
      (s) =>
        s.role === "content" && classifySectionArchetype(s).archetype !== "skip",
    )
    .map((section) => ({
      section,
      intel: classifySectionArchetype(section),
      visual: buildSectionVisual(section, options.sourceUrl),
    }))
    .filter((item) => item.visual.nodes.length >= 2);

  const pool =
    contentCandidates.length > 0
      ? contentCandidates
      : sections
          .map((section) => ({
            section,
            intel: classifySectionArchetype(section),
            visual: buildSectionVisual(section, options.sourceUrl),
          }))
          .filter((item) => item.visual.nodes.length >= 2);

  const selected = pool.slice(0, 12);
  const total = selected.length;
  const layoutCycle: PrismLayout[] = [
    "editorial",
    "ribbon",
    "constellation",
    "checklist",
    "timeline",
  ];
  const patternCycle = BACKGROUND_PATTERNS.map((p) => p.id);
  const cardStyleCycle = CARD_STYLES.map((c) => c.id);
  const depthCycle = ["soft", "raised", "layered"] as const;

  const hint = options.brandTheme;
  const resolvedPaletteId =
    hint?.isDark && BLOG_INFOGRAPHIC_PALETTES[base.paletteId]?.isLight
      ? "indigo-cyber"
      : base.paletteId;
  const useDark =
    hint?.isDark ?? !BLOG_INFOGRAPHIC_PALETTES[resolvedPaletteId]?.isLight;
  const brandCustomColors = hint?.accent
    ? brandColors(hint.accent, useDark)
    : base.brand?.customColors;

  let prevLayout: PrismLayout | undefined;

  return selected.map(({ section, intel, visual }, idx) => {
    let layout: PrismLayout;
    if (intel.isFaq) {
      layout = prevLayout !== "checklist" ? "checklist" : "editorial";
    } else if (
      /\b(vs\.?|versus|compare|comparison|difference|trade-off)\b/i.test(
        section.title,
      ) &&
      visual.nodes.length % 2 === 0
    ) {
      layout = "comparison";
    } else if (
      visual.brief.relationship === "sequence" &&
      prevLayout !== "timeline"
    ) {
      layout = "timeline";
    } else if (
      /\b(checklist|check|audit|verify|guide|rules|criteria)\b/i.test(
        section.title,
      ) &&
      prevLayout !== "checklist"
    ) {
      layout = "checklist";
    } else {
      layout = layoutCycle[idx % layoutCycle.length];
      if (layout === prevLayout) {
        layout = layoutCycle[(idx + 1) % layoutCycle.length];
      }
    }
    prevLayout = layout;

    const autoHighlights = extractHeadlineHighlightPhrases(section.title).join(
      ", ",
    );
    const domainLabel = (
      hint?.siteName ||
      options.domain ||
      "Article Playbook"
    ).slice(0, 32);

    const cardStyle = intel.isFaq
      ? "bordered-bento"
      : cardStyleCycle[idx % cardStyleCycle.length];
    const eyebrowLabel = intel.isFaq
      ? intel.recommendedEyebrow || "FAQ PLAYBOOK · KEY QUESTIONS"
      : total > 1
        ? `SECTION ${String(idx + 1).padStart(2, "0")} · ${domainLabel.toUpperCase()}`
        : undefined;

    return runInfographicQaCritic(
      withPrismLayout(
        {
          ...base,
          id: `sec-vis-${section.id}-${idx + 1}`,
          sectionId: section.id,
          paletteId: resolvedPaletteId,
          headline: section.title,
          subheadline: "",
          highlightWords: autoHighlights,
          eyebrowLabel,
          slideCounter:
            total > 1
              ? `${String(idx + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`
              : undefined,
          backgroundPattern: patternCycle[idx % patternCycle.length],
          cardStyle,
          fontFamily: base.fontFamily || "inter-jakarta",
          secondaryAccent: hint?.secondaryAccent || base.secondaryAccent,
          depth: {
            preset: depthCycle[idx % depthCycle.length],
            strength: 65,
          },
          nodes: visual.nodes,
          visualBrief: {
            ...visual.brief,
            articleCoverage: options.coverage,
          },
          footerSourceLabel: options.domain
            ? `Source: ${options.domain}`
            : base.footerSourceLabel,
          altText: `${section.title}: ${visual.nodes.map((n) => n.title).join("; ")}`,
          extractedBrand: hint || base.extractedBrand,
          signature: {
            ...normalizeSignature(base.signature),
            name: base.signature?.name || hint?.siteName || options.domain || "",
          },
          brand: {
            ...base.brand,
            ...(brandCustomColors ? { customColors: brandCustomColors } : {}),
          },
        },
        layout,
      ),
    );
  });
}

/**
 * Cycles a section infographic through a fresh combination of layout,
 * procedural background pattern, card surface style, and 2-tone highlights.
 */
export function shuffleInfographicVisualVariation(
  config: BlogInfographicConfig,
  step = 1,
): BlogInfographicConfig {
  const nonComparisonLayouts = PRISM_LAYOUTS.filter(
    (l) => l.id !== "comparison" || config.nodes.length % 2 === 0,
  ).map((l) => l.id);
  const currLayoutIdx = Math.max(
    0,
    nonComparisonLayouts.indexOf(config.prismLayout || "editorial"),
  );
  const nextLayout =
    nonComparisonLayouts[(currLayoutIdx + step) % nonComparisonLayouts.length];

  const patterns = BACKGROUND_PATTERNS.map((p) => p.id);
  const currPatIdx = Math.max(
    0,
    patterns.indexOf(config.backgroundPattern || "dots-glow"),
  );
  const nextPattern = patterns[(currPatIdx + step) % patterns.length];

  const styles = CARD_STYLES.map((c) => c.id);
  const currStyleIdx = Math.max(
    0,
    styles.indexOf(config.cardStyle || "glass-editorial"),
  );
  const nextStyle = styles[(currStyleIdx + step) % styles.length];

  const highlights =
    config.highlightWords ??
    extractHeadlineHighlightPhrases(config.headline).join(", ");

  return withPrismLayout(
    {
      ...config,
      backgroundPattern: nextPattern,
      cardStyle: nextStyle,
      highlightWords: highlights,
    },
    nextLayout,
  );
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
  return runInfographicQaCritic(
    withPrismLayout(
      {
        ...section.infographicConfig,
        headline: section.h2Text,
        subheadline: "",
        nodes: result.nodes,
        visualBrief: result.brief,
      },
      section.infographicConfig.prismLayout ||
        recommendPrismLayout(result.brief, result.nodes.length),
    ),
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
