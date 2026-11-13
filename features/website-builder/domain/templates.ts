import { DEFAULT_SITE_DOCUMENT, type CvProvenance, type SiteDocument } from "./site-document";
import { applyGuidedInterview, type GuidedInterview } from "./guided-interview";
import { TEMPLATE_CONTRACTS, isFlatTemplate, applyTemplatePresentation, type TemplateId } from "./template-contracts";

export type PortfolioTemplate = {
  id: string;
  name: string;
  description: string;
  mode: "3d" | "2d";
  audience: string;
  document: SiteDocument;
};

const base = (overrides: Partial<SiteDocument>): SiteDocument => ({
  ...DEFAULT_SITE_DOCUMENT,
  ...overrides,
  identity: { ...DEFAULT_SITE_DOCUMENT.identity, ...overrides.identity },
  design: { ...DEFAULT_SITE_DOCUMENT.design, ...overrides.design },
  scene: { ...DEFAULT_SITE_DOCUMENT.scene, ...overrides.scene },
  skills: overrides.skills ?? DEFAULT_SITE_DOCUMENT.skills,
});

export const PORTFOLIO_TEMPLATES: PortfolioTemplate[] = [
  ...TEMPLATE_CONTRACTS.map((template) => ({ id: template.id, name: template.name, description: template.description, mode: isFlatTemplate(template.id) ? "2d" as const : "3d" as const, audience: template.audience, document: base({ design: { template: template.id, accent: template.presentation.accent, background: template.presentation.background, heroAlignment: template.presentation.heroAlignment }, scene: { family: template.presentation.sceneFamily, preset: template.presentation.scenePreset, motion: template.presentation.motion, intensity: template.presentation.intensity, focusedSkill: null } }) })),
];

export function getTemplate(id: string) {
  return PORTFOLIO_TEMPLATES.find((template) => template.id === id);
}

export function buildGuidedDocument(input: { name: string; role: string; intro: string; skills?: string[]; education?: string[]; website?: string; firstProject?: { title: string; summary: string }; style: "creative" | "technical" | "minimal"; templateId?: TemplateId; projectId?: string; cv?: CvProvenance; interview?: GuidedInterview }): SiteDocument {
  const templateId: TemplateId = input.templateId ?? (input.style === "technical" ? "architectural-grid" : input.style === "minimal" ? "editorial-depth" : "cinematic-orbit");
  const template = getTemplate(templateId)!;
  const approved = input.cv?.approvedFacts ?? [];
  const fact = (kind: "name" | "role" | "intro") => approved.find((item) => item.kind === kind)?.value;
  const cvSkills = approved.filter((item) => item.kind === "skill").slice(0, 8).map((item, index) => ({
    id: `cv-skill-${index + 1}`,
    label: item.value.slice(0, 32),
    level: 4,
  }));
  const suppliedSkills = (input.skills ?? []).slice(0, 8).map((label, index) => ({ id: `guided-skill-${index + 1}`, label: label.slice(0, 32), level: 3 }));
  const selectedSkills = cvSkills.length ? cvSkills : suppliedSkills;
  const skills = selectedSkills;
  const cvEducation = approved.filter((item) => item.kind === "education").map((item) => item.value);
  const education = (cvEducation.length ? cvEducation : input.education ?? []).slice(0, 8).map((credential, index) => ({ id: `education-${index + 1}`, credential: credential.slice(0, 140), institution: "", period: "", summary: "" }));
  const document: SiteDocument = {
    ...template.document,
    projectId: input.projectId ?? crypto.randomUUID(),
    updatedAt: new Date().toISOString(),
    identity: {
      ...template.document.identity,
      name: fact("name") ?? input.name,
      role: fact("role") ?? input.role,
      intro: fact("intro") ?? input.intro,
    },
    skills,
    content: {
      ...template.document.content,
      about: { heading: "About", body: (fact("intro") ?? input.intro).slice(0,900) },
      experience: [], education, projects: input.firstProject ? [{ id: crypto.randomUUID(), title: input.firstProject.title, summary: input.firstProject.summary, technologies: [], link: "", caseStudySlug: input.firstProject.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0,70) || "first-project", role: "", period: "", challenge: "", approach: "", outcome: "", mediaIds: [] }] : [],
      contact: { ...template.document.content.contact, email: "", location: "", socials: input.website ? [{ id: crypto.randomUUID(), platform: "website", url: input.website }] : [] },
    },
    provenance: input.cv ? { cv: input.cv } : undefined,
  };
  const guided = input.interview ? applyGuidedInterview(document, input.interview) : document;
  return input.templateId ? applyTemplatePresentation(guided, input.templateId) : guided;
}
