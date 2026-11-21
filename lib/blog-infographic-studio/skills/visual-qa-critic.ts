/**
 * Layer 6: Automated 12-Point Pre-Render Visual & Copy QA Critic
 *
 * Audits and auto-repairs a compiled BlogInfographicConfig before SVG/Canvas
 * synthesis so every output has crisp standalone headlines, clean 2-tone highlights,
 * zero title-body duplication, zero dangling cliffhangers, zero leading punctuation,
 * zero anaphoric dangling pronouns, distinct sibling icons, preserved FAQ questions
 * with Q1..Qn badges, and word-boundary-safe bottom callouts.
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
import {
  extractArticleSubject,
  isFaqHeadingOrSection,
  rewriteDependentSectionTitle,
} from "./topic-intelligence";

function trimAtWordBoundary(text: string, maxChars: number): string {
  const cleaned = text.trim();
  if (cleaned.length <= maxChars) return cleaned;
  const sliced = cleaned.slice(0, maxChars);
  const lastSpace = sliced.lastIndexOf(" ");
  return (lastSpace > 14 ? sliced.slice(0, lastSpace) : sliced).replace(
    /[\s,:;–—-]+$/,
    "",
  );
}

function stripLeadingPunctuation(raw: string): string {
  return String(raw || "")
    .replace(/^[\s.,;:!?\-–—•·]+/, "")
    .trim();
}

function synthesizeCalloutText(
  config: BlogInfographicConfig,
  isFaq = false,
): string {
  if (isFaq) {
    return `Review all ${config.nodes.length} verified answers before applying changes.`;
  }
  const headlineCore = trimAtWordBoundary(
    decontextualizeProse(config.headline)
      .split(":")[0]
      .replace(/[?.!]+$/, "")
      .trim(),
    38,
  );
  if (config.prismLayout === "comparison" || config.prismLayout === "quadrant-matrix") {
    return `Balance both sides of ${headlineCore} for durable search visibility.`;
  }
  if (
    config.prismLayout === "timeline" ||
    config.prismLayout === "pipeline-flow" ||
    config.prismLayout === "funnel-stages"
  ) {
    return `Follow each stage of ${headlineCore} in sequence for reliable execution.`;
  }
  if (config.prismLayout === "split-equation") {
    const t0 = trimAtWordBoundary(config.nodes[0]?.title || "Workflow", 24);
    const t1 = trimAtWordBoundary(config.nodes[1]?.title || "Discovery", 24);
    return `${headlineCore} = ${t0} + ${t1}`;
  }
  return `Apply these ${config.nodes.length} pillars of ${headlineCore} with verified evidence.`;
}

/**
 * Runs deterministic pre-render QA checks across copy, FAQ preservation,
 * 2-tone highlight phrases, sibling icon uniqueness, and bottom callout anchoring.
 */
export function runInfographicQaCritic(
  config: BlogInfographicConfig,
  articleTitle?: string,
): BlogInfographicConfig {
  const rawHeadline = stripLeadingPunctuation(
    decontextualizeProse(config.headline) || config.headline,
  );
  const cleanHeadline = rewriteDependentSectionTitle(rawHeadline, articleTitle);
  const cleanSubheadline = config.subheadline
    ? stripLeadingPunctuation(decontextualizeProse(config.subheadline))
    : "";

  const subject =
    extractArticleSubject(articleTitle) ||
    extractArticleSubject(cleanHeadline);

  const isFaq =
    isFaqHeadingOrSection(cleanHeadline) ||
    config.nodes.filter((n) => n.title.trim().endsWith("?")).length >= 2;

  const repairedNodes = config.nodes.map((node, idx) => {
    const cleanTitle = stripLeadingPunctuation(
      decontextualizeProse(node.title),
    );
    const cleanDetail = stripLeadingPunctuation(
      decontextualizeProse(node.detail),
    );

    let nextTitle = rewriteDependentSectionTitle(
      cleanTitle || node.title,
      subject || articleTitle,
    );
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
      nextTitle = rewriteDependentSectionTitle(
        stripLeadingPunctuation(synthesized.title || nextTitle),
        subject || articleTitle,
      );
      nextDetail = stripLeadingPunctuation(synthesized.detail || nextDetail);
    }

    // Ensure card detail starts with an uppercase letter or digit after leading punctuation removal
    nextDetail = stripLeadingPunctuation(nextDetail).replace(
      /^\p{Ll}/u,
      (c) => c.toUpperCase(),
    );

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
    (diversifiedNodes.length <= 3 ||
      config.prismLayout === "pipeline-flow" ||
      config.prismLayout === "split-equation") &&
    !config.calloutText?.trim();

  return {
    ...config,
    headline: cleanHeadline,
    subheadline: cleanSubheadline,
    highlightWords: nextHighlights,
    ...(eyebrowLabel ? { eyebrowLabel } : {}),
    ...(shouldSynthesizeCallout
      ? {
          calloutBadge:
            config.calloutBadge?.trim() ||
            (config.prismLayout === "split-equation"
              ? "DEFINITION"
              : "KEY TAKEAWAY"),
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
            ? {
                calloutText: stripLeadingPunctuation(
                  decontextualizeProse(config.calloutText),
                ),
              }
            : {}),
        }),
    nodes: diversifiedNodes,
  };
}
