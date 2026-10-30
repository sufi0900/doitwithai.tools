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
    sendResponse({ ok: false, error: "Side Panel API not supported in this browser version." });
    return true;
  }

  return false;
});
