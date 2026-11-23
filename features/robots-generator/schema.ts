import { z } from "zod";

export const robotsFetchInputSchema = z.object({
  siteUrl: z
    .string()
    .trim()
    .min(4, "Enter a site URL.")
    .max(2048, "That URL is too long."),
});
