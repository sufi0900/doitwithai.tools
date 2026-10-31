export function altAttribute(text: string) {
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\r?\n/g, "&#10;");
  return `alt="${escaped}"`;
}
export function reviewAlt(
  text: string,
  current: string,
  context: string,
  purpose: string,
) {
  const cues: string[] = [];
  const normalized = text.trim().toLowerCase().replace(/\s+/g, " ");
  if (!normalized && purpose !== "decorative")
    cues.push(
      "Empty alternative: check whether this image conveys information or a function.",
    );
  if (/^(an? )?(image|photo|picture) of\b/i.test(text.trim()))
    cues.push(
      "Review the opening phrase. The image medium may not need to be stated.",
    );
  if (Array.from(text).length > 180)
    cues.push(
      "Long alternative: consider which details belong in nearby text. This is an editing cue, not a character limit.",
    );
  if (
    context.trim() &&
    normalized === context.trim().toLowerCase().replace(/\s+/g, " ")
  )
    cues.push(
      "This repeats the nearby text exactly. Check whether a separate description adds meaning.",
    );
  if (/\.(jpg|jpeg|png|webp)\b/i.test(text))
    cues.push(
      "Possible file name: check whether meaningful information is missing.",
    );
  const tokens: string[] = normalized.match(/[\p{L}\p{N}]+/gu) || [];
  const counts = new Map<string, number>();
  tokens
    .filter((t) => t.length > 3)
    .forEach((t) => counts.set(t, (counts.get(t) || 0) + 1));
  if ([...counts.values()].some((n) => n >= 3))
    cues.push(
      "Repeated wording: review whether every repetition helps the reader.",
    );
  if (
    /\b(guaranteed|best ever|rank number one|boost your rankings)\b/i.test(text)
  )
    cues.push(
      "Promotional wording: replace unsupported claims with relevant image information.",
    );
  return {
    count: Array.from(text).length,
    words: tokens.length,
    unchanged: current.trim() ? text.trim() === current.trim() : null,
    cues,
  };
}
