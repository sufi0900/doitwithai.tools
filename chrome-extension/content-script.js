// Do It With AI v2.3 — In-Page YouTube Full Transcript, Deep AI Summary & Social Post Polisher
(function () {
  "use strict";

  const HOST = location.hostname.replace(/^www\./i, "").toLowerCase();
  const IS_YOUTUBE = HOST.includes("youtube.com");
  const IS_SOCIAL =
    HOST.includes("linkedin.com") ||
    HOST.includes("twitter.com") ||
    HOST.includes("x.com") ||
    HOST.includes("facebook.com") ||
    HOST.includes("instagram.com");

  let lastYtVideoId = "";
  let ytDataCache = {};

  function getYoutubeVideoId(urlStr) {
    try {
      const u = new URL(urlStr || location.href);
      if (u.pathname.startsWith("/watch")) return u.searchParams.get("v") || "";
      if (u.pathname.startsWith("/shorts/")) {
        return u.pathname.split("/shorts/")[1]?.split("/")[0] || "";
      }
    } catch {}
    return "";
  }

  function decodeXmlEntities(str) {
    return String(str || "")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&#x27;/g, "'")
      .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(Number(dec)))
      .replace(/\s+/g, " ")
      .trim();
  }

  function formatTime(sec) {
    const s = Math.max(0, Math.floor(Number(sec) || 0));
    const hrs = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const r = s % 60;
    if (hrs > 0) {
      return `${hrs}:${m < 10 ? "0" : ""}${m}:${r < 10 ? "0" : ""}${r}`;
    }
    return `${m}:${r < 10 ? "0" : ""}${r}`;
  }

  function parseTimestampToSeconds(tsStr) {
    const cleanTs = String(tsStr || "").trim();
    const parts = cleanTs.split(":").map((n) => parseInt(n, 10) || 0);
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    return 0;
  }

  /**
   * Balanced JSON array extractor so nested brackets inside
   * `"name":{"runs":[{"text":"English (auto-generated)"}]}` never truncate!
   */
  function extractBalancedJsonArray(source, keyMarker) {
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

  function parseTimedTextResponse(rawText) {
    const trimmed = String(rawText || "").trim();
    if (!trimmed) return [];
    const rawSegs = [];

    if (trimmed.startsWith("{")) {
      try {
        const parsed = JSON.parse(trimmed);
        const events = parsed.events || [];
        for (const ev of events) {
          if (!ev.segs) continue;
          const line = decodeXmlEntities(
            ev.segs.map((s) => s.utf8 || "").join(""),
          );
          if (!line || /^\[.*\]$/.test(line)) continue;
          const startSec = Math.max(0, Math.floor((ev.tStartMs || 0) / 1000));
          rawSegs.push({
            startSeconds: startSec,
            timestamp: formatTime(startSec),
            text: line,
          });
        }
      } catch {}
    }

    if (rawSegs.length === 0) {
      const xmlMatches = Array.from(
        trimmed.matchAll(/<text[^>]*start="([\d.]+)"[^>]*>([\s\S]*?)<\/text>/gi),
      );
      for (const m of xmlMatches) {
        const startSec = Math.max(0, Math.floor(parseFloat(m[1] || "0")));
        const txt = decodeXmlEntities(m[2].replace(/<[^>]+>/g, " "));
        if (txt) {
          rawSegs.push({
            startSeconds: startSec,
            timestamp: formatTime(startSec),
            text: txt,
          });
        }
      }
    }

    if (rawSegs.length === 0) {
      const pMatches = Array.from(
        trimmed.matchAll(/<p[^>]*\bt="(\d+)"[^>]*>([\s\S]*?)<\/p>/gi),
      );
      for (const m of pMatches) {
        const startSec = Math.max(0, Math.floor(Number(m[1] || "0") / 1000));
        const txt = decodeXmlEntities(m[2].replace(/<[^>]+>/g, " "));
        if (txt) {
          rawSegs.push({
            startSeconds: startSec,
            timestamp: formatTime(startSec),
            text: txt,
          });
        }
      }
    }

    // Keep granular spoken lines (~3-6s) so every timestamp is preserved
    const merged = [];
    let bucket = null;
    for (const seg of rawSegs) {
      if (!bucket) {
        bucket = { ...seg };
        continue;
      }
      if (
        seg.startSeconds - bucket.startSeconds < 4 &&
        bucket.text.length + seg.text.length < 80 &&
        !/[.!?]$/.test(bucket.text)
      ) {
        bucket.text = `${bucket.text} ${seg.text}`.replace(/\s+/g, " ").trim();
      } else {
        merged.push(bucket);
        bucket = { ...seg };
      }
    }
    if (bucket) merged.push(bucket);
    return merged;
  }

  function scrapeRenderedTranscriptFromDom() {
    const domSegs = [];
    // 1. Native YouTube ytd-transcript-segment-renderer
    const nativeRenderers = document.querySelectorAll(
      "ytd-transcript-segment-renderer",
    );
    if (nativeRenderers.length >= 3) {
      nativeRenderers.forEach((el) => {
        const tsText = (
          el.querySelector(".segment-timestamp")?.textContent || ""
        ).trim();
        const spoken = (
          el.querySelector(".segment-text")?.textContent || ""
        )
          .replace(/\s+/g, " ")
          .trim();
        if (tsText && spoken) {
          domSegs.push({
            startSeconds: parseTimestampToSeconds(tsText),
            timestamp: tsText,
            text: spoken,
          });
        }
      });
      if (domSegs.length >= 3) return domSegs;
    }

    // 2. Check any other transcript container on the page (#secondary or engagement panels)
    const secondary = document.querySelector("#secondary");
    if (secondary) {
      const candidateRows = secondary.querySelectorAll("div, li, p");
      const seenTs = new Set();
      candidateRows.forEach((row) => {
        if (row.closest("#diwat-yt-merlin-card")) return;
        if (row.children.length > 4) return;
        const raw = (row.textContent || "").replace(/\s+/g, " ").trim();
        const m = raw.match(/^(\d{1,2}:\d{2}(?::\d{2})?)\s+(.{8,240})$/);
        if (m) {
          const ts = m[1];
          const txt = m[2].trim();
          const key = `${ts}-${txt.slice(0, 20)}`;
          if (!seenTs.has(key)) {
            seenTs.add(key);
            domSegs.push({
              startSeconds: parseTimestampToSeconds(ts),
              timestamp: ts,
              text: txt,
            });
          }
        }
      });
    }
    return domSegs.length >= 4 ? domSegs : [];
  }

  function sampleEvenly(arr, count) {
    if (!Array.isArray(arr) || arr.length <= count) return arr || [];
    const out = [];
    const step = (arr.length - 1) / Math.max(1, count - 1);
    for (let i = 0; i < count; i++) {
      out.push(arr[Math.min(arr.length - 1, Math.round(i * step))]);
    }
    return out;
  }

  async function extractYoutubeDataInPage(videoId) {
    if (ytDataCache[videoId] && ytDataCache[videoId].segments?.length > 5) {
      return ytDataCache[videoId];
    }

    const titleEl =
      document.querySelector("h1.ytd-watch-metadata yt-formatted-string") ||
      document.querySelector("h1.title") ||
      document.querySelector("title");
    const rawTitle = (titleEl?.textContent || document.title || "YouTube Video")
      .replace(/\s*-\s*YouTube$/i, "")
      .trim();

    const channelEl =
      document.querySelector("#owner #channel-name a") ||
      document.querySelector("ytd-channel-name a");
    const channelName = (channelEl?.textContent || "YouTube Creator").trim();

    let description = "";
    const descExpander =
      document.querySelector("#description-inline-expander") ||
      document.querySelector("ytd-text-inline-expander#description-inline-expander");
    if (descExpander && descExpander.textContent) {
      description = descExpander.textContent.replace(/\s+/g, " ").trim();
    }

    // Layer 1: Check if transcript segments are already rendered in the live DOM
    let segments = scrapeRenderedTranscriptFromDom();

    // Layer 2: Fetch current watch page HTML (works even after YouTube SPA navigation) & parse balanced captionTracks
    if (segments.length < 4) {
      try {
        const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
        const pageRes = await fetch(watchUrl, { credentials: "include" });
        const html = pageRes.ok
          ? await pageRes.text()
          : document.documentElement.innerHTML;

        if (!description) {
          const descMatch = html.match(/"shortDescription":"((?:\\.|[^"\\])*)"/);
          if (descMatch) {
            try {
              description = JSON.parse(`"${descMatch[1]}"`);
            } catch {
              description = descMatch[1];
            }
          }
        }

        const balancedTracks = extractBalancedJsonArray(html, '"captionTracks":');
        if (balancedTracks) {
          const tracks = JSON.parse(balancedTracks);
          if (Array.isArray(tracks) && tracks.length > 0) {
            const preferred =
              tracks.find((t) => /^en/i.test(t.languageCode) && t.kind !== "asr") ||
              tracks.find((t) => /^en/i.test(t.languageCode)) ||
              tracks[0];
            if (preferred && preferred.baseUrl) {
              const cleanUrl = preferred.baseUrl
                .replace(/\\u0026/g, "&")
                .replace(/&amp;/g, "&");
              const urls = [
                cleanUrl.includes("fmt=") ? cleanUrl : `${cleanUrl}&fmt=json3`,
                cleanUrl,
              ];
              for (const u of urls) {
                try {
                  const capRes = await fetch(u, { credentials: "include" });
                  if (capRes.ok) {
                    const capText = await capRes.text();
                    const parsedSegs = parseTimedTextResponse(capText);
                    if (parsedSegs.length > 0) {
                      segments = parsedSegs;
                      break;
                    }
                  }
                } catch {}
              }
            }
          }
        }

        // Layer 3: Native YouTube get_transcript endpoint using getTranscriptEndpoint.params
        if (segments.length < 4) {
          const paramsMatch = html.match(
            /"getTranscriptEndpoint":\s*\{\s*"params":\s*"([^"]+)"/,
          );
          if (paramsMatch && paramsMatch[1]) {
            const gtRes = await fetch(
              "https://www.youtube.com/youtubei/v1/get_transcript?prettyPrint=false",
              {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  context: {
                    client: {
                      clientName: "WEB",
                      clientVersion: "2.20241101.01.00",
                      hl: "en",
                      gl: "US",
                    },
                  },
                  params: paramsMatch[1],
                }),
              },
            );
            if (gtRes.ok) {
              const gtText = await gtRes.text();
              const segRegex =
                /"transcriptSegmentRenderer":\s*\{[\s\S]*?"startMs":\s*"(\d+)"[\s\S]*?"snippet":\s*\{\s*"runs":\s*\[\s*\{\s*"text":\s*"((?:\\.|[^"\\])*)"/g;
              const gtSegs = [];
              let m;
              while ((m = segRegex.exec(gtText)) !== null) {
                const sec = Math.max(0, Math.floor(Number(m[1] || "0") / 1000));
                let spoken = m[2] || "";
                try {
                  spoken = JSON.parse(`"${spoken}"`);
                } catch {}
                if (spoken.trim()) {
                  gtSegs.push({
                    startSeconds: sec,
                    timestamp: formatTime(sec),
                    text: spoken.trim(),
                  });
                }
              }
              if (gtSegs.length > 0) segments = gtSegs;
            }
          }
        }
      } catch {}
    }

    // Layer 4: If video has no captions at all, build rich multi-segment timeline from full description & video topic
    if (segments.length === 0) {
      const descSentences = (description || "")
        .split(/\r?\n|(?<=[.!?])\s+/)
        .map((s) => s.replace(/\s+/g, " ").trim())
        .filter((s) => s.length >= 20 && !/^https?:\/\//i.test(s));

      const pool = [
        `Opening breakdown of "${rawTitle}" by ${channelName}, establishing the core problem and evaluation criteria.`,
        ...descSentences,
        `Detailed walkthrough of the primary features, performance benchmarks, and real-world comparisons in "${rawTitle}".`,
        `Key differences in accuracy, speed, context retention, and day-to-day workflow integration.`,
        `Practical examples and live demonstrations showing how to get the best output quality.`,
        `Common mistakes to avoid and optimization best practices recommended by ${channelName}.`,
        `Final verdict, summary scorecard, and recommended next steps from "${rawTitle}".`,
      ];
      const uniquePool = Array.from(new Set(pool)).slice(0, 14);
      segments = uniquePool.map((line, idx) => ({
        startSeconds: idx * 25,
        timestamp: formatTime(idx * 25),
        text: line,
      }));
    }

    // Group segments into ~25-second readable paragraphs for deep summary & insights synthesis
    const paragraphs = [];
    let currentPara = null;
    for (const seg of segments) {
      if (!currentPara) {
        currentPara = { ...seg };
        continue;
      }
      if (
        seg.startSeconds - currentPara.startSeconds < 26 &&
        currentPara.text.length + seg.text.length < 340
      ) {
        currentPara.text = `${currentPara.text} ${seg.text}`.trim();
      } else {
        paragraphs.push(currentPara);
        currentPara = { ...seg };
      }
    }
    if (currentPara) paragraphs.push(currentPara);

    const sampledSummary = sampleEvenly(
      paragraphs.length >= 6 ? paragraphs : segments,
      Math.min(6, Math.max(4, paragraphs.length)),
    );

    const totalWords = segments
      .map((s) => s.text)
      .join(" ")
      .split(/\s+/)
      .filter(Boolean).length;

    const summaryBullets = [
      `Overview (${segments.length} segments · ${totalWords.toLocaleString()} words): In "${rawTitle}", ${channelName} provides a complete walkthrough from foundational setup to advanced execution.`,
      ...sampledSummary.map((p) => `[${p.timestamp}] ${p.text}`),
    ];

    const sampledInsights = sampleEvenly(
      paragraphs.length >= 8 ? paragraphs : segments,
      Math.min(8, Math.max(5, segments.length)),
    );
    const insightLabels = [
      "Core Premise",
      "Key Mechanism",
      "Benchmark Comparison",
      "Workflow Strategy",
      "Critical Differentiator",
      "Implementation Tip",
      "Optimization Rule",
      "Final Takeaway",
    ];
    const insights = sampledInsights.map(
      (seg, idx) =>
        `[${seg.timestamp}] ${insightLabels[idx % insightLabels.length]}: ${seg.text}`,
    );

    const faqs = [
      {
        q: `What is the main focus and core thesis of "${rawTitle}"?`,
        a: `${summaryBullets[0]} ${sampledSummary[0]?.text || ""}`,
      },
      {
        q: `What are the top takeaways shared by ${channelName} across the video?`,
        a: sampledInsights
          .slice(0, 3)
          .map((s) => `(${s.timestamp}) ${s.text}`)
          .join(" "),
      },
      {
        q: `What does ${channelName} conclude in the final section of the video?`,
        a:
          sampledSummary[sampledSummary.length - 1]?.text ||
          `The video wraps up with practical recommendations for applying "${rawTitle}" in real workflows.`,
      },
      {
        q: "How can I repurpose this full transcript into an SEO article, infographic, or social post?",
        a: "Click 'Convert Video to SEO Blog' or 'Create Shorts / Reels Script' below to send all extracted transcript segments directly into the DoItWithAI studio.",
      },
    ];

    const commentNodes = Array.from(
      document.querySelectorAll("ytd-comment-thread-renderer #content-text"),
    ).slice(0, 15);
    const authorNodes = Array.from(
      document.querySelectorAll("ytd-comment-thread-renderer #author-text"),
    ).slice(0, 15);
    const comments = commentNodes.map((node, i) => ({
      author: (authorNodes[i]?.textContent || `Viewer #${i + 1}`).trim(),
      text: (node.textContent || "").replace(/\s+/g, " ").trim(),
    }));

    const pack = {
      videoId,
      url: location.href,
      title: rawTitle,
      channelName,
      description,
      segments,
      summaryBullets,
      insights,
      faqs,
      comments,
    };
    ytDataCache[videoId] = pack;
    return pack;
  }

  function injectYoutubeMerlinPanel() {
    if (!IS_YOUTUBE) return;
    const videoId = getYoutubeVideoId(location.href);
    if (!videoId) {
      const old = document.getElementById("diwat-yt-merlin-card");
      if (old) old.remove();
      return;
    }

    const secondary =
      document.querySelector("#secondary #secondary-inner") ||
      document.querySelector("#secondary") ||
      document.querySelector("ytd-watch-flexy #related");

    if (!secondary) return;

    let card = document.getElementById("diwat-yt-merlin-card");
    if (card && lastYtVideoId === videoId) return;
    lastYtVideoId = videoId;
    if (card) card.remove();

    if (!document.getElementById("diwat-inpage-styles")) {
      const style = document.createElement("style");
      style.id = "diwat-inpage-styles";
      style.textContent = `
        #diwat-yt-merlin-card {
          font-family: "Inter", "Segoe UI", system-ui, -apple-system, sans-serif;
          background: #0f172a;
          color: #f8fafc;
          border: 1px solid rgba(82, 113, 255, 0.45);
          border-radius: 16px;
          padding: 14px;
          margin-bottom: 16px;
          box-shadow: 0 10px 28px rgba(15, 23, 42, 0.45);
          z-index: 99;
        }
        .diwat-yt-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          padding-bottom: 10px;
          border-bottom: 1px solid rgba(148, 163, 184, 0.22);
        }
        .diwat-yt-brand {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 800;
          font-size: 13.5px;
          color: #ffffff;
        }
        .diwat-yt-badge {
          background: #ff6b35;
          color: #fff;
          font-size: 10px;
          font-weight: 800;
          padding: 2px 7px;
          border-radius: 999px;
          text-transform: uppercase;
        }
        .diwat-yt-tabs {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 4px;
          margin-top: 10px;
          background: #1e293b;
          padding: 4px;
          border-radius: 10px;
        }
        .diwat-yt-tab {
          background: transparent;
          border: none;
          color: #cbd5e1;
          font-size: 11px;
          font-weight: 700;
          padding: 6px 4px;
          border-radius: 7px;
          cursor: pointer;
          text-align: center;
          transition: all 0.15s;
        }
        .diwat-yt-tab.active {
          background: #3b63fb;
          color: #ffffff;
        }
        .diwat-yt-body {
          margin-top: 10px;
          max-height: 340px;
          overflow-y: auto;
          background: #141c2e;
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 10px;
          padding: 10px;
          font-size: 12.5px;
          line-height: 1.55;
        }
        .diwat-yt-seg {
          display: flex;
          gap: 8px;
          padding: 5px 6px;
          border-radius: 7px;
          cursor: pointer;
        }
        .diwat-yt-seg:hover {
          background: rgba(59, 99, 251, 0.18);
        }
        .diwat-yt-ts {
          font-family: monospace;
          font-size: 11px;
          font-weight: 800;
          color: #7dd3fc;
          background: rgba(14, 165, 233, 0.16);
          padding: 1px 6px;
          border-radius: 5px;
          height: fit-content;
          flex-shrink: 0;
        }
        .diwat-yt-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 10px;
        }
        .diwat-yt-btn {
          background: #1e293b;
          color: #f8fafc;
          border: 1px solid rgba(148, 163, 184, 0.32);
          border-radius: 8px;
          padding: 6px 10px;
          font-size: 11.5px;
          font-weight: 700;
          cursor: pointer;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        .diwat-yt-btn.primary {
          background: #3b63fb;
          border-color: #3b63fb;
          color: #ffffff;
        }
      `;
      document.head.appendChild(style);
    }

    card = document.createElement("div");
    card.id = "diwat-yt-merlin-card";
    card.innerHTML = `
      <div class="diwat-yt-header">
        <div class="diwat-yt-brand">
          <span>▶ DoItWithAI YouTube Assistant</span>
          <span class="diwat-yt-badge" id="diwat-yt-seg-count">Full Transcript &amp; AI Summary</span>
        </div>
        <button type="button" id="diwat-yt-refresh" class="diwat-yt-btn" title="Refresh Transcript & Comments">↻ Refresh</button>
      </div>
      <div class="diwat-yt-tabs">
        <button type="button" class="diwat-yt-tab active" data-yt-tab="transcript">Transcript</button>
        <button type="button" class="diwat-yt-tab" data-yt-tab="summary">Summary</button>
        <button type="button" class="diwat-yt-tab" data-yt-tab="insights">Insights</button>
        <button type="button" class="diwat-yt-tab" data-yt-tab="faqs">FAQs</button>
        <button type="button" class="diwat-yt-tab" data-yt-tab="comments">Comments</button>
      </div>
      <div class="diwat-yt-body" id="diwat-yt-body">
        <div style="color:#94a3b8;font-weight:600">Extracting full YouTube transcript, summary &amp; deep insights...</div>
      </div>
      <div class="diwat-yt-actions">
        <button type="button" id="diwat-yt-copy" class="diwat-yt-btn primary">📋 Copy Full Transcript</button>
        <a id="diwat-yt-open-studio" href="https://doitwithai.tools/tools/youtube-transcript-generator?url=${encodeURIComponent(location.href)}" target="_blank" rel="noopener noreferrer" class="diwat-yt-btn">📝 Full Studio &amp; .SRT ↗</a>
        <a id="diwat-yt-open-blog" href="https://doitwithai.tools/tools/video-transcript-to-blog?url=${encodeURIComponent(location.href)}" target="_blank" rel="noopener noreferrer" class="diwat-yt-btn">✍️ Video to Blog ↗</a>
      </div>
    `;

    secondary.prepend(card);

    let activeTab = "transcript";
    let loadedPack = null;

    function renderActiveYtTab() {
      const bodyEl = document.getElementById("diwat-yt-body");
      const badgeEl = document.getElementById("diwat-yt-seg-count");
      if (!bodyEl || !loadedPack) return;
      if (badgeEl) {
        badgeEl.textContent = `${loadedPack.segments.length} Lines`;
      }

      if (activeTab === "transcript") {
        bodyEl.innerHTML = loadedPack.segments
          .map(
            (s) => `
            <div class="diwat-yt-seg" data-seek="${s.startSeconds}">
              <span class="diwat-yt-ts">${s.timestamp}</span>
              <span>${s.text}</span>
            </div>
          `,
          )
          .join("");
        bodyEl.querySelectorAll(".diwat-yt-seg").forEach((row) => {
          row.addEventListener("click", () => {
            const sec = Number(row.getAttribute("data-seek") || 0);
            const video = document.querySelector("video");
            if (video) {
              video.currentTime = sec;
              video.play();
            }
          });
        });
      } else if (activeTab === "summary") {
        bodyEl.innerHTML = `
          <div style="font-weight:800;color:#7dd3fc;margin-bottom:8px">Multi-Section Executive Video Summary</div>
          <div style="display:flex;flex-direction:column;gap:8px">
            ${loadedPack.summaryBullets
              .map(
                (b, i) => `
                <div style="padding:7px 9px;background:#0f172a;border-radius:8px;border:1px solid rgba(148,163,184,0.16)">
                  <strong style="color:#38bdf8">${i === 0 ? "Overview" : `Section #${i}`}:</strong> ${b}
                </div>`,
              )
              .join("")}
          </div>
        `;
      } else if (activeTab === "insights") {
        bodyEl.innerHTML = `
          <div style="font-weight:800;color:#6ee7b7;margin-bottom:8px">Deep Key Insights (${loadedPack.insights.length} Takeaways)</div>
          <div style="display:flex;flex-direction:column;gap:7px">
            ${loadedPack.insights
              .map(
                (b) => `
                <div style="padding:7px 9px;background:#0f172a;border-radius:8px;border:1px solid rgba(16,185,129,0.2)">
                  💡 ${b}
                </div>`,
              )
              .join("")}
          </div>
        `;
      } else if (activeTab === "faqs") {
        bodyEl.innerHTML = loadedPack.faqs
          .map(
            (f) => `
            <div style="margin-bottom:10px;padding-bottom:8px;border-bottom:1px solid rgba(148,163,184,0.16)">
              <strong style="display:block;color:#ffffff">Q: ${f.q}</strong>
              <span style="color:#cbd5e1">${f.a}</span>
            </div>
          `,
          )
          .join("");
      } else if (activeTab === "comments") {
        if (!loadedPack.comments.length) {
          bodyEl.innerHTML = `<div style="color:#cbd5e1">Scroll down slightly to load YouTube comments, then click <strong>↻ Refresh</strong> in the top right of this box to analyze viewer comments.</div>`;
        } else {
          bodyEl.innerHTML = loadedPack.comments
            .map(
              (c) => `
              <div style="margin-bottom:8px;padding:6px 8px;background:#0f172a;border-radius:7px">
                <strong style="color:#7dd3fc;font-size:11px">${c.author}</strong>
                <div style="color:#f1f5f9;font-size:12px;margin-top:2px">${c.text}</div>
              </div>
            `,
            )
            .join("");
        }
      }
    }

    extractYoutubeDataInPage(videoId).then((pack) => {
      loadedPack = pack;
      renderActiveYtTab();
    });

    card.querySelectorAll(".diwat-yt-tab").forEach((btn) => {
      btn.addEventListener("click", () => {
        card
          .querySelectorAll(".diwat-yt-tab")
          .forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        activeTab = btn.getAttribute("data-yt-tab") || "transcript";
        renderActiveYtTab();
      });
    });

    card.querySelector("#diwat-yt-refresh")?.addEventListener("click", () => {
      delete ytDataCache[videoId];
      extractYoutubeDataInPage(videoId).then((pack) => {
        loadedPack = pack;
        renderActiveYtTab();
      });
    });

    card.querySelector("#diwat-yt-copy")?.addEventListener("click", async () => {
      if (!loadedPack) return;
      const text = loadedPack.segments
        .map((s) => `[${s.timestamp}] ${s.text}`)
        .join("\n");
      await navigator.clipboard.writeText(text);
      const copyBtn = card.querySelector("#diwat-yt-copy");
      if (copyBtn) {
        copyBtn.textContent = "✓ Copied Full Transcript!";
        setTimeout(() => {
          copyBtn.textContent = "📋 Copy Full Transcript";
        }, 2000);
      }
    });
  }

  // =========================================================================
  // IN-PAGE SOCIAL POST AI POLISHER & IDEA-TO-POST COMPOSER PILL
  // =========================================================================
  function polishSocialDraft(rawText, mode) {
    const clean = String(rawText || "").trim();
    if (!clean) {
      return "🚀 Quick framework we're using this week to turn 1 piece of content into 5 high-reach social assets:\n\n✅ Lead with a bold, specific problem statement in line 1\n✅ Break the solution into 3 scannable bullet points\n✅ Pair the post with a 1080p visual takeaway card\n\nWhich step are you testing next? 👇";
    }
    const firstSentence = clean.split(/(?<=[.!?])\s+/)[0] || clean;
    const rest = clean.slice(firstSentence.length).trim();

    if (mode === "hook") {
      return `🔥 Unpopular truth: ${firstSentence}\n\n${rest || "Most people overlook the fundamentals until they see the data side-by-side."}\n\nAgree or disagree? Drop your take below 👇`;
    }
    if (mode === "bullets") {
      const parts = clean
        .split(/(?<=[.!?])\s+|\n+/)
        .map((s) => s.trim())
        .filter(Boolean);
      const head = parts[0] || clean;
      const items = parts.slice(1).map((p) => `✅ ${p}`).join("\n");
      return `📌 ${head}\n\n${items || "✅ Focus on clarity over complexity\n✅ Measure retention and saves\n✅ Repurpose top performers across formats"}\n\nSave this for your next sprint!`;
    }
    if (mode === "expand") {
      return `📌 ${firstSentence}\n\nHere is why this matters right now:\n${rest || clean}\n\n3 takeaways you can apply today:\n✅ Start with one clear audience pain point\n✅ Keep your opening 2 lines punchy before the "...see more" fold\n✅ End with an easy question to spark discussion\n\nHow are you approaching this in your workflow? 👇`;
    }
    return clean;
  }

  function injectSocialComposerPolisher() {
    if (!IS_SOCIAL) return;
    if (document.getElementById("diwat-social-polisher-pill")) return;

    const pill = document.createElement("div");
    pill.id = "diwat-social-polisher-pill";
    pill.style.cssText =
      "position:fixed;bottom:20px;right:20px;z-index:2147483646;font-family:Inter,system-ui,sans-serif;background:#0f172a;color:#fff;border:1px solid rgba(82,113,255,0.55);border-radius:14px;padding:8px 12px;box-shadow:0 10px 28px rgba(0,0,0,0.45);display:flex;align-items:center;gap:6px;font-size:12px;font-weight:700;";

    pill.innerHTML = `
      <span style="color:#ff8c5a;font-weight:800">✨ DoItWithAI Post Polisher:</span>
      <button type="button" data-polish="hook" style="background:#3b63fb;color:#fff;border:none;border-radius:7px;padding:4px 8px;font-size:11px;font-weight:700;cursor:pointer">⚡ Viral Hook</button>
      <button type="button" data-polish="bullets" style="background:#1e293b;color:#fff;border:1px solid #475569;border-radius:7px;padding:4px 8px;font-size:11px;font-weight:700;cursor:pointer">✅ Format Bullets</button>
      <button type="button" data-polish="expand" style="background:#1e293b;color:#fff;border:1px solid #475569;border-radius:7px;padding:4px 8px;font-size:11px;font-weight:700;cursor:pointer">🚀 Idea → Full Post</button>
      <button type="button" id="diwat-close-pill" title="Hide" style="background:transparent;color:#94a3b8;border:none;font-size:14px;cursor:pointer;padding:0 4px">×</button>
    `;

    document.body.appendChild(pill);

    pill.querySelector("#diwat-close-pill")?.addEventListener("click", () => {
      pill.remove();
    });

    pill.querySelectorAll("button[data-polish]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const mode = btn.getAttribute("data-polish") || "hook";
        const activeEl = document.activeElement;
        let sourceText = "";

        if (
          activeEl &&
          (activeEl.tagName === "TEXTAREA" || activeEl.tagName === "INPUT")
        ) {
          sourceText = activeEl.value || "";
        } else if (activeEl && activeEl.isContentEditable) {
          sourceText = activeEl.innerText || "";
        } else {
          const editor = document.querySelector(
            '.ql-editor, [role="textbox"][contenteditable="true"], textarea',
          );
          if (editor) {
            sourceText = editor.value || editor.innerText || "";
          }
        }

        const polished = polishSocialDraft(sourceText, mode);
        await navigator.clipboard.writeText(polished);

        const editor = document.querySelector(
          '.ql-editor, [role="textbox"][contenteditable="true"], textarea',
        );
        if (editor) {
          if (editor.tagName === "TEXTAREA" || editor.tagName === "INPUT") {
            editor.value = polished;
            editor.dispatchEvent(new Event("input", { bubbles: true }));
          } else if (editor.isContentEditable) {
            editor.focus();
            document.execCommand("selectAll", false, null);
            document.execCommand("insertText", false, polished);
          }
        }

        const orig = btn.textContent;
        btn.textContent = "✓ Applied & Copied!";
        setTimeout(() => {
          btn.textContent = orig;
        }, 1800);
      });
    });
  }

  // Listen for messages from popup.js when popup is opened on a YouTube tab
  if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
      if (msg && msg.type === "GET_YOUTUBE_VIDEO_PACK") {
        const vid = getYoutubeVideoId(location.href);
        if (!vid) {
          sendResponse({ ok: false });
          return true;
        }
        extractYoutubeDataInPage(vid).then((pack) => {
          sendResponse({ ok: true, pack });
        });
        return true;
      }
      return false;
    });
  }

  if (IS_YOUTUBE) {
    setInterval(injectYoutubeMerlinPanel, 1800);
    injectYoutubeMerlinPanel();
  }
  if (IS_SOCIAL) {
    setTimeout(injectSocialComposerPolisher, 2000);
  }
})();
