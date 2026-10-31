import { z } from "zod";
import { SCHEMA_TYPE_IDS } from "./types";

export const schemaAnalysisInputSchema = z.object({
  pageUrl: z
    .string()
    .trim()
    .max(2_048)
    .refine(
      (value) => !value || /^https?:\/\//i.test(value),
      "Use a full http:// or https:// URL.",
    ),
  pageContext: z
    .string()
    .trim()
    .min(30, "Describe the page in at least 30 characters.")
    .max(8_000),
  schemaType: z.enum(SCHEMA_TYPE_IDS),
});

export const schemaAnalysisOutputSchema = z.object({
  suggestedType: z.enum(SCHEMA_TYPE_IDS),
  confidence: z.enum(["high", "medium", "low"]),
  rationale: z.string(),
  suggestions: z.array(
    z.object({
      fieldId: z.string(),
      value: z.string(),
      evidence: z.string(),
    }),
  ),
  warnings: z.array(z.string()),
  extracted: z.object({
    title: z.string(),
    description: z.string(),
    canonicalUrl: z.string(),
    imageUrl: z.string(),
    existingSchemaTypes: z.array(z.string()),
  }),
});

export type SchemaAnalysisInput = z.infer<typeof schemaAnalysisInputSchema>;
export type SchemaAnalysisOutput = z.infer<typeof schemaAnalysisOutputSchema>;
