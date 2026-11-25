/**
 * Sanitizes CMS, user-supplied, and internal/external href strings so Next.js `<Link>`
 * and `<a>` tags never emit broken relative paths like `/https://...` or `/http://...`
 * in Google Search Console.
 */
export function normalizeSafeHref(
  rawHref: string | null | undefined,
  fallback = "#",
): string {
  if (typeof rawHref !== "string") return fallback;
  let trimmed = rawHref.trim();
  if (!trimmed) return fallback;

  // Strip stray leading slash(es) placed before an http/https/mailto/tel scheme
  // e.g. "/https://example.com" -> "https://example.com", "/https:example.com" -> "https://example.com"
  trimmed = trimmed.replace(/^\/+(?=(?:https?|mailto|tel):)/i, "");

  // Fix malformed scheme missing double-slash: "https:example.com" or "https:/example.com"
  if (/^https?:\/?[^/]/i.test(trimmed)) {
    trimmed = trimmed.replace(/^(https?):\/?/i, "$1://");
  }

  // Normalize bare "www." domains to https://
  if (/^www\.[a-z0-9.-]+\.[a-z]{2,}/i.test(trimmed)) {
    trimmed = `https://${trimmed}`;
  }

  // Convert full production origin URLs into clean root-relative paths
  if (/^https?:\/\/(?:www\.)?doitwithai\.tools(?=[/?#]|$)/i.test(trimmed)) {
    const relative = trimmed.replace(
      /^https?:\/\/(?:www\.)?doitwithai\.tools/i,
      "",
    );
    return relative.startsWith("/") ? relative : `/${relative}`;
  }

  return trimmed;
}

export function isExternalSafeHref(href: string): boolean {
  const safe = normalizeSafeHref(href, "");
  return /^https?:\/\//i.test(safe) || /^mailto:|^tel:/i.test(safe);
}
