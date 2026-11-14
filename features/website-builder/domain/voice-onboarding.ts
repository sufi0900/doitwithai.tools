import { z } from "zod";
import { completeGuidedDirection, guidedInterviewSchema } from "./guided-interview";
import { templateOptions } from "./template-contracts";

export const exactFieldSchema = z.enum(["name", "role", "intro", "skills", "education", "website", "projectTitle", "projectSummary"]);
export type ExactField = z.infer<typeof exactFieldSchema>;
export const exactLabels: Record<ExactField, string> = {
  name: "Your name", role: "Professional role", intro: "Introduction", skills: "Skills",
  education: "Education", website: "Website URL", projectTitle: "First project title", projectSummary: "First project summary",
};
const limits: Record<ExactField, number> = { name: 60, role: 80, intro: 220, skills: 300, education: 600, website: 300, projectTitle: 100, projectSummary: 500 };
export function parseCoreSkills(raw: string): string[] {
  const skills = raw.split(/[,\n]/).map(item => item.trim().replace(/\s+/g, " ")).filter(Boolean);
  if (skills.length < 2 || skills.length > 8) throw new Error("Add 2 to 8 core skills, separated by commas or new lines.");
  const invalid = skills.find(item => item.length > 32);
  if (invalid) throw new Error(`Shorten “${invalid}” to 32 characters or fewer. Keep each skill separate.`);
  return skills;
}

export const voiceOnboardingSchema = z.object({
  confirmed: z.partialRecord(exactFieldSchema, z.string()).default({}),
  direction: guidedInterviewSchema.partial().default({}),
  selectedTemplate: z.enum(templateOptions).optional(),
  projectSkipped: z.boolean().optional(),
  pending: z.object({ field: exactFieldSchema, value: z.string(), id: z.string().uuid() }).nullable().default(null),
  correcting: exactFieldSchema.nullable().optional(),
});
export type VoiceOnboarding = z.infer<typeof voiceOnboardingSchema>;
export const emptyVoiceOnboarding = (): VoiceOnboarding => ({ confirmed: {}, direction: {}, pending: null });

export function proposeExact(state: VoiceOnboarding, field: ExactField, raw: string): VoiceOnboarding {
  const value = raw.trim().replace(/\s+/g, " ");
  if (!value || value.length > limits[field]) throw new Error(`${exactLabels[field]} must be between 1 and ${limits[field]} characters.`);
  if (field === "skills") parseCoreSkills(value);
  if (field === "website" && !/^https?:\/\/[^\s]+$/i.test(value)) throw new Error("Please provide a complete website URL beginning with https://.");
  return { ...state, pending: { field, value, id: crypto.randomUUID() }, correcting: null };
}

export function beginExactCorrection(state: VoiceOnboarding): VoiceOnboarding {
  if (!state.pending) throw new Error("There is no proposed detail to correct.");
  return { ...state, correcting: state.pending.field };
}

/** Submitting the text is an explicit approval of its exact spelling. */
export function submitExactCorrection(state: VoiceOnboarding, raw: string): VoiceOnboarding {
  if (!state.correcting) throw new Error("Choose a detail to correct first.");
  const proposed = proposeExact(state, state.correcting, raw);
  return confirmExact(proposed, proposed.pending!.id);
}

export function confirmExact(state: VoiceOnboarding, id: string): VoiceOnboarding {
  if (!state.pending || state.pending.id !== id) throw new Error("That answer changed. Please review the latest wording before confirming.");
  const { field, value } = state.pending;
  if (state.correcting) throw new Error("Submit the corrected spelling before confirming.");
  return { ...state, confirmed: { ...state.confirmed, [field]: value }, pending: null, correcting: null };
}

export function isVoiceDraftReady(state: VoiceOnboarding) {
  try { parseCoreSkills(state.confirmed.skills ?? ""); } catch { return false; }
  return Boolean(state.confirmed.name?.trim() && state.confirmed.role?.trim() && state.confirmed.intro?.trim() &&
    completeGuidedDirection(state.direction) && state.selectedTemplate && !state.pending && !state.correcting);
}

/** User-facing progress, never sent verbatim as a spoken greeting. */
export function nextVoiceInterviewStep(state: VoiceOnboarding): string {
  if (state.correcting) return `Correct ${exactLabels[state.correcting]} below, then submit the spelling before continuing.`;
  if (state.pending) return `Review ${exactLabels[state.pending.field]}: ${state.pending.value}.`;
  if (!state.confirmed.name?.trim()) return "What name should your portfolio show?";
  if (!state.confirmed.role?.trim()) return "What is your professional role?";
  if (!state.confirmed.intro?.trim()) return "How would you describe your work in a sentence or two?";
  try { parseCoreSkills(state.confirmed.skills ?? ""); } catch { return "Which two or three core skills describe your work?"; }
  if (!state.direction.goal) return "What should your portfolio help you achieve: win clients, showcase work, or find a role?";
  if (!state.selectedTemplate) return "Preview templates on the right, then confirm your choice before continuing.";
  return "Your portfolio details and template are ready. You can add education, a website link, or a first project, or create your private draft now.";
}
