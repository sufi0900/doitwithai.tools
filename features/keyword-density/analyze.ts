export const MAX_TEXT = 150000;
export type Token = {
  word: string;
  start: number;
  end: number;
  paragraph: number;
};
export type Phrase = {
  phrase: string;
  count: number;
  rate: number;
  words: number;
  first: number;
};
export type Match = { start: number; end: number; paragraph: number };
const stopwords = new Set(
  "a an and are as at be been being but by can could did do does for from had has have he her him his how i if in into is it its may more most my no not of on or our out she should so than that the their them there these they this those to too up us was we were what when where which who will with would you your".split(
    " ",
  ),
);
const canonical = (word: string) =>
  word.normalize("NFKC").toLowerCase().replace(/’/g, "'").replace(/[‑‐]/g, "-");
export function tokenize(text: string): Token[] {
  const tokens: Token[] = [];
  let paragraph = 1;
  let previous = 0;
  for (const match of text.matchAll(
    /[\p{L}\p{N}][\p{L}\p{M}\p{N}]*(?:['’‐‑-][\p{L}\p{N}][\p{L}\p{M}\p{N}]*)*/gu,
  )) {
    const start = match.index!;
    if (tokens.length && /\n\s*\n/.test(text.slice(previous, start)))
      paragraph++;
    tokens.push({
      word: canonical(match[0]),
      start,
      end: start + match[0].length,
      paragraph,
    });
    previous = start + match[0].length;
  }
  return tokens;
}
function contiguous(
  text: string,
  tokens: Token[],
  start: number,
  length: number,
) {
  for (let n = start + 1; n < start + length; n++)
    if (
      tokens[n].paragraph !== tokens[start].paragraph ||
      /[\r\n.!?…]/.test(text.slice(tokens[n - 1].end, tokens[n].start))
    )
      return false;
  return true;
}
export function targetWords(phrase: string) {
  return tokenize(phrase).map((t) => t.word);
}
export function findMatches(
  text: string,
  tokens: Token[],
  phrase: string,
): Match[] {
  const words = targetWords(phrase);
  if (!words.length || words.length > 10) return [];
  const matches: Match[] = [];
  for (let i = 0; i <= tokens.length - words.length; i++)
    if (
      words.every((w, n) => w === tokens[i + n].word) &&
      contiguous(text, tokens, i, words.length)
    )
      matches.push({
        start: tokens[i].start,
        end: tokens[i + words.length - 1].end,
        paragraph: tokens[i].paragraph,
      });
  return matches;
}
export function analyze(text: string, excludeStopwords = true) {
  if (text.length > MAX_TEXT)
    throw new Error(
      `Use up to ${MAX_TEXT.toLocaleString()} characters. Split longer content into sections.`,
    );
  const tokens = tokenize(text);
  const maps = [
    new Map<string, Phrase>(),
    new Map<string, Phrase>(),
    new Map<string, Phrase>(),
  ];
  for (let i = 0; i < tokens.length; i++)
    for (let length = 1; length <= 3 && i + length <= tokens.length; length++) {
      if (!contiguous(text, tokens, i, length)) continue;
      const words = tokens.slice(i, i + length).map((t) => t.word);
      if (
        excludeStopwords &&
        (stopwords.has(words[0]) || stopwords.has(words[words.length - 1]))
      )
        continue;
      const phrase = words.join(" ");
      const entry = maps[length - 1].get(phrase);
      if (entry) entry.count++;
      else
        maps[length - 1].set(phrase, {
          phrase,
          count: 1,
          rate: 0,
          words: length,
          first: tokens[i].start,
        });
    }
  const phrases = maps.map((map) =>
    [...map.values()]
      .map((p) => ({
        ...p,
        rate: tokens.length ? (p.count / tokens.length) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count || a.first - b.first),
  );
  return {
    tokens,
    totalWords: tokens.length,
    paragraphs: new Set(tokens.map((t) => t.paragraph)).size,
    phrases,
  };
}
export function distribution(text: string, tokens: Token[], phrase: string) {
  const matches = findMatches(text, tokens, phrase);
  const groups = new Map<
    number,
    { paragraph: number; words: number; count: number; rate: number }
  >();
  for (const token of tokens) {
    const group = groups.get(token.paragraph) || {
      paragraph: token.paragraph,
      words: 0,
      count: 0,
      rate: 0,
    };
    group.words++;
    groups.set(token.paragraph, group);
  }
  for (const match of matches) groups.get(match.paragraph)!.count++;
  return [...groups.values()]
    .map((g) => ({ ...g, rate: g.words ? (g.count / g.words) * 100 : 0 }))
    .filter((g) => g.count)
    .sort((a, b) => b.rate - a.rate || a.paragraph - b.paragraph);
}
export function mergeMatches(matches: Match[]) {
  const ranges: { start: number; end: number }[] = [];
  for (const match of matches) {
    const last = ranges[ranges.length - 1];
    if (last && match.start < last.end)
      last.end = Math.max(last.end, match.end);
    else ranges.push({ start: match.start, end: match.end });
  }
  return ranges;
}
export function parseTargets(raw: string) {
  const targets = raw
    .split(/\r?\n/)
    .map((t) => t.trim())
    .filter(Boolean);
  if (targets.length > 10)
    throw new Error("Use at most ten target phrases, one per line.");
  const seen = new Set<string>();
  for (const phrase of targets) {
    const words = targetWords(phrase);
    if (!words.length || words.length > 10 || phrase.length > 120)
      throw new Error(
        "Each target needs 1–10 words and at most 120 characters.",
      );
    const key = words.join(" ");
    if (seen.has(key)) throw new Error("Remove duplicate target phrases.");
    seen.add(key);
  }
  return targets;
}
export function exportCsv(rows: Phrase[], totalWords: number) {
  const cell = (v: string) =>
    '"' + (/^[\s]*[=+@-]/.test(v) ? "'" : "") + v.replace(/"/g, '""') + '"';
  return [
    [
      "Phrase",
      "Words in phrase",
      "Occurrences",
      "Occurrences per 100 words",
      "Total source words",
    ],
    ...rows.map((p) => [
      p.phrase,
      String(p.words),
      String(p.count),
      p.rate.toFixed(3),
      String(totalWords),
    ]),
  ]
    .map((row) => row.map(cell).join(","))
    .join("\r\n");
}
export const example =
  "AI writing tools can help you draft an article. AI writing tools still need careful human review. Choose a tool that fits your reader and your task.\n\nReview the source before publishing. A useful article needs clear examples, accurate claims, and relevant next steps. AI writing tools cannot replace evidence.\n\nUse AI writing tools to explore different wording. Then read your draft aloud and remove repeated phrases that add no meaning.";

export function previewWindow(text: string, matches: Match[]) {
  const start = Math.max(0, (matches[0]?.start || 0) - 400);
  const end = Math.min(text.length, start + 20000);
  const visible = mergeMatches(matches).filter(
    (r) => r.start < end && r.end > start,
  );
  const ranges = visible.slice(0, 200).map((r) => ({
    start: Math.max(start, r.start),
    end: Math.min(end, r.end),
  }));
  return {
    start,
    end,
    ranges,
    partial: start > 0 || end < text.length || visible.length > 200,
  };
}
