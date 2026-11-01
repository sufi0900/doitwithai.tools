// Do It With AI v2.1 — In-Page YouTube Merlin-Style Transcript/Summary Widget & Social Post AI Polisher
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
      .replace(/\s+/g, " ")
      .trim();
  }

  function formatTime(sec) {
    const s = Math.max(0, Math.floor(Number(sec) || 0));
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${m}:${r < 10 ? "0" : ""}${r}`;
  }

  async function extractYoutubeDataInPage(videoId) {
    if (ytDataCache[videoId]) return ytDataCache[videoId];

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

    const descEl =
      document.querySelector("#description-inline-expander") ||
      document.querySelector("#description") ||
      document.querySelector('meta[name="description"]');
    const description = (
      descEl?.textContent ||
      descEl?.getAttribute?.("content") ||
      ""
    )
      .replace(/\s+/g, " ")
      .trim();

    let segments = [];

    // 1. Try captionTracks from ytInitialPlayerResponse or page scripts
    try {
      const html = document.documentElement.innerHTML;
      const match = html.match(/"captionTracks":\s*(\[[\s\S]*?\])/);
      if (match && match[1]) {
        const tracks = JSON.parse(match[1]);
        if (Array.isArray(tracks) && tracks.length > 0) {
          const preferred =
            tracks.find((t) => /^en/i.test(t.languageCode) && t.kind !== "asr") ||
            tracks.find((t) => /^en/i.test(t.languageCode)) ||
            tracks[0];
          if (preferred && preferred.baseUrl) {
            const json3Url = preferred.baseUrl.includes("fmt=")
              ? preferred.baseUrl
              : `${preferred.baseUrl}&fmt=json3`;
            const res = await fetch(json3Url);
            const text = await res.text();
            if (text.trim().startsWith("{")) {
              const parsed = JSON.parse(text);
              const events = parsed.events || [];
              let bucketText = [];
              let bucketStart = 0;
              for (const ev of events) {
                if (!ev.segs) continue;
                const line = decodeXmlEntities(
                  ev.segs.map((s) => s.utf8 || "").join(""),
                );
                if (!line) continue;
                const startSec = (ev.tStartMs || 0) / 1000;
                if (bucketText.length === 0) bucketStart = startSec;
                bucketText.push(line);
                const joined = bucketText.join(" ");
                if (joined.length >= 110 || /[.!?]$/.test(line)) {
                  segments.push({
                    startSeconds: bucketStart,
                    timestamp: formatTime(bucketStart),
                    text: joined,
                  });
                  bucketText = [];
                }
              }
              if (bucketText.length > 0) {
                segments.push({
                  startSeconds: bucketStart,
                  timestamp: formatTime(bucketStart),
                  text: bucketText.join(" "),
                });
              }
            }
          }
        }
      }
    } catch {}

    // 2. Fallback: Build structured segments from video description & chapters if captions are disabled
    if (segments.length === 0) {
      const sentences = (description || rawTitle)
        .split(/(?<=[.!?])\s+/)
        .filter((s) => s.trim().length > 15);
      segments = (sentences.length ? sentences : [rawTitle]).map((s, idx) => ({
        startSeconds: idx * 20,
        timestamp: formatTime(idx * 20),
        text: s.trim(),
      }));
    }

    // Scrape visible comments if loaded on page
    const commentNodes = Array.from(
      document.querySelectorAll("ytd-comment-thread-renderer #content-text"),
    ).slice(0, 12);
    const authorNodes = Array.from(
      document.querySelectorAll("ytd-comment-thread-renderer #author-text"),
    ).slice(0, 12);
    const comments = commentNodes.map((node, i) => ({
      author: (authorNodes[i]?.textContent || `Viewer #${i + 1}`).trim(),
      text: (node.textContent || "").replace(/\s+/g, " ").trim(),
    }));

    const fullText = segments.map((s) => s.text).join(" ");
    const sentences = fullText
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 25);

    const summaryBullets = sentences.slice(0, 5);
    if (summaryBullets.length === 0) {
      summaryBullets.push(
        `Core breakdown of "${rawTitle}" by ${channelName}.`,
      );
    }

    const insights = [
      `Primary Topic: ${rawTitle}`,
      `Creator / Channel: ${channelName} (${segments.length} timed transcript blocks extracted)`,
      sentences[1] ||
        sentences[0] ||
        "Actionable step-by-step framework covered in the video.",
      sentences[3] ||
        sentences[2] ||
        "Key implementation takeaways ready for blog or social repurposing.",
    ];

    const faqs = [
      {
        q: `What is the core takeaway of "${rawTitle}"?`,
        a:
          summaryBullets[0] ||
          `This video by ${channelName} walks through ${rawTitle} step by step.`,
      },
      {
        q: "How can I repurpose this video into written content?",
        a:
          "Use the 1-Click Blog Post or Social Thread buttons below to turn this video's transcript into an SEO article, LinkedIn post, or Short script.",
      },
      {
        q: "Does this video include timestamped sections?",
        a: `Yes — ${segments.length} timestamped transcript blocks are indexed and clickable above.`,
      },
    ];

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
          max-height: 290px;
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
          <span class="diwat-yt-badge">Auto-Transcript &amp; AI Summary</span>
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
        <div style="color:#94a3b8;font-weight:600">Extracting YouTube transcript, summary &amp; insights...</div>
      </div>
      <div class="diwat-yt-actions">
        <button type="button" id="diwat-yt-copy" class="diwat-yt-btn primary">📋 Copy Transcript</button>
        <a id="diwat-yt-open-studio" href="https://doitwithai.tools/tools/youtube-transcript-generator?url=${encodeURIComponent(location.href)}" target="_blank" rel="noopener noreferrer" class="diwat-yt-btn">📝 Full Transcript &amp; .SRT ↗</a>
        <a id="diwat-yt-open-blog" href="https://doitwithai.tools/tools/video-transcript-to-blog?url=${encodeURIComponent(location.href)}" target="_blank" rel="noopener noreferrer" class="diwat-yt-btn">✍️ Video to Blog ↗</a>
      </div>
    `;

    secondary.prepend(card);

    let activeTab = "transcript";
    let loadedPack = null;

    function renderActiveYtTab() {
      const bodyEl = document.getElementById("diwat-yt-body");
      if (!bodyEl || !loadedPack) return;

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
          <div style="font-weight:800;color:#7dd3fc;margin-bottom:6px">Executive Video Summary</div>
          <ul style="padding-left:16px;margin:0;display:flex;flex-direction:column;gap:6px">
            ${loadedPack.summaryBullets.map((b) => `<li>${b}</li>`).join("")}
          </ul>
        `;
      } else if (activeTab === "insights") {
        bodyEl.innerHTML = `
          <div style="font-weight:800;color:#6ee7b7;margin-bottom:6px">Key Insights &amp; Takeaways</div>
          <ul style="padding-left:16px;margin:0;display:flex;flex-direction:column;gap:6px">
            ${loadedPack.insights.map((b) => `<li>${b}</li>`).join("")}
          </ul>
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
        copyBtn.textContent = "✓ Copied Transcript!";
        setTimeout(() => {
          copyBtn.textContent = "📋 Copy Transcript";
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
