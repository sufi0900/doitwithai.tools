export type UnicodeStyleId =
  | "boldSans"
  | "italicSans"
  | "boldItalicSans"
  | "boldSerif"
  | "monospace"
  | "underline"
  | "strikethrough";

export type LinkedinAuditCheck = {
  label: string;
  passed: boolean;
  detail: string;
};

export type LinkedinFormatResult = {
  totalChars: number;
  wordCount: number;
  readingTimeSeconds: number;
  hashtagCount: number;
  desktopAboveFold: string;
  desktopIsTruncated: boolean;
  mobileAboveFold: string;
  mobileIsTruncated: boolean;
  hookScore: number;
  checks: LinkedinAuditCheck[];
};

const UPPER_A = "A".charCodeAt(0);
const LOWER_A = "a".charCodeAt(0);
const DIGIT_0 = "0".charCodeAt(0);

function mapAsciiToMathRange(
  text: string,
  upperStart: number,
  lowerStart: number,
  digitStart?: number,
): string {
  return Array.from(text)
    .map((ch) => {
      const code = ch.charCodeAt(0);
      if (code >= UPPER_A && code <= UPPER_A + 25) {
        return String.fromCodePoint(upperStart + (code - UPPER_A));
      }
      if (code >= LOWER_A && code <= LOWER_A + 25) {
        return String.fromCodePoint(lowerStart + (code - LOWER_A));
      }
      if (
        digitStart !== undefined &&
        code >= DIGIT_0 &&
        code <= DIGIT_0 + 9
      ) {
        return String.fromCodePoint(digitStart + (code - DIGIT_0));
      }
      return ch;
    })
    .join("");
}

export function applyUnicodeStyle(
  text: string,
  style: UnicodeStyleId,
): string {
  switch (style) {
    case "boldSans":
      return mapAsciiToMathRange(text, 0x1d5d4, 0x1d5ee, 0x1d7ec);
    case "italicSans":
      return mapAsciiToMathRange(text, 0x1d608, 0x1d622);
    case "boldItalicSans":
      return mapAsciiToMathRange(text, 0x1d63c, 0x1d656, 0x1d7ec);
    case "boldSerif":
      return mapAsciiToMathRange(text, 0x1d400, 0x1d41a, 0x1d7ce);
    case "monospace":
      return mapAsciiToMathRange(text, 0x1d670, 0x1d68a, 0x1d7f6);
    case "underline":
      return Array.from(text)
        .map((c) => (/\w/.test(c) ? `${c}\u0332` : c))
        .join("");
    case "strikethrough":
      return Array.from(text)
        .map((c) => (/\w/.test(c) ? `${c}\u0336` : c))
        .join("");
    default:
      return text;
  }
}

export const LINKEDIN_HOOK_TEMPLATES: Array<{
  label: string;
  category: string;
  template: string;
}> = [
  {
    label: "1. Benchmark / Case Study Hook",
    category: "Data-Driven",
    template: `${applyUnicodeStyle("We audited 45 B2B content sites over the last 90 days.", "boldSans")}\n\n82% were making the exact same internal linking mistake—and it was costing them top-3 rankings.\n\nHere is the 4-step framework we used to fix it:\n\n1️⃣ ${applyUnicodeStyle("Audit anchor text ratios", "boldSans")}\nStop using generic "read more" links on high-value pillar pages.\n\n2️⃣ ${applyUnicodeStyle("Connect striking-distance pages", "boldSans")}\nPass authority from your top-traffic articles to pages ranking in positions 4–12.\n\n3️⃣ ${applyUnicodeStyle("Add jump-link Tables of Contents", "boldSans")}\nHelp both mobile readers and AI answer engines scan your H2 hierarchy.\n\n4️⃣ ${applyUnicodeStyle("Refresh decaying URLs quarterly", "boldSans")}\nUpdate outdated stats and add first-hand proof points.\n\nWhich of these 4 steps is your team prioritizing this quarter? 👇\n\n#SEO #ContentMarketing #B2BMarketing #OrganicGrowth`,
  },
  {
    label: "2. Contrarian Industry Insight",
    category: "Thought Leadership",
    template: `${applyUnicodeStyle("Unpopular opinion: Publishing more blog posts is rarely the answer.", "boldSans")}\n\nWhen organic traffic stalls, most teams double their publishing volume.\n\nInstead, we paused new articles for 30 days and upgraded our top 12 existing guides:\n\n• Added original benchmark tables & first-hand screenshots\n• Rewrote H2 definitions into 45–55 word Featured Snippet blocks\n• Validated Article & FAQPage JSON-LD schema\n\nThe result? +41% organic clicks with zero new URLs published.\n\nAre you spending more time creating new content or upgrading what already ranks?\n\n#ContentStrategy #SEOTips #DigitalMarketing`,
  },
  {
    label: "3. Tactical Checklist / Cheat Sheet",
    category: "Saveable Resource",
    template: `${applyUnicodeStyle("The 60-Second Pre-Publish SEO Checklist (Save this for your next post):", "boldSans")}\n\nBefore hitting publish on any article, verify these 5 signals:\n\n✅ ${applyUnicodeStyle("Title Tag:", "boldSans")} 50–60 chars with primary keyword front-loaded\n✅ ${applyUnicodeStyle("H1–H6 Tree:", "boldSans")} Single H1 and logical H2/H3 nesting\n✅ ${applyUnicodeStyle("Information Gain:", "boldSans")} At least 3 original data points or real examples\n✅ ${applyUnicodeStyle("Internal Links:", "boldSans")} 3–5 descriptive contextual links to core pages\n✅ ${applyUnicodeStyle("Social Cards:", "boldSans")} Verified Open Graph & X card image preview\n\nWhat is the #1 item on your pre-publish checklist?\n\n#OnPageSEO #ContentOps #MarketingChecklist`,
  },
];

export function analyzeLinkedinPost(rawText: string): LinkedinFormatResult {
  const text = rawText || "";
  const totalChars = text.length;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const readingTimeSeconds = Math.max(5, Math.round((words / 200) * 60));

  const hashtags = text.match(/#[A-Za-z0-9_]+/g) || [];
  const hashtagCount = hashtags.length;

  const lines = text.split(/\r?\n/);

  // LinkedIn truncates after ~3 lines OR ~210 chars on Desktop / ~140 chars on Mobile
  const threeLinesText = lines.slice(0, 3).join("\n");
  const desktopCutoff = Math.min(210, threeLinesText.length);
  const desktopAboveFold =
    lines.length > 3 || totalChars > 210
      ? threeLinesText.slice(0, desktopCutoff).trimEnd()
      : text;
  const desktopIsTruncated = lines.length > 3 || totalChars > 210;

  const mobileCutoff = Math.min(140, threeLinesText.length);
  const mobileAboveFold =
    lines.length > 3 || totalChars > 140
      ? threeLinesText.slice(0, mobileCutoff).trimEnd()
      : text;
  const mobileIsTruncated = lines.length > 3 || totalChars > 140;

  const firstLine = (lines[0] || "").trim();
  const hasBlankSecondLine = (lines[1] || "").trim() === "";
  const hasQuestionAtEnd = /\?[\s#A-Za-z0-9_]*$/.test(text.trim());
  const optimalLength = totalChars >= 400 && totalChars <= 1800;
  const optimalHashtags = hashtagCount >= 2 && hashtagCount <= 5;

  const checks: LinkedinAuditCheck[] = [
    {
      label: "Punchy Opening Hook Line (< 95 chars)",
      passed: firstLine.length >= 15 && firstLine.length <= 95,
      detail: `${firstLine.length} chars in line 1 (fits cleanly above mobile fold).`,
    },
    {
      label: "Line-2 White Space Break",
      passed: hasBlankSecondLine,
      detail: hasBlankSecondLine
        ? "Line 2 is blank, creating visual breathing room before '...see more'."
        : "Add an empty line after your first sentence so the hook stands out.",
    },
    {
      label: "Optimal Post Depth (400–1,800 chars)",
      passed: optimalLength,
      detail: `${totalChars.toLocaleString()} / 3,000 max characters (${words} words).`,
    },
    {
      label: "Closing Conversation Question",
      passed: hasQuestionAtEnd,
      detail: hasQuestionAtEnd
        ? "Ends with an open question to drive comment velocity."
        : "Add a question in your final paragraph to encourage comments.",
    },
    {
      label: "Hashtag Discipline (2–5 Hashtags)",
      passed: optimalHashtags,
      detail: `${hashtagCount} hashtags detected (2–5 recommended).`,
    },
  ];

  const hookScore = Math.round(
    (checks.filter((c) => c.passed).length / checks.length) * 100,
  );

  return {
    totalChars,
    wordCount: words,
    readingTimeSeconds,
    hashtagCount,
    desktopAboveFold,
    desktopIsTruncated,
    mobileAboveFold,
    mobileIsTruncated,
    hookScore,
    checks,
  };
}
