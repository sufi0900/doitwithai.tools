import type { ArticleSourceSection } from "./article-source";
import type { BlogInfographicConfig } from "@/lib/blog-writer/canonical-state";

/** A supported editorial overview for articles explaining both meanings of AI SEO. */
export function aiSeoOverview(
  sections: ArticleSourceSection[],
  base: BlogInfographicConfig,
  sourceUrl?: string,
): BlogInfographicConfig | undefined {
  if (!sections.some(section => /\bAI SEO\b/i.test(section.title))) return;
  const blocks = sections.flatMap(section => section.blocks);
  const workflow = blocks.find(block =>
    /content brief/i.test(block.text) && /competitor/i.test(block.text) && /\bAI\b/.test(block.text),
  );
  const discovery = blocks.find(block =>
    /optimizing your content for answer engines and generative systems/i.test(block.text),
  );
  if (!workflow || !discovery || workflow.id === discovery.id) return;
  return {
    ...base,
    paletteId: "indigo-cyber",
    footerSourceLabel: "Source: article passages · review evidence in the source panel",
    id: "ai-seo-overview",
    sectionId: "ai-seo-overview",
    visualEngine: "prism-antv",
    prismLayout: "comparison",
    aspectRatio: "16:9",
    templateSlug: "prism-comparison",
    templateName: "AI SEO explained",
    headline: "Two ways AI changes search work",
    subheadline: "Use AI in your workflow. Help answer engines use your content.",
    comparisonLabels: ["Your SEO workflow", "Your content in search"],
    nodes: [
      { id: "workflow", badge: "AI", title: "Create and analyze",
        detail: "Draft a content brief or compare competitors with AI tools.",
        icon: "workflow", sourceBlockIds: [workflow.id] },
      { id: "discovery", badge: "SEO", title: "Help answers find your content",
        detail: "Optimize content for answer engines and generative systems.",
        icon: "search", sourceBlockIds: [discovery.id] },
    ],
    visualBrief: {
      sectionId: "ai-seo-overview", sourceUrl, relationship: "concepts",
      sourceBlocks: [workflow, discovery], excludedBlocks: 0, omittedPoints: 0,
      warnings: ["This overview combines supporting passages from across the article. Review both sources."],
    },
    altText: "AI SEO combines AI-assisted content work with optimizing content for answer engines.",
    eyebrowLabel: "AI SEO EXPLAINED",
    highlightWords: "AI,search",
    centerLabel: undefined, calloutText: undefined, calloutBadge: undefined,
    slideCounter: undefined,
    renderedPngDataUrl: undefined, renderedSvgMarkup: undefined,
  };
}
