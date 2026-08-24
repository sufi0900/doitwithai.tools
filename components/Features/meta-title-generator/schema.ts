import { z } from "zod";

export const pageTypeSchema = z.enum([
  "blog",
  "guide",
  "product",
  "service",
  "landing-page",
  "homepage",
  "category",
  "video",
  "other",
]);

export const searchIntentSchema = z.enum([
  "informational",
  "commercial",
  "transactional",
  "navigational",
]);

export const toneSchema = z.enum([
  "professional",
  "friendly",
  "authoritative",
  "direct",
  "technical",
  "conversational",
]);

const optionalShortText = z.string().trim().max(240).optional().default("");

export const metaTitleInputSchema = z
  .object({
    topicSummary: z.string().trim().min(40).max(5_000),
    primaryKeyword: z.string().trim().min(2).max(100),
    secondaryKeywords: z
      .array(z.string().trim().min(1).max(80))
      .max(8)
      .default([]),
    pageType: pageTypeSchema,
    searchIntent: searchIntentSchema,
    targetAudience: z.string().trim().min(2).max(240),
    uniqueValue: optionalShortText,
    tone: toneSchema,
    brandName: z.string().trim().max(80).optional().default(""),
    location: z.string().trim().max(100).optional().default(""),
    currentTitle: z.string().trim().max(160).optional().default(""),
    existingTitles: z
      .array(z.string().trim().min(1).max(160))
      .max(30)
      .default([]),
    prohibitedTerms: z
      .array(z.string().trim().min(1).max(60))
      .max(20)
      .default([]),
    includeFreshness: z.boolean().default(false),
    pageUrl: z.string().trim().max(300).optional().default(""),
  })
  .strict();

export const metaTitleLensSchema = z.enum(["unified", "search", "human", "ai"]);

export const metaTitleCandidateSchema = z
  .object({
    title: z.string().trim().min(20).max(72),
    angle: z.string().trim().min(2).max(60),
    rationale: z.string().trim().min(20).max(320),
    tradeoff: z.string().trim().min(10).max(220),
  })
  .strict();

export const metaTitleGroupSchema = z
  .object({
    lens: metaTitleLensSchema,
    heading: z.string().trim().min(3).max(80),
    explanation: z.string().trim().min(40).max(420),
    focuses: z.array(z.string().trim().min(2).max(60)).min(3).max(4),
    candidates: z.array(metaTitleCandidateSchema).length(5),
  })
  .strict();

export const metaTitleOutputSchema = z
  .object({
    analysis: z
      .object({
        contentType: z.string().trim().min(2).max(80),
        intent: z.string().trim().min(2).max(100),
        audienceSummary: z.string().trim().min(10).max(240),
        pagePromise: z.string().trim().min(10).max(240),
        keywordStrategy: z.string().trim().min(10).max(260),
        differentiator: z.string().trim().min(10).max(260),
        recommendedDirection: z.string().trim().min(10).max(260),
        assistantMessage: z.string().trim().min(40).max(650),
      })
      .strict(),
    groups: z.array(metaTitleGroupSchema).length(4),
    editorNotes: z.array(z.string().trim().min(10).max(240)).min(3).max(5),
  })
  .strict();

export type MetaTitleInput = z.infer<typeof metaTitleInputSchema>;
export type MetaTitleOutput = z.infer<typeof metaTitleOutputSchema>;
export type MetaTitleCandidate = z.infer<typeof metaTitleCandidateSchema>;
export type MetaTitleGroup = z.infer<typeof metaTitleGroupSchema>;

export type MetaTitleApiResponse = {
  result: MetaTitleOutput;
  meta: {
    generatedAt: string;
    model: string;
    remaining: number;
  };
};
