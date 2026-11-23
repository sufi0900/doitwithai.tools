export type VideoToBlogInput = {
  videoTitle: string;
  videoUrl: string;
  targetKeyword: string;
  speakerOrChannelName: string;
  rawTranscript: string;
};

export type BlogSectionBlock = {
  heading: string;
  timestamp?: string;
  paragraphs: string[];
  keyTakeawayBullet: string;
};

export type VideoToBlogArticle = {
  seoTitle: string;
  metaDescription: string;
  slug: string;
  executiveSummarySnippet: string;
  sections: BlogSectionBlock[];
  faqItems: Array<{ question: string; answer: string }>;
  markdownOutput: string;
  htmlOutput: string;
  cleanedWordCount: number;
  fillerWordsRemovedCount: number;
};

export const DEFAULT_VIDEO_TO_BLOG_INPUT: VideoToBlogInput = {
  videoTitle: "How We Fixed Technical SEO & Core Web Vitals on 50 Content Sites",
  videoUrl: "https://www.youtube.com/watch?v=example123",
  targetKeyword: "technical seo audit workflow",
  speakerOrChannelName: "Sufian Mustafa",
  rawTranscript: `[00:00] Hey everyone, welcome back to the channel! Um, today we are breaking down our exact technical SEO audit workflow that we used across 50 content websites.
[01:15] Step 1: Verify Canonical Parity
So the first thing we always check, you know, is whether the rendered DOM canonical tag matches the raw HTML source. On 28% of sites we audited, client-side JavaScript was accidentally changing the canonical URL.
[03:40] Step 2: Optimize Interaction to Next Paint (INP)
Next up is Core Web Vitals, specifically INP. Basically, when third-party tracking scripts block the main thread for more than 200 milliseconds, mobile users bounce before the page responds. Deferring non-critical scripts improved organic conversions by 14.8%.
[06:10] Step 3: Fix Internal Link Anchor Cannibalization
Finally, uh, check your internal link anchors. Never point the exact same keyword anchor text to two different URLs on your site, or search engines won't know which page to rank first.`,
};

function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .slice(0, 65) || "video-guide"
  );
}

export function buildDeterministicBlogFromTranscript(
  input: VideoToBlogInput,
): VideoToBlogArticle {
  const title =
    input.videoTitle.trim() || "Complete Step-by-Step Video Guide";
  const kw = input.targetKeyword.trim() || "SEO strategy";
  const author = input.speakerOrChannelName.trim() || "Editorial Team";
  const raw = input.rawTranscript || "";

  // Count and strip conversational filler words
  const fillerRegex = /\b(um+|uh+|you know|basically|like,\s|sort of|kind of)\b/gi;
  const fillerMatches = raw.match(fillerRegex) || [];
  const fillerWordsRemovedCount = fillerMatches.length;

  const lines = raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const sections: BlogSectionBlock[] = [];
  let currentHeading = `Key Insights from ${title}`;
  let currentTimestamp: string | undefined = "00:00";
  let currentParas: string[] = [];

  function flushSection() {
    if (currentParas.length > 0) {
      const joined = currentParas.join(" ");
      sections.push({
        heading: currentHeading,
        timestamp: currentTimestamp,
        paragraphs: currentParas,
        keyTakeawayBullet:
          joined.length > 130 ? `${joined.slice(0, 125).trimEnd()}…` : joined,
      });
      currentParas = [];
    }
  }

  lines.forEach((line) => {
    const tsMatch = line.match(/^\[?(\d{1,2}:\d{2}(?::\d{2})?)\]?\s*(.*)$/);
    if (tsMatch) {
      const ts = tsMatch[1];
      const rest = tsMatch[2]
        .replace(fillerRegex, "")
        .replace(/\s+/g, " ")
        .trim();

      if (rest.length > 0 && rest.length <= 78 && !/[.!?]$/.test(rest)) {
        flushSection();
        currentHeading = rest;
        currentTimestamp = ts;
      } else if (rest.length > 0) {
        currentParas.push(rest);
      }
    } else {
      const cleaned = line
        .replace(fillerRegex, "")
        .replace(/\s+/g, " ")
        .trim();
      if (
        cleaned.length <= 75 &&
        /^(step\s+\d+|chapter\s+\d+|\d+\.)/i.test(cleaned)
      ) {
        flushSection();
        currentHeading = cleaned;
      } else if (cleaned) {
        currentParas.push(cleaned);
      }
    }
  });
  flushSection();

  if (sections.length === 0) {
    sections.push({
      heading: `Core Breakdown: ${title}`,
      timestamp: "00:00",
      paragraphs: [
        raw.replace(fillerRegex, "").trim() ||
          `Here is the structured written breakdown of ${title}.`,
      ],
      keyTakeawayBullet: `Apply this structured ${kw} workflow to improve consistency and results.`,
    });
  }

  const seoTitle = `${title} (Step-by-Step Written Guide)`.slice(0, 62);
  const metaDescription = `Prefer reading over watching? Explore our structured written breakdown of ${title}, covering ${kw}, key timestamps, and actionable takeaways.`.slice(
    0,
    158,
  );
  const slug = slugify(input.targetKeyword || title);

  const executiveSummarySnippet = `A ${kw.toLowerCase()} is a structured process covered in "${title}" by ${author} that helps teams identify high-impact bottlenecks, implement repeatable fixes, and verify measurable performance improvements across every stage of execution.`;

  const faqItems = [
    {
      question: `What is the main takeaway from "${title}"?`,
      answer:
        sections[0]?.paragraphs[0] ||
        `Prioritize foundational ${kw} checks before scaling new campaigns.`,
    },
    {
      question: `How do I implement ${kw} step by step?`,
      answer: `Follow the ${sections.length} core chapters outlined in this guide: ${sections.map((s) => s.heading).join(", ")}.`,
    },
  ];

  const markdownOutput = [
    `# ${title}`,
    "",
    `> **Executive Summary (${kw}):** ${executiveSummarySnippet}`,
    "",
    "## Key Takeaways",
    ...sections.map(
      (s) =>
        `- **${s.heading}${s.timestamp ? ` (${s.timestamp})` : ""}:** ${s.keyTakeawayBullet}`,
    ),
    "",
    ...sections.flatMap((s) => [
      `## ${s.heading}${s.timestamp ? ` [${s.timestamp}]` : ""}`,
      "",
      ...s.paragraphs.map((p) => `${p}\n`),
    ]),
    "## Frequently Asked Questions",
    ...faqItems.flatMap((f) => [`### ${f.question}`, f.answer, ""]),
  ].join("\n");

  const htmlOutput = `<article class="video-to-blog-article">\n  <h1>${title}</h1>\n  <p><strong>Executive Summary:</strong> ${executiveSummarySnippet}</p>\n  <nav aria-label="Table of Contents">\n    <h2>Table of Contents</h2>\n    <ol>\n${sections.map((s) => `      <li><a href="#${slugify(s.heading)}">${s.heading}</a></li>`).join("\n")}\n    </ol>\n  </nav>\n${sections.map((s) => `  <section id="${slugify(s.heading)}">\n    <h2>${s.heading}</h2>\n${s.paragraphs.map((p) => `    <p>${p}</p>`).join("\n")}\n  </section>`).join("\n")}\n</article>`;

  const cleanedWordCount = markdownOutput
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  return {
    seoTitle,
    metaDescription,
    slug,
    executiveSummarySnippet,
    sections,
    faqItems,
    markdownOutput,
    htmlOutput,
    cleanedWordCount,
    fillerWordsRemovedCount,
  };
}
