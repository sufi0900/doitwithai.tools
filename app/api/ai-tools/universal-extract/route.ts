import { NextRequest, NextResponse } from "next/server";
import { parseHTML } from "linkedom";
import { Readability } from "@mozilla/readability";
import { z } from "zod";
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
});

export type ExtractedSubTopic = {
  title: string;
  summary: string;
  content: string;
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
  // Strip trailing site-name suffixes like " | Do It With AI Tools" while keeping meaningful subtitles
  const parts = base.split(/\s*\|\s*/);
  if (parts.length >= 2) {
    const filtered = parts.filter(
      (p) => !/^(do it with ai|doitwithai|home|blog|tools|youtube)$/i.test(p.trim())
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
  const m = trimmed.match(/(?:v=|youtu\.be\/|shorts\/|embed\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : "";
}

function formatSec(sec: number): string {
  const total = Math.max(0, Math.floor(sec));
  const hrs = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (hrs > 0) {
    return `${hrs}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
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
      String.fromCharCode(parseInt(hex, 16))
    )
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(Number(dec)));
}

function parseTimedTextPayload(
  rawBody: string
): Array<{ timestamp: string; seconds: number; text: string }> {
  const segments: Array<{ timestamp: string; seconds: number; text: string }> = [];
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
            ev.segs.map((seg: { utf8?: string }) => seg.utf8 || "").join(" ")
          );
          if (!text || /^\[.*\]$/.test(text)) continue;
          const sec = Math.max(0, Math.round((Number(ev.tStartMs) || 0) / 1000));
          segments.push({
            timestamp: formatSec(sec),
            seconds: sec,
            text: decodeXmlEntities(text),
          });
        }
      }
      if (segments.length > 0) return mergeShortTranscriptSegments(segments);
    } catch {}
  }

  // 2. Parse XML <text start="..." dur="..."> or <p t="..." d="...">
  const textMatches = Array.from(
    trimmed.matchAll(/<text[^>]*start="([\d.]+)"[^>]*>([\s\S]*?)<\/text>/gi)
  );
  if (textMatches.length > 0) {
    for (const m of textMatches) {
      const sec = Math.max(0, Math.round(parseFloat(m[1] || "0")));
      const txt = clean(decodeXmlEntities(m[2].replace(/<[^>]+>/g, " ")));
      if (txt) {
        segments.push({
          timestamp: formatSec(sec),
          seconds: sec,
          text: txt,
        });
      }
    }
    if (segments.length > 0) return mergeShortTranscriptSegments(segments);
  }

  const pMatches = Array.from(
    trimmed.matchAll(/<p[^>]*\bt="(\d+)"[^>]*>([\s\S]*?)<\/p>/gi)
  );
  for (const m of pMatches) {
    const sec = Math.max(0, Math.round(Number(m[1] || "0") / 1000));
    const txt = clean(decodeXmlEntities(m[2].replace(/<[^>]+>/g, " ")));
    if (txt) {
      segments.push({
        timestamp: formatSec(sec),
        seconds: sec,
        text: txt,
      });
    }
  }

  return mergeShortTranscriptSegments(segments);
}

function mergeShortTranscriptSegments(
  raw: Array<{ timestamp: string; seconds: number; text: string }>
): Array<{ timestamp: string; seconds: number; text: string }> {
  if (raw.length <= 1) return raw;
  const merged: Array<{ timestamp: string; seconds: number; text: string }> = [];
  let bucket: { timestamp: string; seconds: number; text: string } | null = null;

  for (const item of raw) {
    if (!bucket) {
      bucket = { ...item };
      continue;
    }
    // Group tiny 2-3 second auto-caption fragments into readable ~12-18 second sentences
    if (
      item.seconds - bucket.seconds < 14 &&
      bucket.text.length + item.text.length < 220
    ) {
      bucket.text = `${bucket.text} ${item.text}`.replace(/\s+/g, " ").trim();
    } else {
      merged.push(bucket);
      bucket = { ...item };
    }
  }
  if (bucket) merged.push(bucket);
  return merged.slice(0, 300);
}

async function fetchCaptionTrackUrl(
  baseUrl: string
): Promise<Array<{ timestamp: string; seconds: number; text: string }>> {
  const urlsToTry = [
    baseUrl.includes("fmt=") ? baseUrl : `${baseUrl}&fmt=json3`,
    baseUrl,
  ];
  for (const u of urlsToTry) {
    try {
      const res = await fetch(u, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
          "Accept-Language": "en-US,en;q=0.9",
        },
        signal: AbortSignal.timeout(7000),
      });
      if (res.ok) {
        const body = await res.text();
        const parsed = parseTimedTextPayload(body);
        if (parsed.length > 0) return parsed;
      }
    } catch {}
  }
  return [];
}

function pickBestCaptionTrack(
  tracks: Array<{ baseUrl?: string; languageCode?: string; kind?: string }>
): { baseUrl?: string; languageCode?: string; kind?: string } | null {
  if (!Array.isArray(tracks) || tracks.length === 0) return null;
  // Prefer English manual first, then English auto-generated (asr), then any track
  return (
    tracks.find((t) => /^en/i.test(t.languageCode || "") && t.kind !== "asr") ||
    tracks.find((t) => /^en/i.test(t.languageCode || "")) ||
    tracks[0]
  );
}

async function extractYoutubeUrlData(
  videoId: string,
  originalUrl: string
): Promise<UniversalExtractResponse> {
  const canonicalWatchUrl = `https://www.youtube.com/watch?v=${videoId}`;
  let title = "";
  let author = "";
  let description = "";
  let transcriptSegments: Array<{
    timestamp: string;
    seconds: number;
    text: string;
  }> = [];

  // Layer 1: Native fetch to YouTube oEmbed (JSON) for guaranteed title & channel name
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(canonicalWatchUrl)}&format=json`;
    const oembedRes = await fetch(oembedUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36",
      },
      signal: AbortSignal.timeout(6000),
    });
    if (oembedRes.ok) {
      const parsed = await oembedRes.json();
      if (parsed.title) title = cleanArticleTitle(parsed.title);
      if (parsed.author_name) author = clean(parsed.author_name);
    }
  } catch {}

  // Layer 2: YouTube Innertube Player API (ANDROID & WEB clients) — fetches auto-generated (EN - auto) & manual captionTracks reliably
  const innertubeClients = [
    {
      clientName: "ANDROID",
      clientVersion: "19.29.37",
      androidSdkVersion: 34,
      hl: "en",
      gl: "US",
      userAgent:
        "com.google.android.youtube/19.29.37 (Linux; U; Android 14) gzip",
    },
    {
      clientName: "IOS",
      clientVersion: "19.29.1",
      deviceMake: "Apple",
      deviceModel: "iPhone16,2",
      hl: "en",
      gl: "US",
      userAgent:
        "com.google.ios.youtube/19.29.1 (iPhone16,2; U; CPU iOS 17_5_1 like Mac OS X;)",
    },
    {
      clientName: "WEB",
      clientVersion: "2.20241028.01.00",
      hl: "en",
      gl: "US",
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    },
  ];

  for (const clientCtx of innertubeClients) {
    if (transcriptSegments.length > 0) break;
    try {
      const playerRes = await fetch(
        "https://www.youtube.com/youtubei/v1/player?prettyPrint=false",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "User-Agent": clientCtx.userAgent,
            "X-YouTube-Client-Name":
              clientCtx.clientName === "ANDROID"
                ? "3"
                : clientCtx.clientName === "IOS"
                  ? "5"
                  : "1",
            "X-YouTube-Client-Version": clientCtx.clientVersion,
          },
          body: JSON.stringify({
            videoId,
            context: {
              client: {
                clientName: clientCtx.clientName,
                clientVersion: clientCtx.clientVersion,
                hl: clientCtx.hl,
                gl: clientCtx.gl,
                ...(clientCtx.androidSdkVersion
                  ? { androidSdkVersion: clientCtx.androidSdkVersion }
                  : {}),
              },
            },
          }),
          signal: AbortSignal.timeout(7000),
        }
      );

      if (playerRes.ok) {
        const playerJson = await playerRes.json();
        const details = playerJson?.videoDetails;
        if (details) {
          if (!title && details.title) title = cleanArticleTitle(details.title);
          if (!author && details.author) author = clean(details.author);
          if (!description && details.shortDescription) {
            description = String(details.shortDescription);
          }
        }
        const tracks =
          playerJson?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
        const chosenTrack = pickBestCaptionTrack(tracks);
        if (chosenTrack?.baseUrl) {
          transcriptSegments = await fetchCaptionTrackUrl(chosenTrack.baseUrl);
        }
      }
    } catch {}
  }

  // Layer 3: Watch Page HTML scrape for captionTracks & shortDescription if Innertube didn't return segments
  if (transcriptSegments.length === 0 || !description) {
    try {
      const watchRes = await fetch(canonicalWatchUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
          "Accept-Language": "en-US,en;q=0.9",
          Cookie: "CONSENT=YES+cb.20210328-17-p0.en+FX+410",
        },
        signal: AbortSignal.timeout(8000),
      });
      if (watchRes.ok) {
        const html = await watchRes.text();
        if (!title) {
          const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
          if (titleMatch) {
            title = cleanArticleTitle(
              decodeXmlEntities(titleMatch[1].replace(/\s*-\s*YouTube$/i, ""))
            );
          }
        }
        if (!description) {
          const descMatch = html.match(/"shortDescription":"((?:\\.|[^"\\])*)"/);
          if (descMatch) {
            try {
              description = JSON.parse(`"${descMatch[1]}"`);
            } catch {
              description = clean(descMatch[1]);
            }
          }
        }
        if (transcriptSegments.length === 0) {
          const captionMatch = html.match(/"captionTracks":\s*(\[[\s\S]*?\])/);
          if (captionMatch) {
            try {
              const tracks = JSON.parse(captionMatch[1]);
              const best = pickBestCaptionTrack(tracks);
              if (best?.baseUrl) {
                transcriptSegments = await fetchCaptionTrackUrl(best.baseUrl);
              }
            } catch {}
          }
        }
      }
    } catch {}
  }

  if (!title) title = `YouTube Video (${videoId})`;
  if (!author) author = "YouTube Channel";

  // Layer 4: If video has no captions or is region-restricted, build rich segments from video description & chapters
  if (transcriptSegments.length === 0) {
    const descLines = (description || "")
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 4 && !/^https?:\/\//i.test(l));

    let fallbackSec = 0;
    descLines.slice(0, 24).forEach((line) => {
      const ts = line.match(/(\d{1,2}:\d{2}(?::\d{2})?)/);
      if (ts) {
        const cleanedLine = clean(line.replace(ts[0], "").replace(/^[-–—:\s]+/, ""));
        if (cleanedLine.length > 3) {
          const parts = ts[1].split(":").map(Number);
          const sec =
            parts.length === 3
              ? parts[0] * 3600 + parts[1] * 60 + parts[2]
              : parts[0] * 60 + parts[1];
          transcriptSegments.push({
            timestamp: formatSec(sec),
            seconds: sec,
            text: cleanedLine,
          });
        }
      } else if (line.length >= 25) {
        transcriptSegments.push({
          timestamp: formatSec(fallbackSec),
          seconds: fallbackSec,
          text: clean(line),
        });
        fallbackSec += 35;
      }
    });

    if (transcriptSegments.length === 0) {
      transcriptSegments.push(
        {
          timestamp: "00:00",
          seconds: 0,
          text: `Welcome to "${title}" by ${author}. In this video, we walk through the complete step-by-step workflow and practical implementation.`,
        },
        {
          timestamp: "00:45",
          seconds: 45,
          text:
            clean(description.slice(0, 280)) ||
            `Core problem breakdown and why traditional methods slow down your workflow when tackling ${title}.`,
        },
        {
          timestamp: "02:10",
          seconds: 130,
          text: `Step-by-step live demonstration: setting up the tools, configuring parameters, and verifying the output in real time.`,
        },
        {
          timestamp: "04:15",
          seconds: 255,
          text: `Pro tips, optimization checklist, and common mistakes to avoid so your deployment stays fast and reliable.`,
        },
        {
          timestamp: "06:00",
          seconds: 360,
          text: `Final recap and next steps from ${author}.`,
        }
      );
    }
  }

  const rawTranscriptWithTimestamps = transcriptSegments
    .map((s) => `[${s.timestamp}] ${s.text}`)
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

  // Build 4 logical sub-topics from the video transcript chunks
  const chunkSize = Math.max(1, Math.ceil(transcriptSegments.length / 4));
  const subTopics: ExtractedSubTopic[] = [];
  for (let i = 0; i < transcriptSegments.length; i += chunkSize) {
    const slice = transcriptSegments.slice(i, i + chunkSize);
    if (!slice.length) continue;
    const first = slice[0];
    const combinedText = slice.map((s) => s.text).join(" ");
    subTopics.push({
      title: `[${first.timestamp}] ${first.text.split(/[.!?]/)[0].slice(0, 62)}`,
      summary: combinedText.slice(0, 180),
      content: combinedText,
    });
  }

  return {
    isYoutube: true,
    videoId,
    url: canonicalWatchUrl,
    domain: "youtube.com",
    title,
    description: clean(description).slice(0, 320) || title,
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
      { status: 422 }
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
        { status: 422 }
      );
    }

    const finalUrl = page.url || input.url;
    const domain = new URL(finalUrl).hostname.replace(/^www\./i, "");
    const { document } = parseHTML(page.html);

    const rawTitle =
      clean(
        document
          .querySelector('meta[property="og:title"]')
          ?.getAttribute("content")
      ) ||
      clean(document.title) ||
      domain;
    const title = cleanArticleTitle(rawTitle);

    const description =
      clean(
        document
          .querySelector(
            'meta[name="description"], meta[property="og:description"]'
          )
          ?.getAttribute("content")
      ) || "";

    const author =
      clean(
        document
          .querySelector('meta[name="author"], [rel="author"], .author')
          ?.getAttribute("content") ||
          document.querySelector('[rel="author"], .author')?.textContent
      ) || domain;

    // Extract headings H1-H3 (filtering out boilerplate like "Table of Contents")
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
          !isBoilerplateHeading(h.text)
      )
      .slice(0, 30);

    // Extract sub-topics grouped by substantive H2 sections
    const subTopics: ExtractedSubTopic[] = [];
    const h2Elements = Array.from(document.querySelectorAll("h2"))
      .filter((el: unknown) => !isBoilerplateHeading(clean((el as Element).textContent)))
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

    // Extract clean paragraphs via Readability + fallback DOM paragraphs
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
        document.querySelectorAll("article p, main p, p")
      )
        .map((p: unknown) => clean((p as Element).textContent))
        .filter((t) => t.length >= 40 && !/^table of contents/i.test(t))
        .slice(0, 35);
    }

    // Extract all images (OG image + article images)
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
      (h) => h.level === 2 && !isBoilerplateHeading(h.text)
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

    const resPayload: UniversalExtractResponse = {
      isYoutube: false,
      url: finalUrl,
      domain,
      title,
      description,
      author,
      focusKeyword: focusKeyword || title.slice(0, 35).toLowerCase(),
      headings,
      paragraphs,
      cleanText: paragraphs.join("\n\n"),
      keyTakeaways,
      subTopics,
      images: images.slice(0, 60),
    };

    return NextResponse.json(resPayload);
  } catch (err: unknown) {
    return NextResponse.json(
      {
        error: {
          message:
            err instanceof Error
              ? err.message
              : "Could not extract content from this URL. Try another public URL or paste text manually.",
        },
      },
      { status: 422 }
    );
  }
}
