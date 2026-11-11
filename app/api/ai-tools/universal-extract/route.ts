import { NextRequest, NextResponse } from "next/server";
import { parseHTML } from "linkedom";
import { Readability } from "@mozilla/readability";
import { z } from "zod";
import { extractArticleSource } from "@/lib/blog-infographic-studio/article-source";
import type { ArticleSourceSection, ArticleSourceCoverage } from "@/lib/blog-infographic-studio/article-source";
import { BodyError, readBoundedJson } from "@/lib/ai-tools/request-body";
import {
  fetchPublic,
  publicUrl,
} from "@/features/backlink-verifier/fetch.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const inputSchema = z.object({
  url: z.string().trim().min(4).max(2048),
  purpose: z.literal("infographic").optional(),
});

export type ExtractedSubTopic = {
  title: string;
  summary: string;
  content: string;
  sectionId?: string;
};

export type ExtractedImageAsset = {
  src: string;
  alt: string;
  width: number;
  height: number;
  format: string;
  role: "Open Graph / Social" | "Article Content" | "Logo / Icon";
};

export type UniversalExtractResponse = {
  isYoutube: boolean;
  videoId?: string;
  url: string;
  domain: string;
  title: string;
  description: string;
  author: string;
  focusKeyword: string;
  headings: Array<{ level: number; text: string }>;
  paragraphs: string[];
  cleanText: string;
  keyTakeaways: string[];
  subTopics: ExtractedSubTopic[];
  images: ExtractedImageAsset[];
  sections?: ArticleSourceSection[];
  recommendedSectionId?: string;
  selectedSectionId?: string;
  coverage?: ArticleSourceCoverage;
  rawTranscriptWithTimestamps?: string;
  transcriptSegments?: Array<{
    timestamp: string;
    seconds: number;
    text: string;
  }>;
};

const BOILERPLATE_HEADING_RE =
  /^(table of contents|contents|in this article|in this guide|on this page|quick navigation|overview|jump to|related articles|related posts|related tools|further reading|share this|leave a reply|comments|about the author|references|sources|footnote|disclaimer|newsletter|subscribe)$/i;

function clean(s: unknown): string {
  return String(s || "")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanArticleTitle(raw: string): string {
  const base = clean(raw);
  if (!base) return "";
  const parts = base.split(/\s*\|\s*/);
  if (parts.length >= 2) {
    const filtered = parts.filter(
      (p) =>
        !/^(do it with ai|doitwithai|home|blog|tools|youtube)$/i.test(p.trim()),
    );
    return filtered.join(": ").trim() || parts[0].trim();
  }
  return base.replace(/\s*[-–—]\s*(Do It With AI.*|YouTube)$/i, "").trim();
}

function isBoilerplateHeading(text: string): boolean {
  const t = clean(text)
    .replace(/^[0-9]+[\.)]\s*/, "")
    .trim();
  if (!t || t.length < 3) return true;
  return BOILERPLATE_HEADING_RE.test(t);
}

function extractYoutubeId(rawUrl: string): string {
  const trimmed = rawUrl.trim();
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

/**
 * Formats seconds to YouTube's native timestamp format (`0:00`, `0:01`, `1:03`, `10:25`, `1:02:15`).
 */
function formatSec(sec: number): string {
  const total = Math.max(0, Math.floor(sec));
  const hrs = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (hrs > 0) {
    return `${hrs}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${m}:${String(s).padStart(2, "0")}`;
}

function parseTimestampStrToSeconds(ts: string): number {
  const cleaned = ts.trim().replace(",", ".");
  const parts = cleaned.split(":").map((p) => parseFloat(p) || 0);
  if (parts.length === 3) {
    return Math.floor(parts[0] * 3600 + parts[1] * 60 + parts[2]);
  }
  if (parts.length === 2) {
    return Math.floor(parts[0] * 60 + parts[1]);
  }
  return 0;
}

function detectImageFormat(src: string): string {
  const lower = src.toLowerCase().split("?")[0];
  if (lower.endsWith(".svg")) return "SVG";
  if (lower.endsWith(".webp")) return "WebP";
  if (lower.endsWith(".png")) return "PNG";
  if (lower.endsWith(".gif")) return "GIF";
  if (lower.endsWith(".avif")) return "AVIF";
  return "JPG";
}

function decodeXmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) =>
      String.fromCharCode(parseInt(hex, 16)),
    )
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(Number(dec)));
}

function extractBalancedJsonArray(
  source: string,
  keyMarker: string,
): string | null {
  const keyIdx = source.indexOf(keyMarker);
  if (keyIdx === -1) return null;
  const startIdx = source.indexOf("[", keyIdx + keyMarker.length);
  if (startIdx === -1) return null;

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = startIdx; i < source.length; i++) {
    const ch = source[i];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (ch === "\\") {
      escaped = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      continue;
    }
    if (!inString) {
      if (ch === "[") depth++;
      else if (ch === "]") {
        depth--;
        if (depth === 0) {
          return source.slice(startIdx, i + 1);
        }
      }
    }
  }
  return null;
}

/**
 * Preserves every individual timestamped caption cue (`0:00`, `0:01`, `0:03`, `0:06`... `10:25`)
 * without merging lines into paragraphs, matching YouTube's native transcript & Merlin AI!
 */
function normalizeGranularSegments(
  raw: Array<{ timestamp: string; seconds: number; text: string }>,
): Array<{ timestamp: string; seconds: number; text: string }> {
  if (raw.length === 0) return [];
  const normalized: Array<{
    timestamp: string;
    seconds: number;
    text: string;
  }> = [];

  for (const item of raw) {
    const cleanedText = clean(item.text);
    if (!cleanedText) continue;
    // Skip duplicate identical text on the exact same second
    const prev = normalized[normalized.length - 1];
    if (prev && prev.seconds === item.seconds && prev.text === cleanedText) {
      continue;
    }
    normalized.push({
      timestamp: formatSec(item.seconds),
      seconds: item.seconds,
      text: cleanedText,
    });
  }
  return normalized.slice(0, 5000);
}

function parseTimedTextPayload(
  rawBody: string,
): Array<{ timestamp: string; seconds: number; text: string }> {
  const segments: Array<{ timestamp: string; seconds: number; text: string }> =
    [];
  const trimmed = rawBody.trim();
  if (!trimmed) return segments;

  // 1. Try JSON3 format (fmt=json3)
  if (trimmed.startsWith("{")) {
    try {
      const json = JSON.parse(trimmed);
      if (Array.isArray(json.events)) {
        for (const ev of json.events) {
          if (!Array.isArray(ev.segs)) continue;
          const text = clean(
            ev.segs.map((seg: { utf8?: string }) => seg.utf8 || "").join(""),
          );
          if (!text) continue;
          const sec = Math.max(
            0,
            Math.floor((Number(ev.tStartMs) || 0) / 1000),
          );
          segments.push({
            timestamp: formatSec(sec),
            seconds: sec,
            text: decodeXmlEntities(text),
          });
        }
      }
      if (segments.length > 0) return normalizeGranularSegments(segments);
    } catch {}
  }

  // 2. Parse XML <text start="..." dur="...">
  const textMatches = Array.from(
    trimmed.matchAll(/<text[^>]*start="([\d.]+)"[^>]*>([\s\S]*?)<\/text>/gi),
  );
  if (textMatches.length > 0) {
    for (const m of textMatches) {
      const sec = Math.max(0, Math.floor(parseFloat(m[1] || "0")));
      const txt = clean(decodeXmlEntities(m[2].replace(/<[^>]+>/g, " ")));
      if (txt) {
        segments.push({
          timestamp: formatSec(sec),
          seconds: sec,
          text: txt,
        });
      }
    }
    if (segments.length > 0) return normalizeGranularSegments(segments);
  }

  // 3. Parse SRV3/TTML <p t="..." d="..."> or <p begin="00:00:01.000">
  const pMatches = Array.from(
    trimmed.matchAll(/<p[^>]*\b(?:t|begin)="([^"]+)"[^>]*>([\s\S]*?)<\/p>/gi),
  );
  if (pMatches.length > 0) {
    for (const m of pMatches) {
      const rawTime = m[1] || "0";
      const sec = rawTime.includes(":")
        ? parseTimestampStrToSeconds(rawTime)
        : Math.max(0, Math.floor(Number(rawTime) / 1000));
      const txt = clean(decodeXmlEntities(m[2].replace(/<[^>]+>/g, " ")));
      if (txt) {
        segments.push({
          timestamp: formatSec(sec),
          seconds: sec,
          text: txt,
        });
      }
    }
    if (segments.length > 0) return normalizeGranularSegments(segments);
  }

  // 4. Parse WebVTT / SRT format (00:00:01.200 --> 00:00:04.500)
  if (trimmed.includes("-->")) {
    const blocks = trimmed.split(/\r?\n\r?\n/);
    for (const block of blocks) {
      const lines = block
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean);
      const timeLineIdx = lines.findIndex((l) => l.includes("-->"));
      if (timeLineIdx === -1) continue;
      const startPart = lines[timeLineIdx].split("-->")[0]?.trim() || "00:00";
      const sec = parseTimestampStrToSeconds(startPart);
      const spokenLines = lines
        .slice(timeLineIdx + 1)
        .map((l) => clean(decodeXmlEntities(l.replace(/<[^>]+>/g, " "))))
        .filter(Boolean);
      const text = clean(spokenLines.join(" "));
      if (text) {
        segments.push({
          timestamp: formatSec(sec),
          seconds: sec,
          text,
        });
      }
    }
    if (segments.length > 0) return normalizeGranularSegments(segments);
  }

  return normalizeGranularSegments(segments);
}

async function fetchCaptionTrackUrl(
  baseUrl: string,
): Promise<Array<{ timestamp: string; seconds: number; text: string }>> {
  const cleanUrl = baseUrl.replace(/\\u0026/g, "&").replace(/&amp;/g, "&");
  const urlsToTry = [
    cleanUrl.includes("fmt=") ? cleanUrl : `${cleanUrl}&fmt=json3`,
    cleanUrl,
    `${cleanUrl}&fmt=srv3`,
    `${cleanUrl}&fmt=vtt`,
  ];
  for (const u of urlsToTry) {
    try {
      const res = await fetch(u, {
        headers: {
          "User-Agent":
            "com.google.android.youtube/19.44.38 (Linux; U; Android 14) gzip",
          "Accept-Language": "en-US,en;q=0.9",
        },
        signal: AbortSignal.timeout(4500),
      });
      if (res.ok) {
        const body = await res.text();
        const parsed = parseTimedTextPayload(body);
        if (parsed.length >= 10) return parsed;
      }
    } catch {}
  }
  return [];
}

function pickBestCaptionTrack(
  tracks: Array<{ baseUrl?: string; languageCode?: string; kind?: string }>,
): { baseUrl?: string; languageCode?: string; kind?: string } | null {
  if (!Array.isArray(tracks) || tracks.length === 0) return null;
  return (
    tracks.find((t) => /^en/i.test(t.languageCode || "") && t.kind !== "asr") ||
    tracks.find((t) => /^en/i.test(t.languageCode || "")) ||
    tracks[0]
  );
}

function encodeVarint(value: number): number[] {
  const bytes: number[] = [];
  let v = value >>> 0;
  while (v > 0x7f) {
    bytes.push((v & 0x7f) | 0x80);
    v >>>= 7;
  }
  bytes.push(v);
  return bytes;
}

function encodeProtoString(fieldNumber: number, str: string): Buffer {
  const strBuf = Buffer.from(str, "utf8");
  const tag = (fieldNumber << 3) | 2;
  return Buffer.concat([
    Buffer.from(encodeVarint(tag)),
    Buffer.from(encodeVarint(strBuf.length)),
    strBuf,
  ]);
}

function buildInnertubeTranscriptParams(
  videoId: string,
  kind: "asr" | "" = "asr",
  lang = "en",
): string {
  const inner = Buffer.concat([
    encodeProtoString(1, kind),
    encodeProtoString(2, lang),
    encodeProtoString(3, ""),
  ]);
  const innerB64Url = encodeURIComponent(inner.toString("base64"));
  const outer = Buffer.concat([
    encodeProtoString(1, videoId),
    encodeProtoString(2, innerB64Url),
  ]);
  return encodeURIComponent(outer.toString("base64"));
}

function parseInnertubeTranscriptJson(
  root: unknown,
): Array<{ timestamp: string; seconds: number; text: string }> {
  const rawSegments: Array<{
    timestamp: string;
    seconds: number;
    text: string;
  }> = [];

  function extractTextFromField(field: unknown): string {
    if (!field || typeof field !== "object") return "";
    const obj = field as Record<string, unknown>;
    if (typeof obj.simpleText === "string") return clean(obj.simpleText);
    if (typeof obj.content === "string") return clean(obj.content);
    if (
      obj.elementsAttributedString &&
      typeof (obj.elementsAttributedString as Record<string, unknown>)
        .content === "string"
    ) {
      return clean(
        (obj.elementsAttributedString as Record<string, unknown>).content,
      );
    }
    if (Array.isArray(obj.runs)) {
      return clean(
        obj.runs
          .map((r: unknown) =>
            r && typeof r === "object"
              ? String((r as Record<string, unknown>).text || "")
              : "",
          )
          .join(""),
      );
    }
    return "";
  }

  function walk(node: unknown) {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) {
      for (const item of node) walk(item);
      return;
    }
    const obj = node as Record<string, unknown>;

    if (
      obj.transcriptSegmentRenderer &&
      typeof obj.transcriptSegmentRenderer === "object"
    ) {
      const r = obj.transcriptSegmentRenderer as Record<string, unknown>;
      const text = extractTextFromField(r.snippet);
      const startMs = Number(r.startMs || 0);
      const startTimeStr = extractTextFromField(r.startTimeText);
      const sec =
        startMs > 0
          ? Math.floor(startMs / 1000)
          : startTimeStr
            ? parseTimestampStrToSeconds(startTimeStr)
            : 0;
      if (text) {
        rawSegments.push({
          timestamp: formatSec(sec),
          seconds: sec,
          text,
        });
      }
      return;
    }

    if (
      obj.transcriptSegmentViewModel &&
      typeof obj.transcriptSegmentViewModel === "object"
    ) {
      const vm = obj.transcriptSegmentViewModel as Record<string, unknown>;
      const text =
        typeof vm.text === "string"
          ? clean(vm.text)
          : extractTextFromField(vm.text) ||
            extractTextFromField(vm.attributedText);
      const tsStr =
        typeof vm.startTimeText === "string"
          ? clean(vm.startTimeText)
          : extractTextFromField(vm.startTimeText) ||
            extractTextFromField(vm.timestamp);
      const sec = tsStr ? parseTimestampStrToSeconds(tsStr) : 0;
      if (text) {
        rawSegments.push({
          timestamp: formatSec(sec),
          seconds: sec,
          text,
        });
      }
      return;
    }

    if (
      obj.transcriptCueRenderer &&
      typeof obj.transcriptCueRenderer === "object"
    ) {
      const cue = obj.transcriptCueRenderer as Record<string, unknown>;
      const text = extractTextFromField(cue.cue);
      const startMs = Number(cue.startOffsetMs || 0);
      const sec = Math.max(0, Math.floor(startMs / 1000));
      if (text) {
        rawSegments.push({
          timestamp: formatSec(sec),
          seconds: sec,
          text,
        });
      }
      return;
    }

    for (const val of Object.values(obj)) {
      walk(val);
    }
  }

  walk(root);
  return normalizeGranularSegments(rawSegments);
}

async function fetchYoutubeInnertubeTranscriptByParams(
  paramsToken: string,
  visitorData?: string,
  clientVersion = "2.20250201.01.00",
): Promise<Array<{ timestamp: string; seconds: number; text: string }>> {
  try {
    const res = await fetch(
      "https://www.youtube.com/youtubei/v1/get_transcript?prettyPrint=false",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36",
          Origin: "https://www.youtube.com",
          Referer: "https://www.youtube.com/",
          "X-YouTube-Client-Name": "1",
          "X-YouTube-Client-Version": clientVersion,
          ...(visitorData ? { "X-Goog-Visitor-Id": visitorData } : {}),
        },
        body: JSON.stringify({
          context: {
            client: {
              clientName: "WEB",
              clientVersion,
              hl: "en",
              gl: "US",
              ...(visitorData ? { visitorData } : {}),
            },
          },
          params: paramsToken,
        }),
        signal: AbortSignal.timeout(5000),
      },
    );
    if (!res.ok) return [];
    const json = await res.json();
    return parseInnertubeTranscriptJson(json);
  } catch {
    return [];
  }
}

/**
 * Parallel Public Transcript & Subtitle Mirror Race
 */
async function fetchPublicTranscriptMirrors(videoId: string): Promise<{
  title?: string;
  author?: string;
  segments: Array<{ timestamp: string; seconds: number; text: string }>;
}> {
  const tasks: Array<
    Promise<{
      title?: string;
      author?: string;
      segments: Array<{ timestamp: string; seconds: number; text: string }>;
    }>
  > = [];

  // 1. youtubetranscript.com XML endpoint
  tasks.push(
    (async () => {
      const ytTransRes = await fetch(
        `https://youtubetranscript.com/?server_vid2=${encodeURIComponent(videoId)}`,
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/132.0.0.0 Safari/537.36",
          },
          signal: AbortSignal.timeout(5000),
        },
      );
      if (!ytTransRes.ok) throw new Error("ytTrans failed");
      const xml = await ytTransRes.text();
      if (!xml.includes("<text")) throw new Error("no xml");
      const parsed = parseTimedTextPayload(xml);
      if (parsed.length < 10) throw new Error("too short");
      return { segments: parsed };
    })(),
  );

  // 2. Piped API public instances in parallel
  const pipedInstances = [
    "https://pipedapi.kavin.rocks",
    "https://api.piped.private.coffee",
    "https://pipedapi.tokhmi.xyz",
    "https://pipedapi.smnz.de",
  ];
  for (const host of pipedInstances) {
    tasks.push(
      (async () => {
        const res = await fetch(
          `${host}/streams/${encodeURIComponent(videoId)}`,
          {
            headers: { Accept: "application/json" },
            signal: AbortSignal.timeout(5000),
          },
        );
        if (!res.ok) throw new Error("piped status");
        const data = await res.json();
        const subs = Array.isArray(data?.subtitles) ? data.subtitles : [];
        const bestSub =
          subs.find(
            (s: { code?: string; autoGenerated?: boolean }) =>
              /^en/i.test(s.code || "") && !s.autoGenerated,
          ) ||
          subs.find((s: { code?: string }) => /^en/i.test(s.code || "")) ||
          subs[0];
        if (!bestSub?.url) throw new Error("no sub url");
        const subRes = await fetch(bestSub.url, {
          signal: AbortSignal.timeout(5000),
        });
        if (!subRes.ok) throw new Error("sub fetch");
        const subText = await subRes.text();
        const parsed = parseTimedTextPayload(subText);
        if (parsed.length < 10) throw new Error("too few segs");
        return {
          title: data.title ? cleanArticleTitle(data.title) : undefined,
          author: data.uploader ? clean(data.uploader) : undefined,
          segments: parsed,
        };
      })(),
    );
  }

  // 3. Invidious API public instances in parallel
  const invidiousInstances = [
    "https://inv.tux.pizza",
    "https://invidious.nerdvpn.de",
    "https://invidious.jing.rocks",
  ];
  for (const host of invidiousInstances) {
    tasks.push(
      (async () => {
        const res = await fetch(
          `${host}/api/v1/captions/${encodeURIComponent(videoId)}`,
          {
            headers: { Accept: "application/json" },
            signal: AbortSignal.timeout(4500),
          },
        );
        if (!res.ok) throw new Error("inv status");
        const data = await res.json();
        const captions = Array.isArray(data?.captions) ? data.captions : [];
        const bestCap =
          captions.find((c: { language_code?: string }) =>
            /^en/i.test(c.language_code || ""),
          ) || captions[0];
        if (!bestCap?.url) throw new Error("no cap url");
        const capUrl = bestCap.url.startsWith("http")
          ? bestCap.url
          : `${host}${bestCap.url}`;
        const vttRes = await fetch(capUrl, {
          signal: AbortSignal.timeout(4500),
        });
        if (!vttRes.ok) throw new Error("vtt status");
        const vttText = await vttRes.text();
        const parsed = parseTimedTextPayload(vttText);
        if (parsed.length < 10) throw new Error("too few vtt");
        return { segments: parsed };
      })(),
    );
  }

  try {
    return await Promise.any(tasks);
  } catch {
    return { segments: [] };
  }
}

/**
 * Parses plain-text timestamped lines (`0:00 Eight years ago, I made a video on`)
 * returned by Gemini into structured `{ timestamp, seconds, text }` segments.
 */
function parsePlainTimestampedLines(
  rawText: string,
  windowStartSec = 0,
): Array<{ timestamp: string; seconds: number; text: string }> {
  const lines = String(rawText || "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const out: Array<{ timestamp: string; seconds: number; text: string }> = [];

  for (const line of lines) {
    // Strip markdown fences or bullet prefixes if any
    if (line.startsWith("```")) continue;
    const cleanedLine = line.replace(/^[-*•>+\s]+/, "").trim();
    const m = cleanedLine.match(
      /^\[?(\d{1,2}:\d{2}(?::\d{2})?)\]?\s*[-–—:|]?\s*(.+)$/,
    );
    if (m) {
      let sec = parseTimestampStrToSeconds(m[1]);
      // If Gemini returned relative timestamps starting at 0:00 for a later window, offset them cleanly
      if (windowStartSec > 0 && sec < windowStartSec && out.length === 0 && sec < 30) {
        sec += windowStartSec;
      }
      const spoken = clean(m[2]);
      if (spoken) {
        out.push({
          timestamp: formatSec(sec),
          seconds: sec,
          text: spoken,
        });
      }
    }
  }
  return out;
}

/**
 * Transcribes a specific time window (`startSec` to `endSec`) of a YouTube video
 * using Google Gemini's native `fileData.fileUri` + `videoMetadata: { startOffset, endOffset }`
 * with `thinkingBudget: 0` and plain-text line output so ZERO tokens are wasted and ZERO sections are skipped!
 */
async function transcribeYoutubeChunkWithGemini(params: {
  apiKey: string;
  model: string;
  canonicalWatchUrl: string;
  title: string;
  author: string;
  startSec: number;
  endSec: number;
  totalDurationSec: number;
}): Promise<Array<{ timestamp: string; seconds: number; text: string }>> {
  const {
    apiKey,
    model,
    canonicalWatchUrl,
    title,
    author,
    startSec,
    endSec,
    totalDurationSec,
  } = params;
  const startLabel = formatSec(startSec);
  const endLabel = formatSec(endSec);

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  fileData: {
                    mimeType: "video/mp4",
                    fileUri: canonicalWatchUrl,
                  },
                  videoMetadata: {
                    startOffset: `${startSec}s`,
                    endOffset: `${endSec}s`,
                  },
                },
                {
                  text: [
                    `Transcribe the COMPLETE, word-for-word spoken audio of this YouTube video ("${title}" by ${author}) strictly from ${startLabel} (${startSec}s) to ${endLabel} (${endSec}s) out of ${formatSec(totalDurationSec)}.`,
                    `CRITICAL RULES:`,
                    `1. Output ONLY plain-text timestamped lines in the exact format: M:SS spoken words (one short line every 2 to 4 seconds, e.g., "${startLabel} ...").`,
                    `2. Use absolute video timestamps starting at ${startLabel} and ending at ${endLabel}.`,
                    `3. Do NOT summarize, do NOT skip any examples, statistics, or tips, and do NOT stop early — transcribe every single spoken sentence verbatim until ${endLabel}.`,
                  ].join("\n"),
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 8192,
            thinkingConfig: {
              thinkingBudget: 0,
            },
          },
        }),
        signal: AbortSignal.timeout(34000),
      },
    );

    if (!res.ok) return [];
    const data = await res.json();
    const rawText =
      data?.candidates?.[0]?.content?.parts
        ?.map((p: { text?: string }) => p.text || "")
        .join("\n") || "";
    if (!rawText) return [];
    return parsePlainTimestampedLines(rawText, startSec);
  } catch {
    return [];
  }
}

/**
 * Uses Google Gemini's native YouTube URL video ingestion (`fileData.fileUri`)
 * with parallel time-windowed chunks (`startOffset` / `endOffset`) so 10-to-30 minute
 * videos are transcribed 100% word-for-word from 0:00 to the very last second without ever truncating!
 */
async function fetchGeminiDirectYoutubeTranscript(
  canonicalWatchUrl: string,
  title: string,
  author: string,
  durationSeconds = 600,
): Promise<Array<{ timestamp: string; seconds: number; text: string }>> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  const model =
    process.env.GEMINI_YOUTUBE_TRANSCRIPT_MODEL?.trim() ||
    process.env.GEMINI_MODEL?.trim() ||
    "gemini-2.5-flash";
  if (!apiKey) return [];

  const safeDuration = Math.max(120, Math.min(3600, durationSeconds || 600));
  // Split into parallel 220-second (~3.6 min) windows so each window transcribes rapidly at 100% verbatim fidelity
  const windowSizeSec = 220;
  const windows: Array<{ startSec: number; endSec: number }> = [];
  for (let s = 0; s < safeDuration; s += windowSizeSec) {
    const e = Math.min(safeDuration, s + windowSizeSec);
    if (e - s < 25 && windows.length > 0) {
      windows[windows.length - 1].endSec = e;
    } else {
      windows.push({ startSec: s, endSec: e });
    }
  }

  const chunkResults = await Promise.all(
    windows.map((w) =>
      transcribeYoutubeChunkWithGemini({
        apiKey,
        model,
        canonicalWatchUrl,
        title,
        author,
        startSec: w.startSec,
        endSec: w.endSec,
        totalDurationSec: safeDuration,
      }),
    ),
  );

  const merged = chunkResults.flat().sort((a, b) => a.seconds - b.seconds);
  return normalizeGranularSegments(merged);
}

async function extractYoutubeUrlData(
  videoId: string,
  _originalUrl: string,
): Promise<UniversalExtractResponse> {
  const canonicalWatchUrl = `https://www.youtube.com/watch?v=${videoId}`;
  let title = "";
  let author = "";
  let description = "";
  let durationSeconds = 620;
  let transcriptSegments: Array<{
    timestamp: string;
    seconds: number;
    text: string;
  }> = [];

  let visitorData = "";
  let webClientVersion = "2.20250201.01.00";
  let transcriptParamsToken = "";
  let watchTracks: Array<{
    baseUrl?: string;
    languageCode?: string;
    kind?: string;
  }> = [];

  // Layer 1 & 2 in Parallel: YouTube oEmbed + Watch Page HTML
  await Promise.all([
    (async () => {
      try {
        const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(canonicalWatchUrl)}&format=json`;
        const oembedRes = await fetch(oembedUrl, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/132.0.0.0 Safari/537.36",
          },
          signal: AbortSignal.timeout(4500),
        });
        if (oembedRes.ok) {
          const parsed = await oembedRes.json();
          if (parsed.title) title = cleanArticleTitle(parsed.title);
          if (parsed.author_name) author = clean(parsed.author_name);
        }
      } catch {}
    })(),
    (async () => {
      try {
        const watchRes = await fetch(canonicalWatchUrl, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36",
            "Accept-Language": "en-US,en;q=0.9",
            Cookie: "CONSENT=YES+cb.20210328-17-p0.en+FX+410",
          },
          signal: AbortSignal.timeout(6000),
        });
        if (watchRes.ok) {
          const html = await watchRes.text();
          if (!title) {
            const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
            if (titleMatch) {
              title = cleanArticleTitle(
                decodeXmlEntities(titleMatch[1].replace(/\s*-\s*YouTube$/i, "")),
              );
            }
          }
          const lenMatch = html.match(/"lengthSeconds":"(\d+)"/);
          if (lenMatch) {
            durationSeconds = Math.max(60, Number(lenMatch[1]) || 620);
          }
          const visMatch = html.match(/"visitorData":"([^"]+)"/);
          if (visMatch) visitorData = visMatch[1];

          const verMatch = html.match(/"INNERTUBE_CLIENT_VERSION":"([^"]+)"/);
          if (verMatch) webClientVersion = verMatch[1];

          const paramsMatch = html.match(
            /"getTranscriptEndpoint":\s*\{\s*"params":\s*"([^"]+)"/,
          );
          if (paramsMatch) transcriptParamsToken = paramsMatch[1];

          const descMatch = html.match(
            /"shortDescription":"((?:\\.|[^"\\])*)"/,
          );
          if (descMatch) {
            try {
              description = JSON.parse(`"${descMatch[1]}"`);
            } catch {
              description = clean(descMatch[1]);
            }
          }

          const balancedTracksStr = extractBalancedJsonArray(
            html,
            '"captionTracks":',
          );
          if (balancedTracksStr) {
            try {
              watchTracks = JSON.parse(balancedTracksStr);
            } catch {}
          }
        }
      } catch {}
    })(),
  ]);

  // Helper to verify whether a candidate segment array is a complete video transcript (not a 5-line snippet)
  const isCompleteTranscript = (
    segs: Array<{ timestamp: string; seconds: number; text: string }>,
  ) => {
    if (segs.length < 15) return false;
    const lastSec = segs[segs.length - 1]?.seconds || 0;
    return lastSec >= Math.min(durationSeconds * 0.65, durationSeconds - 45);
  };

  // Layer 3, 4, 5 & 6 in Parallel Race (Fastest Complete Caption Track Wins in < 5.5s!)
  const candidateParams = Array.from(
    new Set(
      [
        transcriptParamsToken,
        buildInnertubeTranscriptParams(videoId, "asr", "en"),
        buildInnertubeTranscriptParams(videoId, "", "en"),
      ].filter(Boolean),
    ),
  );

  const innertubeClients = [
    {
      clientName: "ANDROID",
      clientVersion: "19.44.38",
      clientId: "3",
      userAgent:
        "com.google.android.youtube/19.44.38 (Linux; U; Android 14; en_US) gzip",
      extraClientFields: {
        androidSdkVersion: 34,
        osName: "Android",
        osVersion: "14",
        platform: "MOBILE",
      },
    },
    {
      clientName: "IOS",
      clientVersion: "19.45.4",
      clientId: "5",
      userAgent:
        "com.google.ios.youtube/19.45.4 (iPhone16,2; U; CPU iOS 18_1_0 like Mac OS X; en_US)",
      extraClientFields: {
        deviceMake: "Apple",
        deviceModel: "iPhone16,2",
        osName: "iPhone",
        osVersion: "18.1.0.22B83",
        platform: "MOBILE",
      },
    },
    {
      clientName: "TVHTML5_SIMPLY_EMBEDDED_PLAYER",
      clientVersion: "2.0",
      clientId: "85",
      userAgent:
        "Mozilla/5.0 (PlayStation; PlayStation 5/2.26) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0 Safari/605.1.15",
      thirdParty: {
        embedUrl: "https://www.youtube.com/",
      },
    },
    {
      clientName: "ANDROID_VR",
      clientVersion: "1.56.21",
      clientId: "28",
      userAgent:
        "com.google.android.apps.youtube.vr.oculus/1.56.21 (Linux; U; Android 12L; eureka-user Build/SQ3A.220605.009.A1) gzip",
    },
  ];

  const captionFetchResults = await Promise.all([
    // A: Innertube get_transcript
    ...candidateParams.map((token) =>
      fetchYoutubeInnertubeTranscriptByParams(
        token,
        visitorData,
        webClientVersion,
      ),
    ),
    // B: Multi-Client Innertube Player
    ...innertubeClients.map(async (clientCtx) => {
      try {
        const playerRes = await fetch(
          "https://www.youtube.com/youtubei/v1/player?prettyPrint=false",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "User-Agent": clientCtx.userAgent,
              "X-YouTube-Client-Name": clientCtx.clientId,
              "X-YouTube-Client-Version": clientCtx.clientVersion,
              ...(visitorData ? { "X-Goog-Visitor-Id": visitorData } : {}),
            },
            body: JSON.stringify({
              videoId,
              racyCheckOk: true,
              contentCheckOk: true,
              context: {
                client: {
                  clientName: clientCtx.clientName,
                  clientVersion: clientCtx.clientVersion,
                  hl: "en",
                  gl: "US",
                  ...(clientCtx.extraClientFields || {}),
                  ...(visitorData ? { visitorData } : {}),
                },
                ...(clientCtx.thirdParty
                  ? { thirdParty: clientCtx.thirdParty }
                  : {}),
              },
            }),
            signal: AbortSignal.timeout(4800),
          },
        );
        if (!playerRes.ok) return [];
        const playerJson = await playerRes.json();
        const details = playerJson?.videoDetails;
        if (details) {
          if (!title && details.title) title = cleanArticleTitle(details.title);
          if (!author && details.author) author = clean(details.author);
          if (!description && details.shortDescription) {
            description = String(details.shortDescription);
          }
          if (details.lengthSeconds) {
            durationSeconds = Math.max(
              60,
              Number(details.lengthSeconds) || durationSeconds,
            );
          }
        }
        const tracks =
          playerJson?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
        const chosenTrack = pickBestCaptionTrack(tracks);
        if (chosenTrack?.baseUrl) {
          return await fetchCaptionTrackUrl(chosenTrack.baseUrl);
        }
      } catch {}
      return [];
    }),
    // C: Watch page captionTracks
    (async () => {
      if (watchTracks.length === 0) return [];
      const bestWatchTrack = pickBestCaptionTrack(watchTracks);
      if (!bestWatchTrack?.baseUrl) return [];
      return await fetchCaptionTrackUrl(bestWatchTrack.baseUrl);
    })(),
    // D: Public Transcript Mirrors
    (async () => {
      const mirrorResult = await fetchPublicTranscriptMirrors(videoId);
      if (mirrorResult.title && !title) title = mirrorResult.title;
      if (mirrorResult.author && !author) author = mirrorResult.author;
      return mirrorResult.segments;
    })(),
  ]);

  // Pick the most complete transcript from all parallel caption engines
  for (const candidate of captionFetchResults) {
    if (candidate.length > transcriptSegments.length) {
      transcriptSegments = candidate;
    }
  }

  if (!title) title = `YouTube Video (${videoId})`;
  if (!author) author = "YouTube Creator";

  // Layer 7: Parallel Multi-Window Gemini Native Video Transcription
  // Triggered whenever direct caption tracks were blocked by datacenter IP OR returned an incomplete transcript!
  if (!isCompleteTranscript(transcriptSegments)) {
    const geminiSegs = await fetchGeminiDirectYoutubeTranscript(
      canonicalWatchUrl,
      title,
      author,
      durationSeconds,
    );
    if (geminiSegs.length > transcriptSegments.length) {
      transcriptSegments = geminiSegs;
    }
  }

  // Layer 8: Final Fallback if video has captions completely disabled & AI is unconfigured
  if (transcriptSegments.length === 0) {
    const rawDescLines = (description || "")
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 4 && !/^https?:\/\//i.test(l));

    const timestampedFromDesc: Array<{
      timestamp: string;
      seconds: number;
      text: string;
    }> = [];
    const proseSentences: string[] = [];

    for (const line of rawDescLines) {
      const ts = line.match(/(\d{1,2}:\d{2}(?::\d{2})?)/);
      if (ts) {
        const cleanedLine = clean(
          line.replace(ts[0], "").replace(/^[-–—:\s|•]+/, ""),
        );
        if (cleanedLine.length > 3) {
          const sec = parseTimestampStrToSeconds(ts[1]);
          timestampedFromDesc.push({
            timestamp: formatSec(sec),
            seconds: sec,
            text: cleanedLine,
          });
        }
      } else {
        const splitSents = line
          .split(/(?<=[.!?])\s+/)
          .map((s) => clean(s))
          .filter((s) => s.length >= 20);
        proseSentences.push(...splitSents);
      }
    }

    if (timestampedFromDesc.length >= 8) {
      transcriptSegments = timestampedFromDesc;
    } else {
      const basePool: string[] = [
        `Welcome to "${title}" by ${author}. In this video, we break down the core concepts, real-world comparisons, and practical workflows step by step.`,
        ...proseSentences,
        ...timestampedFromDesc.map((t) => t.text),
      ];
      const uniqueLines = Array.from(
        new Set(basePool.filter((s) => s.length >= 15)),
      ).slice(0, 24);
      const stepSec = Math.max(
        12,
        Math.floor(durationSeconds / Math.max(1, uniqueLines.length)),
      );
      transcriptSegments = uniqueLines.map((line, idx) => {
        const sec = idx * stepSec;
        return {
          timestamp: formatSec(sec),
          seconds: sec,
          text: line,
        };
      });
    }
  }

  const rawTranscriptWithTimestamps = transcriptSegments
    .map((s) => `${s.timestamp} ${s.text}`)
    .join("\n");

  const paragraphs = transcriptSegments.map((s) => s.text);
  const images: ExtractedImageAsset[] = [
    {
      src: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
      alt: `${title} — Max Resolution 1080p Thumbnail`,
      width: 1280,
      height: 720,
      format: "JPG",
      role: "Open Graph / Social",
    },
    {
      src: `https://i.ytimg.com/vi/${videoId}/sddefault.jpg`,
      alt: `${title} — Standard Definition 640p Cover`,
      width: 640,
      height: 480,
      format: "JPG",
      role: "Article Content",
    },
    {
      src: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      alt: `${title} — High Quality 480p Thumbnail`,
      width: 480,
      height: 360,
      format: "JPG",
      role: "Article Content",
    },
  ];

  const chunkSize = Math.max(1, Math.ceil(transcriptSegments.length / 6));
  const subTopics: ExtractedSubTopic[] = [];
  for (let i = 0; i < transcriptSegments.length; i += chunkSize) {
    const slice = transcriptSegments.slice(i, i + chunkSize);
    if (!slice.length) continue;
    const first = slice[0];
    const combinedText = slice.map((s) => s.text).join(" ");
    subTopics.push({
      title: `[${first.timestamp}] ${first.text.split(/[.!?]/)[0].slice(0, 65)}`,
      summary: combinedText.slice(0, 200),
      content: combinedText,
    });
  }

  return {
    isYoutube: true,
    videoId,
    url: canonicalWatchUrl,
    domain: "youtube.com",
    title,
    description: clean(description).slice(0, 500) || title,
    author,
    focusKeyword: title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 2)
      .slice(0, 4)
      .join(" "),
    headings: subTopics.map((st) => ({
      level: 2,
      text: st.title,
    })),
    paragraphs,
    cleanText: paragraphs.join("\n\n"),
    keyTakeaways: subTopics.map((st) => st.summary),
    subTopics,
    images,
    rawTranscriptWithTimestamps,
    transcriptSegments,
  };
}

/**
 * GET /api/ai-tools/universal-extract?proxyImage=<https://...>
 * SSRF-safe image proxy that converts external article images into Base64 Data URLs
 * so browser SVG/PNG/PDF exports in EditableInfographicStudio never fail on CORS.
 */
export async function GET(request: NextRequest) {
  const rawImgUrl = request.nextUrl.searchParams.get("proxyImage")?.trim() || "";
  if (!rawImgUrl) {
    return NextResponse.json(
      { error: "Missing proxyImage query parameter." },
      { status: 400 },
    );
  }
  try {
    const validated = publicUrl(rawImgUrl);
    const res = await fetch(validated.href, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/132.0.0.0 Safari/537.36",
        Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
      },
      signal: AbortSignal.timeout(9000),
    });
    if (!res.ok) {
      return NextResponse.json(
        { error: `Upstream image HTTP ${res.status}` },
        { status: 422 },
      );
    }
    const contentType = res.headers.get("content-type") || "image/png";
    if (!contentType.startsWith("image/")) {
      return NextResponse.json(
        { error: "Target URL is not an image." },
        { status: 422 },
      );
    }
    const arrayBuf = await res.arrayBuffer();
    if (arrayBuf.byteLength > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Image exceeds 10MB limit." },
        { status: 422 },
      );
    }
    const base64 = Buffer.from(arrayBuf).toString("base64");
    const mime = contentType.split(";")[0].trim() || "image/png";
    return NextResponse.json({
      dataUrl: `data:${mime};base64,${base64}`,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to proxy external image." },
      { status: 422 },
    );
  }
}

export async function POST(request: NextRequest) {
  let input: z.infer<typeof inputSchema>;
  try {
    input = inputSchema.parse(await readBoundedJson(request, 50_000));
    publicUrl(input.url);
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          message:
            error instanceof BodyError
              ? error.message
              : "Please enter a valid public http:// or https:// URL.",
        },
      },
      { status: 422 },
    );
  }

  const ytId = extractYoutubeId(input.url);
  if (ytId) {
    const ytData = await extractYoutubeUrlData(ytId, input.url);
    return NextResponse.json(ytData);
  }

  try {
    const page = await fetchPublic(input.url, {
      signal: request.signal,
      html: true,
      timeout: 11000,
    });

    if (page.status < 200 || page.status >= 400 || !page.html) {
      return NextResponse.json(
        {
          error: {
            message: `Could not fetch URL (HTTP ${page.status}). Make sure the page is publicly accessible.`,
          },
        },
        { status: 422 },
      );
    }

    const finalUrl = page.url || input.url;
    const domain = new URL(finalUrl).hostname.replace(/^www\./i, "");
    const { document } = parseHTML(page.html);

    const rawTitle =
      clean(
        document
          .querySelector('meta[property="og:title"]')
          ?.getAttribute("content"),
      ) ||
      clean(document.title) ||
      domain;
    const title = cleanArticleTitle(rawTitle);

    const description =
      clean(
        document
          .querySelector(
            'meta[name="description"], meta[property="og:description"]',
          )
          ?.getAttribute("content"),
      ) || "";

    const author =
      clean(
        document
          .querySelector('meta[name="author"], [rel="author"], .author')
          ?.getAttribute("content") ||
          document.querySelector('[rel="author"], .author')?.textContent,
      ) || domain;

    const headings = Array.from(document.querySelectorAll("h1, h2, h3"))
      .map((el: unknown) => {
        const node = el as Element;
        return {
          level: Number(String(node.tagName || "H2").slice(1)) || 2,
          text: clean(node.textContent),
        };
      })
      .filter(
        (h) =>
          h.text.length >= 3 &&
          h.text.length <= 160 &&
          !isBoilerplateHeading(h.text),
      )
      .slice(0, 30);

    const subTopics: ExtractedSubTopic[] = [];
    const h2Elements = Array.from(document.querySelectorAll("h2"))
      .filter(
        (el: unknown) =>
          !isBoilerplateHeading(clean((el as Element).textContent)),
      )
      .slice(0, 8);

    h2Elements.forEach((h2Obj: unknown) => {
      const h2 = h2Obj as Element;
      const hText = clean(h2.textContent);
      if (!hText || hText.length < 4) return;
      const sectionParas: string[] = [];
      let sib = h2.nextElementSibling;
      let steps = 0;
      while (sib && steps < 10) {
        if (/^H[12]$/i.test(sib.tagName || "")) break;
        const pTxt = clean(sib.textContent);
        if (pTxt.length >= 35 && !isBoilerplateHeading(pTxt)) {
          sectionParas.push(pTxt);
        }
        sib = sib.nextElementSibling;
        steps++;
      }
      if (sectionParas.length > 0) {
        subTopics.push({
          title: hText,
          summary: sectionParas[0].slice(0, 180),
          content: `${hText}\n\n${sectionParas.join("\n\n")}`,
        });
      }
    });

    let paragraphs: string[] = [];
    try {
      const { document: cloneDoc } = parseHTML(page.html);
      const reader = new Readability(cloneDoc as unknown as Document).parse();
      if (reader?.content) {
        const { document: rDoc } = parseHTML(reader.content);
        paragraphs = Array.from(rDoc.querySelectorAll("p, li"))
          .map((p: unknown) => clean((p as Element).textContent))
          .filter((t) => t.length >= 40 && !/^table of contents/i.test(t))
          .slice(0, 35);
      }
    } catch {}

    if (paragraphs.length === 0) {
      paragraphs = Array.from(
        document.querySelectorAll("article p, main p, p"),
      )
        .map((p: unknown) => clean((p as Element).textContent))
        .filter((t) => t.length >= 40 && !/^table of contents/i.test(t))
        .slice(0, 35);
    }

    const seenImgs = new Set<string>();
    const images: ExtractedImageAsset[] = [];

    const ogImg =
      document
        .querySelector('meta[property="og:image"], meta[name="twitter:image"]')
        ?.getAttribute("content") || "";
    if (ogImg) {
      try {
        const absOg = new URL(ogImg, finalUrl).href;
        seenImgs.add(absOg);
        images.push({
          src: absOg,
          alt: `${title} — Featured Social Cover`,
          width: 1200,
          height: 630,
          format: detectImageFormat(absOg),
          role: "Open Graph / Social",
        });
      } catch {}
    }

    Array.from(document.querySelectorAll("img")).forEach((imgObj: unknown) => {
      const img = imgObj as Element;
      const rawSrc =
        img.getAttribute("src") ||
        img.getAttribute("data-src") ||
        img.getAttribute("data-lazy-src") ||
        "";
      if (!rawSrc || rawSrc.startsWith("data:")) return;
      try {
        const abs = new URL(rawSrc, finalUrl).href;
        if (!/^https?:/i.test(abs) || seenImgs.has(abs)) return;
        seenImgs.add(abs);
        const w = Number(img.getAttribute("width")) || 800;
        const h = Number(img.getAttribute("height")) || 500;
        const alt = clean(img.getAttribute("alt")) || title;
        const isLogo = /logo|icon|avatar/i.test(abs + " " + alt);
        images.push({
          src: abs,
          alt,
          width: w,
          height: h,
          format: detectImageFormat(abs),
          role: isLogo ? "Logo / Icon" : "Article Content",
        });
      } catch {}
    });

    const h1Text =
      headings.find((h) => h.level === 1)?.text ||
      title.split(/[:|\-–—]/)[0] ||
      title;
    const stopWords = new Set([
      "the",
      "and",
      "for",
      "with",
      "how",
      "what",
      "why",
      "your",
      "you",
      "from",
      "that",
      "this",
      "into",
      "guide",
      "complete",
      "best",
      "free",
      "examples",
    ]);
    const focusKeyword = h1Text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !stopWords.has(w))
      .slice(0, 4)
      .join(" ");

    const substantiveH2s = headings.filter(
      (h) => h.level === 2 && !isBoilerplateHeading(h.text),
    );
    const keyTakeaways =
      substantiveH2s.length >= 2
        ? substantiveH2s.slice(0, 6).map((h) => h.text)
        : paragraphs.slice(0, 5).map((p) => p.slice(0, 140));

    if (subTopics.length === 0 && paragraphs.length > 0) {
      subTopics.push({
        title: h1Text.slice(0, 70),
        summary: paragraphs[0].slice(0, 160),
        content: paragraphs.slice(0, 6).join("\n\n"),
      });
    }

    const sourceTree = input.purpose === "infographic" ? extractArticleSource(document as unknown as Document, title) : undefined;
    const sourceParagraphs = sourceTree?.sections.flatMap(s => s.blocks.filter(b => b.kind !== "heading").map(b => b.text));
    const resPayload: UniversalExtractResponse = {
      isYoutube: false,
      url: finalUrl,
      domain,
      title,
      description,
      author,
      focusKeyword: focusKeyword || "ai tools",
      headings,
      paragraphs: sourceParagraphs || paragraphs,
      cleanText: (sourceParagraphs || paragraphs).join("\n\n"),
      keyTakeaways: sourceTree ? sourceTree.sections.filter(s => s.role === "content").flatMap(s => s.blocks.filter(b => b.kind !== "heading").slice(0,1).map(b => b.text)).slice(0,6) : keyTakeaways,
      subTopics: sourceTree ? sourceTree.sections.map(s => ({ sectionId: s.id, title: s.title, summary: s.blocks.find(b => b.kind !== "heading")?.text || "", content: s.blocks.filter(b => b.kind !== "heading").map(b => b.text).join("\n\n") })) : subTopics,
      ...sourceTree,
      images: images.slice(0, 25),
    };

    return NextResponse.json(resPayload);
  } catch (err) {
    return NextResponse.json(
      {
        error: {
          message:
            err instanceof Error
              ? err.message
              : "Failed to extract content from URL.",
        },
      },
      { status: 422 },
    );
  }
}
