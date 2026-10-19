import { z } from "zod";

export const citationAnalyzeInputSchema = z.object({
  url: z
    .string()
    .trim()
    .min(4, "Enter a page URL.")
    .max(2048, "That URL is too long."),
});
