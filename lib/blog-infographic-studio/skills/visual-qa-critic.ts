/**
 * Layer 6: Automated 12-Point Pre-Render Visual & Copy QA Critic
 *
 * Audits and auto-repairs a compiled BlogInfographicConfig before SVG/Canvas
 * synthesis so every output has crisp standalone headlines, clean 2-tone highlights,
 * zero title-body duplication, zero dangling cliffhangers, distinct sibling icons,
 * preserved FAQ questions with Q1..Qn badges, and balanced 2–3 card bottom callouts.
 */
import type { BlogInfographicConfig } from "@/lib/blog-writer/canonical-state";
import { assignDistinctSectionIcons } from "./semantic-iconography";
import {
  decontextualizeProse,
  hasTitleBodyDuplication,
  hasTrailingCliffhanger,
  scoreHeadlineHighlightPhrases,
  synthesizeStandaloneTitleAndDetail,
} from "./standalone-copywriter";
import { isFaqHeadingOrSection } from "./topic-intelligence";

function synthesizeCalloutText(
  config: BlogInfographicConfig,
  isFaq = false,
): string {
  if (isFaq) {
    return `Review all ${config.nodes.length} verified answers before applying changes.`;
  }
  const headlineCore = decontextualizeProse(config.headline)
    .split(":")[0]
    .replace(/[?.!]+$/, "")
    .trim()
    .slice(0, 44);
  if (config.prismLayout === "comparison") {
    return `Balance both sides of ${headlineCore} for durable search visibility.`;
  }
  if (config.prismLayout === "timeline") {
    return `Follow each phase of ${headlineCore} in sequence for reliable execution.`;
  }
  return `Apply these ${config.nodes.length} pillars of ${headlineCore} together with verified evidence.`;
}

/**
 * Runs deterministic pre-render QA checks across copy, FAQ preservation,
 * 2-tone highlight phrases, sibling icon uniqueness, and bottom callout anchoring.
 */
export function runInfographicQaCritic(
  config: BlogInfographicConfig,
): BlogInfographicConfig {
  const cleanHeadline = decontextualizeProse(config.headline) || config.headline;
  const cleanSubheadline = config.subheadline
    ? decontextualizeProse(config.subheadline)
    : "";

  const isFaq =
    isFaqHeadingOrSection(cleanHeadline) ||
    config.nodes.filter((n) => n.title.trim().endsWith("?")).length >= 2;

  const repairedNodes = config.nodes.map((node, idx) => {
    const cleanTitle = decontextualizeProse(node.title).trim();
    const cleanDetail = decontextualizeProse(node.detail).trim();

    let nextTitle = cleanTitle || node.title;
    let nextDetail = cleanDetail || node.detail;

    if (
      hasTrailingCliffhanger(nextTitle) ||
      hasTitleBodyDuplication(nextTitle, nextDetail) ||
      /\b(?:above|below|earlier)\b/i.test(node.title + " " + node.detail)
    ) {
      const synthesized = synthesizeStandaloneTitleAndDetail(
        nextDetail,
        nextDetail,
        nextTitle,
        { isFaq, index: idx },
      );
      nextTitle = synthesized.title || nextTitle;
      nextDetail = synthesized.detail || nextDetail;
    }

    const badge = isFaq
      ? `Q${idx + 1}`
      : node.badge?.trim() || String(idx + 1).padStart(2, "0");

    return {
      ...node,
      badge,
      title: nextTitle,
      detail: nextDetail,
    };
  });

  const diversifiedNodes = assignDistinctSectionIcons(
    repairedNodes,
    cleanHeadline,
  );

  const nextHighlights = scoreHeadlineHighlightPhrases(
    cleanHeadline,
    config.highlightWords?.trim() ? config.highlightWords : undefined,
  ).join(", ");

  const eyebrowLabel =
    config.eyebrowLabel?.trim() ||
    (isFaq ? "FAQ PLAYBOOK · KEY QUESTIONS" : undefined);

  const shouldSynthesizeCallout =
    diversifiedNodes.length <= 3 && !config.calloutText?.trim();

  return {
    ...config,
    headline: cleanHeadline,
    subheadline: cleanSubheadline,
    highlightWords: nextHighlights,
    ...(eyebrowLabel ? { eyebrowLabel } : {}),
    ...(shouldSynthesizeCallout
      ? {
          calloutBadge: config.calloutBadge?.trim() || "KEY TAKEAWAY",
          calloutText: synthesizeCalloutText(
            {
              ...config,
              headline: cleanHeadline,
              subheadline: cleanSubheadline,
              nodes: diversifiedNodes,
            },
            isFaq,
          ),
        }
      : {
          ...(config.calloutText
            ? { calloutText: decontextualizeProse(config.calloutText) }
            : {}),
        }),
    nodes: diversifiedNodes,
  };
}
