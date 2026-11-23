/**
 * Runtime bootstrap for standalone portable tools.
 * - Routes every relative /api/... call to the live DoItWithAI cloud (CORS-enabled).
 * - Forces the dark studio theme exactly like the live tool pages.
 */
const ORIGIN = "https://doitwithai.tools";

const w = window as unknown as { process?: { env: Record<string, string> } };
w.process = w.process || { env: {} };

const nativeFetch = window.fetch.bind(window);
window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
  try {
    if (typeof input === "string" && input.startsWith("/")) {
      return nativeFetch(ORIGIN + input, init);
    }
    if (input instanceof URL && input.origin === window.location.origin) {
      return nativeFetch(ORIGIN + input.pathname + input.search, init);
    }
    if (typeof Request !== "undefined" && input instanceof Request) {
      const u = new URL(input.url, window.location.href);
      if (u.protocol === "file:" || u.origin === window.location.origin) {
        return nativeFetch(new Request(ORIGIN + u.pathname + u.search, input), init);
      }
    }
  } catch {
    /* fall through to native fetch */
  }
  return nativeFetch(input, init);
};

document.documentElement.classList.add("dark");
document.documentElement.style.colorScheme = "dark";
