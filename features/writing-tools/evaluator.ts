import { writingChecks, type WritingInput, type WritingKind } from "./schema";
export function textWords(text: string) {
  return text
    .normalize("NFKC")
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);
}
export function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
export function exportMarkup(text: string, kind: WritingKind) {
  return kind === "meta-description"
    ? `<meta name="description" content="${escapeHtml(text)}">`
    : `<h1>${escapeHtml(text)}</h1>`;
}
export function reviewWriting(
  text: string,
  input: WritingInput,
  kind: WritingKind,
) {
  const checks = writingChecks(text, input.keyword, kind);
  const words = textWords(text);
  const keywords = textWords(input.keyword);
  const titleWords = new Set(textWords(input.pageTitle));
  const overlap =
    words.length && titleWords.size
      ? Math.round(
          (new Set(words.filter((w) => titleWords.has(w))).size /
            new Set(words).size) *
            100,
        )
      : null;
  const phraseOccurrences = keywords.length
    ? words.reduce(
        (count, _, i) =>
          count + Number(keywords.every((w, j) => words[i + j] === w)),
        0,
      )
    : 0;
  const repeated = [...new Set(words)].filter(
    (w) => w.length > 3 && words.filter((v) => v === w).length >= 3,
  );
  const claimWords =
    /\b(guaranteed?|best|proven|leading|number one|award-winning)\b|#1/i.test(
      text,
    );
  return {
    ...checks,
    words: words.length,
    overlap,
    phraseOccurrences,
    repeated,
    claimWords,
    empty: !text.trim(),
    rows: [
      {
        label: "Editing length",
        note: checks.lengthNote,
        warn:
          (kind === "meta-description" && checks.count < 100) ||
          checks.count === 0 ||
          checks.count > (kind === "meta-description" ? 160 : 80),
      },
      {
        label: "Keyword wording",
        note: !keywords.length
          ? "No keyword supplied. Focus on a clear topic."
          : checks.keywordIncluded
            ? "All entered keyword words appear. Check that they read naturally."
            : "Some keyword words are absent. Review relevance before adding them.",
        warn: false,
      },
      {
        label: "Repeated wording",
        note:
          phraseOccurrences > 1
            ? "The exact keyword phrase appears more than once. Consider removing repetition."
            : repeated.length
              ? `Repeated terms: ${repeated.join(", ")}. Review whether each repetition helps.`
              : "No frequent repeated terms found by this simple word check.",
        warn: phraseOccurrences > 1 || repeated.length > 0,
      },
      {
        label:
          kind === "meta-description" ? "Title comparison" : "Title alignment",
        note:
          overlap === null
            ? "Add a page title to compare literal word overlap."
            : `${overlap}% of unique draft words also appear in the title. ${kind === "meta-description" ? "Look for useful detail beyond the title." : "Shared wording is allowed; check that both describe the same page."}`,
        warn: kind === "meta-description" && overlap === 100,
      },
      {
        label: "Claims to review",
        note: claimWords
          ? "Strong claim language found. Confirm it is supported by the page."
          : "No terms from the strong-claim word list found. This is not fact verification.",
        warn: claimWords,
      },
    ],
  };
}
