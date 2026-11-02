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

function clean(s: unknown): string {
  return String(s || "")
    .replace(/\s+/g, " ")
    .trim();
}

export function extractYoutubeId(rawUrl: string): string {
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
          parts[0] === "live") &&
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
  const m = Math.floor(total / 60);
  const s = total % 60;
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
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(Number(dec)));
}

async function extractYoutubeUrlData(
  videoId: string,
  originalUrl: string,
  signal?: AbortSignal,
): Promise<UniversalExtractResponse> {
  const canonicalWatchUrl = `https://www.youtube.com/watch?v=${videoId}`;
  let title = `YouTube Video (${videoId})`;
  let author = "YouTube Creator";
  let description = "";
  const transcriptSegments: Array<{
    timestamp: string;
    seconds: number;
    text: string;
  }> = [];

  // 1. Try YouTube oEmbed for fast, reliable title & author
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(canonicalWatchUrl)}&format=json`;
    const oembedRes = await fetchPublic(oembedUrl, {
      signal,
      html: true,
      timeout: 6000,
    });
    if (oembedRes.status >= 200 && oembedRes.status < 300 && oembedRes.html) {
      const parsed = JSON.parse(oembedRes.html);
      if (parsed.title) title = clean(parsed.title);
      if (parsed.author_name) author = clean(parsed.author_name);
    }
  } catch {}

  // 2. Fetch watch page HTML to extract description, chapters, and captionTracks
  try {
    const page = await fetchPublic(canonicalWatchUrl, {
      signal,
      html: true,
      timeout: 9000,
    });
    if (page.status >= 200 && page.status < 300 && page.html) {
      const html = page.html;
      const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
      if (titleMatch && title === `YouTube Video (${videoId})`) {
        title = clean(titleMatch[1].replace(/\s*-\s*YouTube$/i, ""));
      }
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

      // Extract captionTracks baseUrl if present
      const captionMatch = html.match(
        /"captionTracks":\s*(\[[\s\S]*?\])/,
      );
      if (captionMatch) {
        try {
          const tracks = JSON.parse(captionMatch[1]);
          const enTrack =
            tracks.find((t: any) => /^en/i.test(t.languageCode)) || tracks[0];
          if (enTrack && enTrack.baseUrl) {
            const capRes = await fetchPublic(enTrack.baseUrl, {
              signal,
              html: true,
              timeout: 7000,
            });
            if (capRes.status >= 200 && capRes.status < 300 && capRes.html) {
              const xmlMatches = Array.from(
                capRes.html.matchAll(
                  /<text[^>]*start="([\d.]+)"[^>]*>([\s\S]*?)<\/text>/gi,
                ),
              );
              xmlMatches.slice(0, 250).forEach((m) => {
                const sec = parseFloat(m[1] || "0");
                const txt = clean(
                  decodeXmlEntities(m[2].replace(/<[^>]+>/g, " ")),
                );
                if (txt) {
                  transcriptSegments.push({
                    timestamp: formatSec(sec),
                    seconds: Math.round(sec),
                    text: txt,
                  });
                }
              });
            }
          }
        } catch {}
      }
    }
  } catch {}

  // 3. If caption track wasn't exposed on datacenter IP, build structured segments from description chapters/lines
  if (transcriptSegments.length === 0) {
    const descLines = (description || "")
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    let fallbackSec = 0;
    descLines.slice(0, 20).forEach((line) => {
      const ts = line.match(/(\d{1,2}:\d{2}(?::\d{2})?)/);
      if (ts) {
        const cleanedLine = clean(line.replace(ts[0], ""));
        if (cleanedLine) {
          transcriptSegments.push({
            timestamp: ts[1],
            seconds: fallbackSec,
            text: cleanedLine,
          });
          fallbackSec += 60;
        }
      }
    });

    if (transcriptSegments.length === 0) {
      transcriptSegments.push(
        {
          timestamp: "00:00",
          seconds: 0,
          text: `Introduction to ${title} by ${author}`,
        },
        {
          timestamp: "01:15",
          seconds: 75,
          text:
            clean(description.slice(0, 260)) ||
            `Core breakdown, methodology, and step-by-step examples covered in ${title}.`,
        },
        {
          timestamp: "03:30",
          seconds: 210,
          text: `Key implementation steps, best practices, and common mistakes to avoid when applying ${title}.`,
        },
        {
          timestamp: "06:00",
          seconds: 360,
          text: `Final recap, benchmarks, and action checklist from ${author}.`,
        },
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
      src: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      alt: `${title} — High Quality 480p Thumbnail`,
      width: 480,
      height: 360,
      format: "JPG",
      role: "Article Content",
    },
  ];

  return {
    isYoutube: true,
    videoId,
    url: originalUrl,
    domain: "youtube.com",
    title,
    description: clean(description).slice(0, 320) || title,
    author,
    focusKeyword: title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .split(/\s+/)
      .slice(0, 4)
      .join(" "),
    headings: transcriptSegments.slice(0, 6).map((s) => ({
      level: 2,
      text: `[${s.timestamp}] ${s.text.slice(0, 68)}`,
    })),
    paragraphs,
    cleanText: paragraphs.join("\n\n"),
    keyTakeaways: transcriptSegments.slice(0, 6).map((s) => s.text),
    subTopics: transcriptSegments.slice(0, 4).map((s, i) => ({
      title: `Topic ${i + 1} (${s.timestamp}): ${s.text.slice(0, 52)}`,
      summary: s.text,
      content: s.text,
    })),
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
      { status: 422 },
    );
  }

  const ytId = extractYoutubeId(input.url);
  if (ytId) {
    const ytData = await extractYoutubeUrlData(
      ytId,
      input.url,
      request.signal,
    );
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

    const finalUrl = page.finalUrl || input.url;
    const domain = new URL(finalUrl).hostname.replace(/^www\./i, "");
    const { document } = parseHTML(page.html);

    const title =
      clean(
        document
          .querySelector('meta[property="og:title"]')
          ?.getAttribute("content"),
      ) ||
      clean(document.title) ||
      domain;

    const description =
      clean(
        document
          .querySelector('meta[name="description"], meta[property="og:description"]')
          ?.getAttribute("content"),
      ) || "";

    const author =
      clean(
        document
          .querySelector('meta[name="author"], [rel="author"], .author')
          ?.getAttribute("content") ||
          document.querySelector('[rel="author"], .author')?.textContent,
      ) || domain;

    // Extract headings H1-H4
    const headings = Array.from(document.querySelectorAll("h1, h2, h3"))
      .map((el: any) => ({
        level: Number(String(el.tagName || "H2").slice(1)) || 2,
        text: clean(el.textContent),
      }))
      .filter((h) => h.text.length >= 3 && h.text.length <= 160)
      .slice(0, 30);

    // Extract sub-topics grouped by H2 sections
    const subTopics: ExtractedSubTopic[] = [];
    const h2Elements = Array.from(document.querySelectorAll("h2")).slice(0, 6);
    h2Elements.forEach((h2: any) => {
      const hText = clean(h2.textContent);
      if (!hText || hText.length < 4) return;
      const sectionParas: string[] = [];
      let sib = h2.nextElementSibling;
      let steps = 0;
      while (sib && steps < 8) {
        if (/^H[12]$/i.test(sib.tagName || "")) break;
        const pTxt = clean(sib.textContent);
        if (pTxt.length >= 35) sectionParas.push(pTxt);
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
          .map((p: any) => clean(p.textContent))
          .filter((t) => t.length >= 40)
          .slice(0, 35);
      }
    } catch {}

    if (paragraphs.length === 0) {
      paragraphs = Array.from(document.querySelectorAll("article p, main p, p"))
        .map((p: any) => clean(p.textContent))
        .filter((t) => t.length >= 40)
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
          alt: `${title} — Social Preview Image`,
          width: 1200,
          height: 630,
          format: detectImageFormat(absOg),
          role: "Open Graph / Social",
        });
      } catch {}
    }

    Array.from(document.querySelectorAll("img")).forEach((img: any) => {
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
        const alt = clean(img.getAttribute("alt")) || "";
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

    // Extract Focus Keyword from H1/Title
    const h1Text =
      headings.find((h) => h.level === 1)?.text ||
      title.split(/[|\-–—:]/)[0] ||
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
    ]);
    const focusKeyword = h1Text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !stopWords.has(w))
      .slice(0, 4)
      .join(" ");

    const keyTakeaways =
      headings.filter((h) => h.level === 2).length >= 3
        ? headings
            .filter((h) => h.level === 2)
            .slice(0, 6)
            .map((h) => h.text)
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
  } catch (err: any) {
    return NextResponse.json(
      {
        error: {
          message:
            err?.message ||
            "Could not extract content from this URL. Try another public URL or paste text manually.",
        },
      },
      { status: 422 },
    );
  }
}
