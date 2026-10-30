import { z } from "zod";

export const pageSpeedInputSchema = z.object({
  url: z.string().trim().min(4, "Enter a page URL.").max(2048, "That URL is too long."),
  strategy: z.enum(["mobile", "desktop"]).default("mobile"),
});
