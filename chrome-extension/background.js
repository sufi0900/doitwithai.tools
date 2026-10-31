// Do It With AI Tools — Manifest V3 Service Worker
chrome.runtime.onInstalled.addListener(() => {
  if (chrome.action && chrome.action.setBadgeBackgroundColor) {
    chrome.action.setBadgeBackgroundColor({ color: "#10B981" });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || typeof message !== "object") return false;

  if (message.type === "SET_BADGE") {
    const tabId = message.tabId || (sender && sender.tab && sender.tab.id);
    const text = String(message.text || "200");
    const color = message.color || "#10B981";
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

  // Auto-Fit Split View: Resizes the active browser window and docks the extension right beside it at an optimal readable width
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
