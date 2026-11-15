import { z } from "zod";
export const toolPageFields = ["title", "summary", "role", "period", "technologies", "heroHighlights", "customCtaLabel", "defaultInput", "defaultSecondaryInput", "toolAccentHex", "toolBackgroundHex", "toolThemeMode", "hideEducationSection", "hideFaqSection", "customFaqs", "challenge", "approach", "outcome", "metaTitle", "metaDescription"] as const;
export type ToolPageField = typeof toolPageFields[number];
const valueSchema = z.union([z.string(), z.boolean(), z.array(z.string()), z.array(z.object({ question: z.string(), answer: z.string() })), z.null()]);
export const toolPageEditsSchema = z.object({ schemaVersion: z.literal(1), baseline: z.record(z.string(), valueSchema).refine(value => Object.keys(value).every(key => (toolPageFields as readonly string[]).includes(key)), "Unknown page property") });
export type ToolPageEdits = z.infer<typeof toolPageEditsSchema>;
export const toolPageLabels: Record<ToolPageField, string> = {
 title: "Heading", summary: "Introduction", role: "Eyebrow", period: "Highlight heading", technologies: "Badges", heroHighlights: "Highlights", customCtaLabel: "Primary button", defaultInput: "Default input", defaultSecondaryInput: "Secondary input", toolAccentHex: "Accent color", toolBackgroundHex: "Background color", toolThemeMode: "Theme", hideEducationSection: "Hide educational sections", hideFaqSection: "Hide FAQ", customFaqs: "FAQs", challenge: "Challenge", approach: "Approach", outcome: "Outcome", metaTitle: "SEO title", metaDescription: "SEO description",
};
export function isToolPageField(value: string): value is ToolPageField { return (toolPageFields as readonly string[]).includes(value); }
