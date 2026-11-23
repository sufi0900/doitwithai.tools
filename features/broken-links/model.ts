import { inputUrl } from "../backlink-verifier/io";
export type LinkState = "broken" | "working" | "redirected" | "unverified";
export const labels: Record<LinkState, string> = {
  broken: "404 / 410 candidate",
  working: "Responded successfully",
  redirected: "Redirected successfully",
  unverified: "Needs verification",
};
export type Row = {
  href: string;
  anchor: string;
  context: string;
  rel: string[];
  occurrences: number;
  finalUrl: string;
  httpStatus: number | null;
  redirects: { url: string; status: number; location: string }[];
  state: LinkState;
  reason: string;
  checkedAt: string;
};
export type Report = {
  sourceUrl: string;
  finalSourceUrl: string;
  title: string;
  method: "live" | "pasted";
  sourceStatus: number | null;
  totalExternal: number;
  checkedCount: number;
  rows: Row[];
  notes: string[];
  error: string;
  checkedAt: string;
};
export function sourceUrls(text: string) {
  const raw = text
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (!raw.length) throw new Error("Add at least one publisher page URL.");
  const urls = [...new Set(raw.map(inputUrl))];
  if (urls.length > 5)
    throw new Error("Check up to five unique publisher pages per run.");
  return urls;
}
const cell = (v: unknown) => {
  let s = String(v ?? "");
  if (/^[\s\u0000-\u001f]*[=+@-]/.test(s)) s = "'" + s;
  return '"' + s.replace(/"/g, '""') + '"';
};
export function evidenceCsv(reports: Report[], onlyBroken = false) {
  const rows: unknown[][] = [
    [
      "Source URL",
      "Final source URL",
      "Source method",
      "Source HTTP status",
      "Source title",
      "Destination URL",
      "Final destination URL",
      "Anchor text",
      "Context",
      "Rel attributes",
      "Occurrences",
      "Result",
      "Destination HTTP status",
      "Redirect chain",
      "Reason",
      "Checked at",
      "Unique external URLs",
      "Checked destinations",
      "Source notes",
    ],
  ];
  for (const r of reports) {
    for (const l of r.rows.filter((l) => !onlyBroken || l.state === "broken"))
      rows.push([
        r.sourceUrl,
        r.finalSourceUrl,
        r.method,
        r.sourceStatus,
        r.title,
        l.href,
        l.finalUrl,
        l.anchor,
        l.context,
        l.rel.join(" "),
        l.occurrences,
        labels[l.state],
        l.httpStatus,
        l.redirects
          .map((h) => `${h.status} ${h.url} -> ${h.location}`)
          .join(" | "),
        l.reason,
        l.checkedAt,
        r.totalExternal,
        r.checkedCount,
        r.notes.join(" | "),
      ]);
    if (!onlyBroken && !r.rows.length)
      rows.push([
        r.sourceUrl,
        r.finalSourceUrl,
        r.method,
        r.sourceStatus,
        r.title,
        "",
        "",
        "",
        "",
        "",
        "",
        r.error ? "Source unverified" : "No eligible links",
        "",
        "",
        r.error || "No external links selected",
        r.checkedAt,
        r.totalExternal,
        r.checkedCount,
        r.notes.join(" | "),
      ]);
  }
  return "\uFEFF" + rows.map((r) => r.map(cell).join(",")).join("\r\n");
}
