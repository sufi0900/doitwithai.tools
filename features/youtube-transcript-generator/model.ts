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

export type YoutubeTranscriptPack = {
  videoId: string;
  videoUrl: string;
  title: string;
  channelName: string;
  thumbnailUrl: string;
  segments: TranscriptSegment[];
  chapters: VideoChapterSummary[];
  executiveSummary: string;
  keyTakeaways: string[];
  plainTextTranscript: string;
  timestampedTranscript: string;
  srtSubtitleContent: string;
  wordCount: number;
  estimatedReadingMinutes: number;
};

export const DEFAULT_YT_TRANSCRIPT_URL =
  "https://www.youtube.com/watch?v=exampleSEO2026";

export const DEFAULT_YT_SEGMENTS: TranscriptSegment[] = [
  {
    timestamp: "00:00",
    seconds: 0,
    text: "Welcome back! Today we are walking through the complete On-Page, Technical, and Local SEO workflow for 2026.",
  },
  {
    timestamp: "00:42",
    seconds: 42,
    text: "First, always verify canonical tag parity between your rendered DOM and raw HTML source so client-side scripts never override indexability.",
  },
  {
    timestamp: "01:35",
    seconds: 95,
    text: "Second, place a concise 45-to-58-word direct definition paragraph immediately below your primary H2 question heading to win Featured Snippets and AI Overviews.",
  },
  {
    timestamp: "02:50",
    seconds: 170,
    text: "Third, boost Information Gain by embedding original benchmark numbers, comparison tables, and first-hand testing screenshots that generic articles lack.",
  },
  {
    timestamp: "04:15",
    seconds: 255,
    text: "Fourth, for Local SEO, align your LocalBusiness JSON-LD schema and USPS-normalized NAP citations with your Google Business Profile primary category.",
  },
  {
    timestamp: "05:30",
    seconds: 330,
    text: "Finally, repurpose every guide into a 15-post social campaign, a LinkedIn carousel, and a downloadable cheatsheet to compound distribution.",
  },
];

function formatSrtTime(sec: number): string {
  const total = Math.max(0, Math.floor(sec));
  const hrs = Math.floor(total / 3600);
  const mins = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")},000`;
}

export function buildYoutubeTranscriptPack(params: {
  videoId?: string;
  videoUrl: string;
  title?: string;
  channelName?: string;
  segments?: TranscriptSegment[];
  aiSummary?: {
    executiveSummary: string;
    keyTakeaways: string[];
    chapters: VideoChapterSummary[];
  };
}): YoutubeTranscriptPack {
  const videoId = params.videoId || "exampleSEO2026";
  const title =
    params.title ||
    "Complete On-Page, Technical & Local SEO Workflow (2026 Guide)";
  const channelName = params.channelName || "Do It With AI Studio";
  const segments =
    params.segments && params.segments.length > 0
      ? params.segments
      : DEFAULT_YT_SEGMENTS;

  const plainTextTranscript = segments.map((s) => s.text).join(" ");
  const timestampedTranscript = segments
    .map((s) => `[${s.timestamp}] ${s.text}`)
    .join("\n");

  const srtSubtitleContent = segments
    .map((s, idx) => {
      const nextSec = segments[idx + 1]?.seconds || s.seconds + 15;
      return `${idx + 1}\n${formatSrtTime(s.seconds)} --> ${formatSrtTime(nextSec)}\n${s.text}\n`;
    })
    .join("\n");

  const wordCount = plainTextTranscript
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  const estimatedReadingMinutes = Math.max(1, Math.ceil(wordCount / 220));

  const chapters: VideoChapterSummary[] =
    params.aiSummary?.chapters ||
    segments.slice(0, 6).map((s, i) => ({
      timestamp: s.timestamp,
      heading: `Chapter ${i + 1}: ${s.text.split(/[.,!]/)[0].slice(0, 58)}`,
      summary: s.text,
    }));

  const executiveSummary =
    params.aiSummary?.executiveSummary ||
    `In "${title}", ${channelName} breaks down a step-by-step framework covering ${segments.length} timestamped segments—focusing on technical verification, extractable answer blocks, first-hand proof signals, and multi-channel distribution.`;

  const keyTakeaways =
    params.aiSummary?.keyTakeaways ||
    segments.slice(0, 5).map((s) => s.text);

  return {
    videoId,
    videoUrl: params.videoUrl || `https://www.youtube.com/watch?v=${videoId}`,
    title,
    channelName,
    thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
    segments,
    chapters,
    executiveSummary,
    keyTakeaways,
    plainTextTranscript,
    timestampedTranscript,
    srtSubtitleContent,
    wordCount,
    estimatedReadingMinutes,
  };
}
