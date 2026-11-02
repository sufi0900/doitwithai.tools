export type ThreadPlatform = "X (Twitter)" | "Threads" | "LinkedIn Slide Text";

export type ThreadGeneratorInput = {
  topicOrHeadline: string;
  sourceContent: string;
  platform: ThreadPlatform;
  includeNumbering: boolean;
  ctaUrl: string;
  authorHandle: string;
};

export type ThreadPostItem = {
  index: number;
  total: number;
  role: "Hook (Post #1)" | "Body Insight" | "Recap & CTA";
  text: string;
  charCount: number;
  maxChars: number;
  withinLimit: boolean;
};

export type ThreadHookVariant = {
  angle: "Data / Benchmark Hook" | "Contrarian Framework" | "Step-by-Step Playbook";
  hookText: string;
};

export type ThreadGeneratorResult = {
  maxCharsPerPost: number;
  hookOptions: ThreadHookVariant[];
  posts: ThreadPostItem[];
};

export const DEFAULT_THREAD_INPUT: ThreadGeneratorInput = {
  topicOrHeadline: "7 On-Page & Technical SEO Signals That Move Rankings in 2026",
  sourceContent: [
    "Most teams spend 90% of their time chasing new keywords while their existing pages leak rankings due to fixable on-page and technical gaps.",
    "1. Canonical Parity: Always verify that your live rendered DOM canonical tag matches your raw HTML canonical tag so client-side scripts never override indexability.",
    "2. 48-Word Answer Blocks: Place a concise 45-to-58-word ontological definition immediately below your primary H2 question heading to win Featured Snippets and AI Overviews.",
    "3. Information Gain & Proof: Add original data points, benchmark numbers, and first-hand testing notes that generic competitor articles lack.",
    "4. Internal Anchor Diversity: Audit your internal links so two different URLs never compete for the same exact-match anchor text phrase.",
    "5. Crawl-Safe Jump-Link TOCs: Use semantic <nav> Table of Contents blocks with matching heading IDs to earn clickable 'Jump to' links in search results.",
  ].join("\n\n"),
  platform: "X (Twitter)",
  includeNumbering: true,
  ctaUrl: "https://doitwithai.tools/tools",
  authorHandle: "@DoItWithAI",
};

export function getPlatformMaxChars(platform: ThreadPlatform): number {
  if (platform === "X (Twitter)") return 280;
  if (platform === "Threads") return 500;
  return 320;
}

export function buildDeterministicThread(
  input: ThreadGeneratorInput,
): ThreadGeneratorResult {
  const maxChars = getPlatformMaxChars(input.platform);
  const title = input.topicOrHeadline.trim() || "Practical Playbook";
  const ctaUrl = input.ctaUrl.trim() || "https://doitwithai.tools";
  const handle = input.authorHandle.trim() || "@Creator";

  const hookOptions: ThreadHookVariant[] = [
    {
      angle: "Data / Benchmark Hook",
      hookText: `${title}\n\nWe tested these exact workflows across dozens of live pages.\n\nHere is the step-by-step breakdown you can steal in 3 minutes 🧵👇`,
    },
    {
      angle: "Contrarian Framework",
      hookText: `Most advice on "${title}" is outdated.\n\nInstead of guessing, focus on the high-leverage signals that actually compound.\n\nA quick thread 🧵👇`,
    },
    {
      angle: "Step-by-Step Playbook",
      hookText: `Bookmark this checklist before your next content sprint:\n\n${title}\n\nStep-by-step implementation guide 🧵👇`,
    },
  ];

  // Split sourceContent into clean post-sized chunks respecting sentence boundaries
  const rawParagraphs = input.sourceContent
    .split(/\r?\n\r?\n|\r?\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  const bodyChunks: string[] = [];
  const budget = maxChars - 18; // Reserve room for "2/8 " numbering

  rawParagraphs.forEach((para) => {
    if (para.length <= budget) {
      bodyChunks.push(para);
    } else {
      const sentences = para.match(/[^.!?]+[.!?]+|\S+/g) || [para];
      let current = "";
      sentences.forEach((sent) => {
        const s = sent.trim();
        if (!current) {
          current = s;
        } else if ((current + " " + s).length <= budget) {
          current += " " + s;
        } else {
          bodyChunks.push(current);
          current = s;
        }
      });
      if (current) bodyChunks.push(current);
    }
  });

  const recapPostRaw = `TL;DR Recap — ${title}:\n\n• Audit technical & canonical parity first\n• Lead H2s with concise answer blocks\n• Back every claim with first-hand proof\n\nBookmark this thread & explore all free tools:\n🌐 ${ctaUrl}\n\nFollow ${handle} for more actionable playbooks!`;

  const allRawPosts: Array<{
    role: ThreadPostItem["role"];
    body: string;
  }> = [
    { role: "Hook (Post #1)", body: hookOptions[0].hookText },
    ...bodyChunks.map((c) => ({ role: "Body Insight" as const, body: c })),
    { role: "Recap & CTA", body: recapPostRaw },
  ];

  const total = allRawPosts.length;
  const posts: ThreadPostItem[] = allRawPosts.map((item, idx) => {
    const index = idx + 1;
    const prefix = input.includeNumbering ? `${index}/${total}\n\n` : "";
    const text = `${prefix}${item.body}`.slice(0, maxChars + 40);
    return {
      index,
      total,
      role: item.role,
      text,
      charCount: text.length,
      maxChars,
      withinLimit: text.length <= maxChars,
    };
  });

  return {
    maxCharsPerPost: maxChars,
    hookOptions,
    posts,
  };
}
