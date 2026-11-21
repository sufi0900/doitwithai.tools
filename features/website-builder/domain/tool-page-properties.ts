import { z } from "zod";

export const toolGradientPresets = [
  "auto",
  "indigo-cyan",
  "emerald-cyan",
  "violet-rose",
  "amber-rose",
  "obsidian-slate",
  "daylight-clean",
] as const;

export type ToolGradientPreset = (typeof toolGradientPresets)[number];

export const toolPageFields = [
  "title",
  "summary",
  "role",
  "period",
  "technologies",
  "heroHighlights",
  "customCtaLabel",
  "inputLabel",
  "defaultInput",
  "secondaryInputLabel",
  "defaultSecondaryInput",
  "toolAccentHex",
  "toolSecondaryAccentHex",
  "toolBackgroundHex",
  "toolSurfaceHex",
  "toolGradientPreset",
  "toolThemeMode",
  "hideEducationSection",
  "hideFaqSection",
  "customFaqs",
  "challenge",
  "approach",
  "outcome",
  "metaTitle",
  "metaDescription",
] as const;

export type ToolPageField = (typeof toolPageFields)[number];

const valueSchema = z.union([
  z.string(),
  z.boolean(),
  z.array(z.string()),
  z.array(z.object({ question: z.string(), answer: z.string() })),
  z.null(),
]);

export const toolPageEditsSchema = z.object({
  schemaVersion: z.literal(1),
  baseline: z
    .record(z.string(), valueSchema)
    .refine(
      (value) =>
        Object.keys(value).every((key) =>
          (toolPageFields as readonly string[]).includes(key)
        ),
      "Unknown page property"
    ),
});

export type ToolPageEdits = z.infer<typeof toolPageEditsSchema>;

export const toolPageLabels: Record<ToolPageField, string> = {
  title: "Heading (H1)",
  summary: "Introduction & Lead Copy",
  role: "Eyebrow / Category Kicker",
  period: "Right Card Heading",
  technologies: "Feature Badges",
  heroHighlights: "Right Card Bullet Highlights",
  customCtaLabel: "Primary Run Button Text",
  inputLabel: "Primary Input Field Label",
  defaultInput: "Primary Input Default / Placeholder",
  secondaryInputLabel: "Secondary Input Field Label",
  defaultSecondaryInput: "Secondary Input Default / Placeholder",
  toolAccentHex: "Primary Accent Color",
  toolSecondaryAccentHex: "Secondary / Gradient Accent Color",
  toolBackgroundHex: "Page Background Color",
  toolSurfaceHex: "Card & Workspace Surface Color",
  toolGradientPreset: "Hero & Card Gradient Preset",
  toolThemeMode: "Theme Mode (Auto / Dark / Light)",
  hideEducationSection: "Hide Educational / Methodology Sections",
  hideFaqSection: "Hide FAQ Section",
  customFaqs: "Custom Tool FAQs",
  challenge: "Problem / Use Case (Section 1)",
  approach: "How It Works / Methodology (Section 2)",
  outcome: "Expected Output & Best Practices (Section 3)",
  metaTitle: "SEO Meta Title",
  metaDescription: "SEO Meta Description",
};

export const toolPageFieldCategories: Array<{
  id: "hero" | "inputs" | "theme" | "story" | "seo";
  label: string;
  fields: ToolPageField[];
}> = [
  {
    id: "hero",
    label: "Hero & Highlights",
    fields: ["title", "role", "summary", "technologies", "period", "heroHighlights"],
  },
  {
    id: "inputs",
    label: "Inputs & CTA",
    fields: [
      "inputLabel",
      "defaultInput",
      "secondaryInputLabel",
      "defaultSecondaryInput",
      "customCtaLabel",
    ],
  },
  {
    id: "theme",
    label: "Theme & Gradient",
    fields: [
      "toolThemeMode",
      "toolGradientPreset",
      "toolAccentHex",
      "toolSecondaryAccentHex",
      "toolBackgroundHex",
      "toolSurfaceHex",
      "hideEducationSection",
      "hideFaqSection",
    ],
  },
  {
    id: "story",
    label: "Story & FAQs",
    fields: ["challenge", "approach", "outcome", "customFaqs"],
  },
  {
    id: "seo",
    label: "SEO Metadata",
    fields: ["metaTitle", "metaDescription"],
  },
];

export function isToolPageField(value: string): value is ToolPageField {
  return (toolPageFields as readonly string[]).includes(value);
}

export function isToolPageFieldEdited(
  tool: { toolPageEdits?: ToolPageEdits } | undefined,
  field: ToolPageField
): boolean {
  if (!tool?.toolPageEdits?.baseline) return false;
  return Object.prototype.hasOwnProperty.call(tool.toolPageEdits.baseline, field);
}

export function getEditedToolPageFields(
  tool: { toolPageEdits?: ToolPageEdits } | undefined
): ToolPageField[] {
  if (!tool?.toolPageEdits?.baseline) return [];
  return Object.keys(tool.toolPageEdits.baseline).filter(isToolPageField);
}

export function getToolPageFieldTab(
  field?: ToolPageField
): "hero" | "inputs" | "theme" | "story" {
  if (!field) return "hero";
  if (
    field === "inputLabel" ||
    field === "defaultInput" ||
    field === "secondaryInputLabel" ||
    field === "defaultSecondaryInput" ||
    field === "customCtaLabel"
  ) {
    return "inputs";
  }
  if (
    field === "toolThemeMode" ||
    field === "toolGradientPreset" ||
    field === "toolAccentHex" ||
    field === "toolSecondaryAccentHex" ||
    field === "toolBackgroundHex" ||
    field === "toolSurfaceHex" ||
    field === "hideEducationSection" ||
    field === "hideFaqSection" ||
    field === "metaTitle" ||
    field === "metaDescription"
  ) {
    return "theme";
  }
  if (
    field === "challenge" ||
    field === "approach" ||
    field === "outcome" ||
    field === "customFaqs"
  ) {
    return "story";
  }
  return "hero";
}
