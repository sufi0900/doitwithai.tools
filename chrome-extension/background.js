// Do It With AI Tools v3.0 — Manifest V3 Service Worker (Main-World YouTube Transcript Bridge + Cloud AI Fallback)
chrome.runtime.onInstalled.addListener(() => {
  if (chrome.action && chrome.action.setBadgeBackgroundColor) {
    chrome.action.setBadgeBackgroundColor({ color: "#4058D0" });
  }
});

/**
 * Runs inside YouTube's MAIN page world (`world: "MAIN"`) so it has direct access
 * to `window.ytInitialData`, `window.ytInitialPlayerResponse`, `#movie_player.getPlayerResponse()`,
 * and `window.ytcfg` to call `/youtubei/v1/get_transcript` as a genuine first-party YouTube request.
 */
async function mainWorldYoutubeTranscriptExtractor(targetVideoId) {
  const clean = (s) =>
    String(s || "")
      .replace(/\s+/g, " ")
      .trim();

  const formatTime = (sec) => {
    const s = Math.max(0, Math.floor(Number(sec) || 0));
    const hrs = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const r = s % 60;
    if (hrs > 0) {
      return `${hrs}:${m < 10 ? "0" : ""}${m}:${r < 10 ? "0" : ""}${r}`;
    }
    return `${m}:${r < 10 ? "0" : ""}${r}`;
  };

  const parseTs = (tsStr) => {
    const parts = String(tsStr || "")
      .trim()
      .replace(",", ".")
      .split(":")
      .map((n) => parseFloat(n) || 0);
    if (parts.length === 3) {
      return Math.floor(parts[0] * 3600 + parts[1] * 60 + parts[2]);
    }
    if (parts.length === 2) {
      return Math.floor(parts[0] * 60 + parts[1]);
    }
    return 0;
  };

  try {
    const playerEl = document.getElementById("movie_player");
    const livePlayerResp =
      playerEl && typeof playerEl.getPlayerResponse === "function"
        ? playerEl.getPlayerResponse()
        : window.ytInitialPlayerResponse || null;

    const details = (livePlayerResp && livePlayerResp.videoDetails) || {};
    const title = clean(details.title || document.title.replace(/\s*-\s*YouTube$/i, ""));
    const author = clean(details.author || "");
    const lengthSeconds = Number(details.lengthSeconds) || 0;
    const captionTracks =
      (livePlayerResp &&
        livePlayerResp.captions &&
        livePlayerResp.captions.playerCaptionsTracklistRenderer &&
        livePlayerResp.captions.playerCaptionsTracklistRenderer.captionTracks) ||
      [];

    // Find getTranscriptEndpoint.params inside window.ytInitialData
    let paramsToken = "";
    const findParams = (node) => {
      if (!node || typeof node !== "object" || paramsToken) return;
      if (
        node.getTranscriptEndpoint &&
        typeof node.getTranscriptEndpoint.params === "string"
      ) {
        paramsToken = node.getTranscriptEndpoint.params;
        return;
      }
      if (Array.isArray(node)) {
        for (const item of node) findParams(item);
        return;
      }
      for (const k of Object.keys(node)) {
        findParams(node[k]);
      }
    };
    if (window.ytInitialData) {
      findParams(window.ytInitialData);
    }

    const ytcfgData =
      (window.ytcfg && window.ytcfg.data_) ||
      (window.ytcfg && typeof window.ytcfg.get === "function"
        ? {
            INNERTUBE_API_KEY: window.ytcfg.get("INNERTUBE_API_KEY"),
            INNERTUBE_CONTEXT: window.ytcfg.get("INNERTUBE_CONTEXT"),
            VISITOR_DATA: window.ytcfg.get("VISITOR_DATA"),
            INNERTUBE_CLIENT_VERSION: window.ytcfg.get(
              "INNERTUBE_CLIENT_VERSION",
            ),
          }
        : {});

    const apiKey = ytcfgData.INNERTUBE_API_KEY || "";
    const context = ytcfgData.INNERTUBE_CONTEXT || {
      client: {
        clientName: "WEB",
        clientVersion: ytcfgData.INNERTUBE_CLIENT_VERSION || "2.20250201.01.00",
        hl: "en",
        gl: "US",
      },
    };

    const extractText = (field) => {
      if (!field || typeof field !== "object") return "";
      if (typeof field.simpleText === "string") return clean(field.simpleText);
      if (typeof field.content === "string") return clean(field.content);
      if (
        field.elementsAttributedString &&
        typeof field.elementsAttributedString.content === "string"
      ) {
        return clean(field.elementsAttributedString.content);
      }
      if (Array.isArray(field.runs)) {
        return clean(field.runs.map((r) => (r && r.text) || "").join(""));
      }
      return "";
    };

    const parseGtJson = (root) => {
      const segs = [];
      const walk = (n) => {
        if (!n || typeof n !== "object") return;
        if (Array.isArray(n)) {
          for (const item of n) walk(item);
          return;
        }
        if (n.transcriptSegmentRenderer) {
          const r = n.transcriptSegmentRenderer;
          const txt = extractText(r.snippet);
          const ms = Number(r.startMs || 0);
          const tsStr = extractText(r.startTimeText);
          const sec = ms > 0 ? Math.floor(ms / 1000) : parseTs(tsStr);
          if (txt) {
            segs.push({
              startSeconds: sec,
              seconds: sec,
              timestamp: tsStr || formatTime(sec),
              text: txt,
            });
          }
          return;
        }
        if (n.transcriptSegmentViewModel) {
          const vm = n.transcriptSegmentViewModel;
          const txt =
            typeof vm.text === "string"
              ? clean(vm.text)
              : extractText(vm.text) || extractText(vm.attributedText);
          const tsStr =
            typeof vm.startTimeText === "string"
              ? clean(vm.startTimeText)
              : extractText(vm.startTimeText) || extractText(vm.timestamp);
          const sec = parseTs(tsStr);
          if (txt) {
            segs.push({
              startSeconds: sec,
              seconds: sec,
              timestamp: tsStr || formatTime(sec),
              text: txt,
            });
          }
          return;
        }
        for (const k of Object.keys(n)) walk(n[k]);
      };
      walk(root);
      return segs;
    };

    // 1. If we have paramsToken from ytInitialData, call get_transcript directly with first-party page context
    if (paramsToken) {
      try {
        const url = apiKey
          ? `https://www.youtube.com/youtubei/v1/get_transcript?key=${encodeURIComponent(apiKey)}&prettyPrint=false`
          : "https://www.youtube.com/youtubei/v1/get_transcript?prettyPrint=false";
        const res = await fetch(url, {
          method: "POST",
          credentials: "same-origin",
          headers: {
            "Content-Type": "application/json",
            "X-YouTube-Client-Name": "1",
            "X-YouTube-Client-Version":
              (context.client && context.client.clientVersion) ||
              "2.20250201.01.00",
          },
          body: JSON.stringify({
            context,
            params: paramsToken,
          }),
        });
        if (res.ok) {
          const json = await res.json();
          const segs = parseGtJson(json);
          if (segs.length >= 10) {
            return {
              ok: true,
              videoId: targetVideoId,
              title,
              author,
              lengthSeconds,
              segments: segs,
            };
          }
        }
      } catch {}
    }

    // 2. Also return captionTracks from livePlayerResp so content-script/background can use them
    return {
      ok: true,
      videoId: targetVideoId,
      title,
      author,
      lengthSeconds,
      segments: [],
      captionTracks: captionTracks.map((t) => ({
        baseUrl: t.baseUrl,
        languageCode: t.languageCode,
        kind: t.kind,
      })),
    };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || typeof message !== "object") return false;

  if (message.type === "SET_BADGE") {
    const tabId = message.tabId || (sender && sender.tab && sender.tab.id);
    const text = String(message.text || "200");
    const color = message.color || "#4058D0";
    if (chrome.action) {
      chrome.action.setBadgeText({ text, ...(tabId ? { tabId } : {}) });
      chrome.action.setBadgeBackgroundColor({
        color,
        ...(tabId ? { tabId } : {}),
      });
    }
    sendResponse({ ok: true });
    return true;
  }

  // Execute main-world YouTube transcript extraction + optional cloud fallback
  if (message.type === "EXTRACT_YOUTUBE_MAIN_WORLD") {
    const tabId = (sender && sender.tab && sender.tab.id) || message.tabId;
    const videoId = String(message.videoId || "");

    (async () => {
      let mainResult = null;
      if (tabId && chrome.scripting && chrome.scripting.executeScript) {
        try {
          const injected = await chrome.scripting.executeScript({
            target: { tabId },
            world: "MAIN",
            func: mainWorldYoutubeTranscriptExtractor,
            args: [videoId],
          });
          if (injected && injected[0] && injected[0].result) {
            mainResult = injected[0].result;
          }
        } catch {}
      }

      if (mainResult && Array.isArray(mainResult.segments) && mainResult.segments.length >= 15) {
        sendResponse(mainResult);
        return;
      }

      // Cloud API fallback via doitwithai.tools if main-world returned < 15 segments
      if (videoId) {
        const apiEndpoints = [
          "https://doitwithai.tools/api/ai-tools/universal-extract",
        ];
        for (const endpoint of apiEndpoints) {
          try {
            const res = await fetch(endpoint, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                url: `https://www.youtube.com/watch?v=${videoId}`,
              }),
            });
            if (res.ok) {
              const data = await res.json();
              if (
                Array.isArray(data.transcriptSegments) &&
                data.transcriptSegments.length >= 10
              ) {
                sendResponse({
                  ok: true,
                  videoId,
                  title: data.title || (mainResult && mainResult.title) || "",
                  author: data.author || (mainResult && mainResult.author) || "",
                  segments: data.transcriptSegments.map((s) => ({
                    startSeconds: s.seconds,
                    seconds: s.seconds,
                    timestamp: s.timestamp,
                    text: s.text,
                  })),
                });
                return;
              }
            }
          } catch {}
        }
      }

      sendResponse(mainResult || { ok: false, segments: [] });
    })();

    return true;
  }

  if (message.type === "OPEN_SIDE_PANEL") {
    if (chrome.sidePanel && chrome.sidePanel.open && message.windowId) {
      chrome.sidePanel
        .open({ windowId: message.windowId })
        .then(() => sendResponse({ ok: true }))
        .catch((err) =>
          sendResponse({ ok: false, error: String(err && err.message) }),
        );
      return true;
    }
    sendResponse({
      ok: false,
      error: "Side Panel API not supported in this browser version.",
    });
    return true;
  }

  if (message.type === "OPEN_SPLIT_VIEW") {
    const targetWinId = message.windowId;
    const targetTabId = message.tabId || "";
    const screenW = Number(message.screenWidth) || 1440;
    const screenH = Number(message.screenHeight) || 900;
    const extWidth = Math.min(760, Math.max(520, Math.round(screenW * 0.42)));
    const browserWidth = Math.max(640, screenW - extWidth);

    if (chrome.windows && targetWinId) {
      chrome.windows.update(
        targetWinId,
        {
          state: "normal",
          left: 0,
          top: 0,
          width: browserWidth,
          height: screenH,
        },
        () => {
          chrome.windows.create(
            {
              url: chrome.runtime.getURL(
                `popup.html?mode=split&tabId=${encodeURIComponent(String(targetTabId))}`,
              ),
              type: "popup",
              left: browserWidth,
              top: 0,
              width: extWidth,
              height: screenH,
            },
            () => sendResponse({ ok: true }),
          );
        },
      );
      return true;
    }
    sendResponse({ ok: false, error: "Window split API unavailable." });
    return true;
  }

  return false;
});
