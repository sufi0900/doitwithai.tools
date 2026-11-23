export type Device = "desktop" | "mobile";
export const PRESETS = {
  desktop: {
    width: 648,
    titleWidth: 600,
    titleLines: 1,
    descriptionWidth: 480,
    descriptionLines: 2,
  },
  mobile: {
    width: 388,
    titleWidth: 340,
    titleLines: 2,
    descriptionWidth: 340,
    descriptionLines: 3,
  },
};
export type Measure = (text: string) => number;
export function textLayout(
  text: string,
  width: number,
  maxLines: number,
  measure: Measure,
) {
  const clean = text.replace(/\s+/g, " ").trim();
  const lines: string[] = [];
  let line = "";
  for (const word of clean.split(" ").filter(Boolean)) {
    if (line && measure(`${line} ${word}`) <= width) {
      line += ` ${word}`;
      continue;
    }
    if (line) {
      lines.push(line);
      line = "";
    }
    for (const char of Array.from(word)) {
      if (line && measure(line + char) > width) {
        lines.push(line);
        line = "";
      }
      line += char;
    }
  }
  if (line) lines.push(line);
  const truncated = lines.length > maxLines;
  const shown = lines.slice(0, maxLines);
  if (truncated && shown.length) {
    let last = Array.from(shown[shown.length - 1]);
    while (last.length && measure(last.join("") + "…") > width) last.pop();
    shown[shown.length - 1] = last.join("").trimEnd() + "…";
  }
  return {
    lines: shown,
    totalLines: lines.length,
    truncated,
    pixels: Math.round(measure(clean)),
  };
}
export function highlightParts(
  text: string,
  keyword: string,
): { text: string; bold: boolean }[] {
  const terms = keyword
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 5)
    .map((s) => s.slice(0, 80))
    .sort((a, b) => b.length - a.length);
  if (!terms.length) return [{ text, bold: false }];
  const pattern = terms
    .map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|");
  const regex = new RegExp(`(${pattern})`, "gi");
  return text
    .split(regex)
    .filter(Boolean)
    .map((part) => ({
      text: part,
      bold: terms.some((term) => term.toLowerCase() === part.toLowerCase()),
    }));
}
export function safeWebUrl(value: string) {
  try {
    const url = new URL(value);
    return /^https?:$/.test(url.protocol) && !url.username && !url.password
      ? url.toString()
      : "";
  } catch {
    return "";
  }
}
const escapeHtml = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
export function metadataHtml(
  title: string,
  description: string,
  siteName: string,
  jsonLd: string,
) {
  let schema = "";
  if (jsonLd.trim())
    schema = `\n<script type="application/ld+json">${JSON.stringify(JSON.parse(jsonLd)).replace(/</g, "\\u003c")}</script>`;
  return `<title>${escapeHtml(title)}</title>\n<meta name="description" content="${escapeHtml(description)}">\n<meta property="og:site_name" content="${escapeHtml(siteName)}">${schema}`;
}
