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
  const sub = config.subheadline?.trim();
  if (sub && sub.length >= 16 && sub.length <= 68) {
    return decontextualizeProse(sub);
  }
  if (isFaq) {
    return `Review all ${config.nodes.length} verified answers before applying changes.`;
  }
  const titles = config.nodes
    .slice(0, 3)
    .map((n) => n.title.replace(/[?.!]+$/, "").trim())
    .filter(Boolean);
  if (titles.length >= 2) {
    const three = titles.join(" · ");
    if (three.length <= 68) return three;
    const two = titles.slice(0, 2).join(" · ");
    if (two.length <= 68) return two;
    return `${titles[0].slice(0, 62)}`;
  }
  const headline = decontextualizeProse(config.headline);
  return `Apply ${headline.slice(0, 52)} consistently.`;
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
