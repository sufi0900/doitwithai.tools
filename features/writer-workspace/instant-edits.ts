/**
 * Deterministic ("scripted") editing helpers for the Ask AI bar.
 *
 * Pure formatting requests — bullets, numbered steps, quotes, headings, a simple
 * two-column table — never need a model round-trip. Doing them locally makes the
 * result instant, free, and 100% structurally correct. Anything that needs real
 * rewriting (shorten, expand, add an example, change tone…) still goes to the AI.
 */

const BULLET_MARKER = /^\s*(?:[-*+•▪◦●·‣⁃]|\d+[.)])\s+/;
const SENTENCE_SPLIT = /(?<=[.!?])\s+(?=[A-Z0-9"“‘'(\[*_`])/;
const NEEDS_AI =
  /\b(summar|shorten|shorter|trim|condense|longer|expand|elaborate|rewrite|rephrase|simplif|improve|polish|example|compar|tone|formal|casual|friendly|fix|grammar|translate|seo|keyword|explain|clarif|cite|source|link|statistic)\w*/i;

/** Split text into list items, preserving inline Markdown (links, bold). */
export function toItems(md: string): string[] {
  const lines = md
    .split(/\r?\n/)
    .map((l) => l.replace(BULLET_MARKER, "").trim())
    .filter(Boolean);
  const raw =
    lines.length >= 2
      ? lines
      : (lines[0] || "")
          .split(SENTENCE_SPLIT)
          .map((s) => s.trim())
          .filter(Boolean);
  return raw.slice(0, 14);
}

function oneLine(md: string) {
  return md.replace(/\s*\r?\n\s*/g, " ").replace(/\s{2,}/g, " ").trim();
}

function toTable(items: string[]): string | null {
  if (items.length < 2) return null;
  const rows: [string, string][] = [];
  for (const item of items) {
    const m =
      item.match(/^(\*\*[^*]{2,60}\*\*|[^:–—]{2,60}?)\s*[:–—]\s+(.{3,})$/) ||
      item.match(/^(.{2,50}?)\s+-\s+(.{3,})$/);
    if (!m) return null;
    rows.push([m[1].replace(/^\*\*|\*\*$/g, "").trim(), m[2].trim()]);
  }
  const cell = (s: string) => s.replace(/\|/g, "\\|");
  return [
    "| Item | Details |",
    "| --- | --- |",
    ...rows.map(([a, b]) => `| ${cell(a)} | ${cell(b)} |`),
  ].join("\n");
}

/**
 * Returns replacement Markdown for an obvious formatting-only instruction, or
 * `null` when the request needs the AI (or cannot be done safely by script).
 */
export function instantEdit(instruction: string, md: string): string | null {
  const ins = instruction.trim().toLowerCase();
  const text = md.trim();
  if (!ins || !text) return null;
  if (ins.split(/\s+/).length > 10 || NEEDS_AI.test(ins)) return null;

  const wantsTable = /\btable\b/.test(ins);
  const wantsNumbered =
    /\b(numbered|ordered|steps?|step[- ]by[- ]step|checklist)\b/.test(ins) ||
    /\b1\.\s/.test(ins);
  const wantsBullets = /\b(bullets?|bulleted|bullet points?|list)\b/.test(ins);
  const wantsQuote = /\b(block ?quote|quote|pull ?quote)\b/.test(ins);
  const heading = ins.match(/\b(?:h|heading\s*)([1-6])\b/);
  const wantsParagraph = /\b(paragraph|plain text|merge|join)\b/.test(ins);

  if (wantsTable) {
    const t = toTable(toItems(text));
    return t;
  }
  if (wantsNumbered) {
    const items = toItems(text);
    return items.length >= 2
      ? items.map((it, i) => `${i + 1}. ${it}`).join("\n")
      : null;
  }
  if (wantsBullets) {
    const items = toItems(text);
    return items.length >= 2 ? items.map((it) => `- ${it}`).join("\n") : null;
  }
  if (wantsQuote) {
    return text
      .split(/\r?\n/)
      .filter((l) => l.trim())
      .map((l) => `> ${l.replace(/^>\s?/, "").trim()}`)
      .join("\n");
  }
  if (heading) {
    const line = oneLine(text.replace(/^#{1,6}\s+/, ""));
    if (line.length > 140) return null;
    return `${"#".repeat(Number(heading[1]))} ${line.replace(/[.:;]+$/, "")}`;
  }
  if (wantsParagraph) return oneLine(text.replace(BULLET_MARKER, ""));
  return null;
}

/**
 * Cleans model output so the editor can always turn it into real structure:
 * strips wrappers/preambles, converts unicode bullets to Markdown lists, and
 * splits "• a • b • c" run-on bullets into separate list lines.
 */
export function normalizeAiMarkdown(raw: string): string {
  let text = raw.replace(/\r\n/g, "\n").trim();
  const fenced = text.match(/^```(?:markdown|md|text)?\n([\s\S]*?)\n```$/i);
  if (fenced) text = fenced[1].trim();
  text = text.replace(
    /^(?:sure|certainly|here(?:'s| is| are)|of course)[^\n]{0,80}:\s*\n+/i,
    "",
  );
  // Run-on unicode bullets in a single line → one bullet per line.
  if (!/\n/.test(text) && (text.match(/\s[•▪◦●‣]\s/g) || []).length >= 1)
    text = text.replace(/\s*[•▪◦●‣]\s+/g, "\n• ").trim();
  text = text
    .split("\n")
    .map((line) =>
      line
        .replace(/^\s*[•▪◦●·‣⁃]\s*/, "- ")
        .replace(/^(\s*)(\d+)\)\s+/, "$1$2. "),
    )
    .join("\n");
  return text.trim();
}
