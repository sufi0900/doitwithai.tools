/** Bounded, metadata-only brand hints from the already fetched page. No additional network calls. */
export interface WebsiteBrandHint {
  accent?: string;
  siteName: string;
  source: "theme-color" | "css-variable" | "site-name";
}
function colorHint(raw: string | null | undefined): string | undefined {
  if (!raw) return;
  let hex = raw.trim().match(/^#([a-f\d]{6}|[a-f\d]{3})(?:\s|;|$)/i)?.[1];
  if (hex?.length === 3) hex = [...hex].map((x) => x + x).join("");
  const rgb = raw.match(/^rgba?\(\s*(\d+)\s*[, ]\s*(\d+)\s*[, ]\s*(\d+)/i);
  if (!hex && rgb && rgb.slice(1, 4).every((n) => Number(n) <= 255))
    hex = rgb
      .slice(1, 4)
      .map((n) => Number(n).toString(16).padStart(2, "0"))
      .join("");
  if (!hex) return;
  const channels = [0, 2, 4].map((i) => parseInt(hex!.slice(i, i + 2), 16));
  // White/black browser chrome is not evidence of a site's accent color.
  if (Math.max(...channels) - Math.min(...channels) < 32) return;
  return `#${hex.toUpperCase()}`;
}
export function extractWebsiteBrand(
  doc: Document,
  domain: string,
): WebsiteBrandHint {
  const siteName = (
    doc
      .querySelector('meta[property="og:site_name"]')
      ?.getAttribute("content") ||
    doc
      .querySelector('meta[name="application-name"]')
      ?.getAttribute("content") ||
    domain
  )
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 64);
  for (const meta of Array.from(
    doc.querySelectorAll('meta[name="theme-color"]'),
  ).slice(0, 8)) {
    const accent = colorHint(meta.getAttribute("content"));
    if (accent) return { accent, siteName, source: "theme-color" };
  }
  const css = Array.from(doc.querySelectorAll("style"))
    .slice(0, 24)
    .map((n) => (n.textContent || "").slice(0, 12000))
    .join("\n")
    .slice(0, 96000);
  const declarations = css.matchAll(
    /--(?:brand(?:-primary|-color)?|primary(?:-color)?|accent-color)\s*:\s*([^;}]+)/gi,
  );
  for (const match of declarations) {
    const accent = colorHint(match[1]);
    if (accent) return { accent, siteName, source: "css-variable" };
  }
  return { siteName, source: "site-name" };
}
