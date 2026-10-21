import { keywordMatches } from "./report";
export type Level = 1 | 2 | 3 | 4 | 5 | 6;
export type Severity = "error" | "warning" | "info";
export type Format = "html" | "markdown";

export interface Heading {
  index: number;
  level: Level;
  text: string;
  hidden: boolean;
  landmark: string | null;
  line: number | null;
}

export interface Issue {
  severity: Severity;
  code: string;
  title: string;
  detail: string;
  indexes: number[];
}

export interface KeywordReport {
  term: string;
  inH1: boolean;
  matching: number;
  total: number;
  share: number;
}

export interface Analysis {
  headings: Heading[];
  issues: Issue[];
  counts: number[]; // index 0 = H1 … index 5 = H6
  flags: Record<number, { severity: Severity; title: string }[]>;
  keyword: KeywordReport | null;
}

export interface ExtractResult {
  headings: Heading[];
  scope: string;
}

export const MAX_HEADINGS = 1000;
export const MAX_HEADING_TEXT = 200_000;
export const LONG_H1 = 70;
export const LONG_HEADING = 100;
const GENERIC =
  /^(click here|read more|learn more|more|untitled|heading|title|header|new section|section|text|lorem ipsum.*)$/i;

export type XmlParser = (html: string) => Document;

/* ------------------------------- detection ------------------------------- */

export function detectFormat(text: string): Format {
  return /<\/?(h[1-6]|html|body|main|article|section|div|p|header|footer|nav)\b[^>]*>/i.test(
    text,
  )
    ? "html"
    : "markdown";
}

/* ---------------------------------- HTML ---------------------------------- */

function cleanText(value: string): string {
  return value
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function accessibleText(element: Element): string {
  const clone = element.cloneNode(true) as Element;
  clone
    .querySelectorAll("script,style,template")
    .forEach((node) => node.remove());
  const text = cleanText(clone.textContent ?? "");
  if (text) return text;
  return cleanText(
    Array.from(element.querySelectorAll("img[alt]"))
      .map((image) => image.getAttribute("alt") ?? "")
      .join(" "),
  );
}

function isHidden(element: Element): boolean {
  for (let node: Element | null = element; node; node = node.parentElement) {
    if (
      node.hasAttribute("hidden") ||
      node.getAttribute("aria-hidden") === "true"
    )
      return true;
    const style = (node.getAttribute("style") ?? "")
      .toLowerCase()
      .replace(/\s+/g, "");
    if (/display:none|visibility:hidden/.test(style)) return true;
  }
  return false;
}

function landmarkOf(element: Element): string | null {
  if (element.closest("nav")) return "navigation";
  if (element.closest("footer")) return "footer";
  if (element.closest("aside")) return "sidebar";
  return null;
}

export function extractFromHtml(
  html: string,
  parse: XmlParser,
  mainOnly: boolean,
): ExtractResult {
  const doc = parse(html);
  let root: Element = doc.body ?? doc.documentElement;
  let scope = "the whole page";
  if (mainOnly) {
    const main = doc.querySelector("main") ?? doc.querySelector("article");
    if (main) {
      root = main;
      scope = `the <${main.localName}> element`;
    }
  }

  const headings: Heading[] = [];
  let totalText = 0;
  for (const element of Array.from(
    root.querySelectorAll('h1, h2, h3, h4, h5, h6, [role="heading"]'),
  )) {
    if (element.closest("noscript, template")) continue;
    if (mainOnly && element.closest("nav, footer, aside")) continue;
    const tag = /^H([1-6])$/.exec(element.tagName.toUpperCase());
    let level: number;
    if (tag) level = Number(tag[1]);
    else {
      const aria = Number(element.getAttribute("aria-level"));
      level = Number.isInteger(aria) && aria >= 1 && aria <= 6 ? aria : 2; // ARIA default level for role=heading
    }
    const text = accessibleText(element);
    totalText += text.length;
    if (headings.length >= MAX_HEADINGS || totalText > MAX_HEADING_TEXT) {
      throw new Error(
        "Use a smaller article section, with up to 1,000 headings and 200,000 heading characters.",
      );
    }
    headings.push({
      index: headings.length,
      level: level as Level,
      text,
      hidden: isHidden(element),
      landmark: mainOnly ? null : landmarkOf(element),
      line: null,
    });
  }
  return {
    headings,
    scope: mainOnly
      ? `${scope} excluding navigation, footer, and sidebar headings`
      : scope,
  };
}

/* -------------------------------- Markdown -------------------------------- */

function stripInline(value: string): string {
  return cleanText(
    value
      .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
      .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
      .replace(/(\*\*|__|\*|_|`|~~)/g, "")
      .replace(/<[^>]+>/g, ""),
  );
}

export function extractFromMarkdown(markdown: string): ExtractResult {
  const lines = markdown.replace(/^\uFEFF/, "").split(/\r?\n/);
  const headings: Heading[] = [];
  let fence: string | null = null;
  let start = 0;

  // Skip YAML front matter.
  if (lines[0]?.trim() === "---") {
    const end = lines.findIndex((line, i) => i > 0 && line.trim() === "---");
    if (end > 0) start = end + 1;
  }

  let totalText = 0;
  const push = (level: number, text: string, line: number) => {
    const clean = stripInline(text);
    totalText += clean.length;
    if (headings.length >= MAX_HEADINGS || totalText > MAX_HEADING_TEXT) {
      throw new Error(
        "Use a smaller article section, with up to 1,000 headings and 200,000 heading characters.",
      );
    }
    headings.push({
      index: headings.length,
      level: level as Level,
      text: clean,
      hidden: false,
      landmark: null,
      line,
    });
  };

  for (let i = start; i < lines.length; i += 1) {
    const line = lines[i];
    const fenceMatch = /^ {0,3}(`{3,}|~{3,})/.exec(line);
    if (fenceMatch) {
      if (fence === null) fence = fenceMatch[1][0];
      else if (fenceMatch[1][0] === fence) fence = null;
      continue;
    }
    if (fence !== null) continue;

    const atx = /^ {0,3}(#{1,6})(?:[ \t]+(.*?))?[ \t]*$/.exec(line);
    if (atx) {
      push(
        atx[1].length,
        (atx[2] ?? "").replace(/[ \t]+#+[ \t]*$/, "").replace(/^#+$/, ""),
        i + 1,
      );
      continue;
    }

    const prev = i > 0 ? lines[i - 1] : "";
    const prevIsText =
      prev.trim() !== "" &&
      !/^ {0,3}(#{1,6}\b|[-*+] |\d+[.)] |>|```|~~~)/.test(prev) &&
      !/^ {0,3}(=+|-+)\s*$/.test(prev);
    if (prevIsText && i - 1 >= start) {
      if (/^ {0,3}=+\s*$/.test(line)) push(1, prev, i);
      else if (/^ {0,3}-{2,}\s*$/.test(line)) push(2, prev, i);
    }
  }
  return { headings, scope: "the Markdown text" };
}

/* -------------------------------- analysis -------------------------------- */

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

function countOccurrences(haystack: string, needle: string): boolean {
  return keywordMatches(haystack, needle);
}

export function analyzeHeadings(
  headings: Heading[],
  keywordInput: string,
): Analysis {
  const issues: Issue[] = [];
  const flags: Analysis["flags"] = {};
  const counts = [0, 0, 0, 0, 0, 0];
  const add = (
    severity: Severity,
    code: string,
    title: string,
    detail: string,
    indexes: number[] = [],
  ) => {
    issues.push({ severity, code, title, detail, indexes });
    for (const index of indexes)
      (flags[index] ??= []).push({ severity, title });
  };

  for (const heading of headings) counts[heading.level - 1] += 1;
  const visible = headings.filter((heading) => !heading.hidden);

  if (headings.length === 0) {
    add(
      "error",
      "none",
      "No headings found",
      "No headings were detected in the supplied content. Check the scope or use rendered HTML before deciding whether the page needs headings.",
    );
    return { headings, issues, counts, flags, keyword: null };
  }

  const h1s = visible.filter((heading) => heading.level === 1);
  if (h1s.length === 0) {
    add(
      "error",
      "no-h1",
      "No visible H1",
      "Every page should have one clear main heading that states what the page is about.",
    );
  } else if (h1s.length > 1) {
    add(
      "warning",
      "multi-h1",
      `${h1s.length} H1 headings`,
      "Browsers and search engines cope with several H1s, so this is not a penalty. A single H1 is still the clearest way to state the page's topic, and it keeps the outline easy to follow.",
      h1s.map((heading) => heading.index),
    );
  }

  const first = visible[0];
  if (first && first.level !== 1 && h1s.length > 0) {
    add(
      "warning",
      "first-not-h1",
      "The page doesn't start with an H1",
      `The first heading is an H${first.level}. Usually the H1 comes first so the outline reads in order.`,
      [first.index],
    );
  }

  const skipped: number[] = [];
  const skippedDetail: string[] = [];
  for (let i = 1; i < visible.length; i += 1) {
    if (visible[i].level > visible[i - 1].level + 1) {
      skipped.push(visible[i].index);
      skippedDetail.push(`H${visible[i - 1].level} → H${visible[i].level}`);
    }
  }
  if (skipped.length > 0) {
    add(
      "warning",
      "skipped",
      `${skipped.length} skipped heading level${skipped.length === 1 ? "" : "s"}`,
      `Jumping down more than one level (${[...new Set(skippedDetail)].join(", ")}) breaks the outline for people who navigate by headings. Use the next level down, or restructure the section.`,
      skipped,
    );
  }

  const empty = visible
    .filter((heading) => heading.text === "")
    .map((heading) => heading.index);
  if (empty.length > 0) {
    add(
      "error",
      "empty",
      `${empty.length} empty heading${empty.length === 1 ? "" : "s"}`,
      "A heading with no text is announced as a blank landmark by screen readers and tells search engines nothing. Add text or remove the tag.",
      empty,
    );
  }

  const groups = new Map<string, number[]>();
  for (const heading of visible) {
    const key = normalize(heading.text);
    if (!key) continue;
    groups.set(key, [...(groups.get(key) ?? []), heading.index]);
  }
  const duplicates = [...groups.values()].filter((list) => list.length > 1);
  if (duplicates.length > 0) {
    add(
      "warning",
      "duplicate",
      `${duplicates.length} repeated heading text${duplicates.length === 1 ? "" : "s"}`,
      "Identical headings make sections hard to tell apart. Make each one specific to its section.",
      duplicates.flat(),
    );
  }

  const generic = visible.filter((heading) =>
    GENERIC.test(heading.text.replace(/[.:!?\s]+$/, "")),
  );
  if (generic.length > 0) {
    add(
      "warning",
      "generic",
      `${generic.length} non-descriptive heading${generic.length === 1 ? "" : "s"}`,
      'Headings such as "Read more" or "Untitled" don\'t describe their section. Replace them with the section\'s real topic.',
      generic.map((heading) => heading.index),
    );
  }

  const longH1 = visible
    .filter((heading) => heading.level === 1 && heading.text.length > LONG_H1)
    .map((heading) => heading.index);
  if (longH1.length > 0) {
    add(
      "info",
      "long-h1",
      "Long H1",
      `The H1 is over ${LONG_H1} characters. There is no strict limit, but a shorter main heading is easier to scan.`,
      longH1,
    );
  }
  const longOther = visible
    .filter(
      (heading) => heading.level > 1 && heading.text.length > LONG_HEADING,
    )
    .map((heading) => heading.index);
  if (longOther.length > 0) {
    add(
      "info",
      "long",
      `${longOther.length} very long heading${longOther.length === 1 ? "" : "s"}`,
      `These run over ${LONG_HEADING} characters. Consider shortening them, or moving detail into the paragraph below.`,
      longOther,
    );
  }

  const hidden = headings
    .filter((heading) => heading.hidden)
    .map((heading) => heading.index);
  if (hidden.length > 0) {
    add(
      "warning",
      "hidden",
      `${hidden.length} hidden heading${hidden.length === 1 ? "" : "s"}`,
      "These headings are marked hidden (hidden attribute, aria-hidden, or inline display:none). They are left out of the other checks. Remove them or make them visible if they're meant to be part of the page.",
      hidden,
    );
  }

  const landmarked = headings
    .filter((heading) => heading.landmark !== null)
    .map((heading) => heading.index);
  if (landmarked.length > 0) {
    add(
      "info",
      "landmark",
      `${landmarked.length} heading${landmarked.length === 1 ? "" : "s"} outside the main content`,
      'These sit in a navigation, footer, or sidebar. Turn on "Analyze main content only" to check just the article body.',
      landmarked,
    );
  }

  if (visible.length > 1 && counts[1] === 0) {
    add(
      "info",
      "no-h2",
      "No H2 headings",
      "Consider breaking the content into sections with H2 headings so the page is easier to scan.",
    );
  }

  let keyword: KeywordReport | null = null;
  const term = normalize(keywordInput);
  if (term) {
    const matching = visible.filter((heading) =>
      countOccurrences(heading.text, keywordInput),
    );
    const inH1 = h1s.some((heading) =>
      countOccurrences(heading.text, keywordInput),
    );
    keyword = {
      term: keywordInput.trim(),
      inH1,
      matching: matching.length,
      total: visible.length,
      share: visible.length ? matching.length / visible.length : 0,
    };
    if (h1s.length > 0 && !inH1) {
      add(
        "info",
        "kw-h1",
        "Target phrase not in the H1",
        "The H1 doesn't contain your phrase. That's fine if it uses a close variation, but check the heading still states the page's topic clearly.",
      );
    }
    if (matching.length === 0) {
      add(
        "info",
        "kw-none",
        "Target phrase not in any heading",
        "Consider whether one section heading could naturally name this topic.",
      );
    } else if (visible.length >= 5 && keyword.share > 0.6) {
      add(
        "warning",
        "kw-over",
        "Target phrase repeated in most headings",
        `It appears in ${matching.length} of ${visible.length} headings. Repeating it everywhere can read as forced. Vary the wording and describe each section's own angle.`,
        matching.map((heading) => heading.index),
      );
    }
  }

  const order: Record<Severity, number> = { error: 0, warning: 1, info: 2 };
  issues.sort((a, b) => order[a.severity] - order[b.severity]);
  return { headings, issues, counts, flags, keyword };
}

/* --------------------------------- export --------------------------------- */

export function outlineAsMarkdown(headings: Heading[]): string {
  return headings
    .filter((heading) => !heading.hidden)
    .map((heading) => `${"#".repeat(heading.level)} ${heading.text}`)
    .join("\n");
}

function csvCell(value: string | number): string {
  let text = String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function buildCsv(analysis: Analysis): string {
  const rows = analysis.headings.map((heading) =>
    [
      heading.index + 1,
      `H${heading.level}`,
      heading.text,
      heading.hidden ? "hidden" : "visible",
      (analysis.flags[heading.index] ?? [])
        .map((flag) => flag.title)
        .join("; "),
    ]
      .map(csvCell)
      .join(","),
  );
  return ["Position,Level,Text,Visibility,Flags", ...rows].join("\n");
}

export const SAMPLE_HTML = `<html><body>
<header><nav><h2>Menu</h2></nav></header>
<main>
  <h2>How to write meta descriptions</h2>
  <p>Intro text…</p>
  <h1>Meta Descriptions</h1>
  <h3>What is a meta description?</h3>
  <h2>Why they matter</h2>
  <h4>Click-through rate</h4>
  <h2>Read more</h2>
  <h2>Why they matter</h2>
  <h2></h2>
  <h2 style="display:none">Hidden promo</h2>
  <h1>Frequently asked questions about writing meta descriptions that get more clicks in search results</h1>
</main>
<footer><h3>Contact</h3></footer>
</body></html>`;

export const SAMPLE_MARKDOWN = `# Meta descriptions guide

## What they are
Text here.

### Length
### Length

#### Tips

## Examples

##### Deep point

Setext Heading
--------------
`;
