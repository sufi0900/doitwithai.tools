// Do It With AI v3.0 — In-Page YouTube Full Transcript, Merlin-Style AI Summary, Web Studio Bridge & Social Post Polisher
(function () {
  "use strict";

  const HOST = location.hostname.replace(/^www\./i, "").toLowerCase();
  const IS_YOUTUBE = HOST.includes("youtube.com");
  const IS_DOITWITHAI_WEB =
    HOST.includes("doitwithai.tools") ||
    HOST.includes("vercel.app") ||
    HOST.includes("localhost");
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
      if (u.hostname.includes("youtu.be")) {
        return u.pathname.split("/").filter(Boolean)[0] || "";
      }
      if (u.pathname.startsWith("/watch")) return u.searchParams.get("v") || "";
      if (u.pathname.startsWith("/shorts/")) {
        return u.pathname.split("/shorts/")[1]?.split("/")[0] || "";
      }
      if (u.pathname.startsWith("/embed/") || u.pathname.startsWith("/live/")) {
        return u.pathname.split("/").filter(Boolean)[1] || "";
      }
    } catch {}
    const m = String(urlStr || "").match(
      /(?:v=|youtu\.be\/|shorts\/|embed\/)([A-Za-z0-9_-]{11})/,
    );
    return m ? m[1] : "";
  }

  function decodeXmlEntities(str) {
    return String(str || "")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&#x27;/g, "'")
      .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) =>
        String.fromCharCode(parseInt(hex, 16)),
      )
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

  function formatSrtTimestamp(sec) {
    const total = Math.max(0, Math.floor(Number(sec) || 0));
    const hrs = Math.floor(total / 3600);
    const mins = Math.floor((total % 3600) / 60);
    const secs = total % 60;
    return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")},000`;
  }

  function parseTimestampToSeconds(tsStr) {
    const cleanTs = String(tsStr || "").trim().replace(",", ".");
    const parts = cleanTs.split(":").map((n) => parseFloat(n) || 0);
    if (parts.length === 3) {
      return Math.floor(parts[0] * 3600 + parts[1] * 60 + parts[2]);
    }
    if (parts.length === 2) {
      return Math.floor(parts[0] * 60 + parts[1]);
    }
    return 0;
  }

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

  function encodeVarint(val) {
    const out = [];
    let v = val >>> 0;
    while (v > 0x7f) {
      out.push((v & 0x7f) | 0x80);
      v >>>= 7;
    }
    out.push(v);
    return out;
  }

  function encodeProtoString(fieldNum, str) {
    const utf8 = new TextEncoder().encode(String(str || ""));
    const tag = (fieldNum << 3) | 2;
    return new Uint8Array([
      ...encodeVarint(tag),
      ...encodeVarint(utf8.length),
      ...utf8,
    ]);
  }

  function uint8ToBase64(bytes) {
    let bin = "";
    for (let i = 0; i < bytes.length; i++) {
      bin += String.fromCharCode(bytes[i]);
    }
    return btoa(bin);
  }

  function buildInnertubeTranscriptParams(videoId, kind, lang) {
    const p1 = encodeProtoString(1, kind || "");
    const p2 = encodeProtoString(2, lang || "en");
    const p3 = encodeProtoString(3, "");
    const inner = new Uint8Array(p1.length + p2.length + p3.length);
    inner.set(p1, 0);
    inner.set(p2, p1.length);
    inner.set(p3, p1.length + p2.length);
    const innerB64Url = encodeURIComponent(uint8ToBase64(inner));

    const o1 = encodeProtoString(1, videoId);
    const o2 = encodeProtoString(2, innerB64Url);
    const outer = new Uint8Array(o1.length + o2.length);
    outer.set(o1, 0);
    outer.set(o2, o1.length);
    return encodeURIComponent(uint8ToBase64(outer));
  }

  /**
   * Preserves every individual timestamped caption cue (`0:00`, `0:01`, `0:03`, `0:06`... `10:25`)
   * without merging lines into paragraphs, matching YouTube's native transcript & Merlin AI!
   */
  function normalizeSegments(rawSegs) {
    const out = [];
    for (const seg of rawSegs) {
      const cleanedText = String(seg.text || "").replace(/\s+/g, " ").trim();
      if (!cleanedText) continue;
      const sec =
        typeof seg.startSeconds === "number"
          ? seg.startSeconds
          : typeof seg.seconds === "number"
            ? seg.seconds
            : parseTimestampToSeconds(seg.timestamp);
      const prev = out[out.length - 1];
      if (prev && prev.startSeconds === sec && prev.text === cleanedText) {
        continue;
      }
      out.push({
        startSeconds: sec,
        seconds: sec,
        timestamp: formatTime(sec),
        text: cleanedText,
      });
    }
    return out;
  }

  function parseInnertubeTranscriptJson(root) {
    const rawSegs = [];

    function extractText(field) {
      if (!field || typeof field !== "object") return "";
      if (typeof field.simpleText === "string") return field.simpleText.trim();
      if (typeof field.content === "string") return field.content.trim();
      if (
        field.elementsAttributedString &&
        typeof field.elementsAttributedString.content === "string"
      ) {
        return field.elementsAttributedString.content.trim();
      }
      if (Array.isArray(field.runs)) {
        return field.runs.map((r) => (r && r.text) || "").join("").trim();
      }
      return "";
    }

    function walk(node) {
      if (!node || typeof node !== "object") return;
      if (Array.isArray(node)) {
        for (const item of node) walk(item);
        return;
      }
      if (node.transcriptSegmentRenderer) {
        const r = node.transcriptSegmentRenderer;
        const text = extractText(r.snippet);
        const startMs = Number(r.startMs || 0);
        const tsText = extractText(r.startTimeText);
        const sec =
          startMs > 0
            ? Math.floor(startMs / 1000)
            : tsText
              ? parseTimestampToSeconds(tsText)
              : 0;
        if (text) {
          rawSegs.push({
            startSeconds: sec,
            seconds: sec,
            timestamp: formatTime(sec),
            text,
          });
        }
        return;
      }
      if (node.transcriptSegmentViewModel) {
        const vm = node.transcriptSegmentViewModel;
        const text =
          typeof vm.text === "string"
            ? vm.text.trim()
            : extractText(vm.text) || extractText(vm.attributedText);
        const tsStr =
          typeof vm.startTimeText === "string"
            ? vm.startTimeText.trim()
            : extractText(vm.startTimeText) || extractText(vm.timestamp);
        const sec = tsStr ? parseTimestampToSeconds(tsStr) : 0;
        if (text) {
          rawSegs.push({
            startSeconds: sec,
            seconds: sec,
            timestamp: formatTime(sec),
            text,
          });
        }
        return;
      }
      if (node.transcriptCueRenderer) {
        const cue = node.transcriptCueRenderer;
        const text = extractText(cue.cue);
        const sec = Math.max(
          0,
          Math.floor(Number(cue.startOffsetMs || 0) / 1000),
        );
        if (text) {
          rawSegs.push({
            startSeconds: sec,
            seconds: sec,
            timestamp: formatTime(sec),
            text,
          });
        }
        return;
      }
      for (const k of Object.keys(node)) {
        walk(node[k]);
      }
    }

    walk(root);
    return normalizeSegments(rawSegs);
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
          if (!line) continue;
          const startSec = Math.max(0, Math.floor((ev.tStartMs || 0) / 1000));
          rawSegs.push({
            startSeconds: startSec,
            seconds: startSec,
            timestamp: formatTime(startSec),
            text: line,
          });
        }
      } catch {}
    }

    if (rawSegs.length === 0) {
      const xmlMatches = Array.from(
        trimmed.matchAll(
          /<text[^>]*start="([\d.]+)"[^>]*>([\s\S]*?)<\/text>/gi,
        ),
      );
      for (const m of xmlMatches) {
        const startSec = Math.max(0, Math.floor(parseFloat(m[1] || "0")));
        const txt = decodeXmlEntities(m[2].replace(/<[^>]+>/g, " "));
        if (txt) {
          rawSegs.push({
            startSeconds: startSec,
            seconds: startSec,
            timestamp: formatTime(startSec),
            text: txt,
          });
        }
      }
    }

    if (rawSegs.length === 0) {
      const pMatches = Array.from(
        trimmed.matchAll(
          /<p[^>]*\b(?:t|begin)="([^"]+)"[^>]*>([\s\S]*?)<\/p>/gi,
        ),
      );
      for (const m of pMatches) {
        const rawT = m[1] || "0";
        const startSec = rawT.includes(":")
          ? parseTimestampToSeconds(rawT)
          : Math.max(0, Math.floor(Number(rawT) / 1000));
        const txt = decodeXmlEntities(m[2].replace(/<[^>]+>/g, " "));
        if (txt) {
          rawSegs.push({
            startSeconds: startSec,
            seconds: startSec,
            timestamp: formatTime(startSec),
            text: txt,
          });
        }
      }
    }

    if (rawSegs.length === 0 && trimmed.includes("-->")) {
      const blocks = trimmed.split(/\r?\n\r?\n/);
      for (const b of blocks) {
        const lines = b
          .split(/\r?\n/)
          .map((l) => l.trim())
          .filter(Boolean);
        const idx = lines.findIndex((l) => l.includes("-->"));
        if (idx === -1) continue;
        const sec = parseTimestampToSeconds(
          lines[idx].split("-->")[0] || "0:00",
        );
        const txt = decodeXmlEntities(
          lines
            .slice(idx + 1)
            .join(" ")
            .replace(/<[^>]+>/g, " "),
        );
        if (txt) {
          rawSegs.push({
            startSeconds: sec,
            seconds: sec,
            timestamp: formatTime(sec),
            text: txt,
          });
        }
      }
    }

    return normalizeSegments(rawSegs);
  }

  /**
   * Universal 2025/2026 YouTube DOM Transcript Engagement Panel Scraper
   * Handles classic ytd-transcript-segment-renderer, modern transcript-segment-view-model,
   * and zero-whitespace timestamp+text concatenation!
   */
  function scrapeRenderedTranscriptFromDom() {
    const domSegs = [];
    const nativeRenderers = document.querySelectorAll(
      "ytd-transcript-segment-renderer, transcript-segment-view-model, ytd-macro-markers-list-item-renderer",
    );
    if (nativeRenderers.length >= 5) {
      nativeRenderers.forEach((el) => {
        const tsEl = el.querySelector(
          ".segment-timestamp, .ytwTranscriptSegmentViewModelTimestamp, [class*='Timestamp'], [class*='timestamp'], #time",
        );
        const txtEl = el.querySelector(
          ".segment-text, .yt-core-attributed-string, [class*='SegmentText'], #details h4",
        );
        const tsText = (tsEl?.textContent || "").trim();
        const spoken = (txtEl?.textContent || "").replace(/\s+/g, " ").trim();
        if (tsText && spoken && /^\d{1,2}:\d{2}(?::\d{2})?$/.test(tsText)) {
          const sec = parseTimestampToSeconds(tsText);
          domSegs.push({
            startSeconds: sec,
            seconds: sec,
            timestamp: formatTime(sec),
            text: spoken,
          });
        }
      });
      if (domSegs.length >= 10) return normalizeSegments(domSegs);
    }

    const engagementPanel =
      document.querySelector(
        'ytd-engagement-panel-section-list-renderer[target-id="engagement-panel-searchable-transcript"]',
      ) || document.querySelector("ytd-transcript-renderer");

    if (engagementPanel) {
      const seen = new Set();
      engagementPanel
        .querySelectorAll("div, ytd-transcript-segment-renderer")
        .forEach((row) => {
          if (row.children.length > 5) return;
          const raw = (row.textContent || "").replace(/\s+/g, " ").trim();
          // Allow optional or zero whitespace between timestamp and text!
          const m = raw.match(/^(\d{1,2}:\d{2}(?::\d{2})?)\s*(.{3,300})$/);
          if (m && !/^\d+:\d+$/.test(m[2])) {
            const key = `${m[1]}-${m[2].slice(0, 24)}`;
            if (!seen.has(key)) {
              seen.add(key);
              const sec = parseTimestampToSeconds(m[1]);
              domSegs.push({
                startSeconds: sec,
                seconds: sec,
                timestamp: formatTime(sec),
                text: m[2].trim(),
              });
            }
          }
        });
    }
    return domSegs.length >= 10 ? normalizeSegments(domSegs) : [];
  }

  async function autoOpenAndScrapeNativeTranscriptPanel() {
    let existing = scrapeRenderedTranscriptFromDom();
    if (existing.length >= 15) return existing;

    const expandBtn = document.querySelector(
      "tp-yt-paper-button#expand, #description-inline-expander #expand",
    );
    if (expandBtn && typeof expandBtn.click === "function") {
      try {
        expandBtn.click();
      } catch {}
    }

    const findTranscriptButton = () =>
      document.querySelector(
        "ytd-video-description-transcript-section-renderer button",
      ) ||
      document.querySelector('button[aria-label*="Show transcript" i]') ||
      document.querySelector('button[aria-label*="transcript" i]') ||
      Array.from(
        document.querySelectorAll(
          "ytd-button-renderer button, yt-button-shape button",
        ),
      ).find((b) =>
        /show transcript|^transcript$/i.test(
          (b.textContent || b.getAttribute("aria-label") || "").trim(),
        ),
      );

    let btn = findTranscriptButton();
    if (!btn) {
      await new Promise((r) => setTimeout(r, 250));
      btn = findTranscriptButton();
    }

    if (btn && typeof btn.click === "function") {
      try {
        btn.click();
      } catch {}
      for (let attempt = 0; attempt < 15; attempt++) {
        await new Promise((r) => setTimeout(r, 180));
        existing = scrapeRenderedTranscriptFromDom();
        if (existing.length >= 15) return existing;
      }
    }
    return existing;
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

  function requestMainWorldExtraction(videoId) {
    return new Promise((resolve) => {
      if (
        typeof chrome === "undefined" ||
        !chrome.runtime ||
        !chrome.runtime.sendMessage
      ) {
        resolve(null);
        return;
      }
      try {
        chrome.runtime.sendMessage(
          { type: "EXTRACT_YOUTUBE_MAIN_WORLD", videoId },
          (res) => {
            if (chrome.runtime.lastError) {
              resolve(null);
              return;
            }
            resolve(res || null);
          },
        );
      } catch {
        resolve(null);
      }
    });
  }

  async function fetchSegmentsForVideoId(videoId, allowDomClick) {
    let segments = [];
    let description = "";
    let extractedTitle = "";
    let extractedChannel = "";

    // Engine 1: Main-World Player & First-Party `get_transcript` via background.js `world: "MAIN"`
    const mainWorldRes = await requestMainWorldExtraction(videoId);
    if (mainWorldRes) {
      if (mainWorldRes.title) extractedTitle = mainWorldRes.title;
      if (mainWorldRes.author) extractedChannel = mainWorldRes.author;
      if (
        Array.isArray(mainWorldRes.segments) &&
        mainWorldRes.segments.length >= 15
      ) {
        segments = normalizeSegments(mainWorldRes.segments);
      }
    }

    // Engine 2: Native YouTube Transcript DOM Panel Scraper
    if (segments.length < 15 && IS_YOUTUBE && allowDomClick) {
      const domSegs = await autoOpenAndScrapeNativeTranscriptPanel();
      if (domSegs.length > segments.length) {
        segments = domSegs;
      }
    }

    let visitorData = "";
    let clientVersion = "2.20250201.01.00";
    let scrapedParamsToken = "";
    let watchTracks =
      (mainWorldRes && Array.isArray(mainWorldRes.captionTracks)
        ? mainWorldRes.captionTracks
        : []) || [];

    if (segments.length < 15) {
      try {
        const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
        const pageRes = await fetch(watchUrl, {
          credentials: IS_YOUTUBE ? "include" : "omit",
        });
        if (pageRes.ok) {
          const html = await pageRes.text();
          const tMatch = html.match(/<title>([^<]+)<\/title>/i);
          if (tMatch && !extractedTitle) {
            extractedTitle = decodeXmlEntities(
              tMatch[1].replace(/\s*-\s*YouTube$/i, ""),
            );
          }
          const aMatch = html.match(/"ownerChannelName":"((?:\\.|[^"\\])*)"/);
          if (aMatch && !extractedChannel) {
            try {
              extractedChannel = JSON.parse(`"${aMatch[1]}"`);
            } catch {
              extractedChannel = aMatch[1];
            }
          }
          const visMatch = html.match(/"visitorData":"([^"]+)"/);
          if (visMatch) visitorData = visMatch[1];
          const verMatch = html.match(/"INNERTUBE_CLIENT_VERSION":"([^"]+)"/);
          if (verMatch) clientVersion = verMatch[1];
          const pMatch = html.match(
            /"getTranscriptEndpoint":\s*\{\s*"params":\s*"([^"]+)"/,
          );
          if (pMatch) scrapedParamsToken = pMatch[1];
          const descMatch = html.match(
            /"shortDescription":"((?:\\.|[^"\\])*)"/,
          );
          if (descMatch) {
            try {
              description = JSON.parse(`"${descMatch[1]}"`);
            } catch {
              description = descMatch[1];
            }
          }
          if (watchTracks.length === 0) {
            const balanced = extractBalancedJsonArray(html, '"captionTracks":');
            if (balanced) {
              try {
                watchTracks = JSON.parse(balanced);
              } catch {}
            }
          }
        }
      } catch {}
    }

    // Engine 3: `youtubei/v1/get_transcript` with scraped + Protobuf-generated params
    if (segments.length < 15) {
      const candidateTokens = Array.from(
        new Set(
          [
            scrapedParamsToken,
            buildInnertubeTranscriptParams(videoId, "asr", "en"),
            buildInnertubeTranscriptParams(videoId, "", "en"),
          ].filter(Boolean),
        ),
      );
      for (const token of candidateTokens) {
        if (segments.length >= 15) break;
        try {
          const gtRes = await fetch(
            "https://www.youtube.com/youtubei/v1/get_transcript?prettyPrint=false",
            {
              method: "POST",
              credentials: IS_YOUTUBE ? "include" : "omit",
              headers: {
                "Content-Type": "application/json",
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
                params: token,
              }),
            },
          );
          if (gtRes.ok) {
            const gtJson = await gtRes.json();
            const parsed = parseInnertubeTranscriptJson(gtJson);
            if (parsed.length > segments.length) {
              segments = parsed;
            }
          }
        } catch {}
      }
    }

    // Engine 4: Mobile & Embedded Innertube `/youtubei/v1/player`
    if (segments.length < 15) {
      const clients = [
        {
          clientName: "ANDROID",
          clientVersion: "19.44.38",
          clientId: "3",
          extra: {
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
          extra: {
            deviceMake: "Apple",
            deviceModel: "iPhone16,2",
            osName: "iPhone",
            osVersion: "18.1.0.22B83",
            platform: "MOBILE",
          },
        },
      ];
      for (const c of clients) {
        if (segments.length >= 15) break;
        try {
          const pRes = await fetch(
            "https://www.youtube.com/youtubei/v1/player?prettyPrint=false",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-YouTube-Client-Name": c.clientId,
                "X-YouTube-Client-Version": c.clientVersion,
              },
              body: JSON.stringify({
                videoId,
                racyCheckOk: true,
                contentCheckOk: true,
                context: {
                  client: {
                    clientName: c.clientName,
                    clientVersion: c.clientVersion,
                    hl: "en",
                    gl: "US",
                    ...c.extra,
                  },
                },
              }),
            },
          );
          if (pRes.ok) {
            const pJson = await pRes.json();
            if (!extractedTitle && pJson?.videoDetails?.title) {
              extractedTitle = pJson.videoDetails.title;
            }
            if (!extractedChannel && pJson?.videoDetails?.author) {
              extractedChannel = pJson.videoDetails.author;
            }
            const tracks =
              pJson?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
            if (Array.isArray(tracks) && tracks.length > 0) {
              const best =
                tracks.find(
                  (t) => /^en/i.test(t.languageCode) && t.kind !== "asr",
                ) ||
                tracks.find((t) => /^en/i.test(t.languageCode)) ||
                tracks[0];
              if (best?.baseUrl) {
                const base = best.baseUrl
                  .replace(/\\u0026/g, "&")
                  .replace(/&amp;/g, "&");
                for (const u of [
                  base.includes("fmt=") ? base : `${base}&fmt=json3`,
                  base,
                  `${base}&fmt=srv3`,
                ]) {
                  const tRes = await fetch(u);
                  if (tRes.ok) {
                    const tBody = await tRes.text();
                    const parsed = parseTimedTextResponse(tBody);
                    if (parsed.length > segments.length) {
                      segments = parsed;
                      break;
                    }
                  }
                }
              }
            }
          }
        } catch {}
      }
    }

    // Engine 5: Try watch page captionTracks if still needed
    if (segments.length < 15 && watchTracks.length > 0) {
      const best =
        watchTracks.find(
          (t) => /^en/i.test(t.languageCode) && t.kind !== "asr",
        ) ||
        watchTracks.find((t) => /^en/i.test(t.languageCode)) ||
        watchTracks[0];
      if (best?.baseUrl) {
        const base = best.baseUrl
          .replace(/\\u0026/g, "&")
          .replace(/&amp;/g, "&");
        for (const u of [
          base.includes("fmt=") ? base : `${base}&fmt=json3`,
          base,
        ]) {
          try {
            const capRes = await fetch(u, { credentials: "include" });
            if (capRes.ok) {
              const capText = await capRes.text();
              const parsed = parseTimedTextResponse(capText);
              if (parsed.length > segments.length) {
                segments = parsed;
                break;
              }
            }
          } catch {}
        }
      }
    }

    return {
      segments,
      description,
      extractedTitle,
      extractedChannel,
    };
  }

  async function extractYoutubeDataInPage(videoId) {
    if (ytDataCache[videoId] && ytDataCache[videoId].segments?.length >= 25) {
      return ytDataCache[videoId];
    }

    const titleEl =
      document.querySelector("h1.ytd-watch-metadata yt-formatted-string") ||
      document.querySelector("h1.title") ||
      document.querySelector("title");
    let rawTitle = (titleEl?.textContent || document.title || "YouTube Video")
      .replace(/\s*-\s*YouTube$/i, "")
      .trim();

    const channelEl =
      document.querySelector("#owner #channel-name a") ||
      document.querySelector("ytd-channel-name a");
    let channelName = (channelEl?.textContent || "YouTube Creator").trim();

    const fetched = await fetchSegmentsForVideoId(videoId, true);
    const segments = fetched.segments || [];
    if (
      (!rawTitle || rawTitle === "YouTube Video") &&
      fetched.extractedTitle
    ) {
      rawTitle = fetched.extractedTitle;
    }
    if (
      (!channelName || channelName === "YouTube Creator") &&
      fetched.extractedChannel
    ) {
      channelName = fetched.extractedChannel;
    }

    // Group granular lines into ~35-second chronological paragraphs for summary, chapters & insights
    const paragraphs = [];
    let currentPara = null;
    for (const seg of segments) {
      if (!currentPara) {
        currentPara = { ...seg };
        continue;
      }
      if (
        seg.startSeconds - currentPara.startSeconds < 35 &&
        currentPara.text.length + seg.text.length < 400
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
      `Executive Overview (${segments.length} timestamped lines · ${totalWords.toLocaleString()} words): In "${rawTitle}", ${channelName} walks through the core methodology, strategic rules, and real-world execution from 0:00 to ${segments[segments.length - 1]?.timestamp || "the end"}.`,
      ...sampledSummary.map((p) => `[${p.timestamp}] ${p.text}`),
    ];

    const sampledChapters = sampleEvenly(
      paragraphs.length >= 7 ? paragraphs : segments,
      Math.min(7, Math.max(5, paragraphs.length)),
    );
    const chapters = sampledChapters.map((seg, idx) => {
      const words = seg.text.split(/\s+/).slice(0, 7).join(" ").replace(/[.,:;!?]+$/, "");
      return {
        timestamp: seg.timestamp,
        seconds: seg.startSeconds,
        heading: `Chapter ${idx + 1}: ${words}`,
        summary: seg.text,
      };
    });

    const sampledInsights = sampleEvenly(
      paragraphs.length >= 8 ? paragraphs : segments,
      Math.min(8, Math.max(5, segments.length)),
    );
    const insightLabels = [
      "Core Premise",
      "Key Mechanism",
      "Benchmark Proof",
      "Workflow Strategy",
      "Critical Differentiator",
      "Implementation Tip",
      "Optimization Rule",
      "Final Verdict",
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
        a: "Click 'Full Studio ↗' or 'Video to Blog ↗' below to send all extracted transcript segments directly into the DoItWithAI studio.",
      },
    ];

    const pack = {
      videoId,
      url: location.href,
      title: rawTitle,
      channelName,
      description: fetched.description || "",
      segments,
      wordCount: totalWords,
      summaryBullets,
      chapters,
      insights,
      faqs,
    };

    if (segments.length >= 15) {
      ytDataCache[videoId] = pack;
      try {
        if (
          typeof chrome !== "undefined" &&
          chrome.storage &&
          chrome.storage.local
        ) {
          chrome.storage.local.set({
            [`diwat_ext_yt_transcript_${videoId}`]: pack,
            diwat_ext_yt_transcript_latest: pack,
          });
        }
      } catch {}
    }
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
          border: 1.5px solid rgba(82, 113, 255, 0.5);
          border-radius: 16px;
          padding: 12px;
          margin-bottom: 16px;
          box-shadow: 0 12px 32px rgba(15, 23, 42, 0.5);
          z-index: 99;
          width: 100%;
          box-sizing: border-box;
        }
        #diwat-yt-merlin-card * {
          box-sizing: border-box;
        }
        .diwat-yt-header {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 6px;
          padding-bottom: 9px;
          border-bottom: 1px solid rgba(148, 163, 184, 0.2);
        }
        .diwat-yt-brand {
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: 800;
          font-size: 13px;
          color: #ffffff;
          min-width: 0;
        }
        .diwat-yt-badge {
          background: linear-gradient(90deg, #3452d1 0%, #5271ff 100%);
          color: #ffffff;
          font-size: 10px;
          font-weight: 800;
          padding: 2px 8px;
          border-radius: 999px;
          white-space: nowrap;
        }
        .diwat-yt-header-btns {
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .diwat-yt-tabs {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 3px;
          margin-top: 9px;
          background: #1e293b;
          padding: 3.5px;
          border-radius: 10px;
        }
        .diwat-yt-tab {
          background: transparent;
          border: none;
          color: #cbd5e1;
          font-size: 11px;
          font-weight: 750;
          padding: 6px 2px;
          border-radius: 7px;
          cursor: pointer;
          text-align: center;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          transition: all 0.15s;
        }
        .diwat-yt-tab:hover {
          color: #ffffff;
          background: rgba(82, 113, 255, 0.15);
        }
        .diwat-yt-tab.active {
          background: #4058d0;
          color: #ffffff;
          box-shadow: 0 2px 8px rgba(64, 88, 208, 0.35);
        }
        .diwat-yt-toolbar {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 8px;
        }
        .diwat-yt-search {
          flex: 1;
          min-width: 0;
          background: #141c2e;
          border: 1px solid rgba(148, 163, 184, 0.3);
          color: #f8fafc;
          border-radius: 8px;
          padding: 5px 9px;
          font-size: 11.5px;
          outline: none;
        }
        .diwat-yt-search:focus {
          border-color: #5271ff;
        }
        .diwat-yt-mini-btn {
          background: #1e293b;
          color: #e2e8f0;
          border: 1px solid rgba(148, 163, 184, 0.3);
          border-radius: 8px;
          padding: 5px 8px;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
        }
        .diwat-yt-mini-btn:hover {
          border-color: #5271ff;
          color: #ffffff;
        }
        .diwat-yt-body {
          margin-top: 8px;
          max-height: 360px;
          overflow-y: auto;
          background: #111827;
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 11px;
          padding: 8px;
          font-size: 12.5px;
          line-height: 1.5;
          transition: max-height 0.2s ease;
        }
        .diwat-yt-body.expanded {
          max-height: 620px;
        }
        .diwat-yt-seg {
          display: flex;
          align-items: baseline;
          gap: 8px;
          padding: 5px 6px;
          border-radius: 7px;
          cursor: pointer;
          transition: background 0.12s;
        }
        .diwat-yt-seg:hover {
          background: rgba(64, 88, 208, 0.22);
        }
        .diwat-yt-seg.active-cue {
          background: rgba(82, 113, 255, 0.26);
          border-left: 3px solid #5271ff;
        }
        .diwat-yt-ts {
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          font-size: 11px;
          font-weight: 800;
          color: #93c5fd;
          background: rgba(59, 130, 246, 0.18);
          padding: 1px 6px;
          border-radius: 5px;
          flex-shrink: 0;
        }
        .diwat-yt-actions {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 6px;
          margin-top: 9px;
        }
        .diwat-yt-btn {
          background: #1e293b;
          color: #f8fafc;
          border: 1px solid rgba(148, 163, 184, 0.32);
          border-radius: 9px;
          padding: 7px 8px;
          font-size: 11.5px;
          font-weight: 750;
          cursor: pointer;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          transition: all 0.15s;
        }
        .diwat-yt-btn:hover {
          border-color: #5271ff;
          background: #26354d;
        }
        .diwat-yt-btn.primary {
          background: #4058d0;
          border-color: #5271ff;
          color: #ffffff;
        }
        .diwat-yt-btn.primary:hover {
          background: #3448b5;
        }
      `;
      document.head.appendChild(style);
    }

    card = document.createElement("div");
    card.id = "diwat-yt-merlin-card";
    card.innerHTML = `
      <div class="diwat-yt-header">
        <div class="diwat-yt-brand">
          <span>▶ DoItWithAI Assistant</span>
          <span class="diwat-yt-badge" id="diwat-yt-seg-count">Extracting...</span>
        </div>
        <div class="diwat-yt-header-btns">
          <button type="button" id="diwat-yt-expand" class="diwat-yt-mini-btn" title="Expand or collapse transcript box">↕ Expand</button>
          <button type="button" id="diwat-yt-refresh" class="diwat-yt-mini-btn" title="Refresh Transcript">↻</button>
        </div>
      </div>

      <div class="diwat-yt-tabs">
        <button type="button" class="diwat-yt-tab active" data-yt-tab="transcript">Transcript</button>
        <button type="button" class="diwat-yt-tab" data-yt-tab="summary">Summary</button>
        <button type="button" class="diwat-yt-tab" data-yt-tab="chapters">Chapters</button>
        <button type="button" class="diwat-yt-tab" data-yt-tab="insights">Insights</button>
        <button type="button" class="diwat-yt-tab" data-yt-tab="faqs">FAQs</button>
      </div>

      <div class="diwat-yt-toolbar" id="diwat-yt-toolbar">
        <input type="search" id="diwat-yt-search" class="diwat-yt-search" placeholder="🔍 Search keyword or timestamp..." />
        <button type="button" id="diwat-yt-sync" class="diwat-yt-mini-btn" title="Jump to current video playback time">🎯 Sync</button>
        <button type="button" id="diwat-yt-ts-toggle" class="diwat-yt-mini-btn" title="Show or hide timestamps">⏱ On</button>
      </div>

      <div class="diwat-yt-body" id="diwat-yt-body">
        <div style="color:#94a3b8;font-weight:600;padding:8px">⏳ Extracting 100% full timestamped YouTube transcript (0:00 → end) &amp; AI summary...</div>
      </div>

      <div class="diwat-yt-actions">
        <button type="button" id="diwat-yt-copy" class="diwat-yt-btn primary">📋 Copy Transcript</button>
        <button type="button" id="diwat-yt-srt" class="diwat-yt-btn">📄 Download .SRT</button>
        <a id="diwat-yt-open-studio" href="https://doitwithai.tools/tools/youtube-transcript-generator?url=${encodeURIComponent(location.href)}" target="_blank" rel="noopener noreferrer" class="diwat-yt-btn">📝 Full Studio ↗</a>
        <a id="diwat-yt-open-blog" href="https://doitwithai.tools/tools/video-transcript-to-blog?url=${encodeURIComponent(location.href)}" target="_blank" rel="noopener noreferrer" class="diwat-yt-btn">✍️ Video to Blog ↗</a>
      </div>
    `;

    secondary.prepend(card);

    let activeTab = "transcript";
    let loadedPack = null;
    let searchQuery = "";
    let showTimestamps = true;

    function renderActiveYtTab() {
      const bodyEl = document.getElementById("diwat-yt-body");
      const badgeEl = document.getElementById("diwat-yt-seg-count");
      const toolbarEl = document.getElementById("diwat-yt-toolbar");
      if (!bodyEl || !loadedPack) return;

      if (badgeEl) {
        const lastTs =
          loadedPack.segments[loadedPack.segments.length - 1]?.timestamp ||
          "0:00";
        badgeEl.textContent = `${loadedPack.segments.length} Lines · ${lastTs}`;
      }

      if (toolbarEl) {
        toolbarEl.style.display = activeTab === "transcript" ? "flex" : "none";
      }

      if (activeTab === "transcript") {
        if (!loadedPack.segments.length) {
          bodyEl.innerHTML = `<div style="color:#cbd5e1;padding:8px">No spoken captions detected yet. Click <strong>↻</strong> in the top-right to retry.</div>`;
          return;
        }
        const q = searchQuery.trim().toLowerCase();
        const filtered = q
          ? loadedPack.segments.filter(
              (s) =>
                s.text.toLowerCase().includes(q) ||
                s.timestamp.toLowerCase().includes(q),
            )
          : loadedPack.segments;

        if (!filtered.length) {
          bodyEl.innerHTML = `<div style="color:#94a3b8;padding:8px">No transcript lines match "${searchQuery}".</div>`;
          return;
        }

        bodyEl.innerHTML = filtered
          .map(
            (s) => `
            <div class="diwat-yt-seg" data-seek="${s.startSeconds}">
              ${showTimestamps ? `<span class="diwat-yt-ts">${s.timestamp}</span>` : ""}
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
          <div style="font-weight:800;color:#93c5fd;margin-bottom:8px">Multi-Section Executive Video Summary</div>
          <div style="display:flex;flex-direction:column;gap:8px">
            ${loadedPack.summaryBullets
              .map(
                (b, i) => `
                <div style="padding:8px 10px;background:#0f172a;border-radius:8px;border:1px solid rgba(148,163,184,0.18)">
                  <strong style="color:#60a5fa">${i === 0 ? "Overview" : `Key Section #${i}`}:</strong> ${b}
                </div>`,
              )
              .join("")}
          </div>
        `;
      } else if (activeTab === "chapters") {
        bodyEl.innerHTML = `
          <div style="font-weight:800;color:#a5b4fc;margin-bottom:8px">Timestamped Video Chapters (${loadedPack.chapters.length})</div>
          <div style="display:flex;flex-direction:column;gap:8px">
            ${loadedPack.chapters
              .map(
                (ch) => `
                <div class="diwat-yt-seg" data-seek="${ch.seconds}" style="flex-direction:column;gap:4px;background:#0f172a;border:1px solid rgba(148,163,184,0.18);padding:8px 10px">
                  <div style="display:flex;align-items:center;gap:6px">
                    <span class="diwat-yt-ts">${ch.timestamp}</span>
                    <strong style="color:#ffffff;font-size:12px">${ch.heading}</strong>
                  </div>
                  <div style="color:#cbd5e1;font-size:11.5px">${ch.summary}</div>
                </div>`,
              )
              .join("")}
          </div>
        `;
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
      } else if (activeTab === "insights") {
        bodyEl.innerHTML = `
          <div style="font-weight:800;color:#6ee7b7;margin-bottom:8px">Deep Key Insights (${loadedPack.insights.length} Takeaways)</div>
          <div style="display:flex;flex-direction:column;gap:7px">
            ${loadedPack.insights
              .map(
                (b) => `
                <div style="padding:8px 10px;background:#0f172a;border-radius:8px;border:1px solid rgba(16,185,129,0.22)">
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

    card.querySelector("#diwat-yt-search")?.addEventListener("input", (e) => {
      searchQuery = e.target.value || "";
      renderActiveYtTab();
    });

    card.querySelector("#diwat-yt-ts-toggle")?.addEventListener("click", (e) => {
      showTimestamps = !showTimestamps;
      e.currentTarget.textContent = showTimestamps ? "⏱ On" : "⏱ Off";
      renderActiveYtTab();
    });

    card.querySelector("#diwat-yt-sync")?.addEventListener("click", () => {
      const video = document.querySelector("video");
      const bodyEl = document.getElementById("diwat-yt-body");
      if (!video || !bodyEl) return;
      const curSec = video.currentTime || 0;
      const rows = Array.from(bodyEl.querySelectorAll(".diwat-yt-seg"));
      let bestRow = null;
      for (const r of rows) {
        r.classList.remove("active-cue");
        const s = Number(r.getAttribute("data-seek") || 0);
        if (s <= curSec + 1) bestRow = r;
      }
      if (bestRow) {
        bestRow.classList.add("active-cue");
        bestRow.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });

    card.querySelector("#diwat-yt-expand")?.addEventListener("click", (e) => {
      const bodyEl = document.getElementById("diwat-yt-body");
      if (!bodyEl) return;
      const isExp = bodyEl.classList.toggle("expanded");
      e.currentTarget.textContent = isExp ? "↕ Collapse" : "↕ Expand";
    });

    card.querySelector("#diwat-yt-refresh")?.addEventListener("click", () => {
      delete ytDataCache[videoId];
      const badgeEl = document.getElementById("diwat-yt-seg-count");
      if (badgeEl) badgeEl.textContent = "Refreshing...";
      extractYoutubeDataInPage(videoId).then((pack) => {
        loadedPack = pack;
        renderActiveYtTab();
      });
    });

    card.querySelector("#diwat-yt-copy")?.addEventListener("click", async () => {
      if (!loadedPack || !loadedPack.segments.length) return;
      const text = loadedPack.segments
        .map((s) => (showTimestamps ? `${s.timestamp} ${s.text}` : s.text))
        .join("\n");
      await navigator.clipboard.writeText(text);
      const copyBtn = card.querySelector("#diwat-yt-copy");
      if (copyBtn) {
        copyBtn.textContent = `✓ Copied (${loadedPack.segments.length} lines)!`;
        setTimeout(() => {
          copyBtn.textContent = "📋 Copy Transcript";
        }, 2000);
      }
    });

    card.querySelector("#diwat-yt-srt")?.addEventListener("click", () => {
      if (!loadedPack || !loadedPack.segments.length) return;
      const srt = loadedPack.segments
        .map((s, idx) => {
          const nextSec =
            loadedPack.segments[idx + 1]?.startSeconds || s.startSeconds + 4;
          return `${idx + 1}\n${formatSrtTimestamp(s.startSeconds)} --> ${formatSrtTimestamp(nextSec)}\n${s.text}\n`;
        })
        .join("\n");
      const blob = new Blob([srt], { type: "text/plain;charset=utf-8" });
      const u = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = u;
      a.download = `transcript-${videoId}.srt`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(u), 1500);
    });
  }

  // =========================================================================
  // WEB STUDIO BRIDGE (Syncs Extension-Extracted Transcripts to doitwithai.tools / vercel.app)
  // =========================================================================
  function initWebStudioBridge() {
    if (!IS_DOITWITHAI_WEB) return;

    try {
      if (
        typeof chrome !== "undefined" &&
        chrome.storage &&
        chrome.storage.local
      ) {
        chrome.storage.local.get(null, (items) => {
          if (!items) return;
          for (const [k, v] of Object.entries(items)) {
            if (k.startsWith("diwat_ext_yt_transcript")) {
              try {
                window.localStorage.setItem(k, JSON.stringify(v));
              } catch {}
            }
          }
        });
      }
    } catch {}

    window.addEventListener("diwat:request-youtube-transcript", async (ev) => {
      const detail = (ev && ev.detail) || {};
      const targetId = detail.videoId || getYoutubeVideoId(detail.url || "");
      if (!targetId) {
        window.dispatchEvent(
          new CustomEvent("diwat:youtube-transcript-response", { detail: null }),
        );
        return;
      }

      try {
        const fetched = await fetchSegmentsForVideoId(targetId, false);
        if (fetched.segments && fetched.segments.length >= 15) {
          const payload = {
            videoId: targetId,
            title: fetched.extractedTitle || "",
            channelName: fetched.extractedChannel || "",
            segments: fetched.segments,
          };
          try {
            window.localStorage.setItem(
              `diwat_ext_yt_transcript_${targetId}`,
              JSON.stringify(payload),
            );
          } catch {}
          window.dispatchEvent(
            new CustomEvent("diwat:youtube-transcript-response", {
              detail: payload,
            }),
          );
          return;
        }
      } catch {}

      window.dispatchEvent(
        new CustomEvent("diwat:youtube-transcript-response", { detail: null }),
      );
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
      const items = parts
        .slice(1)
        .map((p) => `✅ ${p}`)
        .join("\n");
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
      <span style="color:#8094ff;font-weight:800">✨ DoItWithAI Post Polisher:</span>
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

  if (
    typeof chrome !== "undefined" &&
    chrome.runtime &&
    chrome.runtime.onMessage
  ) {
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
  if (IS_DOITWITHAI_WEB) {
    initWebStudioBridge();
  }
  if (IS_SOCIAL) {
    setTimeout(injectSocialComposerPolisher, 2000);
  }
})();
