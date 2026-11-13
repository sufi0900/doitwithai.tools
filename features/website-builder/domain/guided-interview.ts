import { z } from "zod";
import type { SiteDocument } from "./site-document";

export const guidedInterviewSchema = z.object({
  goal: z.enum(["win-clients", "showcase-work", "find-role"]),
  audience: z.enum(["clients", "employers", "collaborators"]),
  tone: z.enum(["bold", "structured", "minimal"]),
  motion: z.enum(["immersive", "balanced", "reduced"]),
  emphasis: z.enum(["skills", "story", "results"]),
});

export type GuidedInterview = z.infer<typeof guidedInterviewSchema>;
export type GuidedInterviewKey = keyof GuidedInterview;

/** One intentional choice supplies internal defaults; earlier detailed answers stay intact. */
export function completeGuidedDirection(value: Partial<GuidedInterview>): GuidedInterview | null {
  if (!value.goal) return null;
  const defaults: Record<GuidedInterview["goal"], Omit<GuidedInterview, "goal">> = {
    "win-clients": { audience: "clients", tone: "bold", motion: "balanced", emphasis: "results" },
    "showcase-work": { audience: "collaborators", tone: "minimal", motion: "balanced", emphasis: "story" },
    "find-role": { audience: "employers", tone: "structured", motion: "reduced", emphasis: "skills" },
  };
  return guidedInterviewSchema.parse({ ...defaults[value.goal], ...value });
}

export const GUIDED_INTERVIEW_STEPS: Array<{
  key: GuidedInterviewKey;
  prompt: string;
  help: string;
  options: Array<{ value: string; label: string; description: string }>;
}> = [
  { key: "goal", prompt: "What should this portfolio help you achieve?", help: "This controls the primary professional signal without rewriting your CV facts.", options: [
    { value: "win-clients", label: "Win clients", description: "Lead with service confidence and availability." },
    { value: "showcase-work", label: "Showcase my work", description: "Balance craft, capabilities and exploration." },
    { value: "find-role", label: "Find a role", description: "Prioritize recruiter-friendly clarity." },
  ] },
  { key: "audience", prompt: "Who needs to understand your value first?", help: "The interview uses one primary audience to prevent a vague portfolio.", options: [
    { value: "clients", label: "Potential clients", description: "Clear outcomes and project readiness." },
    { value: "employers", label: "Hiring teams", description: "Direct professional evidence and skills." },
    { value: "collaborators", label: "Collaborators", description: "Capabilities, ideas and complementary strengths." },
  ] },
  { key: "tone", prompt: "How should the portfolio feel?", help: "This selects a governed visual system rather than generating arbitrary styling.", options: [
    { value: "bold", label: "Bold and cinematic", description: "High contrast with a strong visual signal." },
    { value: "structured", label: "Technical and structured", description: "Precise hierarchy and architectural rhythm." },
    { value: "minimal", label: "Minimal and restrained", description: "Quiet presentation with reduced visual noise." },
  ] },
  { key: "motion", prompt: "How much motion is appropriate?", help: "Visitors' reduced-motion preferences still override this choice.", options: [
    { value: "immersive", label: "Immersive", description: "Dynamic scene for visually expressive work." },
    { value: "balanced", label: "Balanced", description: "Calm motion that supports the content." },
    { value: "reduced", label: "Reduced", description: "A stable, low-motion professional presentation." },
  ] },
  { key: "emphasis", prompt: "What should visitors remember most?", help: "CV-grounded facts remain unchanged; this only changes presentation priority.", options: [
    { value: "skills", label: "Core skills", description: "Give the skills system the strongest scene focus." },
    { value: "story", label: "Professional story", description: "Keep the introduction visually central." },
    { value: "results", label: "Professional outcomes", description: "Use a confident, action-oriented presentation." },
  ] },
];

export function applyGuidedInterview(document: SiteDocument, interview: GuidedInterview): SiteDocument {
  const availability = interview.goal === "win-clients"
    ? "Available for selected client projects"
    : interview.goal === "find-role"
      ? "Open to relevant professional opportunities"
      : "Available for collaborations and selected projects";
  const toneDesign = interview.tone === "structured"
    ? { accent: "violet" as const, background: "ink" as const, heroAlignment: "left" as const, preset: "architect" as const }
    : interview.tone === "minimal"
      ? { accent: "lime" as const, background: "cloud" as const, heroAlignment: "center" as const, preset: "minimal" as const }
      : { accent: "cyan" as const, background: "midnight" as const, heroAlignment: "left" as const, preset: "cosmic" as const };
  const sceneMotion = interview.motion === "immersive" ? "dynamic" : interview.motion === "reduced" ? "still" : "calm";
  const intensity = interview.motion === "immersive" ? 1.15 : interview.motion === "reduced" ? 0.5 : 0.85;
  return {
    ...document,
    identity: { ...document.identity, availability },
    design: { ...document.design, accent: toneDesign.accent, background: toneDesign.background, heroAlignment: toneDesign.heroAlignment },
    scene: {
      ...document.scene,
      preset: toneDesign.preset,
      motion: sceneMotion,
      intensity,
      focusedSkill: interview.emphasis === "skills" ? document.skills[0]?.id ?? null : null,
    },
    guidedInterview: interview,
  };
}
