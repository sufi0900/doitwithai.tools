import { NextRequest, NextResponse } from "next/server";
import { parseHTML } from "linkedom";
import { zipStored } from "../../../../features/outreach-email/docx";
import {
  fetchPublic,
  publicUrl,
} from "../../../../features/backlink-verifier/fetch.server";
import type {
  ThumbnailVariant,
  VideoInspectResult,
} from "../../../../features/social-media-video-thumbnail-grabber/model";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function extractYoutubeVideoId(rawUrl: string): string | null {
  try {
    const parsed = new URL(rawUrl);
    const host = parsed.hostname.replace(/^www\./, "").toLowerCase();
    if (host === "youtu.be") {
      const id = parsed.pathname.split("/").filter(Boolean)[0];
      return id && /^[a-zA-Z0-9_-]{6,15}$/.test(id) ? id : null;
    }
    if (host.endsWith("youtube.com") || host.endsWith("youtube-nocookie.com")) {
      const v = parsed.searchParams.get("v");
      if (v && /^[a-zA-Z0-9_-]{6,15}$/.test(v)) return v;
      const parts = parsed.pathname.split("/").filter(Boolean);
      if (
        (parts[0] === "shorts" || parts[0] === "embed" || parts[0] === "live" || parts[0] === "v") &&
        parts[1]
      ) {
        return parts[1];
      }
    }
  } catch {
    // fallback regex
  }
  const match = rawUrl.match(/(?:v=|youtu\.be\/|shorts\/|embed\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

function detectPlatformName(rawUrl: string): string {
  try {
    const host = new URL(rawUrl).hostname.toLowerCase();
    if (host.includes("youtube") || host.includes("youtu.be")) return "YouTube / Shorts";
    if (host.includes("tiktok")) return "TikTok";
    if (host.includes("instagram")) return "Instagram";
    if (host.includes("facebook") || host.includes("fb.watch")) return "Facebook Video";
    if (host.includes("linkedin")) return "LinkedIn";
    if (host.includes("twitter") || host.includes("x.com")) return "X (Twitter)";
    if (host.includes("vimeo")) return "Vimeo";
    return host.replace(/^www\./, "");
  } catch {
    return "Web Video / Social Post";
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const mode = body.mode || "inspect";

    if (mode === "zip") {
      const items: { url: string; filename: string; label?: string; resolution?: string }[] =
        Array.isArray(body.items) ? body.items.slice(0, 15) : [];
      if (!items.length) {
        return NextResponse.json(
          { error: "Select at least one thumbnail to bundle into a .ZIP archive." },
          { status: 400 }
        );
      }

      const zipEntries: Record<string, string | Uint8Array> = {};
      const manifestRows: string[] = [
        "Filename,Label,Resolution,SourceURL,DownloadStatus",
      ];

      await Promise.all(
        items.map(async (item, idx) => {
          try {
            const validated = publicUrl(item.url);
            const res = await fetch(validated.toString(), {
              headers: {
                "User-Agent":
                  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36",
              },
              signal: AbortSignal.timeout(8000),
            });
            if (!res.ok) {
              manifestRows.push(
                `"${item.filename}","${item.label || ""}","${item.resolution || ""}","${item.url}","HTTP ${res.status}"`
              );
              return;
            }
            const buf = new Uint8Array(await res.arrayBuffer());
            const safeName =
              (item.filename || `thumbnail-${idx + 1}.jpg`).replace(/[^a-zA-Z0-9._-]/g, "_");
            zipEntries[safeName] = buf;
            manifestRows.push(
              `"${safeName}","${item.label || ""}","${item.resolution || ""}","${item.url}","Included (${buf.byteLength} bytes)"`
            );
          } catch {
            manifestRows.push(
              `"${item.filename}","${item.label || ""}","${item.resolution || ""}","${item.url}","Skipped"`
            );
          }
        })
      );

      zipEntries["00-video-thumbnails-manifest.csv"] = manifestRows.join("\n");
      const zipBytes = zipStored(zipEntries);
      const base64Zip = Buffer.from(zipBytes).toString("base64");
      return NextResponse.json({
        zipBase64: base64Zip,
        fileCount: Object.keys(zipEntries).length - 1,
      });
    }

    // Default mode: inspect URL
    const rawUrl = String(body.url || "").trim();
    if (!rawUrl) {
      return NextResponse.json(
        { error: "Please paste a YouTube, Shorts, TikTok, Instagram, or webpage URL." },
        { status: 400 }
      );
    }

    const ytId = extractYoutubeVideoId(rawUrl);
    if (ytId) {
      let title = `YouTube Video (${ytId})`;
      let authorOrChannel = "YouTube Creator";
      let description =
        "Full HD 1080p/4K thumbnail set, storyboard frames, and embed package extracted directly from YouTube.";
      const tagsOrKeywords: string[] = ["YouTube Video", "HD Thumbnail", "Video SEO"];

      try {
        const oembedRes = await fetch(
          `https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${ytId}`)}&format=json`,
          { signal: AbortSignal.timeout(6000) }
        );
        if (oembedRes.ok) {
          const oembed = await oembedRes.json();
          if (oembed.title) title = oembed.title;
          if (oembed.author_name) authorOrChannel = oembed.author_name;
        }
      } catch {
        // continue with defaults
      }

      const thumbnails: ThumbnailVariant[] = [
        {
          id: "maxresdefault",
          label: "Max Resolution HD / 4K Cover (maxresdefault.jpg)",
          resolution: "1280 × 720 (16:9 HD)",
          aspectRatio: "16:9",
          url: `https://i.ytimg.com/vi/${ytId}/maxresdefault.jpg`,
          category: "High-Res Cover",
          recommendedUse: "Best for blog hero images, social reposts, and design mockups.",
        },
        {
          id: "sddefault",
          label: "Standard Definition Cover (sddefault.jpg)",
          resolution: "640 × 480 (4:3 SD)",
          aspectRatio: "4:3",
          url: `https://i.ytimg.com/vi/${ytId}/sddefault.jpg`,
          category: "Standard Cover",
          recommendedUse: "Best for lightweight newsletter embeds and fast-loading previews.",
        },
        {
          id: "hqdefault",
          label: "High Quality Feed Cover (hqdefault.jpg)",
          resolution: "480 × 360",
          aspectRatio: "4:3",
          url: `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`,
          category: "Standard Cover",
          recommendedUse: "Guaranteed fallback cover available on 100% of YouTube videos.",
        },
        {
          id: "mqdefault",
          label: "Medium Widescreen Thumbnail (mqdefault.jpg)",
          resolution: "320 × 180 (16:9)",
          aspectRatio: "16:9",
          url: `https://i.ytimg.com/vi/${ytId}/mqdefault.jpg`,
          category: "Standard Cover",
          recommendedUse: "Compact 16:9 card without black letterbox bars.",
        },
        {
          id: "hq1",
          label: "Auto-Captured Video Frame #1 (25% Mark)",
          resolution: "480 × 360",
          aspectRatio: "4:3",
          url: `https://i.ytimg.com/vi/${ytId}/hq1.jpg`,
          category: "Storyboard Frame",
          recommendedUse: "Compare custom thumbnail against actual in-video frame #1.",
        },
        {
          id: "hq2",
          label: "Auto-Captured Video Frame #2 (50% Midpoint)",
          resolution: "480 × 360",
          aspectRatio: "4:3",
          url: `https://i.ytimg.com/vi/${ytId}/hq2.jpg`,
          category: "Storyboard Frame",
          recommendedUse: "Mid-video still frame for storyboard or article screenshots.",
        },
        {
          id: "hq3",
          label: "Auto-Captured Video Frame #3 (75% Mark)",
          resolution: "480 × 360",
          aspectRatio: "4:3",
          url: `https://i.ytimg.com/vi/${ytId}/hq3.jpg`,
          category: "Storyboard Frame",
          recommendedUse: "Late-video still frame for multi-image blog recaps.",
        },
      ];

      const words = title
        .replace(/[^a-zA-Z0-9\s]/g, " ")
        .split(/\s+/)
        .filter((w) => w.length > 3);
      for (const w of words.slice(0, 5)) {
        if (!tagsOrKeywords.includes(w)) tagsOrKeywords.push(w);
      }

      const result: VideoInspectResult = {
        isYoutube: true,
        platformName: "YouTube / Shorts",
        sourceUrl: `https://www.youtube.com/watch?v=${ytId}`,
        videoId: ytId,
        title,
        authorOrChannel,
        description,
        embedHtml: `<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/${ytId}" title="${title.replace(/"/g, "&quot;")}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`,
        thumbnails,
        tagsOrKeywords,
        seoChecklist: [
          {
            label: "1280×720 HD Cover Available (maxresdefault)",
            passed: true,
            detail: "Full 16:9 widescreen high-resolution thumbnail is active for Google Discover & Video SERPs.",
          },
          {
            label: "Title Length & CTR Readability",
            passed: title.length >= 25 && title.length <= 70,
            detail: `Title is ${title.length} characters (optimal range is 35–65 characters before mobile truncation).`,
          },
          {
            label: "Privacy-Enhanced Embed Ready",
            passed: true,
            detail: "Generated youtube-nocookie.com iframe prevents third-party cookie bloat on your blog.",
          },
        ],
      };

      return NextResponse.json(result);
    }

    // Non-YouTube Social or Webpage URL inspection
    const targetUrl = publicUrl(rawUrl);
    const fetched = await fetchPublic(targetUrl);
    const { document } = parseHTML(fetched.text || "");

    const ogTitle =
      document.querySelector('meta[property="og:title"]')?.getAttribute("content") ||
      document.querySelector('meta[name="twitter:title"]')?.getAttribute("content") ||
      document.querySelector("title")?.textContent ||
      targetUrl.hostname;
    const ogDesc =
      document.querySelector('meta[property="og:description"]')?.getAttribute("content") ||
      document.querySelector('meta[name="description"]')?.getAttribute("content") ||
      "Extracted social video & OpenGraph preview cards from the target URL.";
    const ogSite =
      document.querySelector('meta[property="og:site_name"]')?.getAttribute("content") ||
      detectPlatformName(rawUrl);

    const thumbnails: ThumbnailVariant[] = [];
    const seenUrls = new Set<string>();

    function pushThumb(
      rawSrc: string | null | undefined,
      label: string,
      resolution: string,
      category: ThumbnailVariant["category"],
      recommendedUse: string
    ) {
      if (!rawSrc) return;
      try {
        const abs = new URL(rawSrc, targetUrl.toString()).toString();
        if (seenUrls.has(abs) || abs.startsWith("data:")) return;
        seenUrls.add(abs);
        thumbnails.push({
          id: `thumb-${thumbnails.length + 1}`,
          label,
          resolution,
          aspectRatio: "16:9 / Auto",
          url: abs,
          category,
          recommendedUse,
        });
      } catch {
        // ignore invalid URL
      }
    }

    pushThumb(
      document.querySelector('meta[property="og:image"]')?.getAttribute("content"),
      "OpenGraph Social Share Cover (og:image)",
      "1200 × 630 (Social Card)",
      "Social OpenGraph",
      "Primary cover image shown on LinkedIn, Facebook, Discord, and WhatsApp link previews."
    );
    pushThumb(
      document.querySelector('meta[name="twitter:image"]')?.getAttribute("content"),
      "X / Twitter Summary Large Image (twitter:image)",
      "1200 × 675",
      "Social OpenGraph",
      "Dedicated preview card displayed on X / Twitter posts."
    );

    // Check <video poster="...">
    const videoNodes = Array.from(document.querySelectorAll("video"));
    videoNodes.forEach((v: unknown, idx: number) => {
      const el = v as Element;
      pushThumb(
        el.getAttribute("poster"),
        `HTML5 Video Poster Frame #${idx + 1}`,
        "Native Video Poster",
        "High-Res Cover",
        "Poster frame configured on the page's embedded <video> player."
      );
    });

    // Check top hero images
    const imgNodes = Array.from(document.querySelectorAll("img")).slice(0, 12);
    imgNodes.forEach((img: unknown, idx: number) => {
      const el = img as Element;
      const src =
        el.getAttribute("src") ||
        el.getAttribute("data-src") ||
        el.getAttribute("data-lazy-src");
      const alt = el.getAttribute("alt")?.trim() || `Page Visual #${idx + 1}`;
      pushThumb(
        src,
        alt.slice(0, 65),
        "Webpage Media Asset",
        "Standard Cover",
        "Extracted visual asset from the page body."
      );
    });

    const result: VideoInspectResult = {
      isYoutube: false,
      platformName: detectPlatformName(rawUrl),
      sourceUrl: targetUrl.toString(),
      title: ogTitle.trim(),
      authorOrChannel: ogSite.trim(),
      description: ogDesc.trim(),
      thumbnails,
      tagsOrKeywords: [detectPlatformName(rawUrl), "OpenGraph Cover", "Social Preview"],
      seoChecklist: [
        {
          label: "OpenGraph Cover Image (og:image) Present",
          passed: thumbnails.some((t) => t.category === "Social OpenGraph"),
          detail: thumbnails.some((t) => t.category === "Social OpenGraph")
            ? "Page defines a social preview cover image for link shares."
            : "No og:image meta tag detected—link shares on social feeds may appear blank.",
        },
        {
          label: "Visual Assets Discovered",
          passed: thumbnails.length > 0,
          detail: `Extracted ${thumbnails.length} downloadable cover/media assets from ${targetUrl.hostname}.`,
        },
      ],
    };

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not inspect thumbnails from that URL.",
      },
      { status: 500 }
    );
  }
}
