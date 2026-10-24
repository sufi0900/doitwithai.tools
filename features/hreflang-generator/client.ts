export type HreflangFetchResult =
  | { ok: true; tags: { hreflang: string; href: string }[]; finalUrl: string }
  | { ok: false; message: string };

export async function fetchExistingHreflangTags(pageUrl: string): Promise<HreflangFetchResult> {
  try {
    const response = await fetch("/api/ai-tools/hreflang/fetch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pageUrl }),
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload || payload.error) {
      return { ok: false, message: payload?.error?.message || "hreflang tags could not be fetched." };
    }
    return { ok: true, tags: payload.tags, finalUrl: payload.finalUrl };
  } catch {
    return { ok: false, message: "Could not reach the fetch service. Check your connection and try again." };
  }
}
