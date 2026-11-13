import { z } from "zod";
import { cvProvenanceSchema } from "./site-document";
import { guidedInterviewSchema } from "./guided-interview";
import { templateOptions } from "./template-contracts";
import type { VoiceOnboarding } from "./voice-onboarding";

/** Shared by Studio onboarding and the project API so a voice request fails before networking. */
export const guidedCreateSchema = z.object({
  mode: z.literal("guided"),
  templateId: z.enum(templateOptions).optional(),
  projectName: z.string().trim().min(1).max(80),
  name: z.string().trim().min(1).max(60),
  role: z.string().trim().min(1).max(80),
  intro: z.string().trim().min(1).max(220),
  skills: z.array(z.string().trim().min(1).max(32)).max(8).default([]),
  education: z.array(z.string().trim().min(1).max(220)).max(8).default([]),
  website: z.union([z.literal(""), z.string().url().refine(url => /^https?:\/\//.test(url))]).default(""),
  cv: cvProvenanceSchema.optional(),
  interview: guidedInterviewSchema,
  firstProject: z.object({ title: z.string().trim().min(1).max(100), summary: z.string().trim().max(500) }).optional(),
});

export function describeCreationIssue(issue: { path: PropertyKey[]; message: string }): string {
  const [field, item] = issue.path;
  const labels: Record<string, string> = { projectName: "Project name", name: "Your name", role: "Professional role", intro: "Introduction", skills: "Core skills", education: "Education", website: "Website URL", templateId: "Template", interview: "Design questions", firstProject: "Optional first project" };
  const label = labels[String(field)] ?? "Portfolio details";
  const location = typeof item === "number" ? ` (item ${item + 1})` : item ? ` (${String(item)})` : "";
  return `${label}${location}: ${issue.message}. Review this field before creating a private draft.`;
}

export function selectedFirstProject(state: VoiceOnboarding): { title: string; summary: string } | undefined {
  if (state.projectSkipped || !state.confirmed.projectTitle?.trim()) return undefined;
  return { title: state.confirmed.projectTitle, summary: state.confirmed.projectSummary ?? "" };
}
