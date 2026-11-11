export function extractYoutubeVideoId(rawUrl: string): string {
  const trimmed = String(rawUrl || "").trim();
  if (/^[A-Za-z0-9_-]{11}$/.test(trimmed)) return trimmed;
  try {
    const u = new URL(trimmed);
    if (u.hostname.includes("youtu.be")) {
      const id = u.pathname.split("/").filter(Boolean)[0] || "";
      if (/^[A-Za-z0-9_-]{11}$/.test(id)) return id;
    }
    if (u.hostname.includes("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v && /^[A-Za-z0-9_-]{11}$/.test(v)) return v;
      const parts = u.pathname.split("/").filter(Boolean);
      if (
        (parts[0] === "shorts" ||
          parts[0] === "embed" ||
          parts[0] === "live" ||
          parts[0] === "v") &&
        parts[1] &&
        /^[A-Za-z0-9_-]{11}$/.test(parts[1])
      ) {
        return parts[1];
      }
    }
  } catch {}
  const m = trimmed.match(
    /(?:v=|youtu\.be\/|shorts\/|embed\/)([A-Za-z0-9_-]{11})/,
  );
  return m ? m[1] : "";
}

export type TranscriptSegment = {
  timestamp: string;
  seconds: number;
  text: string;
};

export type VideoChapterSummary = {
  timestamp: string;
  heading: string;
  summary: string;
};

export type VideoKeyInsight = {
  timestamp: string;
  title: string;
  detail: string;
  category: string;
};

export type VideoFaqItem = {
  question: string;
  answer: string;
};

export type YoutubeTranscriptPack = {
  videoId: string;
  videoUrl: string;
  title: string;
  channelName: string;
  thumbnailUrl: string;
  segments: TranscriptSegment[];
  paragraphBlocks: TranscriptSegment[];
  chapters: VideoChapterSummary[];
  executiveSummary: string;
  executiveSummaryParagraphs: string[];
  keyTakeaways: string[];
  deepInsights: VideoKeyInsight[];
  actionChecklist: string[];
  videoFaqs: VideoFaqItem[];
  plainTextTranscript: string;
  timestampedTranscript: string;
  srtSubtitleContent: string;
  wordCount: number;
  estimatedReadingMinutes: number;
};

export const DEFAULT_YT_TRANSCRIPT_URL =
  "https://www.youtube.com/watch?v=cH9LbVH7EI4";

export const DEFAULT_YT_SEGMENTS: TranscriptSegment[] = [
  {
    timestamp: "00:00",
    seconds: 0,
    text: "When we talk about generative AI in 2026, two heavyweights immediately come to mind: OpenAI's ChatGPT and Anthropic's Claude.",
  },
  {
    timestamp: "00:14",
    seconds: 14,
    text: "For the past few years, ChatGPT was the undisputed default for consumer AI, multimodal voice, and quick browsing.",
  },
  {
    timestamp: "00:29",
    seconds: 29,
    text: "But recently, Claude has captured the attention of software engineers, SEO strategists, and long-form writers everywhere.",
  },
  {
    timestamp: "00:46",
    seconds: 46,
    text: "In this head-to-head breakdown, we test both models across five real-world benchmarks: coding accuracy, long-context synthesis, writing tone, speed, and workflow automation.",
  },
  {
    timestamp: "01:08",
    seconds: 68,
    text: "Benchmark #1 is Coding and Front-End UI Architecture. When building complex React and Next.js components, Claude consistently produces cleaner, less truncated code.",
  },
  {
    timestamp: "01:36",
    seconds: 96,
    text: "ChatGPT excels when you need rapid Python data analysis, live web search citations, or quick multi-step calculator scripts inside a single prompt.",
  },
  {
    timestamp: "02:05",
    seconds: 125,
    text: "Benchmark #2 is Long-Document Context Retention. We fed a 60,000-word technical documentation repository into both models to test recall.",
  },
  {
    timestamp: "02:34",
    seconds: 154,
    text: "Claude maintained near-perfect citation fidelity across the middle sections of the document, avoiding the classic 'lost-in-the-middle' hallucination problem.",
  },
  {
    timestamp: "03:08",
    seconds: 188,
    text: "Benchmark #3 is Editorial Writing and Brand Voice. Out of the box, default LLM outputs often sound repetitive and full of corporate clichés.",
  },
  {
    timestamp: "03:40",
    seconds: 220,
    text: "When given a 3-shot writing sample, Claude adapts more naturally to human sentence cadence, whereas ChatGPT shines at structured tables and bulleted summaries.",
  },
  {
    timestamp: "04:15",
    seconds: 255,
    text: "Benchmark #4 is Multimodal Reasoning and Vision. ChatGPT leads in real-time voice interaction and image generation, while Claude excels at reading dense charts and UI screenshots.",
  },
  {
    timestamp: "04:52",
    seconds: 292,
    text: "Benchmark #5 is Cost Efficiency, API Rate Limits, and Team Workflows. Combining both models in a hybrid router gives teams the highest ROI.",
  },
  {
    timestamp: "05:28",
    seconds: 328,
    text: "Use ChatGPT for live web discovery, research verification, and multimodal asset generation.",
  },
  {
    timestamp: "05:56",
    seconds: 356,
    text: "Pair that with Claude for deep codebase refactoring, long-form article drafting, and complex prompt engineering.",
  },
  {
    timestamp: "06:30",
    seconds: 390,
    text: "Final Verdict: Neither model replaces the other—the winning workflow in 2026 uses each model for its strongest specialized capability.",
  },
];

function formatSrtTime(sec: number): string {
  const total = Math.max(0, Math.floor(sec));
  const hrs = Math.floor(total / 3600);
  const mins = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")},000`;
}

function groupSegmentsIntoParagraphs(
  segments: TranscriptSegment[],
): TranscriptSegment[] {
  if (segments.length <= 4) return segments;
  const blocks: TranscriptSegment[] = [];
  let current: TranscriptSegment | null = null;

  for (const seg of segments) {
    if (!current) {
      current = { ...seg };
      continue;
    }
    if (
      seg.seconds - current.seconds < 28 &&
      current.text.length + seg.text.length < 380
    ) {
      current.text = `${current.text} ${seg.text}`.replace(/\s+/g, " ").trim();
    } else {
      blocks.push(current);
      current = { ...seg };
    }
  }
  if (current) blocks.push(current);
  return blocks;
}

function sampleEvenlyAcrossVideo<T>(items: T[], targetCount: number): T[] {
  if (items.length <= targetCount) return items;
  const result: T[] = [];
  const step = (items.length - 1) / Math.max(1, targetCount - 1);
  for (let i = 0; i < targetCount; i++) {
    const idx = Math.min(items.length - 1, Math.round(i * step));
    result.push(items[idx]);
  }
  return result;
}

export function buildYoutubeTranscriptPack(params: {
  videoId?: string;
  videoUrl: string;
  title?: string;
  channelName?: string;
  segments?: TranscriptSegment[];
  aiSummary?: {
    executiveSummary: string;
    executiveSummaryParagraphs?: string[];
    keyTakeaways: string[];
    deepInsights?: VideoKeyInsight[];
    actionChecklist?: string[];
    chapters: VideoChapterSummary[];
    videoFaqs?: VideoFaqItem[];
  };
}): YoutubeTranscriptPack {
  const videoId = params.videoId || "cH9LbVH7EI4";
  const title =
    params.title || "ChatGPT vs Claude AI: Complete Benchmark & Workflow Guide";
  const channelName = params.channelName || "Facts with MFB";
  const segments =
    params.segments && params.segments.length > 0
      ? params.segments
      : DEFAULT_YT_SEGMENTS;

  const paragraphBlocks = groupSegmentsIntoParagraphs(segments);
  const plainTextTranscript = segments.map((s) => s.text).join(" ");
  const timestampedTranscript = segments
    .map((s) => `[${s.timestamp}] ${s.text}`)
    .join("\n");

  const srtSubtitleContent = segments
    .map((s, idx) => {
      const nextSec = segments[idx + 1]?.seconds || s.seconds + 6;
      return `${idx + 1}\n${formatSrtTime(s.seconds)} --> ${formatSrtTime(nextSec)}\n${s.text}\n`;
    })
    .join("\n");

  const wordCount = plainTextTranscript
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  const estimatedReadingMinutes = Math.max(1, Math.ceil(wordCount / 200));

  // Sample chapters across the ENTIRE video timeline (start, 20%, 40%, 60%, 80%, end) instead of only the first 5 lines!
  const sampledForChapters = sampleEvenlyAcrossVideo(
    paragraphBlocks.length >= 6 ? paragraphBlocks : segments,
    Math.min(8, Math.max(5, paragraphBlocks.length)),
  );

  const chapters: VideoChapterSummary[] =
    params.aiSummary?.chapters && params.aiSummary.chapters.length > 0
      ? params.aiSummary.chapters
      : sampledForChapters.map((s, i) => {
          const cleanLine = s.text.replace(/^\[.*?\]\s*/, "").trim();
          const words = cleanLine.split(/\s+/);
          const headingText = words
            .slice(0, 7)
            .join(" ")
            .replace(/[.,:;!?]+$/, "");
          return {
            timestamp: s.timestamp,
            heading: `Section ${i + 1}: ${headingText}`,
            summary: cleanLine.slice(0, 220),
          };
        });

  // Build 3-paragraph comprehensive executive summary
  const firstChunk = paragraphBlocks.slice(0, 2).map((p) => p.text).join(" ");
  const midChunk = paragraphBlocks
    .slice(
      Math.floor(paragraphBlocks.length * 0.35),
      Math.floor(paragraphBlocks.length * 0.65) + 1,
    )
    .map((p) => p.text)
    .join(" ");
  const endChunk = paragraphBlocks.slice(-2).map((p) => p.text).join(" ");

  const defaultSummaryParas = [
    `1. Core Premise & Context: In "${title}", ${channelName} delivers a comprehensive, timestamped breakdown across ${segments.length} transcript segments (${wordCount.toLocaleString()} words). ${firstChunk.slice(0, 260)}`,
    `2. Key Methodology & Comparison Breakdown: Throughout the middle sections of the video, the analysis focuses on practical execution, benchmark differences, and real-world trade-offs. ${midChunk.slice(0, 280)}`,
    `3. Final Verdict & Actionable Outcome: Wrapping up the walkthrough, ${channelName} emphasizes how to combine these insights into a repeatable daily workflow. ${endChunk.slice(0, 260)}`,
  ];

  const executiveSummaryParagraphs =
    params.aiSummary?.executiveSummaryParagraphs &&
    params.aiSummary.executiveSummaryParagraphs.length >= 2
      ? params.aiSummary.executiveSummaryParagraphs
      : params.aiSummary?.executiveSummary
        ? [params.aiSummary.executiveSummary, ...defaultSummaryParas.slice(1)]
        : defaultSummaryParas;

  const executiveSummary = executiveSummaryParagraphs.join("\n\n");

  // Sample 8 insights evenly across the entire video so insights cover 0% -> 100% of the video
  const sampledForInsights = sampleEvenlyAcrossVideo(
    paragraphBlocks.length >= 8 ? paragraphBlocks : segments,
    Math.min(8, Math.max(5, segments.length)),
  );

  const insightCategories = [
    "Core Thesis",
    "Primary Mechanism",
    "Benchmark Proof",
    "Practical Workflow",
    "Key Differentiator",
    "Optimization Tip",
    "Pitfall to Avoid",
    "Final Verdict",
  ];

  const deepInsights: VideoKeyInsight[] =
    params.aiSummary?.deepInsights && params.aiSummary.deepInsights.length > 0
      ? params.aiSummary.deepInsights
      : sampledForInsights.map((s, idx) => {
          const cat = insightCategories[idx % insightCategories.length];
          const firstClause = s.text
            .split(/[.!?]/)[0]
            .split(/\s+/)
            .slice(0, 8)
            .join(" ");
          return {
            timestamp: s.timestamp,
            category: cat,
            title: `${cat}: ${firstClause}`,
            detail: s.text,
          };
        });

  const keyTakeaways =
    params.aiSummary?.keyTakeaways && params.aiSummary.keyTakeaways.length >= 5
      ? params.aiSummary.keyTakeaways
      : deepInsights.map(
          (ins) => `[${ins.timestamp}] ${ins.category} — ${ins.detail}`,
        );

  const actionChecklist =
    params.aiSummary?.actionChecklist &&
    params.aiSummary.actionChecklist.length > 0
      ? params.aiSummary.actionChecklist
      : [
          `Review the opening thesis of "${title}" (${segments[0]?.timestamp || "00:00"}) and align it with your current workflow goals.`,
          `Compare the core benchmarks and examples highlighted in the middle chapters before choosing your approach.`,
          `Extract the highest-signal quotes and timestamped points into an SEO blog post or social carousel.`,
          `Test the recommended configuration on a real project and measure time saved vs. output quality.`,
          `Bookmark the timestamped chapters below for quick team reference and implementation.`,
        ];

  const videoFaqs: VideoFaqItem[] =
    params.aiSummary?.videoFaqs && params.aiSummary.videoFaqs.length > 0
      ? params.aiSummary.videoFaqs
      : [
          {
            question: `What is the main topic and core takeaway of "${title}"?`,
            answer: defaultSummaryParas[0],
          },
          {
            question: `What are the most important insights shared by ${channelName} in this video?`,
            answer: deepInsights
              .slice(0, 3)
              .map((d) => `(${d.timestamp}) ${d.detail}`)
              .join(" "),
          },
          {
            question: `How is the breakdown structured across the video timeline?`,
            answer: `The video spans ${segments.length} timestamped segments (${wordCount.toLocaleString()} words) organized into ${chapters.length} major thematic sections, progressing from foundational context to live comparisons and final recommendations.`,
          },
          {
            question: `How can I repurpose this YouTube transcript into written articles or social posts?`,
            answer: `You can copy the full timestamped transcript, download the .SRT subtitle file, or click "Turn Transcript Into SEO Blog Post" above to convert "${title}" into a structured article or social media campaign in 1 click.`,
          },
        ];

  return {
    videoId,
    videoUrl: params.videoUrl || `https://www.youtube.com/watch?v=${videoId}`,
    title,
    channelName,
    thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
    segments,
    paragraphBlocks,
    chapters,
    executiveSummary,
    executiveSummaryParagraphs,
    keyTakeaways,
    deepInsights,
    actionChecklist,
    videoFaqs,
    plainTextTranscript,
    timestampedTranscript,
    srtSubtitleContent,
    wordCount,
    estimatedReadingMinutes,
  };
}
