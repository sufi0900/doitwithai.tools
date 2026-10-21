import { z } from "zod";

export const serpImportInputSchema = z.object({
  includeStructuredData: z.boolean().default(true),
  pageUrl: z
    .string()
    .trim()
    .url("Enter a valid public page URL.")
    .max(2048)
    .refine((url) => /^https?:\/\//i.test(url), "Use http:// or https://."),
});
