export const SESSION_KEY = "tools:recent-public-urls:v1";
export const DEVICE_KEY = "tools:remember-public-urls:v1";
export const MAX_RECENT_URLS = 10;
// Suggestions omit query strings and fragments, which can contain private tokens.
export function suggestionUrl(raw: string): string | null {
  if (raw.length > 2048) return null;
  try {
    const url = new URL(raw.trim());
    const host = url.hostname.toLowerCase();
    if (
      !/^https?:$/.test(url.protocol) ||
      url.username ||
      url.password ||
      url.port
    )
      return null;
    if (!host.includes(".") || /^[\d.]+$/.test(host) || host.includes(":"))
      return null;
    if (/(?:^|\.)(?:localhost|local|internal|test|invalid|onion)$/.test(host))
      return null;
    if (!/^[a-z0-9.-]+\.(?:[a-z]{2,}|xn--[a-z0-9-]+)$/i.test(host)) return null;
    url.search = "";
    url.hash = "";
    return url.toString();
  } catch {
    return null;
  }
}
export function recentUrls(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return [
    ...new Set(
      raw
        .filter((v): v is string => typeof v === "string")
        .map(suggestionUrl)
        .filter((v): v is string => Boolean(v)),
    ),
  ].slice(0, MAX_RECENT_URLS);
}
export function addRecentUrl(urls: string[], raw: string): string[] {
  const value = suggestionUrl(raw);
  return value
    ? [value, ...urls.filter((u) => u !== value)].slice(0, MAX_RECENT_URLS)
    : urls;
}
