import { z } from "zod";
import { questionKey, type FaqItem, type FaqInput } from "./schema";
export const reportSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string().min(1),
        question: z.string().min(8).max(220),
        answer: z.string().max(650),
        evidence: z
          .array(
            z.object({
              passageId: z.number().int().positive(),
              quote: z.string().min(15).max(500),
            }),
          )
          .max(3),
        status: z.enum(["draft", "needs-information"]),
        reason: z.string().max(300),
        reviewed: z.literal(false),
      }),
    )
    .max(8),
  coverage: z.object({
    totalPassages: z.number().int().positive(),
    sourceCharacters: z.number().positive(),
    selectedCharacters: z.number().positive(),
    partial: z.boolean(),
  }),
  notice: z.string(),
});
export function reviewedItems(items: FaqItem[]) {
  const selected = items.filter((i) => i.status === "draft" && i.reviewed);
  if (!selected.length)
    throw new Error(
      "Review and select at least one answered FAQ before exporting.",
    );
  const seen = new Set<string>();
  for (const item of selected) {
    const key = questionKey(item.question);
    if (key.length < 5 || !item.answer.trim())
      throw new Error(
        "Selected FAQs need a clear question and a nonempty answer.",
      );
    if (seen.has(key))
      throw new Error(
        "Two selected questions are duplicates. Edit or deselect one before exporting.",
      );
    seen.add(key);
  }
  return selected;
}
export function exportFaq(items: FaqItem[], format: "markdown" | "html") {
  const selected = reviewedItems(items);
  const escape = (v: string) =>
    v
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  const line = (v: string) => v.replace(/[\r\n]+/g, " ");
  if (format === "html")
    return `<section aria-label="Frequently asked questions">\n${selected.map((i) => `  <details>\n    <summary>${escape(i.question)}</summary>\n    <p>${escape(i.answer).replace(/\n/g, "<br>")}</p>\n  </details>`).join("\n")}\n</section>`;
  return (
    "# Frequently asked questions\n\n" +
    selected.map((i) => `## ${line(i.question)}\n\n${i.answer}`).join("\n\n")
  );
}
export function exportReviewNotes(items: FaqItem[]) {
  return (
    "# FAQ editorial review\n\nQuotes come from supplied text and are not independent fact checks.\n\n" +
    items
      .map(
        (i) =>
          `## ${i.question.replace(/[\r\n]+/g, " ")}\n\n${i.status === "draft" ? `Review: ${i.reviewed ? "selected by editor" : "not selected"}\n\n${i.answer}\n\n${i.evidence.map((e) => `Passage ${e.passageId}: ${e.quote}`).join("\n\n")}` : `Research needed: ${i.reason}`}`,
      )
      .join("\n\n")
  );
}

export function sourceWording(item: FaqItem) {
  const quotes: string[] = [];
  for (const evidence of item.evidence) {
    if ([...quotes, evidence.quote].join(" ").length <= 650)
      quotes.push(evidence.quote);
  }
  return quotes.join(" ");
}

export function inputKey(input: FaqInput) {
  return JSON.stringify([
    input.topic.trim(),
    input.audience.trim(),
    input.content.trim(),
    input.count,
    input.questions.map((question) => question.trim()),
  ]);
}
