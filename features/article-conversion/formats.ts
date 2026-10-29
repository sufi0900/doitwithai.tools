import { zipStored } from "../outreach-email/docx";
import { safeLink, validate, type Article } from "./model";

export type ConversionFormat =
  | "pdf"
  | "docx"
  | "audio"
  | "video-script"
  | "social-posts"
  | "markdown"
  | "epub"
  | "newsletter"
  | "linkedin-carousel"
  | "podcast-script";

const xmlEscape = (s: string) =>
  s
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\ufffe\uffff]/g, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

export const stripRefs = (s: string) =>
  s
    .replace(/\s*\[\d+\]/g, "")
    .replace(/\s+/g, " ")
    .trim();

export function countWords(text: string): number {
  const cleaned = text.trim();
  if (!cleaned) return 0;
  return cleaned.split(/\s+/).filter(Boolean).length;
}

export function splitSentences(text: string): string[] {
  const cleaned = stripRefs(text).replace(/^\s*(?:[•▪▸◦–—-]|\d+\.)\s*/, "");
  if (!cleaned) return [];
  const parts = cleaned
    .split(/(?<=[.!?।])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  return parts.length ? parts : [cleaned];
}

export type ArticleSectionGroup = {
  heading: string;
  paragraphs: string[];
  bullets: string[];
  quotes: string[];
};

/**
 * Groups an entire Article into logical topic sections so that every single
 * heading, paragraph, bullet point, and quote in the article is understood
 * and represented in scripts, social posts, newsletters, carousels, and podcasts.
 */
export function groupArticleSections(article: Article): ArticleSectionGroup[] {
  const groups: ArticleSectionGroup[] = [];
  let current: ArticleSectionGroup = {
    heading: article.title || "Overview",
    paragraphs: [],
    bullets: [],
    quotes: [],
  };

  for (const b of article.blocks) {
    const t = stripRefs(b.text);
    if (!t && b.kind !== "table") continue;
    if (b.kind === "heading") {
      if (
        current.paragraphs.length > 0 ||
        current.bullets.length > 0 ||
        current.quotes.length > 0
      ) {
        groups.push(current);
      }
      current = {
        heading: t,
        paragraphs: [],
        bullets: [],
        quotes: [],
      };
    } else if (b.kind === "list") {
      current.bullets.push(t.replace(/^\s*(?:[•▪▸◦–—-]|\d+\.)\s*/, ""));
    } else if (b.kind === "quote") {
      current.quotes.push(t);
    } else if (b.kind === "paragraph") {
      current.paragraphs.push(t);
    } else if (b.kind === "table" && b.cells?.length) {
      const summary = b.cells
        .slice(0, 4)
        .map((r) => r.filter(Boolean).join(": "))
        .filter(Boolean)
        .join(" | ");
      if (summary) current.bullets.push(summary);
    }
  }
  if (
    current.paragraphs.length > 0 ||
    current.bullets.length > 0 ||
    current.quotes.length > 0 ||
    groups.length === 0
  ) {
    groups.push(current);
  }
  return groups;
}

function toSpokenSentence(raw: string, idx: number, isFirstInScene: boolean): string {
  let s = stripRefs(raw)
    .replace(/^\s*(?:[•▪▸◦–—-]|\d+\.)\s*/, "")
    .replace(/\s*(?:→|➔|➜|⟶|⇒|->|=>)\s*/g, ", then ")
    .replace(/\bvs\.?(?=\s|$)/gi, "versus")
    .replace(/\be\.g\.(?=\s|,|$)/gi, "for example")
    .replace(/\bi\.e\.(?=\s|,|$)/gi, "that is")
    .trim();
  if (!s) return "";
  if (!/[.!?]$/.test(s)) s += ".";
  if (isFirstInScene && idx > 0 && s.length < 140 && !/^(Here|When|Why|How|Let|Start|Instead|The)/i.test(s)) {
    return `Here is what matters next: ${s.charAt(0).toLowerCase()}${s.slice(1)}`;
  }
  return s;
}

function inferVisualForSentence(
  sentence: string,
  sectionHeading: string,
  beatIndex: number,
): {
  visualType:
    | "SCREENSHOT"
    | "INFOGRAPHIC"
    | "SPLIT COMPARISON"
    | "B-ROLL VIDEO"
    | "UI WALKTHROUGH"
    | "DATA CALLOUT"
    | "TALKING HEAD";
  visualDirection: string;
  onScreenText: string;
} {
  const lower = sentence.toLowerCase();
  const words = sentence
    .replace(/[^\w\s%-]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 3 && !/^(that|this|with|from|your|have|more|into|they|will|what|when|were|been)$/i.test(w));
  const keyPhrase = words.slice(0, 5).join(" ") || sectionHeading.slice(0, 40);

  if (/\d+%|\d+\s*(?:times|percent|steps|pillars|hours|minutes|days|x\b)/i.test(sentence)) {
    return {
      visualType: "DATA CALLOUT",
      visualDirection: `Animated metric graphic highlighting the figure in "${sentence.slice(0, 80)}..." over a clean dark card.`,
      onScreenText: keyPhrase.slice(0, 55),
    };
  }
  if (/versus|instead of|rather than|without|shift from|away from|compare|difference/i.test(lower)) {
    return {
      visualType: "SPLIT COMPARISON",
      visualDirection: `Split-screen comparison card: Left side labeled "Old Approach" (muted red/slate) vs. Right side labeled "Smarter System" (highlighted accent) illustrating: ${sectionHeading}.`,
      onScreenText: `Old Way vs. ${sectionHeading.slice(0, 36)}`,
    };
  }
  if (/workflow|process|loop|system|step|connect|stage|cycle|audit|map/i.test(lower)) {
    return {
      visualType: "INFOGRAPHIC",
      visualDirection: `Step-by-step connected flowchart diagram showing the workflow for "${sectionHeading}" with directional arrows lighting up sequentially.`,
      onScreenText: `${sectionHeading.slice(0, 48)}`,
    };
  }
  if (/tool|page|search|url|website|audit|check|inspect|measure|data|dashboard/i.test(lower)) {
    return {
      visualType: "SCREENSHOT",
      visualDirection: `Close-up annotated browser screenshot or live tool walkthrough demonstrating "${keyPhrase}" with a cursor highlight on the key area.`,
      onScreenText: keyPhrase.slice(0, 55),
    };
  }
  if (beatIndex === 0) {
    return {
      visualType: "TALKING HEAD",
      visualDirection: `Presenter on camera (medium shot) with a lower-third chapter title card introducing "${sectionHeading}".`,
      onScreenText: sectionHeading.slice(0, 55),
    };
  }
  return {
    visualType: "B-ROLL VIDEO",
    visualDirection: `Dynamic B-roll clip or kinetic typography card reinforcing "${keyPhrase}" while voiceover continues.`,
    onScreenText: keyPhrase.slice(0, 55),
  };
}

function buildMinimalDocx(
  title: string,
  subtitle: string,
  bodyXml: string,
): Uint8Array {
  const w = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";
  const pkg = "http://schemas.openxmlformats.org/package/2006/relationships";
  const decl = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';

  const entries: Record<string, string | Uint8Array> = {
    "[Content_Types].xml":
      `${decl}<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">` +
      `<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>` +
      `<Default Extension="xml" ContentType="application/xml"/>` +
      `<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>` +
      `<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>` +
      `</Types>`,
    "_rels/.rels":
      `${decl}<Relationships xmlns="${pkg}">` +
      `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>` +
      `</Relationships>`,
    "word/_rels/document.xml.rels":
      `${decl}<Relationships xmlns="${pkg}">` +
      `<Relationship Id="rIdStyles" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>` +
      `</Relationships>`,
    "word/styles.xml":
      `${decl}<w:styles xmlns:w="${w}">` +
      `<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:rPr><w:sz w:val="22"/></w:rPr></w:style>` +
      `<w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:rPr><w:b/><w:sz w:val="36"/></w:rPr></w:style>` +
      `<w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:rPr><w:b/><w:sz w:val="28"/></w:rPr></w:style>` +
      `<w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:rPr><w:b/><w:sz w:val="24"/></w:rPr></w:style>` +
      `</w:styles>`,
    "word/document.xml":
      `${decl}<w:document xmlns:w="${w}"><w:body>` +
      `<w:p><w:pPr><w:pStyle w:val="Title"/></w:pPr><w:r><w:t xml:space="preserve">${xmlEscape(title)}</w:t></w:r></w:p>` +
      (subtitle
        ? `<w:p><w:r><w:t xml:space="preserve">${xmlEscape(subtitle)}</w:t></w:r></w:p>`
        : "") +
      bodyXml +
      `<w:sectPr><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="1080" w:right="1080" w:bottom="1080" w:left="1080"/></w:sectPr>` +
      `</w:body></w:document>`,
  };
  return zipStored(entries);
}

const docxParagraph = (text: string, style = "Normal", boldPrefix = "") =>
  `<w:p><w:pPr><w:pStyle w:val="${style}"/></w:pPr>` +
  (boldPrefix
    ? `<w:r><w:rPr><w:b/></w:rPr><w:t xml:space="preserve">${xmlEscape(boldPrefix)}</w:t></w:r>`
    : "") +
  `<w:r><w:t xml:space="preserve">${xmlEscape(text)}</w:t></w:r></w:p>`;

// ============================================================================
// 1. BLOG TO VIDEO SCRIPT (Comprehensive Sentence-by-Sentence Storyboard)
// ============================================================================
export type VideoBeat = {
  id: string;
  spokenSentence: string;
  visualType:
    | "SCREENSHOT"
    | "INFOGRAPHIC"
    | "SPLIT COMPARISON"
    | "B-ROLL VIDEO"
    | "UI WALKTHROUGH"
    | "DATA CALLOUT"
    | "TALKING HEAD";
  visualDirection: string;
  onScreenText: string;
  seconds: number;
};

export type VideoScene = {
  id: string;
  title: string;
  narration: string;
  visual: string;
  onScreenText: string;
  seconds: number;
  beats: VideoBeat[];
  sourceBlockId?: string;
};

export type VideoScriptDraft = {
  mode: "youtube" | "shorts";
  wpm: 120 | 140 | 160;
  hookIndex: number;
  cta: string;
  scenes: VideoScene[];
  totalWords: number;
  totalSeconds: number;
};

export function buildVideoScript(
  article: Article,
  mode: "youtube" | "shorts" = "youtube",
  wpm: 120 | 140 | 160 = 140,
  hookIndex = 0,
  cta = "If you want the complete written breakdown and checklist, visit the link in the description.",
): VideoScriptDraft {
  const err = validate(article);
  if (err) throw Error(err);

  const sections = groupArticleSections(article);
  const allFirstSentences = sections
    .flatMap((sec) => [
      ...sec.paragraphs.flatMap((p) => splitSentences(p)),
      ...sec.bullets.flatMap((b) => splitSentences(b)),
    ])
    .filter((s) => s.length >= 20);

  const corePremise =
    allFirstSentences[0] ||
    `Most people miss the underlying system behind ${article.title}.`;
  const secondPremise =
    allFirstSentences[1] ||
    `In this video, we will break down every step so you can apply it right away.`;

  const hooks = [
    [
      `Most people approach ${article.title} the hard way—and wonder why their results stall.`,
      corePremise,
      `In this video, we are breaking down the exact problem-to-solution framework step by step.`,
    ],
    [
      corePremise,
      secondPremise,
      `Let's walk through how to fix this from the ground up.`,
    ],
    [
      `Before you spend another hour on ${article.title}, watch this breakdown.`,
      corePremise,
      `Here is the complete system and how each part connects.`,
    ],
  ];
  const chosenHookSentences = hooks[hookIndex % hooks.length];

  const scenes: VideoScene[] = [];
  const createSceneFromSentences = (
    title: string,
    rawSentences: string[],
    sectionHeading: string,
  ) => {
    const cleanSents = rawSentences
      .map((s, idx) => toSpokenSentence(s, scenes.length, idx === 0))
      .filter(Boolean);
    if (!cleanSents.length) return;

    const beats: VideoBeat[] = cleanSents.map((sent, bIdx) => {
      const vis = inferVisualForSentence(sent, sectionHeading, bIdx);
      const words = countWords(sent);
      const secs = Math.max(2, Math.ceil((words / wpm) * 60));
      return {
        id: `beat-${scenes.length + 1}-${bIdx + 1}`,
        spokenSentence: sent,
        visualType: vis.visualType,
        visualDirection: vis.visualDirection,
        onScreenText: vis.onScreenText,
        seconds: secs,
      };
    });

    const narration = beats.map((b) => b.spokenSentence).join(" ");
    const seconds = beats.reduce((n, b) => n + b.seconds, 0);
    const primaryVisual = beats
      .map((b, idx) => `[Beat ${idx + 1} · ${b.visualType}] ${b.visualDirection}`)
      .join(" | ");
    const primaryOnScreen = beats[0]?.onScreenText || sectionHeading.slice(0, 60);

    scenes.push({
      id: `scene-${scenes.length + 1}`,
      title,
      narration,
      visual: primaryVisual,
      onScreenText: primaryOnScreen,
      seconds,
      beats,
    });
  };

  // Scene 1: Opening Hook & Problem Setup
  createSceneFromSentences(
    mode === "shorts"
      ? "Scene 1 · Pattern-Interrupt Hook (0–8s)"
      : "Scene 1 · Opening Hook & Problem Setup",
    mode === "shorts" ? chosenHookSentences.slice(0, 2) : chosenHookSentences,
    article.title,
  );

  // Cover ALL article sections in YouTube mode (up to 16 sections), or top 4 in Shorts mode
  const maxSections = mode === "shorts" ? 4 : Math.min(sections.length, 16);
  for (let i = 0; i < maxSections && i < sections.length; i++) {
    const sec = sections[i];
    const secSentences: string[] = [];

    if (sec.heading && sec.heading !== article.title && mode === "youtube") {
      secSentences.push(`Now let's look at ${sec.heading}.`);
    }

    for (const p of sec.paragraphs.slice(0, mode === "shorts" ? 1 : 3)) {
      const sents = splitSentences(p);
      secSentences.push(...sents.slice(0, mode === "shorts" ? 1 : 3));
    }

    if (sec.bullets.length > 0) {
      const bulletCount = mode === "shorts" ? 2 : 5;
      sec.bullets.slice(0, bulletCount).forEach((b, bIdx) => {
        const prefix =
          bIdx === 0
            ? "First, "
            : bIdx === 1
              ? "Second, "
              : bIdx === 2
                ? "Third, "
                : "Additionally, ";
        const cleanB = b.charAt(0).toLowerCase() + b.slice(1);
        secSentences.push(`${prefix}${cleanB}`);
      });
    }

    if (sec.quotes.length > 0 && mode === "youtube") {
      secSentences.push(`As the research highlights: "${sec.quotes[0]}"`);
    }

    const deduped = [...new Set(secSentences)].slice(
      0,
      mode === "shorts" ? 2 : 7,
    );
    if (deduped.length > 0) {
      createSceneFromSentences(
        `Scene ${scenes.length + 1} · ${sec.heading.slice(0, 68)}`,
        deduped,
        sec.heading,
      );
    }
  }

  // Closing & Actionable Call to Action
  const closingSentences = [
    `So if we bring all of this together around ${article.title}, the biggest takeaway is building a repeatable workflow rather than treating each step in isolation.`,
    cta.trim() ||
      `Check the link in the description to read the full article and download the resources.`,
  ];
  createSceneFromSentences(
    `Scene ${scenes.length + 1} · Summary & Call to Action`,
    mode === "shorts" ? [closingSentences[1]] : closingSentences,
    "Actionable Takeaway & Next Step",
  );

  const totalWords = scenes.reduce((n, s) => n + countWords(s.narration), 0);
  const totalSeconds = scenes.reduce((n, s) => n + s.seconds, 0);

  return {
    mode,
    wpm,
    hookIndex,
    cta,
    scenes,
    totalWords,
    totalSeconds,
  };
}

export function videoScriptTxt(
  article: Article,
  draft: VideoScriptDraft,
): string {
  const lines = [
    `PRODUCTION VIDEO SCRIPT & STORYBOARD: ${article.title}`,
    `Format: ${draft.mode === "shorts" ? "Short-Form Vertical (Shorts / Reels / TikTok)" : "YouTube Long-Form Deep Dive"}`,
    `Speaking Rate: ${draft.wpm} WPM · Estimated Duration: ${Math.floor(draft.totalSeconds / 60)}m ${draft.totalSeconds % 60}s (${draft.totalWords} spoken words)`,
    article.source ? `Source Article: ${article.source}` : "",
    "",
    "====================================================================",
    "PART 1 · SENTENCE-BY-SENTENCE AUDIO / VISUAL STORYBOARD",
    "====================================================================",
    "",
  ].filter((l) => l !== "");

  draft.scenes.forEach((s, idx) => {
    lines.push(`### [${idx + 1}] ${s.title} (~${s.seconds}s)`);
    if (s.beats?.length) {
      s.beats.forEach((beat, bIdx) => {
        lines.push(
          `  Beat ${idx + 1}.${bIdx + 1} (~${beat.seconds}s) [${beat.visualType}]`,
          `  • VOICEOVER: "${beat.spokenSentence}"`,
          `  • BACKGROUND VISUAL: ${beat.visualDirection}`,
          `  • ON-SCREEN TEXT: "${beat.onScreenText}"`,
          "",
        );
      });
    } else {
      lines.push(
        `  NARRATION: ${s.narration}`,
        `  VISUAL: ${s.visual}`,
        `  ON-SCREEN TEXT: ${s.onScreenText}`,
        "",
      );
    }
  });

  lines.push(
    "====================================================================",
    "PART 2 · CLEAN TELEPROMPTER / VOICEOVER SCRIPT",
    "====================================================================",
    "",
    ...draft.scenes.flatMap((s) => [`[${s.title}]`, s.narration, ""]),
  );

  return lines.join("\n");
}

export function videoScriptDocx(
  article: Article,
  draft: VideoScriptDraft,
): Uint8Array {
  const rowsXml = draft.scenes
    .flatMap((s, i) =>
      (s.beats?.length
        ? s.beats
        : [
            {
              id: s.id,
              spokenSentence: s.narration,
              visualType: "B-ROLL VIDEO" as const,
              visualDirection: s.visual,
              onScreenText: s.onScreenText,
              seconds: s.seconds,
            },
          ]
      ).map(
        (beat, bIdx) =>
          `<w:tr>` +
          `<w:tc>` +
          `<w:p><w:r><w:rPr><w:b/></w:rPr><w:t xml:space="preserve">${xmlEscape(`${bIdx === 0 ? `${i + 1}. ${s.title} — ` : ""}[${beat.visualType}] (${beat.seconds}s)`)}</w:t></w:r></w:p>` +
          `<w:p><w:r><w:t xml:space="preserve">${xmlEscape(`Visual: ${beat.visualDirection}`)}</w:t></w:r></w:p>` +
          `<w:p><w:r><w:t xml:space="preserve">${xmlEscape(`On-Screen Text: "${beat.onScreenText}"`)}</w:t></w:r></w:p>` +
          `</w:tc>` +
          `<w:tc><w:p><w:r><w:t xml:space="preserve">${xmlEscape(beat.spokenSentence)}</w:t></w:r></w:p></w:tc>` +
          `</w:tr>`,
      ),
    )
    .join("");

  const tableXml =
    `<w:tbl><w:tblPr><w:tblBorders>` +
    `<w:top w:val="single" w:sz="4" w:color="CBD5E1"/>` +
    `<w:bottom w:val="single" w:sz="4" w:color="CBD5E1"/>` +
    `<w:left w:val="single" w:sz="4" w:color="CBD5E1"/>` +
    `<w:right w:val="single" w:sz="4" w:color="CBD5E1"/>` +
    `<w:insideH w:val="single" w:sz="4" w:color="CBD5E1"/>` +
    `<w:insideV w:val="single" w:sz="4" w:color="CBD5E1"/>` +
    `</w:tblBorders></w:tblPr>` +
    `<w:tr><w:tc><w:p><w:r><w:rPr><w:b/></w:rPr><w:t>Scene, Visual Type &amp; Background Direction</w:t></w:r></w:p></w:tc>` +
    `<w:tc><w:p><w:r><w:rPr><w:b/></w:rPr><w:t>Spoken Voiceover Sentence</w:t></w:r></w:p></w:tc></w:tr>` +
    rowsXml +
    `</w:tbl>`;

  return buildMinimalDocx(
    `${article.title} — Production Video Script`,
    `${draft.mode === "shorts" ? "Short-form script" : "Long-form YouTube script"} · ${draft.wpm} WPM · ~${Math.floor(draft.totalSeconds / 60)}m ${draft.totalSeconds % 60}s`,
    tableXml,
  );
}

// ============================================================================
// 2. BLOG TO SOCIAL POSTS (Multi-Idea Editorial Posts Modeled on User Screenshots)
// ============================================================================
export type SocialPostIdea = {
  id: string;
  label: string;
  content: string;
};

export type SocialPost = {
  id: string;
  platform:
    | "LinkedIn"
    | "X / Twitter Thread"
    | "Facebook"
    | "Instagram"
    | "Threads";
  angle: string;
  content: string;
  charLimit: number;
  ideas: SocialPostIdea[];
};

function extractHashtags(title: string): string {
  const stop = new Set([
    "the",
    "and",
    "for",
    "with",
    "from",
    "your",
    "how",
    "why",
    "what",
    "when",
    "into",
    "that",
    "this",
    "guide",
    "complete",
  ]);
  const words = title
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !stop.has(w.toLowerCase()));
  const tags = words
    .slice(0, 4)
    .map((w) => `#${w.charAt(0).toUpperCase()}${w.slice(1).toLowerCase()}`);
  for (const fallback of ["#ContentStrategy", "#DigitalMarketing", "#SEO", "#AIWorkflows"]) {
    if (tags.length < 4 && !tags.includes(fallback)) tags.push(fallback);
  }
  return tags.join(" ");
}

export function buildSocialPosts(
  article: Article,
  angle: "takeaways" | "educational" | "discussion" = "takeaways",
  includeSourceLink = true,
): SocialPost[] {
  const err = validate(article);
  if (err) throw Error(err);

  const sections = groupArticleSections(article);
  const allSentences = sections
    .flatMap((sec) => [
      ...sec.paragraphs.flatMap((p) => splitSentences(p)),
      ...sec.bullets.flatMap((b) => splitSentences(b)),
    ])
    .filter((s) => s.length >= 25);

  const hashtags = extractHashtags(article.title);
  const url = article.source || "https://doitwithai.tools";
  const ctaBlock = includeSourceLink
    ? `\n\nFor a deeper dive and the full workflow, read the complete article:\n${url}`
    : `\n\nReview your current workflow against these steps before publishing your next piece.`;

  const coreOpening =
    allSentences[0] ||
    `A strong workflow around ${article.title} starts with a clear task, not just more output.`;
  const secondInsight =
    allSentences[1] ||
    `When teams skip the structural review, even good ideas get lost in execution.`;
  const thirdInsight =
    allSentences[2] ||
    `Connecting strategy, creation, and measurement turns isolated efforts into a repeatable system.`;

  const sectionBullets = sections
    .slice(0, 5)
    .map((sec, idx) => {
      const pt =
        sec.bullets[0] ||
        splitSentences(sec.paragraphs[0] || "")[0] ||
        sec.heading;
      const cleanPt = pt.replace(/^\s*(?:[•▪▸◦–—-]|\d+\.)\s*/, "").trim();
      return sec.heading && sec.heading !== article.title
        ? `• ${sec.heading}: ${cleanPt}`
        : `• Step ${idx + 1}: ${cleanPt}`;
    })
    .slice(0, 5);

  while (sectionBullets.length < 4 && allSentences[sectionBullets.length]) {
    sectionBullets.push(`• ${allSentences[sectionBullets.length]}`);
  }

  // ---- LINKEDIN (3 High-Quality Editorial Ideas matching image_ad573c.png) ----
  const linkedinIdeas: SocialPostIdea[] = [
    {
      id: "li-1",
      label: "Idea 1 · Problem → Checklist & Practical Review",
      content: [
        `${article.title} has one clear job: turning scattered effort into a system that actually compounds.`,
        "",
        `${coreOpening} ${secondInsight}`,
        "",
        "Before scaling your next round of work, review the process as an operator:",
        ...sectionBullets.slice(0, 4),
        "",
        thirdInsight,
        ctaBlock,
        "",
        hashtags,
      ]
        .join("\n")
        .trim(),
    },
    {
      id: "li-2",
      label: "Idea 2 · Contrarian Hook & Strategic Deep-Dive",
      content: [
        `Doing more of the same task faster does not automatically create better results.`,
        "",
        `In our latest breakdown on ${article.title}, we looked at why teams hit a ceiling—and what separates isolated experiments from a repeatable operating system:`,
        "",
        ...sections.slice(0, 4).map((sec, i) => {
          const detail =
            splitSentences(sec.paragraphs[0] || sec.bullets[0] || "")[0] ||
            sec.heading;
          return `${i + 1}. ${sec.heading}\n   ${detail}`;
        }),
        "",
        "Human expertise and editorial judgment still set the direction. The system connects the steps so every cycle improves the next one.",
        ctaBlock,
        "",
        hashtags,
      ]
        .join("\n")
        .trim(),
    },
    {
      id: "li-3",
      label: "Idea 3 · Before vs. After Playbook",
      content: [
        `Two workflows can use the exact same tools and produce completely different outcomes.`,
        "",
        `BEFORE (Disconnected Execution):\n• Treating each deliverable as a one-off campaign\n• Measuring activity volume instead of audience impact\n• Publishing without a feedback loop`,
        "",
        `AFTER (Connected System — ${article.title}):\n${sectionBullets.slice(0, 3).join("\n")}`,
        "",
        coreOpening,
        ctaBlock,
        "",
        hashtags,
      ]
        .join("\n")
        .trim(),
    },
  ];

  // ---- X / TWITTER THREAD (3 Ideas with strict <280 char tweets) ----
  const buildTweetThread = (leadHook: string) => {
    const tweets = [
      `1/ ${leadHook.slice(0, 220)}\n\nA breakdown on ${article.title.slice(0, 90)}:`,
      ...sections.slice(0, 5).map((sec, i) => {
        const body =
          splitSentences(sec.paragraphs[0] || sec.bullets[0] || "")[0] ||
          sec.heading;
        return `${i + 2}/ ${sec.heading.slice(0, 65)}\n\n${body.slice(0, 185)}`;
      }),
    ];
    const lastNum = tweets.length + 1;
    tweets.push(
      includeSourceLink
        ? `${lastNum}/ Want the full guide and checklist?\n\nRead the complete article here: ${url}`
        : `${lastNum}/ Bottom line: connect your strategy, execution, and feedback loop so every piece compounds over time.`,
    );
    return tweets.join("\n\n---\n\n");
  };

  const xIdeas: SocialPostIdea[] = [
    {
      id: "x-1",
      label: "Idea 1 · Step-by-Step Thread (6–7 Tweets)",
      content: buildTweetThread(coreOpening),
    },
    {
      id: "x-2",
      label: "Idea 2 · Contrarian Insight Thread",
      content: buildTweetThread(
        `Most teams focus on speed when they should be fixing the underlying workflow. ${secondInsight}`,
      ),
    },
    {
      id: "x-3",
      label: "Idea 3 · Single High-Impact X Post",
      content: [
        `${article.title}:`,
        "",
        ...sectionBullets.slice(0, 4).map((b) => b.slice(0, 95)),
        "",
        includeSourceLink ? `Full breakdown: ${url}` : coreOpening.slice(0, 120),
      ].join("\n"),
    },
  ];

  // ---- FACEBOOK (3 Ideas modeled on image_ad5496.png) ----
  const facebookIdeas: SocialPostIdea[] = [
    {
      id: "fb-1",
      label: "Idea 1 · Reader Task & Practical Review (Editorial Style)",
      content: [
        `Your workflow can use the right tools and still miss the core objective.`,
        "",
        `${coreOpening} ${secondInsight}`,
        "",
        `A practical review from "${article.title}":`,
        ...sectionBullets.slice(0, 4),
        "",
        thirdInsight,
        ctaBlock,
      ]
        .join("\n")
        .trim(),
    },
    {
      id: "fb-2",
      label: "Idea 2 · Story & Solution Breakdown",
      content: [
        `Why do some teams get compounding results from ${article.title} while others just create more noise?`,
        "",
        coreOpening,
        "",
        "Here are the core pillars to focus on:",
        ...sectionBullets.slice(0, 4),
        ctaBlock,
      ]
        .join("\n")
        .trim(),
    },
    {
      id: "fb-3",
      label: "Idea 3 · Quick Audit Checklist",
      content: [
        `Quick checklist for anyone working on ${article.title} this week:`,
        "",
        ...sectionBullets.slice(0, 5),
        "",
        secondInsight,
        ctaBlock,
      ]
        .join("\n")
        .trim(),
    },
  ];

  // ---- INSTAGRAM (3 Ideas modeled on image_ad547a.png) ----
  const instagramIdeas: SocialPostIdea[] = [
    {
      id: "ig-1",
      label: "Idea 1 · Quick Fix & Direct Path (Modeled on @doitwithaitools)",
      content: [
        `${article.title}. One clear, repeatable system.`,
        "",
        `${coreOpening}`,
        "",
        `${secondInsight}`,
        "",
        "Key steps to review before publishing:",
        ...sectionBullets.slice(0, 4),
        "",
        includeSourceLink
          ? `Read the complete guide through our profile link, or visit:\n${url}`
          : "Save this post for your next workflow review.",
        "",
        hashtags,
      ]
        .join("\n")
        .trim(),
    },
    {
      id: "ig-2",
      label: "Idea 2 · Carousel Companion Caption",
      content: [
        `Swipe through to see how ${article.title} works in practice →`,
        "",
        ...sections.slice(0, 4).map((sec, i) => `Slide ${i + 2}: ${sec.heading}`),
        "",
        thirdInsight,
        "",
        includeSourceLink ? `Full article at:\n${url}` : "Save and share with your team.",
        "",
        hashtags,
      ]
        .join("\n")
        .trim(),
    },
    {
      id: "ig-3",
      label: "Idea 3 · Mistakes to Avoid",
      content: [
        `Stop treating ${article.title} like a one-off checklist.`,
        "",
        coreOpening,
        "",
        "What to focus on instead:",
        ...sectionBullets.slice(0, 3),
        "",
        includeSourceLink ? `Visit:\n${url}` : "",
        "",
        hashtags,
      ]
        .join("\n")
        .trim(),
    },
  ];

  // ---- THREADS (3 Ideas modeled on image_ad573b.png) ----
  const threadsIdeas: SocialPostIdea[] = [
    {
      id: "th-1",
      label: "Idea 1 · High-Signal Concise Note (Modeled on Threads)",
      content: [
        `${coreOpening} ${secondInsight}`,
        "",
        `Key focus for ${article.title}: ${sections
          .slice(0, 3)
          .map((s) => s.heading)
          .join(" → ")}.`,
        "",
        includeSourceLink ? `Explore the full guide:\n${url}` : "",
      ]
        .join("\n")
        .trim()
        .slice(0, 495),
    },
    {
      id: "th-2",
      label: "Idea 2 · Quick Checklist Thread Starter",
      content: [
        `${article.title} in 3 steps:`,
        ...sectionBullets.slice(0, 3).map((b) => b.slice(0, 110)),
        "",
        includeSourceLink ? `Full breakdown: ${url}` : "",
      ]
        .join("\n")
        .trim()
        .slice(0, 495),
    },
    {
      id: "th-3",
      label: "Idea 3 · Discussion Question",
      content: [
        `${thirdInsight}`,
        "",
        `How is your team handling ${article.title} right now?`,
        includeSourceLink ? `\nRead our guide: ${url}` : "",
      ]
        .join("\n")
        .trim()
        .slice(0, 495),
    },
  ];

  const defaultIdeaIdx =
    angle === "educational" ? 1 : angle === "discussion" ? 2 : 0;

  return [
    {
      id: "linkedin",
      platform: "LinkedIn",
      angle,
      content: linkedinIdeas[defaultIdeaIdx]?.content || linkedinIdeas[0].content,
      charLimit: 3000,
      ideas: linkedinIdeas,
    },
    {
      id: "x-thread",
      platform: "X / Twitter Thread",
      angle,
      content: xIdeas[defaultIdeaIdx]?.content || xIdeas[0].content,
      charLimit: 2200,
      ideas: xIdeas,
    },
    {
      id: "facebook",
      platform: "Facebook",
      angle,
      content: facebookIdeas[defaultIdeaIdx]?.content || facebookIdeas[0].content,
      charLimit: 2200,
      ideas: facebookIdeas,
    },
    {
      id: "instagram",
      platform: "Instagram",
      angle,
      content: instagramIdeas[defaultIdeaIdx]?.content || instagramIdeas[0].content,
      charLimit: 2200,
      ideas: instagramIdeas,
    },
    {
      id: "threads",
      platform: "Threads",
      angle,
      content: threadsIdeas[defaultIdeaIdx]?.content || threadsIdeas[0].content,
      charLimit: 500,
      ideas: threadsIdeas,
    },
  ];
}

export function socialPostsTxt(article: Article, posts: SocialPost[]): string {
  const out: string[] = [
    `SOCIAL MEDIA CAMPAIGN PACK: ${article.title}`,
    article.source ? `Source Article: ${article.source}` : "",
    "",
  ];
  for (const p of posts) {
    out.push(
      `====================================================================`,
      `PLATFORM: ${p.platform} (Selected Draft · ${p.content.length} chars)`,
      `====================================================================`,
      p.content,
      "",
    );
    if (p.ideas?.length > 1) {
      for (const idea of p.ideas) {
        out.push(`--- [${p.platform} · ${idea.label}] ---`, idea.content, "");
      }
    }
  }
  return out.filter((l) => l !== undefined).join("\n");
}

export function socialPostsCsv(article: Article, posts: SocialPost[]): string {
  const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const rows: string[] = [
    ["Platform", "Variation", "Characters", "Post Copy", "Source URL"].join(","),
  ];
  for (const p of posts) {
    if (p.ideas?.length) {
      for (const idea of p.ideas) {
        rows.push(
          [
            esc(p.platform),
            esc(idea.label),
            String(idea.content.length),
            esc(idea.content),
            esc(article.source || ""),
          ].join(","),
        );
      }
    } else {
      rows.push(
        [
          esc(p.platform),
          esc(p.angle),
          String(p.content.length),
          esc(p.content),
          esc(article.source || ""),
        ].join(","),
      );
    }
  }
  return rows.join("\r\n") + "\r\n";
}

// ============================================================================
// 3. ARTICLE TO MARKDOWN
// ============================================================================
export function articleToMarkdown(
  article: Article,
  options: { includeFrontmatter?: boolean; includeReferences?: boolean } = {},
): string {
  const err = validate(article);
  if (err) throw Error(err);
  const { includeFrontmatter = true, includeReferences = true } = options;

  const lines: string[] = [];
  if (includeFrontmatter) {
    lines.push("---");
    lines.push(`title: "${article.title.replace(/"/g, '\\"')}"`);
    if (article.byline)
      lines.push(`author: "${article.byline.replace(/"/g, '\\"')}"`);
    if (article.published)
      lines.push(`date: "${article.published.replace(/"/g, '\\"')}"`);
    if (article.source) lines.push(`source: "${article.source}"`);
    lines.push("---", "");
  }

  lines.push(`# ${article.title}`, "");
  if (article.byline || article.published || article.source) {
    const meta = [
      article.byline ? `By ${article.byline}` : "",
      article.published ? `Published ${article.published}` : "",
      article.source ? `[Original source](${article.source})` : "",
    ]
      .filter(Boolean)
      .join(" · ");
    if (meta) lines.push(`*${meta}*`, "");
  }

  for (const b of article.blocks) {
    if (b.kind === "heading") {
      const hashes = "#".repeat(Math.min(6, Math.max(2, b.level || 2)));
      lines.push(`${hashes} ${b.text.trim()}`, "");
    } else if (b.kind === "paragraph") {
      lines.push(b.text.trim(), "");
    } else if (b.kind === "list") {
      const clean = b.text.replace(/^\s*•\s*/, "- ").trim();
      lines.push(clean, "");
    } else if (b.kind === "quote") {
      lines.push(
        b.text
          .trim()
          .split("\n")
          .map((l) => `> ${l}`)
          .join("\n"),
        "",
      );
    } else if (b.kind === "code") {
      lines.push("```", b.text, "```", "");
    } else if (b.kind === "table" && b.cells?.length) {
      const cols = Math.max(...b.cells.map((r) => r.length), 1);
      const padRow = (r: string[]) =>
        `| ${Array.from({ length: cols }, (_, i) => (r[i] || "").replace(/\|/g, "\\|").replace(/\n/g, " ")).join(" | ")} |`;
      lines.push(padRow(b.cells[0]));
      lines.push(`| ${Array.from({ length: cols }, () => "---").join(" | ")} |`);
      for (const row of b.cells.slice(1)) {
        lines.push(padRow(row));
      }
      lines.push("");
    } else if (b.kind === "image" && b.src) {
      lines.push(`![${b.alt || "Article image"}](${b.src})`, "");
    }
  }

  if (includeReferences && article.links.length > 0) {
    lines.push("## References", "");
    article.links.forEach((l, i) => {
      lines.push(`${i + 1}. [${l.label}](${l.url})`);
    });
    lines.push("");
  }

  return lines.join("\n").trim() + "\n";
}

// ============================================================================
// 4. ARTICLE TO EPUB (Valid EPUB 3 Package)
// ============================================================================
export function articleToEpub(
  article: Article,
  options: { theme?: "serif" | "sans"; lang?: string } = {},
): { epubBytes: Uint8Array; xhtml: string } {
  const err = validate(article);
  if (err) throw Error(err);

  const theme = options.theme || "serif";
  const lang = options.lang || "en";
  const bookId = `urn:uuid:diwat-${Date.now()}`;
  const modified = new Date().toISOString().replace(/\.\d+Z$/, "Z");

  const headings: Array<{ id: string; text: string }> = [];
  const bodyParts: string[] = [];

  article.blocks.forEach((b, idx) => {
    if (b.kind === "heading") {
      const hid = `sec-${idx + 1}`;
      const tag = `h${Math.min(4, Math.max(2, b.level || 2))}`;
      headings.push({ id: hid, text: stripRefs(b.text) });
      bodyParts.push(`<${tag} id="${hid}">${xmlEscape(b.text)}</${tag}>`);
    } else if (b.kind === "paragraph") {
      bodyParts.push(`<p>${xmlEscape(b.text)}</p>`);
    } else if (b.kind === "list") {
      bodyParts.push(`<p class="list-item">${xmlEscape(b.text)}</p>`);
    } else if (b.kind === "quote") {
      bodyParts.push(`<blockquote><p>${xmlEscape(b.text)}</p></blockquote>`);
    } else if (b.kind === "code") {
      bodyParts.push(`<pre><code>${xmlEscape(b.text)}</code></pre>`);
    } else if (b.kind === "table" && b.cells?.length) {
      const trs = b.cells
        .map(
          (row, rIdx) =>
            `<tr>${row
              .map((c) =>
                b.header && rIdx === 0
                  ? `<th>${xmlEscape(c)}</th>`
                  : `<td>${xmlEscape(c)}</td>`,
              )
              .join("")}</tr>`,
        )
        .join("");
      bodyParts.push(`<table><tbody>${trs}</tbody></table>`);
    }
  });

  if (article.links.length > 0) {
    bodyParts.push(
      `<h2 id="references">References</h2><ol>` +
        article.links
          .map(
            (l) =>
              `<li><a href="${xmlEscape(safeLink(l.url))}">${xmlEscape(l.label)}</a></li>`,
          )
          .join("") +
        `</ol>`,
    );
  }

  const fontStack =
    theme === "sans"
      ? "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
      : "Georgia, 'Times New Roman', serif";

  const css = [
    `body { font-family: ${fontStack}; line-height: 1.65; margin: 1.2em; color: #111827; }`,
    `h1, h2, h3, h4 { line-height: 1.3; margin-top: 1.4em; color: #1f2937; }`,
    `p { margin: 0.75em 0; }`,
    `.meta { font-size: 0.9em; color: #4b5563; border-bottom: 1px solid #e5e7eb; padding-bottom: 0.8em; margin-bottom: 1.2em; }`,
    `blockquote { border-left: 3px solid #9a3412; padding-left: 1em; font-style: italic; color: #374151; }`,
    `pre { background: #f3f4f6; padding: 0.8em; overflow-x: auto; font-family: monospace; }`,
    `table { border-collapse: collapse; width: 100%; margin: 1em 0; }`,
    `th, td { border: 1px solid #d1d5db; padding: 0.5em; text-align: left; }`,
  ].join("\n");

  const metaLine = [
    article.byline ? `By ${xmlEscape(article.byline)}` : "",
    article.published ? `Published ${xmlEscape(article.published)}` : "",
    article.source
      ? `<a href="${xmlEscape(safeLink(article.source))}">${xmlEscape(article.source)}</a>`
      : "",
  ]
    .filter(Boolean)
    .join(" · ");

  const xhtml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<!DOCTYPE html>\n` +
    `<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="${xmlEscape(lang)}">\n` +
    `<head><meta charset="UTF-8"/><title>${xmlEscape(article.title)}</title><link rel="stylesheet" type="text/css" href="style.css"/></head>\n` +
    `<body>\n` +
    `<h1 id="top">${xmlEscape(article.title)}</h1>\n` +
    (metaLine ? `<p class="meta">${metaLine}</p>\n` : "") +
    bodyParts.join("\n") +
    `\n</body></html>`;

  const navItems = (
    headings.length ? headings : [{ id: "top", text: article.title }]
  )
    .map(
      (h) =>
        `<li><a href="article.xhtml#${h.id}">${xmlEscape(h.text)}</a></li>`,
    )
    .join("");

  const navXhtml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<!DOCTYPE html>\n` +
    `<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="${xmlEscape(lang)}">\n` +
    `<head><meta charset="UTF-8"/><title>Table of Contents</title></head>\n` +
    `<body><nav epub:type="toc" id="toc"><h1>Contents</h1><ol>${navItems}</ol></nav></body></html>`;

  const opf =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="bookid">\n` +
    `<metadata xmlns:dc="http://purl.org/dc/elements/1.1/">\n` +
    `<dc:identifier id="bookid">${xmlEscape(bookId)}</dc:identifier>\n` +
    `<dc:title>${xmlEscape(article.title)}</dc:title>\n` +
    `<dc:language>${xmlEscape(lang)}</dc:language>\n` +
    (article.byline
      ? `<dc:creator>${xmlEscape(article.byline)}</dc:creator>\n`
      : "") +
    `<meta property="dcterms:modified">${modified}</meta>\n` +
    `</metadata>\n` +
    `<manifest>\n` +
    `<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>\n` +
    `<item id="css" href="style.css" media-type="text/css"/>\n` +
    `<item id="article" href="article.xhtml" media-type="application/xhtml+xml"/>\n` +
    `</manifest>\n` +
    `<spine><itemref idref="article"/></spine>\n` +
    `</package>`;

  const containerXml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">\n` +
    `<rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/epub+xml"/></rootfiles>\n` +
    `</container>`;

  const epubBytes = zipStored({
    mimetype: "application/epub+zip",
    "META-INF/container.xml": containerXml,
    "OEBPS/content.opf": opf,
    "OEBPS/nav.xhtml": navXhtml,
    "OEBPS/style.css": css,
    "OEBPS/article.xhtml": xhtml,
  });

  return { epubBytes, xhtml };
}

// ============================================================================
// 5. BLOG TO NEWSLETTER (Executive Briefing & Founder Deep-Dive Studio)
// ============================================================================
export type NewsletterDraft = {
  style: "executive" | "founder" | "checklist";
  subjectOptions: string[];
  selectedSubject: string;
  preheader: string;
  greeting: string;
  intro: string;
  whyItMatters: string;
  takeaways: string[];
  sections: Array<{ heading: string; summary: string; actionItem: string }>;
  checklist: string[];
  ctaLabel: string;
  ctaUrl: string;
};

export function buildNewsletter(
  article: Article,
  style: "executive" | "founder" | "checklist" = "executive",
): NewsletterDraft {
  const err = validate(article);
  if (err) throw Error(err);

  const grouped = groupArticleSections(article);
  const allSents = grouped
    .flatMap((g) => g.paragraphs.flatMap((p) => splitSentences(p)))
    .filter((s) => s.length >= 20);

  const firstPara =
    allSents.slice(0, 2).join(" ") ||
    `In this edition, we are breaking down "${article.title}" into a practical playbook you can apply right away.`;
  const whyItMatters =
    allSents.slice(2, 4).join(" ") ||
    allSents[1] ||
    `Most teams focus on surface-level output without connecting strategy, execution, and measurement into a repeatable loop.`;

  const takeaways = grouped
    .flatMap((g) =>
      g.bullets.length
        ? g.bullets.slice(0, 2)
        : splitSentences(g.paragraphs[0] || "").slice(0, 1),
    )
    .filter((t) => t.length >= 18)
    .slice(0, 5);

  if (!takeaways.length) takeaways.push(article.title);

  const sections = grouped.slice(0, 6).map((g, idx) => {
    const bodySents = g.paragraphs.flatMap((p) => splitSentences(p));
    const summary =
      bodySents.slice(0, 2).join(" ") ||
      g.bullets.slice(0, 2).join(" ") ||
      g.heading;
    const actionItem =
      g.bullets[0] ||
      bodySents[2] ||
      `Review how your current workflow handles ${g.heading.toLowerCase()}.`;
    return {
      heading:
        g.heading === article.title ? `Part ${idx + 1} · Core Premise` : g.heading,
      summary,
      actionItem,
    };
  });

  const checklist = sections
    .slice(0, 5)
    .map(
      (s, i) =>
        `Step ${i + 1}: Audit "${s.heading}" — ${s.actionItem.replace(/^\s*•\s*/, "")}`,
    );

  const subjectOptions = [
    `The playbook for ${article.title}`,
    `Why most teams get ${article.title} wrong (and how to fix it)`,
    `[${style === "executive" ? "Briefing" : "Deep Dive"}] ${article.title}`,
    `${sections.length} takeaways on ${article.title}`,
    `Before you scale: a practical review of ${article.title}`,
  ];

  const greeting =
    style === "founder"
      ? "Hi friend,"
      : style === "checklist"
        ? "Team,"
        : "Hello,";

  return {
    style,
    subjectOptions,
    selectedSubject: subjectOptions[0],
    preheader: firstPara.slice(0, 140),
    greeting,
    intro: firstPara,
    whyItMatters,
    takeaways,
    sections,
    checklist,
    ctaLabel: "Read the full article on our website →",
    ctaUrl: article.source || "https://doitwithai.tools",
  };
}

export function newsletterTxt(
  article: Article,
  draft: NewsletterDraft,
): string {
  return [
    `SUBJECT: ${draft.selectedSubject}`,
    `PREHEADER: ${draft.preheader}`,
    "",
    draft.greeting,
    "",
    draft.intro,
    "",
    "WHY THIS MATTERS:",
    draft.whyItMatters,
    "",
    "KEY TAKEAWAYS:",
    ...draft.takeaways.map((t) => `• ${t.replace(/^\s*•\s*/, "")}`),
    "",
    "--- DEEP-DIVE BREAKDOWN ---",
    "",
    ...draft.sections.flatMap((s) => [
      `### ${s.heading}`,
      s.summary,
      `→ Action step: ${s.actionItem}`,
      "",
    ]),
    "--- IMPLEMENTATION CHECKLIST ---",
    ...(draft.checklist || []).map((c) => `[ ] ${c}`),
    "",
    `${draft.ctaLabel}: ${draft.ctaUrl}`,
  ].join("\n");
}

export function newsletterHtml(
  article: Article,
  draft: NewsletterDraft,
): string {
  const itemsHtml = draft.takeaways
    .map(
      (t) =>
        `<li style="margin-bottom:8px;">${xmlEscape(t.replace(/^\s*•\s*/, ""))}</li>`,
    )
    .join("");
  const secsHtml = draft.sections
    .map(
      (s) =>
        `<div style="margin:22px 0;padding-bottom:18px;border-bottom:1px solid #e2e8f0;">` +
        `<h2 style="font-size:18px;color:#0f172a;margin:0 0 8px;">${xmlEscape(s.heading)}</h2>` +
        `<p style="margin:0 0 10px;color:#334155;line-height:1.65;">${xmlEscape(s.summary)}</p>` +
        (s.actionItem
          ? `<p style="margin:0;font-size:13px;color:#1d4ed8;background:#eff6ff;padding:8px 12px;border-radius:6px;"><strong>Action item:</strong> ${xmlEscape(s.actionItem)}</p>`
          : "") +
        `</div>`,
    )
    .join("");
  const checkHtml = (draft.checklist || [])
    .map(
      (c) =>
        `<li style="margin-bottom:8px;color:#1e293b;">&#9744; ${xmlEscape(c)}</li>`,
    )
    .join("");

  return (
    `<!DOCTYPE html>\n<html lang="en"><head><meta charset="UTF-8"/><title>${xmlEscape(draft.selectedSubject)}</title></head>` +
    `<body style="margin:0;padding:24px;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#0f172a;">` +
    `<div style="display:none;max-height:0;overflow:hidden;">${xmlEscape(draft.preheader)}</div>` +
    `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #cbd5e1;border-radius:16px;overflow:hidden;">` +
    `<tr><td style="background:#1e293b;padding:24px 32px;color:#ffffff;">` +
    `<p style="margin:0 0 6px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:#fb923c;">Editorial Newsletter Briefing</p>` +
    `<h1 style="margin:0;font-size:24px;line-height:1.3;color:#ffffff;">${xmlEscape(article.title)}</h1>` +
    `</td></tr>` +
    `<tr><td style="padding:32px;">` +
    `<p style="margin:0 0 14px;color:#334155;line-height:1.65;">${xmlEscape(draft.greeting)}</p>` +
    `<p style="margin:0 0 18px;color:#0f172a;font-size:16px;line-height:1.65;">${xmlEscape(draft.intro)}</p>` +
    (draft.whyItMatters
      ? `<div style="background:#f8fafc;border:1px solid #e2e8f0;padding:16px;margin:0 0 20px;border-radius:10px;">` +
        `<strong style="display:block;margin-bottom:6px;color:#0f172a;font-size:13px;text-transform:uppercase;">Why This Matters Now</strong>` +
        `<p style="margin:0;color:#475569;line-height:1.6;font-size:14px;">${xmlEscape(draft.whyItMatters)}</p></div>`
      : "") +
    (itemsHtml
      ? `<div style="background:#fff7ed;border-left:4px solid #ea580c;padding:16px;margin:0 0 24px;border-radius:6px;">` +
        `<strong style="display:block;margin-bottom:8px;color:#9a3412;">KEY TAKEAWAYS:</strong>` +
        `<ul style="margin:0;padding-left:20px;color:#334155;line-height:1.6;">${itemsHtml}</ul></div>`
      : "") +
    secsHtml +
    (checkHtml
      ? `<div style="background:#f0fdf4;border:1px solid #bbf7d0;padding:18px;margin:24px 0;border-radius:10px;">` +
        `<strong style="display:block;margin-bottom:10px;color:#166534;">Quick Implementation Checklist</strong>` +
        `<ul style="list-style:none;margin:0;padding:0;line-height:1.6;font-size:14px;">${checkHtml}</ul></div>`
      : "") +
    (draft.ctaUrl
      ? `<p style="margin:28px 0 8px;text-align:center;"><a href="${xmlEscape(safeLink(draft.ctaUrl) || "https://doitwithai.tools")}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;font-weight:700;padding:14px 26px;border-radius:10px;">${xmlEscape(draft.ctaLabel)}</a></p>`
      : "") +
    `</td></tr></table></body></html>`
  );
}

export function newsletterDocx(
  article: Article,
  draft: NewsletterDraft,
): Uint8Array {
  const body = [
    docxParagraph(draft.selectedSubject, "Heading1", "Subject: "),
    docxParagraph(draft.preheader, "Normal", "Preview text: "),
    docxParagraph(draft.greeting),
    docxParagraph(draft.intro),
    docxParagraph("Why This Matters", "Heading2"),
    docxParagraph(draft.whyItMatters || ""),
    docxParagraph("Key Takeaways", "Heading2"),
    ...draft.takeaways.map((t) =>
      docxParagraph(`• ${t.replace(/^\s*•\s*/, "")}`),
    ),
    ...draft.sections.flatMap((s) => [
      docxParagraph(s.heading, "Heading2"),
      docxParagraph(s.summary),
      docxParagraph(s.actionItem || "", "Normal", "Action Step: "),
    ]),
    docxParagraph("Implementation Checklist", "Heading2"),
    ...(draft.checklist || []).map((c) => docxParagraph(`☐ ${c}`)),
    docxParagraph(`${draft.ctaLabel}: ${draft.ctaUrl}`, "Normal", "CTA: "),
  ].join("");
  return buildMinimalDocx(`${article.title} — Newsletter Edition`, "", body);
}

// ============================================================================
// 6. BLOG TO LINKEDIN CAROUSEL (Grand Studio Tool Modeled on image_ad573d.png & image_ad547a.png)
// ============================================================================
export type CarouselTemplateId =
  | "saas-comparison"
  | "before-after"
  | "executive-editorial"
  | "founder-playbook"
  | "cyber-dark"
  | "blueprint-grid";

export type CarouselBrandConfig = {
  template: CarouselTemplateId;
  bgColor: string;
  bgSecondaryColor: string;
  accentColor: string;
  textColor: string;
  cardBgColor: string;
  brandName: string;
  websiteUrl: string;
  categoryKicker: string;
  logoDataUrl?: string;
  aspect: "portrait" | "square";
};

export type CarouselSlide = {
  number: number;
  kind: "cover" | "point" | "comparison" | "cta";
  kicker: string;
  headline: string;
  highlightPhrase: string;
  body: string;
  cardLeftTitle: string;
  cardLeftBody: string;
  cardRightTitle: string;
  cardRightBody: string;
  footer: string;
};

export const CAROUSEL_THEME_PRESETS: Record<
  CarouselTemplateId,
  Omit<CarouselBrandConfig, "brandName" | "websiteUrl" | "categoryKicker" | "logoDataUrl" | "aspect"> & {
    name: string;
    description: string;
  }
> = {
  "saas-comparison": {
    template: "saas-comparison",
    name: "SaaS UI Comparison (Electric Blue & Lime)",
    description: "Modeled on Do It With AI Tools LinkedIn cards: electric blue canvas, lime-highlighted headline words, and connected macOS window cards.",
    bgColor: "#1D4ED8",
    bgSecondaryColor: "#1E3A8A",
    accentColor: "#D9F99D",
    textColor: "#FFFFFF",
    cardBgColor: "#0F172A",
  },
  "before-after": {
    template: "before-after",
    name: "Before vs. After Flow (Midnight Navy & Cyan)",
    description: "Deep midnight navy canvas with glowing rings, BEFORE -> AFTER workflow comparison boxes, and bordered CTA card.",
    bgColor: "#061026",
    bgSecondaryColor: "#0F244A",
    accentColor: "#38BDF8",
    textColor: "#FFFFFF",
    cardBgColor: "#1E293B",
  },
  "executive-editorial": {
    template: "executive-editorial",
    name: "Executive Editorial (Plum & Coral)",
    description: "High-contrast editorial plum background with warm coral highlights, oversized slide numbers, and structured insight cards.",
    bgColor: "#291B26",
    bgSecondaryColor: "#3B2336",
    accentColor: "#FB923C",
    textColor: "#FFFFFF",
    cardBgColor: "#1E131C",
  },
  "founder-playbook": {
    template: "founder-playbook",
    name: "Founder Playbook (Crisp Light & Cobalt)",
    description: "Clean light studio canvas with deep navy typography, royal cobalt highlights, and elevated white comparison cards.",
    bgColor: "#F8FAFC",
    bgSecondaryColor: "#EFF6FF",
    accentColor: "#2563EB",
    textColor: "#0F172A",
    cardBgColor: "#FFFFFF",
  },
  "cyber-dark": {
    template: "cyber-dark",
    name: "Minimalist Dark Mode (Carbon & Emerald)",
    description: "Sleek developer/marketer dark mode with neon emerald highlights and glass-bordered workflow cards.",
    bgColor: "#090D16",
    bgSecondaryColor: "#111827",
    accentColor: "#34D399",
    textColor: "#F8FAFC",
    cardBgColor: "#1E293B",
  },
  "blueprint-grid": {
    template: "blueprint-grid",
    name: "Framework Blueprint (Indigo & Amber)",
    description: "Architectural grid lines with bold amber highlight phrases and side-by-side pillar cards.",
    bgColor: "#1E1B4B",
    bgSecondaryColor: "#312E81",
    accentColor: "#FBBF24",
    textColor: "#FFFFFF",
    cardBgColor: "#0F172A",
  },
};

function pickHighlightWords(headline: string): string {
  const words = headline.trim().split(/\s+/);
  if (words.length <= 3) return headline;
  return words.slice(Math.max(1, words.length - 3)).join(" ");
}

export function buildLinkedinCarousel(
  article: Article,
  maxSlides = 8,
): CarouselSlide[] {
  const err = validate(article);
  if (err) throw Error(err);

  const sections = groupArticleSections(article);
  const allSents = sections
    .flatMap((s) => s.paragraphs.flatMap((p) => splitSentences(p)))
    .filter((s) => s.length >= 20);

  const slides: CarouselSlide[] = [];

  // Slide 1: High-Impact Cover Slide (modeled on image_ad573d.png)
  const coverHeadline = article.title.slice(0, 95);
  const firstInsight =
    allSents[0] ||
    "Understand the complete workflow before rewriting or scaling output.";
  const secondInsight =
    allSents[1] ||
    "Connect strategy, execution, and measurement into one repeatable system.";

  slides.push({
    number: 1,
    kind: "cover",
    kicker: "PRACTICAL PLAYBOOK",
    headline: coverHeadline,
    highlightPhrase: pickHighlightWords(coverHeadline),
    body: firstInsight.slice(0, 155),
    cardLeftTitle: "COMMON ASSUMPTION",
    cardLeftBody: firstInsight.slice(0, 95),
    cardRightTitle: "WHAT ACTUALLY WORKS",
    cardRightBody: secondInsight.slice(0, 95),
    footer: "Understand the system before scaling output.",
  });

  // Middle Slides: Topic-by-Topic Insight & Comparison Slides
  const targetMiddle = Math.max(4, Math.min(maxSlides - 2, 10));
  for (let i = 0; i < targetMiddle && i < sections.length; i++) {
    const sec = sections[i];
    const sents = sec.paragraphs.flatMap((p) => splitSentences(p));
    const head =
      sec.heading && sec.heading !== article.title
        ? sec.heading
        : `Core Pillar ${i + 1}: ${pickHighlightWords(sents[0] || article.title)}`;
    const mainBody =
      sents[0] ||
      sec.bullets[0] ||
      `Build a structured process around ${head}.`;
    const leftText =
      sents[1] ||
      sec.bullets[0] ||
      `Isolated execution without clear criteria or review.`;
    const rightText =
      sec.bullets[1] ||
      sents[2] ||
      sents[0] ||
      `Connected workflow with measurable quality checks.`;

    slides.push({
      number: slides.length + 1,
      kind: i % 2 === 1 ? "comparison" : "point",
      kicker: `STEP 0${i + 1} / KEY INSIGHT`,
      headline: head.slice(0, 88),
      highlightPhrase: pickHighlightWords(head.slice(0, 88)),
      body: mainBody.slice(0, 175),
      cardLeftTitle: i % 2 === 1 ? "BEFORE / WITHOUT SYSTEM" : "KEY OBSERVATION",
      cardLeftBody: leftText.slice(0, 105),
      cardRightTitle: i % 2 === 1 ? "AFTER / WITH SYSTEM" : "ACTIONABLE RULE",
      cardRightBody: rightText.slice(0, 105),
      footer: `Review step ${i + 1} before moving to the next stage.`,
    });
  }

  // Ensure at least 6 slides even on short articles
  while (slides.length < Math.min(6, maxSlides - 1) && allSents[slides.length]) {
    const s = allSents[slides.length];
    const hl = s.split(/\s+/).slice(0, 7).join(" ");
    slides.push({
      number: slides.length + 1,
      kind: "point",
      kicker: `KEY TAKEAWAY 0${slides.length}`,
      headline: hl,
      highlightPhrase: pickHighlightWords(hl),
      body: s.slice(0, 175),
      cardLeftTitle: "CHECKPOINT",
      cardLeftBody: s.slice(0, 95),
      cardRightTitle: "NEXT ACTION",
      cardRightBody: (allSents[slides.length + 1] || firstInsight).slice(0, 95),
      footer: "Keep every step grounded in your source evidence.",
    });
  }

  // Final Slide: Actionable Summary & CTA (modeled on image_ad547a.png bottom CTA box)
  slides.push({
    number: slides.length + 1,
    kind: "cta",
    kicker: "NEXT STEP / FULL GUIDE",
    headline: "Apply this workflow to your next project.",
    highlightPhrase: "your next project.",
    body: `Read the complete guide "${article.title.slice(0, 80)}" for the full checklist and examples.`,
    cardLeftTitle: "KEY PRINCIPLE",
    cardLeftBody: firstInsight.slice(0, 95),
    cardRightTitle: "FULL BREAKDOWN",
    cardRightBody: article.source || "doitwithai.tools/tools",
    footer: article.source || "Visit doitwithai.tools for more free tools",
  });

  return slides;
}

const pdfEscape = (s: string) =>
  s
    .replace(/[^\x20-\x7E]/g, (ch) =>
      ch === "—" || ch === "–"
        ? "-"
        : ch === "’" || ch === "‘"
          ? "'"
          : ch === "“" || ch === "”"
            ? '"'
            : ch === "•"
              ? "*"
              : ch === "→"
                ? "->"
                : " ",
    )
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");

function wrapPdfLines(text: string, maxChars: number): string[] {
  const words = text.replace(/\s+/g, " ").trim().split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if (!w) continue;
    if ((cur + " " + w).trim().length <= maxChars) {
      cur = (cur + " " + w).trim();
    } else {
      if (cur) lines.push(cur);
      cur = w.slice(0, maxChars);
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

function hexToPdfRgb(hex: string): string {
  const clean = hex.replace("#", "").trim();
  const num = parseInt(clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean, 16);
  if (Number.isNaN(num)) return "0.11 0.30 0.85";
  const r = ((num >> 16) & 255) / 255;
  const g = ((num >> 8) & 255) / 255;
  const b = (num & 255) / 255;
  return `${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)}`;
}

export function carouselPdf(
  slides: CarouselSlide[],
  themeOrConfig:
    | "coral"
    | "navy"
    | "slate"
    | Partial<CarouselBrandConfig> = "coral",
  aspect: "portrait" | "square" = "portrait",
): Uint8Array {
  const width = 540;
  const height = aspect === "portrait" ? 675 : 540;

  let bgRgb = "0.114 0.306 0.847";
  let accentRgb = "0.851 0.976 0.616";
  let textRgb = "1 1 1";
  let cardRgb = "0.059 0.090 0.165";
  let brandName = "Do It With AI Tools";
  let websiteUrl = "doitwithai.tools";

  if (typeof themeOrConfig === "string") {
    if (themeOrConfig === "navy") {
      bgRgb = "0.024 0.063 0.149";
      accentRgb = "0.220 0.741 0.973";
    } else if (themeOrConfig === "slate") {
      bgRgb = "0.973 0.980 0.988";
      accentRgb = "0.145 0.388 0.922";
      textRgb = "0.059 0.090 0.165";
      cardRgb = "0.910 0.941 0.996";
    } else {
      bgRgb = "0.161 0.106 0.149";
      accentRgb = "0.984 0.573 0.235";
    }
  } else if (themeOrConfig) {
    if (themeOrConfig.bgColor) bgRgb = hexToPdfRgb(themeOrConfig.bgColor);
    if (themeOrConfig.accentColor) accentRgb = hexToPdfRgb(themeOrConfig.accentColor);
    if (themeOrConfig.textColor) textRgb = hexToPdfRgb(themeOrConfig.textColor);
    if (themeOrConfig.cardBgColor) cardRgb = hexToPdfRgb(themeOrConfig.cardBgColor);
    if (themeOrConfig.brandName) brandName = themeOrConfig.brandName;
    if (themeOrConfig.websiteUrl) websiteUrl = themeOrConfig.websiteUrl;
  }

  const objects: string[] = [];
  const addObj = (body: string) => {
    objects.push(body);
    return objects.length;
  };

  const fontBoldId = addObj(
    `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>`,
  );
  const fontRegId = addObj(
    `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>`,
  );

  const pageIds: number[] = [];
  const pagesRootPlaceholder = addObj("");

  slides.forEach((slide, idx) => {
    const headLines = wrapPdfLines(slide.headline, 28).slice(0, 3);
    const bodyLines = wrapPdfLines(slide.body, 46).slice(0, 4);
    const leftLines = wrapPdfLines(slide.cardLeftBody || "", 24).slice(0, 3);
    const rightLines = wrapPdfLines(slide.cardRightBody || "", 24).slice(0, 3);

    const cmds: string[] = [
      // Background fill
      `${bgRgb} rg 0 0 ${width} ${height} re f`,
      // Top brand badge & kicker
      `${accentRgb} rg 40 ${height - 46} 10 10 re f`,
      `BT /F1 11 Tf ${textRgb} rg 58 ${height - 45} Td (${pdfEscape(brandName.slice(0, 32))}) Tj ET`,
      `BT /F1 10 Tf ${accentRgb} rg 40 ${height - 76} Td (${pdfEscape(slide.kicker || `SLIDE 0${idx + 1}`)}) Tj ET`,
    ];

    let y = height - 112;
    for (let hIdx = 0; hIdx < headLines.length; hIdx++) {
      const color = hIdx === headLines.length - 1 ? accentRgb : textRgb;
      cmds.push(
        `BT /F1 24 Tf ${color} rg 40 ${y} Td (${pdfEscape(headLines[hIdx])}) Tj ET`,
      );
      y -= 30;
    }

    y -= 8;
    for (const bl of bodyLines) {
      cmds.push(
        `BT /F2 13 Tf ${textRgb} rg 40 ${y} Td (${pdfEscape(bl)}) Tj ET`,
      );
      y -= 20;
    }

    // Visual Diagram / Comparison Cards in the middle of the slide
    const cardTop = Math.max(210, y - 16);
    const cardH = 118;
    const cardW = 215;
    cmds.push(
      `${cardRgb} rg 40 ${cardTop - cardH} ${cardW} ${cardH} re f`,
      `${accentRgb} RG 1.5 w 40 ${cardTop - cardH} ${cardW} ${cardH} re S`,
      `BT /F1 9 Tf ${accentRgb} rg 52 ${cardTop - 22} Td (${pdfEscape((slide.cardLeftTitle || "CONCEPT").slice(0, 26))}) Tj ET`,
    );
    leftLines.forEach((ll, lIdx) => {
      cmds.push(
        `BT /F2 11 Tf ${textRgb} rg 52 ${cardTop - 44 - lIdx * 16} Td (${pdfEscape(ll)}) Tj ET`,
      );
    });

    // Arrow between cards
    cmds.push(
      `BT /F1 16 Tf ${accentRgb} rg 262 ${cardTop - 64} Td (->) Tj ET`,
    );

    cmds.push(
      `${cardRgb} rg 285 ${cardTop - cardH} ${cardW} ${cardH} re f`,
      `${accentRgb} RG 1.5 w 285 ${cardTop - cardH} ${cardW} ${cardH} re S`,
      `BT /F1 9 Tf ${accentRgb} rg 297 ${cardTop - 22} Td (${pdfEscape((slide.cardRightTitle || "ACTION").slice(0, 26))}) Tj ET`,
    );
    rightLines.forEach((rl, rIdx) => {
      cmds.push(
        `BT /F2 11 Tf ${textRgb} rg 297 ${cardTop - 44 - rIdx * 16} Td (${pdfEscape(rl)}) Tj ET`,
      );
    });

    // Footer takeaway, website domain, and slide counter (01 / 08)
    cmds.push(
      `BT /F1 12 Tf ${textRgb} rg 40 68 Td (${pdfEscape(slide.footer.slice(0, 58))}) Tj ET`,
      `BT /F2 11 Tf ${accentRgb} rg 40 36 Td (${pdfEscape(websiteUrl.slice(0, 42))}) Tj ET`,
      `BT /F1 11 Tf ${textRgb} rg ${width - 80} 36 Td (${pdfEscape(`${String(idx + 1).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}`)}) Tj ET`,
    );

    const stream = cmds.join("\n");
    const contentId = addObj(
      `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    );
    const pageId = addObj(
      `<< /Type /Page /Parent ${pagesRootPlaceholder} 0 R /MediaBox [0 0 ${width} ${height}] /Resources << /Font << /F1 ${fontBoldId} 0 R /F2 ${fontRegId} 0 R >> >> /Contents ${contentId} 0 R >>`,
    );
    pageIds.push(pageId);
  });

  objects[pagesRootPlaceholder - 1] =
    `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >>`;
  const catalogId = addObj(
    `<< /Type /Catalog /Pages ${pagesRootPlaceholder} 0 R >>`,
  );

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [];
  objects.forEach((obj, i) => {
    offsets.push(pdf.length);
    pdf += `${i + 1} 0 obj\n${obj}\nendobj\n`;
  });
  const xrefPos = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const off of offsets) {
    pdf += `${String(off).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefPos}\n%%EOF\n`;
  return new TextEncoder().encode(pdf);
}

/**
 * Builds a multi-page PDF embedding high-resolution JPEG buffers rendered from
 * the HTML5 Canvas slides so the downloaded LinkedIn Carousel PDF has 100% of
 * the custom gradients, uploaded brand logo, rounded UI mockup cards, and arrows!
 */
export function buildRasterCarouselPdf(
  jpegPages: Array<{ bytes: Uint8Array; width: number; height: number }>,
  pageWidthPt = 540,
  pageHeightPt = 675,
): Uint8Array {
  const chunks: Uint8Array[] = [];
  const encoder = new TextEncoder();
  let byteOffset = 0;
  const offsets: number[] = [];

  const pushStr = (s: string) => {
    const b = encoder.encode(s);
    chunks.push(b);
    byteOffset += b.length;
  };
  const pushBytes = (b: Uint8Array) => {
    chunks.push(b);
    byteOffset += b.length;
  };

  pushStr("%PDF-1.4\n%\xFF\xFF\xFF\xFF\n");

  const totalObjects = 2 + jpegPages.length * 3;
  const pagesObjId = 1;
  const catalogObjId = 2;
  const pageObjIds: number[] = [];

  for (let i = 0; i < jpegPages.length; i++) {
    pageObjIds.push(3 + i * 3 + 2);
  }

  // Object 1: Pages root
  offsets.push(byteOffset);
  pushStr(
    `${pagesObjId} 0 obj\n<< /Type /Pages /Kids [${pageObjIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${jpegPages.length} >>\nendobj\n`,
  );

  // Object 2: Catalog
  offsets.push(byteOffset);
  pushStr(
    `${catalogObjId} 0 obj\n<< /Type /Catalog /Pages ${pagesObjId} 0 R >>\nendobj\n`,
  );

  for (let i = 0; i < jpegPages.length; i++) {
    const img = jpegPages[i];
    const imgObjId = 3 + i * 3;
    const contentObjId = 3 + i * 3 + 1;
    const pageObjId = 3 + i * 3 + 2;

    // Image XObject
    offsets.push(byteOffset);
    pushStr(
      `${imgObjId} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${img.width} /Height ${img.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${img.bytes.length} >>\nstream\n`,
    );
    pushBytes(img.bytes);
    pushStr(`\nendstream\nendobj\n`);

    // Content stream drawing the image full-bleed
    const streamCmd = `q\n${pageWidthPt} 0 0 ${pageHeightPt} 0 0 cm\n/Im0 Do\nQ\n`;
    offsets.push(byteOffset);
    pushStr(
      `${contentObjId} 0 obj\n<< /Length ${streamCmd.length} >>\nstream\n${streamCmd}endstream\nendobj\n`,
    );

    // Page object
    offsets.push(byteOffset);
    pushStr(
      `${pageObjId} 0 obj\n<< /Type /Page /Parent ${pagesObjId} 0 R /MediaBox [0 0 ${pageWidthPt} ${pageHeightPt}] /Resources << /XObject << /Im0 ${imgObjId} 0 R >> >> /Contents ${contentObjId} 0 R >>\nendobj\n`,
    );
  }

  const xrefStart = byteOffset;
  pushStr(`xref\n0 ${totalObjects + 1}\n0000000000 65535 f \n`);
  for (const off of offsets) {
    pushStr(`${String(off).padStart(10, "0")} 00000 n \n`);
  }
  pushStr(
    `trailer\n<< /Size ${totalObjects + 1} /Root ${catalogObjId} 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`,
  );

  const out = new Uint8Array(byteOffset);
  let pos = 0;
  for (const c of chunks) {
    out.set(c, pos);
    pos += c.length;
  }
  return out;
}

// ============================================================================
// 7. ARTICLE TO PODCAST SCRIPT (Comprehensive Broadcast Episode Script)
// ============================================================================
export type PodcastSegment = {
  id: string;
  speaker: string;
  topic: string;
  dialogue: string;
  cue: string;
  seconds: number;
};

export type PodcastScriptDraft = {
  format: "solo" | "cohost";
  wpm: 130 | 150 | 170;
  segments: PodcastSegment[];
  showNotes: string[];
  totalWords: number;
  totalSeconds: number;
};

export function buildPodcastScript(
  article: Article,
  format: "solo" | "cohost" = "cohost",
  wpm: 130 | 150 | 170 = 150,
): PodcastScriptDraft {
  const err = validate(article);
  if (err) throw Error(err);

  const grouped = groupArticleSections(article);
  const allSents = grouped
    .flatMap((g) => g.paragraphs.flatMap((p) => splitSentences(p)))
    .filter((s) => s.length >= 20);

  const segments: PodcastSegment[] = [];
  const pushSeg = (
    speaker: string,
    topic: string,
    dialogue: string,
    cue: string,
  ) => {
    const clean = dialogue.trim();
    if (!clean) return;
    const words = countWords(clean);
    const seconds = Math.max(4, Math.ceil((words / wpm) * 60));
    segments.push({
      id: `pod-${segments.length + 1}`,
      speaker,
      topic,
      dialogue: clean,
      cue,
      seconds,
    });
  };

  const leadPremise =
    allSents[0] ||
    `How do we turn ${article.title} into a practical, repeatable system?`;

  pushSeg(
    format === "cohost" ? "Host A" : "Host",
    "Cold Open & Episode Hook",
    `Welcome back to the show! Today we are diving into a topic that trips up a lot of teams: "${article.title}"${article.byline ? `, drawing on the research and guide by ${article.byline}` : ""}. ${leadPremise}`,
    "[Cold open — theme music fades under after 5s]",
  );

  if (format === "cohost") {
    pushSeg(
      "Host B",
      "The Core Problem",
      `And here is why this conversation is so timely: ${allSents[1] || "when teams focus only on speed or surface-level output, they miss the system that makes the work compound over time."} Let's break down every stage of this framework from start to finish.`,
      "[Conversational setup]",
    );
  }

  for (let i = 0; i < Math.min(grouped.length, 14); i++) {
    const sec = grouped[i];
    const sents = sec.paragraphs.flatMap((p) => splitSentences(p));
    const topicName =
      sec.heading && sec.heading !== article.title
        ? sec.heading
        : `Part ${i + 1} · Core Breakdown`;

    if (format === "cohost") {
      const questionPrompt =
        i === 0
          ? `Let's start with "${topicName}". What is the biggest shift we need to understand here?`
          : `That brings us to "${topicName}". How does this piece fit into the bigger workflow?`;
      pushSeg(
        "Host A",
        topicName,
        `${questionPrompt} ${sents[0] || ""}`.trim(),
        "[Topic transition cue]",
      );

      const explanationParts = [
        ...sents.slice(1, 3),
        ...sec.bullets.slice(0, 3).map((b, bIdx) =>
          bIdx === 0 ? `First, ${b}` : bIdx === 1 ? `Second, ${b}` : `And third, ${b}`,
        ),
      ].filter(Boolean);

      if (explanationParts.length > 0) {
        pushSeg(
          "Host B",
          `${topicName} · Deep Dive`,
          explanationParts.join(" "),
          sec.quotes.length ? "[Emphasize source evidence]" : "[Conversational breakdown]",
        );
      }
    } else {
      const soloParts = [
        `Let's talk about ${topicName}.`,
        ...sents.slice(0, 3),
        ...sec.bullets.slice(0, 3),
      ].filter(Boolean);
      pushSeg(
        "Host",
        topicName,
        soloParts.join(" "),
        "[Chapter marker]",
      );
    }
  }

  pushSeg(
    format === "cohost" ? "Host B" : "Host",
    "Listener Action Item",
    `If you are listening to this and wondering where to start today, pick just one stage of "${article.title}"—audit your current workflow, remove the bottleneck, and connect the result back to your performance data.`,
    "[Actionable takeaway beat]",
  );

  pushSeg(
    format === "cohost" ? "Host A" : "Host",
    "Outro & Show Notes CTA",
    `That wraps up today's episode on "${article.title}". ${article.source ? `We have linked the full written guide in the show notes at ${article.source} so you can grab the complete checklist.` : "Check the show notes for the complete written guide and checklist."} Thanks for listening, and we will catch you in the next episode!`,
    "[Outro music swells]",
  );

  const showNotes = grouped
    .slice(0, 6)
    .map((g, idx) => `• Part ${idx + 1}: ${g.heading}`);
  const totalWords = segments.reduce((n, s) => n + countWords(s.dialogue), 0);
  const totalSeconds = segments.reduce((n, s) => n + s.seconds, 0);

  return { format, wpm, segments, showNotes, totalWords, totalSeconds };
}

export function podcastScriptTxt(
  article: Article,
  draft: PodcastScriptDraft,
): string {
  const lines = [
    `PODCAST EPISODE SCRIPT & SHOW NOTES: ${article.title}`,
    `Format: ${draft.format === "cohost" ? "Two-Host Conversation (Host A & Host B)" : "Solo Host Episode"}`,
    `Speaking Pace: ${draft.wpm} WPM · Estimated Runtime: ${Math.floor(draft.totalSeconds / 60)}m ${draft.totalSeconds % 60}s (${draft.totalWords} words)`,
    article.source ? `Source Article: ${article.source}` : "",
    "",
    "--- EPISODE SHOW NOTES ---",
    ...(draft.showNotes || []),
    "",
    "--- FULL BROADCAST SCRIPT ---",
    "",
  ].filter((l) => l !== "");

  draft.segments.forEach((s, idx) => {
    lines.push(
      `[${idx + 1}] ${s.topic} · ${s.speaker} (~${s.seconds}s) ${s.cue}`,
      `${s.speaker.toUpperCase()}: ${s.dialogue}`,
      "",
    );
  });
  return lines.join("\n");
}

export function podcastScriptDocx(
  article: Article,
  draft: PodcastScriptDraft,
): Uint8Array {
  const body = [
    docxParagraph("Episode Show Notes", "Heading2"),
    ...(draft.showNotes || []).map((n) => docxParagraph(n)),
    docxParagraph("Broadcast Script", "Heading2"),
    ...draft.segments.map(
      (s, i) =>
        docxParagraph(`${i + 1}. ${s.topic} (${s.seconds}s) ${s.cue}`, "Heading2") +
        docxParagraph(s.dialogue, "Normal", `${s.speaker}: `),
    ),
  ].join("");
  return buildMinimalDocx(
    `${article.title} — Podcast Script`,
    `${draft.format === "cohost" ? "Two-Host Script" : "Solo Host Script"} · ${draft.wpm} WPM · ~${Math.ceil(draft.totalSeconds / 60)} min`,
    body,
  );
}
