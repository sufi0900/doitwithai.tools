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

const NON_FAQ_STRUCTURAL_RE =
  /\b(?:framework|explained|architecture|evolution|ranking factors|workflow|vs\.?|versus|myths|mistakes|tools|pillars)\b/i;

const COMPARISON_RE =
  /\b(?:vs\.?|versus|compare|comparison|difference between|trade-?offs?|before and after|pros and cons|which is better)\b/i;

const PROCESS_RE =
  /\b(?:step-by-step|steps?\b|evolution|chronology|workflow|process|pipeline|sequence|how to|guide|roadmap|phases?|stages?)\b/i;

const CHECKLIST_RE =
  /\b(?:checklist|audit|verify|verification|criteria|rules|requirements|must-haves|best practices|quality check|myths|mistakes)\b/i;

const PROMO_BOILERPLATE_RE =
  /\b(?:subscribe(?: to our newsletter)?|leave a (?:reply|comment)|share this (?:post|article)|about the author|related (?:posts|articles|tools)|table of contents|further reading|newsletter|sign up)\b/i;

const INTRO_OR_AUTHOR_NOTE_RE =
  /\b(?:a note before|note before (?:we|you)|before we begin|before you read|about (?:the |this )?author|author['’]?s note|meet the (?:author|founder)|my (?:story|journey)|why i wrote|how i (?:wrote|created|built)|^introduction$)\b/i;

const NARRATIVE_WRAPUP_RE =
  /^(?:conclusion|final thoughts|wrapping up|closing thoughts|in closing|summary and next steps|the bottom line|parting thoughts)(?:\b|[:\s—–-])/i;

const FIRST_PERSON_BACKSTORY_RE =
  /\b(?:i['’]?m |i am |i wrote|i wanted to|i went deeper|i explored|i studied|i analyzed|i also tested|this guide took|in this guide,? (?:i|we)|if you have read other)\b/i;

const META_WRAPUP_RE =
  /\b(?:is not a fixed strategy|it is an ongoing shift|that combination is what defines|by the end,? you will have)\b/i;

/** Returns true when a section is author backstory or narrative wrap-up unsuitable for a standalone infographic. */
export function isPredominantlyPersonalOrNarrative(
  title: string,
  bodyBlocks: SectionIntelligenceBlockLike[] = [],
): boolean {
  const cleanTitle = cleanText(title);
  if (
    INTRO_OR_AUTHOR_NOTE_RE.test(cleanTitle) ||
    NARRATIVE_WRAPUP_RE.test(cleanTitle)
  ) {
    return true;
  }

  const allSentences = bodyBlocks
    .flatMap((b) => cleanText(b.text).split(/(?<=[.!?])\s+/))
    .map((s) => s.trim())
    .filter(Boolean);
  if (!allSentences.length) return false;

  const personalMatches = allSentences.filter(
    (s) => FIRST_PERSON_BACKSTORY_RE.test(s) || META_WRAPUP_RE.test(s),
  ).length;

  const ratio = personalMatches / allSentences.length;
  if (ratio >= 0.35) return true;
  if (bodyBlocks.length <= 12 && personalMatches >= 3 && ratio >= 0.22) {
    return true;
  }
  return false;
}

/** Returns true when a section is an FAQ by heading or by having >= 3 question blocks/subheadings. */
export function isFaqHeadingOrSection(
  title: string,
  blocks: SectionIntelligenceBlockLike[] = [],
): boolean {
  const cleanTitle = cleanText(title);
  if (FAQ_HEADING_RE.test(cleanTitle)) return true;
  if (NON_FAQ_STRUCTURAL_RE.test(cleanTitle)) return false;

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

  return questionCount >= 3;
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

/**
 * Transforms verbose SEO H2 headings (>58 chars) into a crisp infographic
 * headline + explanatory subheadline pair while preserving concise titles verbatim.
 */
export function synthesizeInfographicHeadlineAndSubheadline(
  rawTitle: string,
  articleTitle?: string,
): { headline: string; subheadline: string } {
  const cleaned = rewriteDependentSectionTitle(rawTitle, articleTitle);

  // Bare definitional question: "What Is AI SEO?" or "What Are Answer Engines?"
  const bareWhatIs = cleaned.match(
    /^what\s+(?:is|are)\s+(?:an?\s+|the\s+)?(.{2,44}?)\?$/i,
  );
  if (bareWhatIs) {
    const subject = cleanText(bareWhatIs[1]);
    return {
      headline: `${subject}: Core Pillars & Practical Workflow`,
      subheadline: `How ${subject} works in practice and why it matters.`,
    };
  }

  // Question + descriptive tail: "What Is AI SEO? Definition, Meaning, and Why It Matters in 2026"
  const qMatch = cleaned.match(/^(.{6,56}?\?)\s+(.{8,})$/);
  if (qMatch) {
    const qHead = cleanText(qMatch[1]);
    const qSub = cleanText(qMatch[2]);
    const whatSubject = qHead.match(
      /^what\s+(?:is|are)\s+(?:an?\s+|the\s+)?(.{2,44}?)\?$/i,
    );
    if (whatSubject) {
      const subject = cleanText(whatSubject[1]);
      return {
        headline: `${subject}: ${qSub.length <= 42 ? qSub : "Core Pillars & Workflow"}`,
        subheadline: qSub.length > 42 ? qSub : `Key concepts and practical execution for ${subject}.`,
      };
    }
    return {
      headline: qHead,
      subheadline: qSub,
    };
  }

  if (cleaned.length <= 58) {
    return { headline: cleaned, subheadline: "" };
  }

  // Colon / em-dash split: "E-E-A-T: The Universal Quality Standard That Connects..." or "How to Optimize...: A Practical Strategy..."
  const delimMatch = cleaned.match(/^(.{3,56}?)(?::|\s+[—–])\s+(.{12,})$/);
  if (delimMatch) {
    const head = cleanText(delimMatch[1]);
    let sub = cleanText(delimMatch[2]);
    if (sub.length > 58) {
      const subRelMatch = sub.match(/^(.{18,48}?)\s+that\s+(\w+s)\s+(.+)$/i);
      if (subRelMatch) {
        const stem = subRelMatch[2].replace(/es$/i, "e").replace(/s$/i, "");
        const participle = stem.endsWith("e")
          ? `${stem.slice(0, -1)}ing`
          : `${stem}ing`;
        sub = `${subRelMatch[1]} ${participle.replace(/^\p{Ll}/u, (c) => c.toUpperCase())} ${subRelMatch[3]}`;
      }
    }
    return {
      headline: head,
      subheadline: sub,
    };
  }

  // Relative clause split: "8 AI SEO Ranking Factors That Determine Whether AI Systems Cite Your Content"
  const thatMatch = cleaned.match(/^(.{14,52}?)\s+that\s+(.{18,})$/i);
  if (thatMatch) {
    const rawClause = cleanText(thatMatch[2]);
    const capClause = rawClause.replace(/^\p{Ll}/u, (c) => c.toUpperCase());
    const sub = /^connects\b/i.test(rawClause)
      ? capClause.replace(/^Connects\b/i, "Connecting")
      : `Signals That ${capClause}`;
    return {
      headline: cleanText(thatMatch[1]),
      subheadline: sub,
    };
  }

  return { headline: cleaned, subheadline: "" };
}

/**
 * Derives left/right comparison axis labels from a comparison section title or nodes.
 */
export function extractComparisonLabels(
  sectionTitle: string,
  nodes: { title: string }[] = [],
): [string, string] | undefined {
  const tail = cleanText(sectionTitle).includes(":")
    ? cleanText(sectionTitle).split(":").slice(1).join(":")
    : cleanText(sectionTitle);

  const vsMatch = tail.match(
    /(.{3,38}?)\s+(?:vs\.?|versus)\s+(.{3,42}?)(?:\s+(?:ranking factors|factors|comparison|strategies|approaches|models|tools))?$/i,
  );
  if (vsMatch) {
    const left = cleanText(vsMatch[1]).replace(/^(?:between|comparing)\s+/i, "");
    const right = cleanText(vsMatch[2]).replace(
      /\s+(?:ranking factors|factors|comparison)$/i,
      "",
    );
    if (left.length >= 3 && right.length >= 3) {
      return [left, right];
    }
  }

  if (/\b(?:two worlds|two revolutions|two sides|two parts)\b/i.test(sectionTitle)) {
    return ["Workflow & Creation", "AI Search & Discovery"];
  }

  if (nodes.length >= 2) {
    const a = cleanText(nodes[0].title).slice(0, 28);
    const b = cleanText(nodes[1].title).slice(0, 28);
    if (a && b) return [a, b];
  }

  return ["Traditional Approach", "AI-First Approach"];
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
    PROMO_BOILERPLATE_RE.test(cleanTitle)
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
    section.role === "introduction" ||
    isPredominantlyPersonalOrNarrative(cleanTitle, bodyBlocks)
  ) {
    return {
      archetype: "skip",
      isFaq: false,
      suitabilityScore: 15,
      skipReason: "Author note, narrative introduction, or closing summary unsuitable for a standalone visual.",
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
    combinedText.match(
      /\b\d+(?:\.\d+)?\s*(?:%(?!\w)|(?:percent|x|ms|s|px)\b)/gi,
    ) || [];
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
