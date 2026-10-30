import { z } from "zod";

export const ogImportInputSchema = z.object({
  pageUrl: z.string().trim().min(4, "Enter a page URL.").max(2048, "That URL is too long."),
});

export const imageCheckInputSchema = z.object({
  imageUrl: z.string().trim().min(4, "Enter an image URL.").max(2048, "That URL is too long."),
});
