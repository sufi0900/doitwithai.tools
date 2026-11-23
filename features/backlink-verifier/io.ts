import { labels, type Options, type Report, type SavedRun } from "./types";
export function inputUrl(value: string) {
  const u = new URL(
    /^https?:\/\//i.test(value.trim())
      ? value.trim()
      : `https://${value.trim()}`,
  );
  if (
    !/^https?:$/.test(u.protocol) ||
    u.username ||
    u.password ||
    !u.hostname.includes(".")
  )
    throw new Error(
      "Enter complete public web URLs, such as https://example.com/article.",
    );
  u.hash = "";
  return u.href;
}
export function sourceList(text: string) {
  const values = text
    .split(/\r?\n/)
    .map((v) => v.trim())
    .filter(Boolean);
  if (!values.length) throw new Error("Add at least one source page URL.");
  const result = [...new Set(values.map(inputUrl))];
  if (result.length > 50)
    throw new Error(
      "Use up to 50 unique source pages per run. Split larger lists into smaller runs.",
    );
  return result;
}
export function importSourceCsv(text: string) {
  if (text.length > 250000)
    throw new Error("Use a CSV file smaller than 250 KB.");
  const rows: string[][] = [];
  let row: string[] = [],
    cell = "",
    quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (quoted && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else quoted = !quoted;
    } else if (!quoted && c === ",") {
      row.push(cell);
      cell = "";
    } else if (!quoted && (c === "\n" || c === "\r")) {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cell);
      if (row.some((v) => v.trim())) rows.push(row);
      row = [];
      cell = "";
    } else cell += c;
  }
  if (quoted) throw new Error("The CSV contains an unclosed quote.");
  row.push(cell);
  if (row.some((v) => v.trim())) rows.push(row);
  if (!rows.length) throw new Error("The CSV is empty.");
  const headers = rows[0].map((v) =>
    v
      .replace(/^\uFEFF/, "")
      .toLowerCase()
      .replace(/[^a-z]/g, ""),
  );
  let column = headers.findIndex((v) =>
    [
      "sourceurl",
      "source",
      "referringpage",
      "referringpageurl",
      "referringurl",
      "url",
    ].includes(v),
  );
  if (column >= 0) rows.shift();
  else {
    column = 0;
    if (!/^https?:\/\//i.test(rows[0][0]?.trim()))
      throw new Error(
        "Add a Source URL column containing the pages that link to your site.",
      );
  }
  return sourceList(rows.map((r) => r[column] || "").join("\n"));
}
const cell = (v: unknown) =>
  '"' +
  (/^[\s\u0000-\u001f]*[=+@-]/.test(String(v ?? "")) ? "'" : "") +
  String(v ?? "").replace(/"/g, '""') +
  '"';
export function reportCsv(reports: Report[], options: Options) {
  const rows: unknown[][] = [
    [
      "Source URL",
      "Final source URL",
      "Checked at",
      "Evidence",
      "Result",
      "Source HTTP",
      "Target",
      "Match mode",
      "Link URL",
      "Anchor",
      "Anchor source",
      "Link rel",
      "Page nofollow",
      "Source noindex",
      "Googlebot robots access",
      "Placement",
      "Context",
      "Review notes",
      "Destination HTTP",
      "Final destination",
      "Destination redirects",
      "Source redirects",
    ],
  ];
  for (const r of reports)
    for (const link of r.links.length ? r.links : [null])
      rows.push([
        r.sourceUrl,
        r.finalUrl,
        r.checkedAt,
        r.method,
        labels[r.status],
        r.httpStatus ?? "Not checked",
        options.target,
        options.mode,
        link?.href,
        link?.anchor,
        link?.anchorSource,
        link?.rel.join(" "),
        r.pageNofollow,
        r.noindex,
        r.crawlAccess,
        link?.placement,
        link?.context,
        [...r.notes, ...(link?.issues || []), r.error]
          .filter(Boolean)
          .join(" | "),
        link?.destination?.status ?? "Not verified",
        link?.destination?.finalUrl,
        JSON.stringify(link?.destination?.redirects || []),
        JSON.stringify(r.redirects),
      ]);
  return "\uFEFF" + rows.map((r) => r.map(cell).join(",")).join("\r\n");
}
export function settingsKey(options: Options) {
  return JSON.stringify([
    options.target,
    options.mode,
    options.includeSubdomains,
    options.expectedAnchor.trim().toLowerCase(),
    options.expectedRel,
  ]);
}
export function comparison(current: Report, baseline?: Report) {
  if (!baseline) return "New source in this run";
  if (current.method !== baseline.method) return "Different evidence method";
  if (current.status === "unverified" || baseline.status === "unverified")
    return "Unable to compare link presence";
  if (baseline.status === "found" && current.status !== "found")
    return "Previously found; absent from current HTML";
  if (baseline.status !== "found" && current.status === "found")
    return "Now found in HTML";
  const fingerprint = (r: Report) =>
    JSON.stringify([
      r.pageNofollow,
      r.noindex,
      r.links
        .map((l) => [l.href, l.anchor, [...l.rel].sort()])
        .sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b))),
    ]);
  return fingerprint(current) === fingerprint(baseline)
    ? "No observed link change"
    : "Link details changed";
}
export function readSavedRun(text: string): SavedRun | null {
  try {
    if (text.length > 2500000) return null;
    const value = JSON.parse(text);
    if (
      value.version !== 1 ||
      typeof value.savedAt !== "string" ||
      !value.options ||
      !["domain", "page"].includes(value.options.mode) ||
      typeof value.options.target !== "string" ||
      typeof value.options.expectedAnchor !== "string" ||
      !Array.isArray(value.reports) ||
      value.reports.length > 50
    )
      return null;
    if (
      !value.reports.every(
        (r: Report) =>
          r &&
          typeof r.sourceUrl === "string" &&
          Object.keys(labels).includes(r.status) &&
          Array.isArray(r.links) &&
          r.links.length <= 100 &&
          r.links.every(
            (l) =>
              typeof l.href === "string" &&
              typeof l.anchor === "string" &&
              Array.isArray(l.rel) &&
              l.rel.every((v) => typeof v === "string"),
          ),
      )
    )
      return null;
    return value;
  } catch {
    return null;
  }
}
export const exampleHtml = `<!doctype html><html><head><title>Example resource roundup</title><link rel="canonical" href="https://publisher.example/resources"></head><body><main><h1>Resources for content teams</h1><p>Try <a href="https://example.com/guide" rel="nofollow">Example guide</a> before planning your content.</p><p>A second placement uses <a href="https://example.com/guide"><img src="logo.png" alt="Example guide"></a>.</p><p>Our community also recommends <a href="https://example.com/guide" rel="ugc nofollow">a helpful resource</a>.</p></main></body></html>`;
