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
import { getBlockHeadingLevel, sourceId } from "./article-source";
import { PRISM_LAYOUTS, prismLayoutSpec } from "./layout-registry";
import type { PrismLayout } from "./layout-registry";
import {
  BACKGROUND_PATTERNS,
  CARD_STYLES,
  extractHeadlineHighlightPhrases,
  normalizeSignature,
} from "./appearance";
import type { WebsiteBrandHint } from "./brand-source";
import { assignDistinctSectionIcons } from "./skills/semantic-iconography";
import {
  decontextualizeProse,
  isRhetoricalOrFragmentSentence,
  stripTrailingCliffhangers as stripCopyCliffhangers,
  synthesizeStandaloneTitleAndDetail,
} from "./skills/standalone-copywriter";
import {
  classifySectionArchetype,
  extractComparisonLabels,
  isFaqHeadingOrSection,
  synthesizeInfographicHeadlineAndSubheadline,
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
  /^(?:(?:this|the) (?:timeline|diagram|infographic|illustration|graphic) (?:visualizes|shows|illustrates|depicts)\b|because of this limitation\b|clearing them up\b|you(?:\s+have|[’']ve)?\s+probably\s+noticed\b|you\s+search\b|you\s+decide\s+whether\b|most\s+people\s+only\b|and\s+optimizing\s+your\b|is\s+not\s+a\s+fixed\s+strategy\b|not\s+because\s+the\b|but\s+because\s+most\b|a\s+lot\s+of\s+what\s+you\s+see\b|this\s+guide\s+(?:took|is\s+not)\b|if\s+you\s+have\s+read\s+other\b|instead\s+of\s+treating\b|so\s+i\s+went\s+deeper\b|i\s+wanted\s+to\s+approach\b|i\s+explored\s+how\b|i\s+also\s+tested\b|we(?:\s+have|[’']ve)?\s+seen\s+a\s+(?:huge|big|major|massive|significant|dramatic)\s+(?:change|shift)\b|in\s+recent\s+years,?\s+we\s+have\s+seen\b|but\s+this\s+does\s+not\s+mean\b|that\s+does\s+not\s+mean\b|does\s+this\s+mean\b|let[’']?s\s+(?:look|take\s+a\s+look|dive|start|explore|break\s+down|be\s+honest)\b|here\s+is\s+(?:why|what|how)\s+that\s+matters\b|think\s+about\s+how\s+you\b|so\s+what\s+does\s+this\s+mean\s+for\s+you\b)/i;

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
    if (b.kind === "table") {
      const [headers, ...rows] = b.text
        .split("\n")
        .map((row) => row.split(" | ").map(clean));
      for (const cells of rows) {
        const [label, ...values] = cells;
        if (
          !label ||
          /^\d+(?:[.,]\d+)?%?$/.test(label) ||
          label.length > 72 ||
          cells.length !== headers.length
        )
          continue;
        const detail = values
          .map((value, idx) =>
            value && headers[idx + 1] ? `${headers[idx + 1]}: ${value}` : value,
          )
          .filter(Boolean)
          .join(". ");
        if (detail.length >= 12 && detail.length <= 260) {
          eligible.push({ ...b, kind: "list", heading: label, text: detail });
        }
      }
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

  const primaryHeadings = [
    ...new Set(eligible.map((b) => b.heading).filter(Boolean)),
  ] as string[];
  const subHeadings = [
    ...new Set(eligible.map((b) => b.subheading).filter(Boolean)),
  ] as string[];
  const useSubheadings = primaryHeadings.length < 2 && subHeadings.length >= 2;
  const groupHeading = (b: ArticleSourceBlock) =>
    useSubheadings ? b.subheading : b.heading;
  const rawHeadings = useSubheadings ? subHeadings : primaryHeadings;
  let headings = rawHeadings;
  // When a section has > 6 headings (e.g. Phase 1..7 + child H4s), prioritize major H3/numbered headings
  if (!useSubheadings && rawHeadings.length > 6) {
    const phaseHeadings = rawHeadings.filter((h) =>
      /^(?:phase|step|pillar|stage|myth|mistake|\d+[.):])\s*/i.test(h),
    );
    const h3Headings = [
      ...new Set(
        eligible
          .filter((b) => b.heading && getBlockHeadingLevel(b) !== 4)
          .map((b) => b.heading!),
      ),
    ];
    if (phaseHeadings.length >= 3) {
      headings = phaseHeadings;
    } else if (h3Headings.length >= 2 && h3Headings.length <= 6) {
      headings = h3Headings;
    }
  }

  const overviewList = eligible.filter(
    (b) =>
      !b.heading && b.kind === "list" && /^.{3,76}\s[—–]\s.{25,}$/.test(b.text),
  );
  const expanded: { block: ArticleSourceBlock; presetTitle?: string }[] =
    overviewList.length < 2 && headings.length < 2
      ? expandCompoundBlocks(eligible)
      : eligible.map((block) => ({ block, presetTitle: undefined }));

  let groups: { title?: string; blocks: ArticleSourceBlock[] }[];
  if (overviewList.length >= 2 && overviewList.length <= 6) {
    groups = overviewList.map((b) => ({ blocks: [b] }));
  } else if (headings.length >= 2) {
    if (headings.length < rawHeadings.length) {
      // Fold child heading blocks into the most recent prioritized parent heading
      const selectedSet = new Set(headings);
      const bucketMap = new Map<string, ArticleSourceBlock[]>(
        headings.map((h) => [h, []]),
      );
      let activeKey = "";
      for (const b of eligible) {
        const gh = groupHeading(b);
        if (gh && selectedSet.has(gh)) {
          activeKey = gh;
        }
        if (activeKey && bucketMap.has(activeKey)) {
          bucketMap.get(activeKey)!.push(b);
        }
      }
      groups = headings
        .map((title) => ({ title, blocks: bucketMap.get(title) || [] }))
        .filter((g) => g.blocks.length > 0);
    } else {
      groups = headings
        .map((title) => ({
          title,
          blocks: eligible.filter((b) => groupHeading(b) === title),
        }))
        .filter((g) => g.blocks.length > 0);
    }
  } else if (expanded.length === 1) {
    groups = sentences(expanded[0].block.text).map((text) => ({
      title: undefined,
      blocks: [{ ...expanded[0].block, text }],
    }));
  } else {
    groups = expanded.map((item) => ({
      title: item.presetTitle,
      blocks: [item.block],
    }));
  }

  const points = groups
    .map((group, i) => {
      const first = group.blocks[0];
      const text = clean(group.blocks.map((b) => b.text).join(" "));
      const allCandidates = group.blocks
        .flatMap((b) =>
          sentences(b.text).map((sentence) => ({ sentence, block: b })),
        )
        .filter(
          (x) =>
            !personal.test(x.sentence) &&
            !conversationalFiller.test(x.sentence),
        );
      const nonFragmentCandidates = allCandidates.filter(
        (x) => !isRhetoricalOrFragmentSentence(x.sentence),
      );
      const candidates = nonFragmentCandidates.length
        ? nonFragmentCandidates
        : allCandidates;

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
        .map((c) => {
          const len = c.sentence.length;
          return {
            ...c,
            score:
              (len < 48 ? -12 : 0) +
              (len >= 65 && len <= 185 ? 8 : 0) +
              (/^(?:and|but|or|so)\s+/i.test(c.sentence) ? -10 : 0) +
              (/\b(?:focus(?:es)?|uses?|practice|refers?|means?|helps?|designed|indicate|show|combines?|optimiz|structur|cit(?:e|ed|ation)|authority|ranking|signals?|answers?|is (?:a|the))\b/i.test(
                c.sentence,
              )
                ? 10
                : 0) +
              Math.min(len, 160) / 36 +
              [...headingWords].filter((w) =>
                c.sentence.toLowerCase().includes(w),
              ).length *
                2 -
              Math.max(0, len - 240) / 15,
          };
        })
        .sort((a, b) => b.score - a.score);
      const chosen = (
        ranked.length
          ? ranked
          : candidates.filter((c) => !/[:;]$/.test(c.sentence))
      ).slice(0, 1);

      if (!chosen.length && /[:;]$/.test(text)) return null;
      const primarySentence = chosen[0]?.sentence || text;
      const derived = deriveStandaloneConcept(
        chosen[0]?.block.text || text,
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

      const detail = (derived.detailOverride || primarySentence).trim();

      return {
        id: `point-${sourceId(`${section.id}:${i}:${title}`)}`,
        badge: isFaq
          ? `Q${i + 1}`
          : title.match(/^([A-Z]{2,5})\b/)?.[1] ||
            String(i + 1).padStart(2, "0"),
        title: clean(title),
        detail: detail.replace(/^\p{Ll}/u, (c) => c.toUpperCase()),
        metricValue: "",
        sourceBlockIds: [chosen[0]?.block.id || first.id],
      };
    })
    .filter((n): n is NonNullable<typeof n> =>
      Boolean(n && n.title && n.detail && norm(n.title) !== norm(n.detail)),
    );
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
  if (section.blocks.some((b) => b.kind === "table"))
    warnings.push(
      "Table rows retain their column labels. The full table is available in the source panel.",
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
  const paletteCycle: BlogInfographicConfig["paletteId"][] = [
    "indigo-cyber",
    "blue-trust",
    "emerald-growth",
    "violet-saas",
    "amber-executive",
    "cyan-tech",
    "rose-editorial",
    "slate-minimal",
  ];
  const patternCycle = BACKGROUND_PATTERNS.map((p) => p.id);
  const cardStyleCycle = CARD_STYLES.map((c) => c.id);
  const depthCycle = ["soft", "raised", "layered"] as const;

  const hint = options.brandTheme;
  let prevLayout: PrismLayout | undefined;

  return selected.map(({ section, intel, visual }, idx) => {
    let nodesForSection = visual.nodes;
    let comparisonLabels: [string, string] | undefined;

    const rawComparisonCandidate =
      intel.archetype === "comparison" ||
      /\b(vs\.?|versus|compare|comparison|difference|trade-off|two revolutions|two worlds)\b/i.test(
        section.title,
      );
    const derivedLabels = rawComparisonCandidate
      ? extractComparisonLabels(section.title, nodesForSection)
      : undefined;
    const rightSideToken = derivedLabels?.[1]?.toLowerCase().split(/\s+/)[0] || "";
    const hasBothComparisonSides =
      Boolean(derivedLabels) &&
      (!/vs|versus/i.test(section.title) ||
        nodesForSection.some(
          (n, ni) =>
            ni % 2 === 1 &&
            rightSideToken.length >= 2 &&
            `${n.title} ${n.detail}`.toLowerCase().includes(rightSideToken),
        ));

    let layout: PrismLayout;
    if (intel.isFaq) {
      layout = prevLayout !== "checklist" ? "checklist" : "editorial";
    } else if (hasBothComparisonSides && nodesForSection.length >= 2) {
      if (nodesForSection.length % 2 === 1) {
        nodesForSection = nodesForSection.slice(0, nodesForSection.length - 1);
      }
      layout = "comparison";
      comparisonLabels = derivedLabels;
    } else if (
      visual.brief.relationship === "sequence" &&
      prevLayout !== "timeline"
    ) {
      layout = "timeline";
    } else if (
      /\b(checklist|check|audit|verify|guide|rules|criteria|myths|mistakes)\b/i.test(
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

    const paletteId =
      idx === 0 &&
      base.paletteId !== "blue-trust" &&
      (!hint?.isDark || base.paletteId === "indigo-cyber")
        ? base.paletteId
        : paletteCycle[idx % paletteCycle.length];

    const adjustedTitle =
      visual.brief.omittedPoints > 0
        ? section.title.replace(/^\d+(?=\s)/, (count) =>
            Number(count) === visual.nodes.length + visual.brief.omittedPoints
              ? String(visual.nodes.length)
              : count,
          )
        : section.title;
    const { headline, subheadline } = synthesizeInfographicHeadlineAndSubheadline(
      adjustedTitle,
    );
    const autoHighlights = extractHeadlineHighlightPhrases(headline).join(", ");
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
          paletteId,
          headline,
          subheadline,
          highlightWords: autoHighlights,
          eyebrowLabel,
          centerLabel: undefined,
          calloutText: undefined,
          calloutBadge: undefined,
          comparisonLabels: comparisonLabels || undefined,
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
          nodes: nodesForSection,
          visualBrief: {
            ...visual.brief,
            articleCoverage: options.coverage,
          },
          footerSourceLabel: options.domain
            ? `Source: ${options.domain}`
            : base.footerSourceLabel,
          altText: `${headline}: ${nodesForSection.map((n) => n.title).join("; ")}`,
          extractedBrand: hint || base.extractedBrand,
          signature: {
            ...normalizeSignature(base.signature),
            name: base.signature?.name || hint?.siteName || options.domain || "",
          },
          brand: {
            ...base.brand,
            ...(base.brand?.customColors
              ? { customColors: base.brand.customColors }
              : { customColors: undefined }),
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
