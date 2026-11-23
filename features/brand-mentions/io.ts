import {
  inputUrl,
  sourceList,
  importSourceCsv as parseSourceCsv,
} from "../backlink-verifier/io";
import { labels, type Settings, type MentionReport } from "./types";
export { inputUrl, sourceList };
export function importSourceCsv(text: string) {
  try {
    return parseSourceCsv(text);
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message.replace(
            "pages that link to your site",
            "external pages to inspect",
          )
        : "Use a Source URL column containing the pages to inspect.",
    );
  }
}
export type Fields = {
  brand?: string;
  target?: string;
  sources?: string;
  html?: string;
  aliases?: string;
};
export function validateSetup(
  settings: Settings,
  sources: string,
  mode: "live" | "pasted",
  html: string,
  aliasText: string,
) {
  const errors: Fields = {};
  if (settings.brand.trim().length < 2 || settings.brand.trim().length > 100)
    errors.brand = "Enter a brand name between 2 and 100 characters.";
  let target = "",
    urls: string[] = [];
  try {
    target = inputUrl(settings.target);
  } catch {
    errors.target = "Enter your website, such as https://yourwebsite.com.";
  }
  try {
    urls = sourceList(sources);
  } catch (error) {
    errors.sources =
      error instanceof Error ? error.message : "Add public source page URLs.";
  }
  if (mode === "pasted") {
    if (urls.length !== 1)
      errors.sources = "Paste HTML mode needs exactly one source page URL.";
    if (!html.trim()) errors.html = "Paste the source page HTML to inspect.";
    else if (new TextEncoder().encode(html).length > 750000)
      errors.html = "Keep supplied HTML below 750 KB of UTF-8 text.";
  }
  const aliases = [
    ...new Set(
      aliasText
        .split(/\r?\n/)
        .map((s) => s.trim())
        .filter(Boolean),
    ),
  ];
  if (aliases.length > 5 || aliases.some((s) => s.length < 2 || s.length > 100))
    errors.aliases =
      "Use up to five alternate names, each between 2 and 100 characters.";
  return {
    errors,
    settings: { ...settings, brand: settings.brand.trim(), target, aliases },
    sources: urls,
  };
}
const cell = (v: unknown) =>
  '"' +
  (/^[\s\u0000-\u001f]*[=+@-]/.test(String(v ?? "")) ? "'" : "") +
  String(v ?? "").replace(/"/g, '""') +
  '"';
export function mentionCsv(
  reports: MentionReport[],
  settings: Settings,
  shortlist: string[],
) {
  const rows: unknown[][] = [
    [
      "Brand",
      "Website",
      "Alternate names",
      "Case sensitive",
      "Include subdomains",
      "Source",
      "Final source",
      "Title",
      "Result",
      "Evidence",
      "HTTP status",
      "Checked at",
      "Complete HTML scan",
      "Shortlisted",
      "Mention",
      "Context",
      "Mention relationship",
      "Mention destination",
      "Link rel",
      "Page section",
      "Direct website links",
      "Notes",
      "Error",
    ],
  ];
  for (const report of reports)
    for (const mention of report.mentions.length ? report.mentions : [null])
      rows.push([
        settings.brand,
        settings.target,
        settings.aliases.join(" | "),
        settings.caseSensitive,
        settings.includeSubdomains,
        report.sourceUrl,
        report.finalUrl,
        report.title,
        labels[report.status],
        report.method === "pasted"
          ? "Supplied HTML; not live verified"
          : "Fetched HTML",
        report.httpStatus,
        report.checkedAt,
        report.complete,
        shortlist.includes(report.sourceUrl),
        mention?.text,
        mention ? mention.before + mention.text + mention.after : "",
        mention?.kind,
        mention?.destinations.join(" | "),
        mention?.rel.join(" "),
        mention?.section,
        report.siteLinks.map((l) => l.href).join(" | "),
        report.notes.join(" | "),
        report.error,
      ]);
  return "\uFEFF" + rows.map((row) => row.map(cell).join(",")).join("\r\n");
}
export const exampleSettings: Settings = {
  brand: "Do It With AI Tools",
  target: "https://doitwithai.tools/",
  aliases: ["DoItWithAI"],
  caseSensitive: false,
  includeSubdomains: true,
};
export const exampleHtml =
  "<html><head><title>Fictional resource roundup</title></head><body><main><h1>Helpful publishing resources</h1><p>Our editors mentioned Do It With AI Tools when discussing content planning.</p><p>DoItWithAI also appeared in our research notes.</p></main></body></html>";
