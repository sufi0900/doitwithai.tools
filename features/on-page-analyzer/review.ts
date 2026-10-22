import { z } from "zod";
import type { Block } from "./types";
export const reviewInput = z.object({
  title: z.string().max(1000),
  keyword: z.string().max(100).default(""),
  audience: z.string().max(160).default(""),
  blocks: z
    .array(
      z.object({
        id: z.string().regex(/^block:\d+$/),
        tag: z.string().regex(/^(h[1-6]|p|li|blockquote|pre|td|th|dt|dd)$/),
        text: z.string().max(1000),
      }),
    )
    .min(1)
    .max(30),
});
export const reviewOutput = z.object({
  summary: z.string().trim().min(15).max(400),
  insights: z
    .array(
      z.object({
        blockId: z.string(),
        quote: z.string().trim().min(8).max(220),
        topic: z.enum([
          "clarity",
          "intent",
          "evidence",
          "coverage",
          "answer-placement",
          "standalone-context",
        ]),
        observation: z.string().trim().min(15).max(350),
        action: z.string().trim().min(15).max(350),
      }),
    )
    .max(6),
});
export type EditorialReview = z.infer<typeof reviewOutput>;
export function validateReview(
  value: unknown,
  blocks: Block[],
): EditorialReview {
  const parsed = reviewOutput.parse(value),
    seen = new Set<string>();
  const normalize = (s: string) => s.replace(/\s+/g, " ").trim();
  parsed.insights = parsed.insights.filter((item) => {
    const block = blocks.find((b) => b.id === item.blockId),
      key = `${item.blockId}:${item.topic}`;
    if (
      !block ||
      !normalize(block.text).includes(normalize(item.quote)) ||
      seen.has(key)
    )
      return false;
    seen.add(key);
    return true;
  });
  return parsed;
}
