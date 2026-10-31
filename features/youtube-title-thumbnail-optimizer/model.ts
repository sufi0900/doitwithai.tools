export type YoutubeTitleInput = {
  topicOrKeyword: string;
  draftTitle: string;
  thumbnailOverlayText: string;
  channelName: string;
  targetAudience: string;
  videoDuration: string;
};

export type YoutubeTitleVariation = {
  framework:
    | "Curiosity & Open Loop"
    | "Quantified Benchmark / Case Study"
    | "Mistake / Warning Hook"
    | "Step-by-Step Blueprint"
    | "Time-Bound Challenge";
  title: string;
  charCount: number;
  thumbnailText: string;
  whyItClicks: string;
};

export type YoutubeAuditCheck = {
  label: string;
  passed: boolean;
  detail: string;
};

export type YoutubeTitleResult = {
  charCount: number;
  mobilePreviewTitle: string;
  desktopPreviewTitle: string;
  thumbnailWordCount: number;
  overlapWarning: boolean;
  ctrScore: number;
  checks: YoutubeAuditCheck[];
  variations: YoutubeTitleVariation[];
};

export const DEFAULT_YOUTUBE_TITLE_INPUT: YoutubeTitleInput = {
  topicOrKeyword: "Technical SEO Audit",
  draftTitle:
    "How I Audited 310 Websites and Fixed Their Biggest Technical SEO Mistakes in 15 Minutes",
  thumbnailOverlayText: "310 SITES AUDITED",
  channelName: "Do It With AI Studio",
  targetAudience: "SEO specialists, founders, and content marketers",
  videoDuration: "14:28",
};

export function buildDeterministicYoutubeVariations(
  input: YoutubeTitleInput,
): YoutubeTitleVariation[] {
  const kw = input.topicOrKeyword.trim() || "SEO Strategy";
  return [
    {
      framework: "Quantified Benchmark / Case Study",
      title: `I Tested ${kw} on 50 Websites — Here's What Actually Worked`,
      charCount: `I Tested ${kw} on 50 Websites — Here's What Actually Worked`.length,
      thumbnailText: "50 SITES TESTED",
      whyItClicks:
        "Pairs first-hand proof ('I Tested 50 Websites') with a 3-word high-contrast thumbnail badge.",
    },
    {
      framework: "Mistake / Warning Hook",
      title: `Stop Doing ${kw} Like It's 2023 (Do This Instead)`,
      charCount: `Stop Doing ${kw} Like It's 2023 (Do This Instead)`.length,
      thumbnailText: "STOP DOING THIS",
      whyItClicks:
        "Triggers loss aversion and urgency while keeping total length under the 60-character mobile cutoff.",
    },
    {
      framework: "Step-by-Step Blueprint",
      title: `The Complete ${kw} Workflow (Step-by-Step in 15 Minutes)`,
      charCount: `The Complete ${kw} Workflow (Step-by-Step in 15 Minutes)`.length,
      thumbnailText: "15-MIN WORKFLOW",
      whyItClicks:
        "Front-loads the exact search keyword for YouTube Search while promising a bounded time investment.",
    },
    {
      framework: "Curiosity & Open Loop",
      title: `Why 90% of ${kw} Advice Fails (And the 1 Fix That Works)`,
      charCount: `Why 90% of ${kw} Advice Fails (And the 1 Fix That Works)`.length,
      thumbnailText: "90% GET IT WRONG",
      whyItClicks:
        "Contrarian hook that performs strongly in YouTube Home and Suggested feeds.",
    },
    {
      framework: "Time-Bound Challenge",
      title: `How to Master ${kw} From Scratch (No Paid Tools Needed)`,
      charCount: `How to Master ${kw} From Scratch (No Paid Tools Needed)`.length,
      thumbnailText: "$0 TOOL STACK",
      whyItClicks:
        "Removes the price objection right in the title and highlights '$0 TOOL STACK' on the thumbnail.",
    },
  ];
}

export function analyzeYoutubeTitleAndThumbnail(
  input: YoutubeTitleInput,
): YoutubeTitleResult {
  const title = input.draftTitle.trim();
  const thumb = input.thumbnailOverlayText.trim();
  const kw = input.topicOrKeyword.trim().toLowerCase();

  const charCount = title.length;
  const mobilePreviewTitle =
    charCount > 58 ? `${title.slice(0, 56).trimEnd()}…` : title;
  const desktopPreviewTitle =
    charCount > 70 ? `${title.slice(0, 68).trimEnd()}…` : title;

  const thumbWords = thumb ? thumb.split(/\s+/).filter(Boolean) : [];
  const thumbnailWordCount = thumbWords.length;

  // Check if thumbnail text merely repeats the exact opening words of the title
  const normTitle = title.toLowerCase().replace(/[^a-z0-9\s]/g, "");
  const normThumb = thumb.toLowerCase().replace(/[^a-z0-9\s]/g, "");
  const overlapWarning =
    thumbWords.length >= 3 && normTitle.startsWith(normThumb);

  const hasKeyword = kw.length > 0 && title.toLowerCase().includes(kw);
  const hasNumberOrBracket = /\d|\(|\)|\[|\]/.test(title);
  const safeMobileLength = charCount >= 35 && charCount <= 62;
  const safeThumbLength = thumbnailWordCount >= 2 && thumbnailWordCount <= 5;

  const checks: YoutubeAuditCheck[] = [
    {
      label: "Mobile & Suggested Feed Safe Length (35–62 chars)",
      passed: safeMobileLength,
      detail:
        charCount <= 62
          ? `${charCount} chars — zero truncation on mobile & suggested sidebars.`
          : `${charCount} chars — last ${charCount - 58} chars will cut off with '…' on mobile feeds.`,
    },
    {
      label: "Primary Keyword Inclusion",
      passed: hasKeyword,
      detail: hasKeyword
        ? `Includes target topic '${input.topicOrKeyword.trim()}'.`
        : `Add '${input.topicOrKeyword.trim()}' near the front of the title for YouTube Search discovery.`,
    },
    {
      label: "Thumbnail Overlay Brevity (2–5 Words)",
      passed: safeThumbLength,
      detail: `${thumbnailWordCount} words on thumbnail (${safeThumbLength ? "reads in < 0.5 seconds" : "keep between 2 and 5 bold words"}).`,
    },
    {
      label: "Title + Thumbnail Synergy (No Redundant Copy-Paste)",
      passed: !overlapWarning,
      detail: overlapWarning
        ? "Thumbnail text repeats the exact start of your title—use the thumbnail to add a visual hook or proof metric instead."
        : "Thumbnail text complements the video title without repeating it verbatim.",
    },
    {
      label: "Specificity Signal (Number, Metric or Parenthetical)",
      passed: hasNumberOrBracket,
      detail: hasNumberOrBracket
        ? "Contains a concrete number or parenthetical qualifier."
        : "Add a number, timeframe, or parenthetical hook (e.g. '(Step-by-Step)') to lift CTR.",
    },
  ];

  const ctrScore = Math.round(
    (checks.filter((c) => c.passed).length / checks.length) * 100,
  );

  return {
    charCount,
    mobilePreviewTitle,
    desktopPreviewTitle,
    thumbnailWordCount,
    overlapWarning,
    ctrScore,
    checks,
    variations: buildDeterministicYoutubeVariations(input),
  };
}
