import { z } from "zod";

const optionalText = (maximum: number) =>
  z.string().trim().max(maximum).optional().default("");

export const slugInputSchema = z
  .object({
    pageContext: z.string().trim().min(30).max(4_000),
    primaryKeyword: optionalText(120),
    currentSlug: optionalText(240),
    baseUrl: optionalText(300),
    timeSensitive: z.boolean().default(false),
  })
  .strict();

export const slugCandidateSchema = z
  .object({
    slug: z.string().trim().min(2).max(80),
    angle: z.string().trim().min(2).max(60),
    rationale: z.string().trim().min(20).max(320),
    bestFor: z.string().trim().min(10).max(180),
    tradeoff: z.string().trim().min(10).max(180),
  })
  .strict();

const compressedDetailSchema = z
  .object({
    detail: z.string().trim().min(2).max(100),
    decision: z.string().trim().min(10).max(220),
  })
  .strict();

export const slugOutputSchema = z
  .object({
    analysis: z
      .object({
        pageType: z.string().trim().min(2).max(80),
        searchIntent: z.string().trim().min(2).max(100),
        coreTopic: z.string().trim().min(2).max(140),
        primaryEntity: z.string().trim().min(2).max(120),
        stableConcepts: z.array(z.string().trim().min(2).max(80)).min(2).max(4),
        detailsCompressed: z.array(compressedDetailSchema).min(1).max(4),
        summary: z.string().trim().min(40).max(520),
        recommendedDirection: z.string().trim().min(30).max(320),
      })
      .strict(),
    topRecommendation: slugCandidateSchema,
    alternatives: z
      .object({
        concise: z.array(slugCandidateSchema).length(2),
        keywordAligned: z.array(slugCandidateSchema).length(2),
        intentLed: z.array(slugCandidateSchema).length(2),
      })
      .strict(),
    editorNotes: z.array(z.string().trim().min(10).max(240)).min(3).max(4),
  })
  .strict();

export type SlugInput = z.infer<typeof slugInputSchema>;
export type SlugCandidate = z.infer<typeof slugCandidateSchema>;
export type SlugOutput = z.infer<typeof slugOutputSchema>;

export type SlugApiResponse = {
  result: SlugOutput;
  meta: {
    generatedAt: string;
    model: string;
    remaining: number;
  };
};
