export const MAX_URLS_PER_SITEMAP = 50000;
export const MAX_BYTES = 50 * 1024 * 1024; // 50 MB uncompressed
export const MAX_INPUT_URLS = 200000;
export const MAX_URL_LENGTH = 2048;
export const SITEMAP_NS = "http://www.sitemaps.org/schemas/sitemap/0.9";
export const CHANGEFREQ_VALUES = ["always", "hourly", "daily", "weekly", "monthly", "yearly", "never"] as const;

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** W3C Datetime as used by sitemaps: YYYY, YYYY-MM, YYYY-MM-DD, or full date-time with time zone. */
export function isValidLastmod(value: string): boolean {
  const match =
    /^(\d{4})(?:-(\d{2})(?:-(\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?(?:Z|[+-]\d{2}:\d{2}))?)?)?$/.exec(value.trim());
  if (!match) return false;
  const [, year, month, day, hour, minute, second] = match;
  if (month !== undefined && (Number(month) < 1 || Number(month) > 12)) return false;
  if (day !== undefined) {
    const daysInMonth = new Date(Date.UTC(Number(year), Number(month), 0)).getUTCDate();
    if (Number(day) < 1 || Number(day) > daysInMonth) return false;
  }
  if (hour !== undefined && (Number(hour) > 23 || Number(minute) > 59 || (second !== undefined && Number(second) > 59))) {
    return false;
  }
  return true;
}

/* ------------------------------- generating ------------------------------- */

export interface GenerateOptions {
  includeLastmod: boolean;
  globalLastmod: string;
  includeChangefreq: boolean;
  changefreq: string;
  includePriority: boolean;
  priority: string;
}

export interface InputEntry {
  url: string;
  lastmod?: string;
}

export interface InputAnalysis {
  entries: InputEntry[];
  invalid: string[];
  duplicates: number;
  fragmentsStripped: number;
  hosts: string[];
  mixedProtocol: boolean;
  badLastmod: string[];
  tooLong: string[];
  overLimit: boolean;
}

const LINE_WITH_DATE = /^(.+?)[,;\t ]\s*(\d{4}(?:-\d{2}(?:-\d{2}(?:T\S*)?)?)?)\s*$/;

export function analyzeInput(text: string, options: GenerateOptions): InputAnalysis {
  const result: InputAnalysis = {
    entries: [],
    invalid: [],
    duplicates: 0,
    fragmentsStripped: 0,
    hosts: [],
    mixedProtocol: false,
    badLastmod: [],
    tooLong: [],
    overLimit: false,
  };
  const seen = new Set<string>();
  const hosts = new Set<string>();
  const protocols = new Set<string>();
  const globalOk = options.globalLastmod && isValidLastmod(options.globalLastmod);

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    if (result.entries.length >= MAX_INPUT_URLS) {
      result.overLimit = true;
      break;
    }

    let rawUrl = line;
    let rawDate: string | undefined;
    const dated = LINE_WITH_DATE.exec(line);
    if (dated) {
      rawUrl = dated[1].trim();
      rawDate = dated[2];
    }

    let parsed: URL;
    try {
      parsed = new URL(rawUrl);
    } catch {
      result.invalid.push(line);
      continue;
    }
    if ((parsed.protocol !== "https:" && parsed.protocol !== "http:") || /\s/.test(rawUrl)) {
      result.invalid.push(line);
      continue;
    }
    if (parsed.hash) {
      parsed.hash = "";
      result.fragmentsStripped += 1;
    }
    const href = parsed.href;
    if (href.length > MAX_URL_LENGTH) {
      result.tooLong.push(href.slice(0, 80));
      continue;
    }
    if (seen.has(href)) {
      result.duplicates += 1;
      continue;
    }
    seen.add(href);
    hosts.add(parsed.host);
    protocols.add(parsed.protocol);

    let lastmod: string | undefined;
    if (options.includeLastmod) {
      if (rawDate !== undefined) {
        if (isValidLastmod(rawDate)) lastmod = rawDate;
        else result.badLastmod.push(`${href} → ${rawDate}`);
      } else if (globalOk) {
        lastmod = options.globalLastmod;
      }
    }
    result.entries.push({ url: href, lastmod });
  }

  result.hosts = [...hosts];
  result.mixedProtocol = protocols.size > 1;
  return result;
}

export interface GeneratedFile {
  name: string;
  xml: string;
  count: number;
  bytes: number;
}

const URLSET_OPEN = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="${SITEMAP_NS}">\n`;
const URLSET_CLOSE = "</urlset>\n";

function entryXml(entry: InputEntry, options: GenerateOptions): string {
  let xml = `  <url>\n    <loc>${escapeXml(entry.url)}</loc>\n`;
  if (options.includeLastmod && entry.lastmod) xml += `    <lastmod>${escapeXml(entry.lastmod)}</lastmod>\n`;
  if (options.includeChangefreq && (CHANGEFREQ_VALUES as readonly string[]).includes(options.changefreq)) {
    xml += `    <changefreq>${options.changefreq}</changefreq>\n`;
  }
  if (options.includePriority) {
    const value = Math.min(Math.max(Number(options.priority), 0), 1);
    xml += `    <priority>${(Number.isFinite(value) ? value : 0.5).toFixed(1)}</priority>\n`;
  }
  return `${xml}  </url>\n`;
}

export function generateSitemaps(entries: InputEntry[], options: GenerateOptions): GeneratedFile[] {
  if (entries.length === 0) return [];

  const chunks: string[][] = [];
  let current: string[] = [];
  let currentBytes = URLSET_OPEN.length + URLSET_CLOSE.length;
  for (const entry of entries) {
    const chunk = entryXml(entry, options);
    if (current.length >= MAX_URLS_PER_SITEMAP || currentBytes + chunk.length > MAX_BYTES - 1024) {
      chunks.push(current);
      current = [];
      currentBytes = URLSET_OPEN.length + URLSET_CLOSE.length;
    }
    current.push(chunk);
    currentBytes += chunk.length;
  }
  if (current.length > 0) chunks.push(current);

  const toFile = (name: string, parts: string[]): GeneratedFile => {
    const xml = `${URLSET_OPEN}${parts.join("")}${URLSET_CLOSE}`;
    return { name, xml, count: parts.length, bytes: xml.length }; // URLs are ASCII after URL normalisation
  };

  if (chunks.length === 1) return [toFile("sitemap.xml", chunks[0])];

  const origin = new URL(entries[0].url).origin;
  const files = chunks.map((parts, index) => toFile(`sitemap-${index + 1}.xml`, parts));
  const indexBody = files
    .map((file) => `  <sitemap>\n    <loc>${escapeXml(`${origin}/${file.name}`)}</loc>\n  </sitemap>\n`)
    .join("");
  const indexXml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="${SITEMAP_NS}">\n${indexBody}</sitemapindex>\n`;
  return [{ name: "sitemap-index.xml", xml: indexXml, count: files.length, bytes: indexXml.length }, ...files];
}

/* ------------------------------- validating ------------------------------- */

export type Level = "error" | "warning" | "info";

export interface Issue {
  level: Level;
  message: string;
  count: number;
  examples: string[];
}

export interface ValidationResult {
  kind: "urlset" | "sitemapindex" | "unknown";
  entryCount: number;
  bytes: number;
  hosts: string[];
  issues: Issue[];
}

export type XmlParser = (text: string) => Document; // must throw on malformed XML

function childElements(parent: Element, localName?: string): Element[] {
  const result: Element[] = [];
  for (let node = parent.firstChild; node; node = node.nextSibling) {
    if (node.nodeType === 1) {
      const element = node as Element;
      if (!localName || element.localName === localName) result.push(element);
    }
  }
  return result;
}

function textOf(parent: Element, localName: string): string | null {
  const [element] = childElements(parent, localName);
  return element ? (element.textContent ?? "").trim() : null;
}

export function validateSitemap(text: string, parseXml: XmlParser): ValidationResult {
  const issues = new Map<string, Issue>();
  const add = (level: Level, message: string, example?: string) => {
    const existing = issues.get(message);
    if (existing) {
      existing.count += 1;
      if (example && existing.examples.length < 3) existing.examples.push(example);
    } else {
      issues.set(message, { level, message, count: 1, examples: example ? [example] : [] });
    }
  };

  const result: ValidationResult = {
    kind: "unknown",
    entryCount: 0,
    bytes: new TextEncoder().encode(text).length,
    hosts: [],
    issues: [],
  };
  const finish = (): ValidationResult => {
    const order: Record<Level, number> = { error: 0, warning: 1, info: 2 };
    result.issues = [...issues.values()].sort((a, b) => order[a.level] - order[b.level] || b.count - a.count);
    return result;
  };

  if (!text.trim()) return finish();
  if (result.bytes > MAX_BYTES) add("error", "The file is larger than 50 MB uncompressed. Split it into several sitemaps and list them in a sitemap index.");

  let doc: Document;
  try {
    doc = parseXml(text);
  } catch (error) {
    const detail = error instanceof Error && error.message ? ` Details: ${error.message}` : "";
    add(
      "error",
      `The file is not well-formed XML.${detail} A frequent cause is an unescaped & in a URL ; write it as &amp;.`
    );
    return finish();
  }

  const root = doc.documentElement;
  if (!root) {
    add("error", "No root element found.");
    return finish();
  }
  if (root.localName !== "urlset" && root.localName !== "sitemapindex") {
    add("error", `The root element is <${root.localName}>. A sitemap must start with <urlset> (or <sitemapindex> for an index).`);
    return finish();
  }
  result.kind = root.localName;
  if (root.namespaceURI !== SITEMAP_NS) {
    add("error", `The root element is missing the namespace xmlns="${SITEMAP_NS}".`);
  }

  const itemName = result.kind === "urlset" ? "url" : "sitemap";
  const items = childElements(root, itemName);
  result.entryCount = items.length;
  if (items.length === 0) add("error", `No <${itemName}> entries were found.`);
  if (items.length > MAX_URLS_PER_SITEMAP) {
    add("error", `The file lists ${items.length.toLocaleString()} entries; the limit is 50,000 per file. Split it and use a sitemap index.`);
  }

  const now = Date.now();
  const seen = new Set<string>();
  const hosts = new Set<string>();
  const protocols = new Set<string>();
  const lastmods = new Set<string>();
  let lastmodCount = 0;

  for (const item of items) {
    const loc = textOf(item, "loc");
    if (loc === null || loc === "") {
      add("error", `An entry has no <loc> value.`);
      continue;
    }
    let parsed: URL | null = null;
    try {
      parsed = new URL(loc);
    } catch {
      parsed = null;
    }
    if (!parsed || (parsed.protocol !== "https:" && parsed.protocol !== "http:")) {
      add("error", "Some <loc> values are not absolute http(s) URLs.", loc);
      continue;
    }
    if (/\s/.test(loc)) add("error", "Some <loc> values contain spaces. Encode them (for example %20).", loc);
    if (loc.length > MAX_URL_LENGTH) add("error", "Some URLs are longer than 2,048 characters.", loc.slice(0, 80));
    if (loc.includes("#")) add("warning", "Some URLs contain a #fragment, which search engines ignore. Remove it.", loc);
    if (parsed.protocol === "http:") add("info", "Some URLs use http:// rather than https://.", loc);
    hosts.add(parsed.host);
    protocols.add(parsed.protocol);
    if (seen.has(loc)) add("warning", "Duplicate URLs were found.", loc);
    seen.add(loc);

    const lastmod = textOf(item, "lastmod");
    if (lastmod !== null) {
      lastmodCount += 1;
      lastmods.add(lastmod);
      if (!isValidLastmod(lastmod)) {
        add("error", "Some <lastmod> values aren't valid W3C dates (use YYYY-MM-DD or a full date-time with a time zone).", `${loc} → ${lastmod}`);
      } else if (Date.parse(lastmod) > now + 24 * 60 * 60 * 1000) {
        add("warning", "Some <lastmod> dates are in the future.", `${loc} → ${lastmod}`);
      }
    }

    if (result.kind === "urlset") {
      const changefreq = textOf(item, "changefreq");
      if (changefreq !== null) {
        add("info", "<changefreq> and <priority> are optional, and Google says it ignores them.");
        if (!(CHANGEFREQ_VALUES as readonly string[]).includes(changefreq)) {
          add("error", "Some <changefreq> values aren't valid (allowed: always, hourly, daily, weekly, monthly, yearly, never).", `${loc} → ${changefreq}`);
        }
      }
      const priority = textOf(item, "priority");
      if (priority !== null) {
        add("info", "<changefreq> and <priority> are optional, and Google says it ignores them.");
        const value = Number(priority);
        if (priority === "" || !Number.isFinite(value) || value < 0 || value > 1) {
          add("error", "Some <priority> values aren't numbers between 0.0 and 1.0.", `${loc} → ${priority}`);
        }
      }
    }
  }

  result.hosts = [...hosts];
  if (hosts.size > 1) add("warning", `The file mixes ${hosts.size} different hosts. A sitemap should only list URLs on its own host.`, [...hosts].slice(0, 3).join(", "));
  if (protocols.size > 1) add("warning", "The file mixes http:// and https:// URLs. List only your canonical version.");
  if (items.length >= 10 && lastmodCount === items.length && lastmods.size === 1) {
    add("warning", "Every URL has the same <lastmod>. If it doesn't reflect real changes, search engines may learn to ignore it.");
  }
  if (result.kind === "urlset" && items.length > 0 && lastmodCount === 0) {
    add("info", "No <lastmod> values were found. They are optional but useful when accurate.");
  }

  return finish();
}

export const SAMPLE_URLS = `https://example.com/
https://example.com/about
https://example.com/blog/how-to-write-meta-descriptions, 2026-09-14
https://example.com/blog/keyword-research-guide, 2026-10-02
https://example.com/tools/robots-txt-generator
https://example.com/blog/ai-search?ref=nav#comments`;

export const SAMPLE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://example.com/</loc>
    <lastmod>2026-10-01</lastmod>
    <priority>1.5</priority>
  </url>
  <url>
    <loc>https://example.com/blog/post</loc>
    <lastmod>01/10/2026</lastmod>
  </url>
  <url>
    <loc>http://example.com/blog/post</loc>
  </url>
  <url>
    <loc>https://example.com/blog/post</loc>
  </url>
</urlset>`;
