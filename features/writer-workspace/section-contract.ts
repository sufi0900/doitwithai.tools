/** Validate the requested outline without inventing prose or moving it under unrelated headings. */
export function validateSectionOutline(body: string, requested: string[]): string {
  const expected = requested.map(heading => heading.trim()).filter(Boolean);
  const actual = [...body.matchAll(/^###\s+(.+)$/gm)].map(match => match[1].trim());
  if (!expected.length) return body.replace(/^###\s+(.+)$/gm, "**$1**");
  if (actual.length !== expected.length || actual.some((heading, i) => heading !== expected[i])) {
    throw new Error("The section response changed or missed a requested subheading. Retry this section.");
  }
  const paragraphs = body.split(/^###\s+.+$/m).slice(1);
  if (paragraphs.some(part => part.replace(/^#{1,6}[^\n]*$/gm, "").trim().length < 45)) {
    throw new Error("The section response left a subheading without an explanation. Retry this section.");
  }
  return body;
}
