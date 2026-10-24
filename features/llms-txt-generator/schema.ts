import { z } from "zod";

export type LlmsLink = {
  id: string;
  title: string;
  url: string;
  description: string;
};

export type LlmsSection = {
  id: string;
  heading: string;
  links: LlmsLink[];
};

export type LlmsSiteInfo = {
  siteName: string;
  summary: string;
  notes: string;
};

export type LlmsTxtState = {
  site: LlmsSiteInfo;
  sections: LlmsSection[];
};

export type LlmsIssue = {
  level: "error" | "warning";
  message: string;
};

export const sitemapFetchInputSchema = z.object({
  sitemapUrl: z
    .string()
    .trim()
    .min(4, "Enter a sitemap URL.")
    .max(2048, "That URL is too long."),
});

export const sitemapFetchOutputSchema = z.object({
  pages: z
    .array(
      z.object({
        url: z.string(),
        title: z.string(),
      }),
    )
    .max(60),
  truncated: z.boolean(),
  sourceUrl: z.string(),
});

export type SitemapFetchOutput = z.infer<typeof sitemapFetchOutputSchema>;
