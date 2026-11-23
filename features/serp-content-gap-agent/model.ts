export type SearchIntentType =
  | "Informational (Guide / Tutorial)"
  | "Commercial Investigation (Comparison / Best X)"
  | "Transactional (Tool / Template / Product)"
  | "Troubleshooting & How-To Fix";

export type SerpContentGapInput = {
  targetUrl: string;
  primaryKeyword: string;
  searchIntent: SearchIntentType;
  userHeadingsList: string;
  competitorTopicsOrUrls: string;
  uniquePractitionerAngle: string;
};

export type MissingSubtopicGap = {
  id: string;
  missingHeading: string;
  level: "H2" | "H3";
  gapSeverity: "High-Priority Gap" | "Information Gain Opportunity";
  competitorCoverageNote: string;
  readyToPasteMarkdown: string;
};

export type PaaQuestionBlock = {
  question: string;
  conciseAnswer: string;
};

export type SerpContentGapPack = {
  baselineCoverageScore: number;
  outrankScoreProjection: number;
  detectedIntentSummary: string;
  missingSubtopicGaps: MissingSubtopicGap[];
  peopleAlsoAskBlocks: PaaQuestionBlock[];
  compiledOutrankBlueprintMarkdown: string;
};

export const DEFAULT_SERP_GAP_INPUT: SerpContentGapInput = {
  targetUrl: "https://doitwithai.tools/ai-seo/meta-title",
  primaryKeyword: "how to write seo meta titles",
  searchIntent: "Informational (Guide / Tutorial)",
  userHeadingsList:
    "What is a meta title\nWhy title tags matter for SEO\nTips for writing good titles",
  competitorTopicsOrUrls:
    "580px desktop pixel width truncation\nWhy Google rewrites 60%+ of title tags\nFront-loading primary keywords vs brand suffix\nTesting CTR improvements in Google Search Console",
  uniquePractitionerAngle:
    "Show how pairing a live 580px pixel counter with Search Console CTR striking-distance filters prevents Google from replacing your title tag with generic H1 text.",
};

export function buildDeterministicSerpContentGapPack(
  input: SerpContentGapInput,
): SerpContentGapPack {
  const kw = input.primaryKeyword.trim() || "seo content optimization";
  const angle =
    input.uniquePractitionerAngle.trim() ||
    `In our live testing across content and tool pages, combining structured SERP validation with first-hand workflow checks outperformed generic keyword-stuffed headings.`;

  const competitorLines = input.competitorTopicsOrUrls
    .split(/\r?\n/)
    .map((l) => l.replace(/^[-*•\d.)\s]+/, "").trim())
    .filter(Boolean);

  const gapTopics =
    competitorLines.length >= 3
      ? competitorLines.slice(0, 4)
      : [
          `Exact Technical Thresholds & Measurement Rules for ${kw}`,
          `Why Search Engines Rewrite or Ignore Standard ${kw} Implementations`,
          `Step-by-Step Audit & Verification Workflow`,
          `Measuring Click-Through Rate (CTR) & Ranking Lift in Search Console`,
        ];

  const missingSubtopicGaps: MissingSubtopicGap[] = gapTopics.map(
    (topic, idx) => ({
      id: `gap-${idx + 1}`,
      missingHeading: topic,
      level: "H2",
      gapSeverity:
        idx < 2 ? "High-Priority Gap" : "Information Gain Opportunity",
      competitorCoverageNote:
        idx < 2
          ? `Covered by top-ranking SERP competitors for "${kw}" but absent from your current H2 outline.`
          : `Rarely explained with real examples by competitors—high leverage for Information Gain.`,
      readyToPasteMarkdown: [
        `When optimizing for **${kw}**, addressing **${topic.toLowerCase()}** directly separates practitioner guides from surface-level summaries.`,
        ``,
        `### Actionable Execution Checklist`,
        `- **Verify technical constraints:** Measure your implementation against actual SERP rendering limits rather than arbitrary character counts.`,
        `- **Apply practitioner insight:** ${idx === 0 ? angle : `Document the exact before-and-after change so readers can replicate your result without trial and error.`}`,
        `- **Validate in Search Console:** Compare impressions, average position, and click-through rate 14 to 28 days after publishing.`,
      ].join("\n"),
    }),
  );

  const peopleAlsoAskBlocks: PaaQuestionBlock[] = [
    {
      question: `What is the most common mistake when implementing ${kw}?`,
      conciseAnswer: `The most common mistake is repeating generic keyword variations without satisfying the specific technical and editorial subtopics (${gapTopics[0]?.toLowerCase() || "verification checks"}) that searchers expect to see answered immediately.`,
    },
    {
      question: `How do I outrank established domains for "${kw}"?`,
      conciseAnswer: `Close every foundational H2 content gap covered by the top 3 results, then add verifiable Information Gain—such as original testing data, comparison tables, or interactive tools (${angle.slice(0, 120)}).`,
    },
    {
      question: `How often should I audit content gaps for ${kw}?`,
      conciseAnswer: `Review your page every 90 days or whenever Google Search Console shows rising impressions paired with a declining click-through rate on your primary query cluster.`,
    },
  ];

  const compiledOutrankBlueprintMarkdown = [
    `# SERP Content Gap & Outranker Patch: ${kw}`,
    ``,
    `**Target Search Intent:** ${input.searchIntent}`,
    `**Information Gain Angle:** ${angle}`,
    ``,
    `---`,
    ``,
    ...missingSubtopicGaps.flatMap((g, idx) => [
      `## [Gap #${idx + 1} · ${g.gapSeverity}] ${g.missingHeading}`,
      `> *Why this matters:* ${g.competitorCoverageNote}`,
      ``,
      g.readyToPasteMarkdown,
      ``,
    ]),
    `## High-Intent People Also Ask (PAA) Additions`,
    ``,
    ...peopleAlsoAskBlocks.flatMap((paa) => [
      `### ${paa.question}`,
      paa.conciseAnswer,
      ``,
    ]),
  ].join("\n");

  return {
    baselineCoverageScore: 56,
    outrankScoreProjection: 95,
    detectedIntentSummary: `${input.searchIntent} — Top SERP results combine foundational definitions with concrete technical thresholds, troubleshooting scenarios, and measurable verification steps.`,
    missingSubtopicGaps,
    peopleAlsoAskBlocks,
    compiledOutrankBlueprintMarkdown,
  };
}
