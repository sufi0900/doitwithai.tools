/**
 * Layer 1: Topic Intelligence, Section Suitability & Archetype Router
 *
 * Classifies extracted article or writer sections into visual archetypes,
 * detects FAQ sections (by heading or Q&A subheading structure), filters out
 * low-value boilerplate sections, and normalizes context-dependent headings
 * so every infographic stands on its own.
 */

export type SectionArchetype =
  | "faq"
  | "process"
  | "comparison"
  | "checklist"
  | "data-metrics"
  | "framework"
  | "skip";

export type RecommendedPrismLayout =
  | "editorial"
  | "constellation"
  | "ribbon"
  | "timeline"
  | "comparison"
  | "checklist";

export interface SectionIntelligenceBlockLike {
  text: string;
  kind?: string;
  heading?: string;
}

export interface SectionIntelligenceInput {
  title: string;
  role?: "content" | "introduction" | "promotional";
  blocks?: SectionIntelligenceBlockLike[];
}

export interface SectionIntelligenceResult {
  archetype: SectionArchetype;
  isFaq: boolean;
  suitabilityScore: number;
  skipReason?: string;
  recommendedPrismLayout: RecommendedPrismLayout;
  recommendedTitle: string;
  recommendedEyebrow?: string;
}

const cleanText = (s: string) => (s || "").replace(/\s+/g, " ").trim();

const QUESTION_RE =
  /^(?:what|why|how|when|where|who|which|can|could|should|shall|does|do|did|is|are|was|were|will|would|have|has|may|might)\b.*\?$/i;

const FAQ_HEADING_RE =
  /\b(?:faq|frequently asked|common questions|q\s*&\s*a|questions answered|reader questions|key questions)\b/i;

const COMPARISON_RE =
  /\b(?:vs\.?|versus|compare|comparison|difference between|trade-?offs?|before and after|pros and cons|which is better)\b/i;

const PROCESS_RE =
  /\b(?:step-by-step|steps?\b|workflow|process|pipeline|sequence|how to|guide|roadmap|phases?|stages?)\b/i;

const CHECKLIST_RE =
  /\b(?:checklist|audit|verify|verification|criteria|rules|requirements|must-haves|best practices|quality check)\b/i;

const PROMO_BOILERPLATE_RE =
  /\b(?:subscribe(?: to our newsletter)?|leave a (?:reply|comment)|share this (?:post|article)|about the author|related (?:posts|articles|tools)|table of contents|further reading|newsletter|sign up)\b/i;

const NARRATIVE_WRAPUP_RE =
  /^(?:conclusion|final thoughts|wrapping up|summary and next steps|closing thoughts|before we begin|note before you start)$/i;

/** Returns true when a section is an FAQ by heading or by having >= 2 question blocks/subheadings. */
export function isFaqHeadingOrSection(
  title: string,
  blocks: SectionIntelligenceBlockLike[] = [],
): boolean {
  const cleanTitle = cleanText(title);
  if (FAQ_HEADING_RE.test(cleanTitle)) return true;

  const uniqueHeadings = new Set<string>();
  let questionCount = 0;

  for (const b of blocks) {
    const candidate = cleanText(b.kind === "heading" ? b.text : b.heading || "");
    if (candidate && !uniqueHeadings.has(candidate)) {
      uniqueHeadings.add(candidate);
      if (candidate.endsWith("?") || QUESTION_RE.test(candidate)) {
        questionCount++;
      }
    }
    const leadSentence = cleanText(b.text).split(/(?<=[.!?])\s+/)[0] || "";
    if (
      b.kind !== "heading" &&
      !b.heading &&
      (leadSentence.endsWith("?") || QUESTION_RE.test(leadSentence))
    ) {
      questionCount++;
    }
  }

  return questionCount >= 2;
}

/**
 * Normalizes dependent or numbered section headings into clean, standalone
 * infographic headlines without altering already strong technical headings.
 */
export function rewriteDependentSectionTitle(
  title: string,
  articleTitle?: string,
): string {
  let out = cleanText(title)
    .replace(/^(?:step|part|phase|section)\s+\d+\s*[:.\-–—]\s*/i, "")
    .replace(/^\d+\s*[.)\-–—]\s+/, "")
    .trim();

  if (!out) return cleanText(articleTitle || "Key Concepts");

  if (/\b(?:this|that) (?:section|step|approach)\b/i.test(out) && articleTitle) {
    const shortTopic = cleanText(articleTitle)
      .split(/[:|\-–—]/)[0]
      .trim()
      .split(/\s+/)
      .slice(0, 4)
      .join(" ");
    if (shortTopic.length >= 6) {
      out = out.replace(
        /\b(?:this|that) (?:section|step|approach)\b/gi,
        shortTopic,
      );
    }
  }

  return out;
}

/** Classifies a section into its visual archetype, suitability score, and recommended layout. */
export function classifySectionArchetype(
  section: SectionIntelligenceInput,
  articleTitle?: string,
): SectionIntelligenceResult {
  const cleanTitle = cleanText(section.title);
  const recommendedTitle = rewriteDependentSectionTitle(cleanTitle, articleTitle);
  const blocks = section.blocks || [];
  const bodyBlocks = blocks.filter((b) => b.kind !== "heading");
  const combinedText = `${cleanTitle} ${bodyBlocks.map((b) => b.text).join(" ")}`;

  if (
    section.role === "promotional" ||
    (PROMO_BOILERPLATE_RE.test(cleanTitle) && bodyBlocks.length < 3)
  ) {
    return {
      archetype: "skip",
      isFaq: false,
      suitabilityScore: 15,
      skipReason: "Promotional or navigational boilerplate without standalone educational takeaways.",
      recommendedPrismLayout: "editorial",
      recommendedTitle,
    };
  }

  if (
    (section.role === "introduction" || NARRATIVE_WRAPUP_RE.test(cleanTitle)) &&
    bodyBlocks.length < 2
  ) {
    return {
      archetype: "skip",
      isFaq: false,
      suitabilityScore: 25,
      skipReason: "Narrative transition without enough standalone structured points.",
      recommendedPrismLayout: "editorial",
      recommendedTitle,
    };
  }

  const isFaq = isFaqHeadingOrSection(cleanTitle, blocks);
  if (isFaq) {
    return {
      archetype: "faq",
      isFaq: true,
      suitabilityScore: 90,
      recommendedPrismLayout: "checklist",
      recommendedTitle: FAQ_HEADING_RE.test(recommendedTitle)
        ? cleanTitle
        : `${recommendedTitle} · Key Questions`,
      recommendedEyebrow: "FAQ PLAYBOOK · KEY QUESTIONS",
    };
  }

  if (COMPARISON_RE.test(cleanTitle)) {
    return {
      archetype: "comparison",
      isFaq: false,
      suitabilityScore: 92,
      recommendedPrismLayout: "comparison",
      recommendedTitle,
      recommendedEyebrow: "SIDE-BY-SIDE COMPARISON",
    };
  }

  if (PROCESS_RE.test(cleanTitle)) {
    return {
      archetype: "process",
      isFaq: false,
      suitabilityScore: 94,
      recommendedPrismLayout: "timeline",
      recommendedTitle,
      recommendedEyebrow: "STEP-BY-STEP WORKFLOW",
    };
  }

  if (CHECKLIST_RE.test(cleanTitle)) {
    return {
      archetype: "checklist",
      isFaq: false,
      suitabilityScore: 91,
      recommendedPrismLayout: "checklist",
      recommendedTitle,
      recommendedEyebrow: "ACTION CHECKLIST",
    };
  }

  const metricMatches =
    combinedText.match(/\b\d+(?:\.\d+)?\s*(?:%|percent|x|ms|s|px)\b/gi) || [];
  if (metricMatches.length >= 2) {
    return {
      archetype: "data-metrics",
      isFaq: false,
      suitabilityScore: 88,
      recommendedPrismLayout: "ribbon",
      recommendedTitle,
      recommendedEyebrow: "KEY BENCHMARKS & SIGNALS",
    };
  }

  const headingsCount = new Set(blocks.map((b) => b.heading).filter(Boolean)).size;
  const score = Math.min(
    98,
    60 + Math.min(bodyBlocks.length, 6) * 4 + Math.min(headingsCount, 4) * 5,
  );

  return {
    archetype: "framework",
    isFaq: false,
    suitabilityScore: score,
    recommendedPrismLayout: "editorial",
    recommendedTitle,
  };
}
