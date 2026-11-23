import { z } from "zod";

export const hreflangFetchInputSchema = z.object({
  pageUrl: z.string().trim().min(4, "Enter a page URL.").max(2048, "That URL is too long."),
});
