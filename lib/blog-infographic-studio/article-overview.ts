import type { ArticleSourceSection, ArticleSourceBlock } from "./article-source";
import type { BlogInfographicConfig, BlogInfographicNodeItem } from "@/lib/blog-writer/canonical-state";
import { assignDistinctSectionIcons } from "./skills/semantic-iconography";

/** A supported editorial overview for articles explaining both meanings of AI SEO. */
export function aiSeoOverview(
  sections: ArticleSourceSection[],
  base: BlogInfographicConfig,
  sourceUrl?: string,
): BlogInfographicConfig | undefined {
  if (!sections.some((section) => /\bAI SEO\b/i.test(section.title))) return;
  const blocks = sections.flatMap((section) => section.blocks);
  const workflow = blocks.find(
    (block) =>
      /content brief/i.test(block.text) &&
      /competitor/i.test(block.text) &&
      /\bAI\b/.test(block.text),
  );
  const discovery = blocks.find((block) =>
    /optimizing your content for answer engines and generative systems/i.test(
      block.text,
    ),
  );
  if (!workflow || !discovery || workflow.id === discovery.id) return;
  return {
    ...base,
    paletteId: "indigo-cyber",
    footerSourceLabel:
      "Source: article passages · review evidence in the source panel",
    id: "ai-seo-overview",
    sectionId: "ai-seo-overview",
    visualEngine: "prism-antv",
    prismLayout: "comparison",
    aspectRatio: "16:9",
    templateSlug: "prism-comparison",
    templateName: "AI SEO explained",
    headline: "Two ways AI changes search work",
    subheadline:
      "Use AI in your workflow. Help answer engines use your content.",
    comparisonLabels: ["Your SEO workflow", "Your content in search"],
    nodes: [
      {
        id: "workflow",
        badge: "AI",
        title: "Create and analyze",
        detail:
          "Draft a content brief or compare competitors with AI tools.",
        icon: "workflow",
        sourceBlockIds: [workflow.id],
      },
      {
        id: "discovery",
        badge: "SEO",
        title: "Help answers find your content",
        detail:
          "Optimize content for answer engines and generative systems.",
        icon: "search",
        sourceBlockIds: [discovery.id],
      },
    ],
    visualBrief: {
      sectionId: "ai-seo-overview",
      sourceUrl,
      relationship: "concepts",
      sourceBlocks: [workflow, discovery],
      excludedBlocks: 0,
      omittedPoints: 0,
      warnings: [
        "This overview combines supporting passages from across the article. Review both sources.",
      ],
    },
    altText:
      "AI SEO combines AI-assisted content work with optimizing content for answer engines.",
    eyebrowLabel: "AI SEO EXPLAINED",
    highlightWords: "AI,search",
    centerLabel: undefined,
    calloutText: undefined,
    calloutBadge: undefined,
    slideCounter: undefined,
    renderedPngDataUrl: undefined,
    renderedSvgMarkup: undefined,
  };
}

/**
 * Synthesizes a cross-article Executive Overview infographic when an article has
 * 3+ substantive sections and does not already match `aiSeoOverview`.
 * Every overview point cites its exact `sourceBlockIds` from the underlying sections.
 */
export function buildUniversalArticleOverview(
  sections: ArticleSourceSection[],
  sectionVisuals: BlogInfographicConfig[],
  base: BlogInfographicConfig,
  sourceUrl?: string,
  domain?: string,
): BlogInfographicConfig | undefined {
  const aiOverview = aiSeoOverview(sections, base, sourceUrl);
  if (aiOverview) return aiOverview;

  if (sectionVisuals.length < 3) return undefined;

  const pickedCards = sectionVisuals.slice(0, 4);
  const citedBlocks: ArticleSourceBlock[] = [];
  const seenBlockIds = new Set<string>();
  const overviewNodes: BlogInfographicNodeItem[] = [];

  for (let i = 0; i < pickedCards.length; i++) {
    const card = pickedCards[i];
    const leadNode = card.nodes[0];
    if (!leadNode) continue;
    const blockIds = leadNode.sourceBlockIds || [];
    const cardBlocks = card.visualBrief?.sourceBlocks || [];
    for (const bid of blockIds) {
      const found = cardBlocks.find((b) => b.id === bid);
      if (found && !seenBlockIds.has(found.id)) {
        seenBlockIds.add(found.id);
        citedBlocks.push(found);
      }
    }
    const shortTitle =
      leadNode.title.length <= 42
        ? leadNode.title
        : card.headline.split(":")[0].trim().slice(0, 42);
    const cleanDetail =
      card.subheadline &&
      card.subheadline.length >= 28 &&
      card.subheadline.length <= 130 &&
      !/^key takeaways synthesized/i.test(card.subheadline)
        ? card.subheadline
        : leadNode.detail;
    overviewNodes.push({
      id: `overview-node-${i + 1}`,
      badge: `0${i + 1}`,
      title: shortTitle,
      detail: cleanDetail,
      metricValue: "",
      icon: leadNode.icon,
      sourceBlockIds: blockIds.length ? blockIds : undefined,
    });
  }

  if (overviewNodes.length < 3 || citedBlocks.length < 2) return undefined;

  const baseTopic = (pickedCards[0]?.headline || "Executive Overview")
    .split(":")[0]
    .trim();
  const overviewHeadline =
    baseTopic.length >= 4 && baseTopic.length <= 36
      ? `${baseTopic}: Complete Visual Playbook`
      : "Executive Summary: Core Pillars";

  const nodesWithIcons = assignDistinctSectionIcons(
    overviewNodes,
    overviewHeadline,
  );

  return {
    ...base,
    id: "article-executive-overview",
    sectionId: "article-executive-overview",
    visualEngine: "prism-antv",
    prismLayout: "editorial",
    aspectRatio: "4:5",
    templateSlug: "prism-editorial",
    templateName: "Executive overview",
    paletteId: base.paletteId || "indigo-cyber",
    headline: overviewHeadline,
    subheadline: `Key takeaways synthesized from ${overviewNodes.length} core sections of the guide.`,
    eyebrowLabel: domain
      ? `EXECUTIVE OVERVIEW · ${domain.toUpperCase().slice(0, 24)}`
      : "EXECUTIVE OVERVIEW · KEY PILLARS",
    nodes: nodesWithIcons,
    visualBrief: {
      sectionId: "article-executive-overview",
      sourceUrl,
      relationship: "concepts",
      sourceBlocks: citedBlocks,
      excludedBlocks: 0,
      omittedPoints: Math.max(0, sectionVisuals.length - overviewNodes.length),
      warnings: [
        "This executive overview combines verified takeaways across the article's main sections.",
      ],
    },
    footerSourceLabel: domain
      ? `Source: ${domain} · multi-section overview`
      : base.footerSourceLabel,
    altText: `${overviewHeadline}: ${nodesWithIcons.map((n) => n.title).join("; ")}`,
    centerLabel: undefined,
    calloutText: undefined,
    calloutBadge: undefined,
    slideCounter: undefined,
    renderedPngDataUrl: undefined,
    renderedSvgMarkup: undefined,
  };
}
