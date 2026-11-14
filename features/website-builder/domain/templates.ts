import { type CvProvenance, type SiteDocument } from "./site-document";
import { applyGuidedInterview, type GuidedInterview } from "./guided-interview";
import { TEMPLATE_CONTRACTS, isFlatTemplate, applyTemplatePresentation, type TemplateId } from "./template-contracts";
import { getTemplateDefaultDocument } from "./template-defaults";

export type PortfolioTemplate = {
  id: string;
  name: string;
  description: string;
  mode: "3d" | "2d";
  audience: string;
  document: SiteDocument;
};

export const PORTFOLIO_TEMPLATES: PortfolioTemplate[] = [
  ...TEMPLATE_CONTRACTS.map((template) => ({
    id: template.id,
    name: template.name,
    description: template.description,
    mode: isFlatTemplate(template.id) ? ("2d" as const) : ("3d" as const),
    audience: template.audience,
    document: getTemplateDefaultDocument(template.id),
  })),
];

export function getTemplate(id: string) {
  return PORTFOLIO_TEMPLATES.find((template) => template.id === id);
}

export function buildGuidedDocument(input: {
  name: string;
  role: string;
  intro: string;
  skills?: string[];
  education?: string[];
  website?: string;
  firstProject?: { title: string; summary: string };
  style: "creative" | "technical" | "minimal";
  templateId?: TemplateId;
  projectId?: string;
  cv?: CvProvenance;
  interview?: GuidedInterview;
}): SiteDocument {
  const templateId: TemplateId =
    input.templateId ??
    (input.style === "technical"
      ? "architectural-grid"
      : input.style === "minimal"
        ? "editorial-depth"
        : "cinematic-orbit");
  const template = getTemplate(templateId) ?? PORTFOLIO_TEMPLATES[0];
  const approved = input.cv?.approvedFacts ?? [];
  const fact = (kind: "name" | "role" | "intro") =>
    approved.find((item) => item.kind === kind)?.value;
  const cvSkills = approved
    .filter((item) => item.kind === "skill")
    .slice(0, 8)
    .map((item, index) => ({
      id: `cv-skill-${index + 1}`,
      label: item.value.slice(0, 32),
      level: 4,
    }));
  const suppliedSkills = (input.skills ?? [])
    .slice(0, 8)
    .map((label, index) => ({
      id: `guided-skill-${index + 1}`,
      label: label.slice(0, 32),
      level: 3,
    }));
  const selectedSkills = cvSkills.length
    ? cvSkills
    : suppliedSkills.length
      ? suppliedSkills
      : template.document.skills;
  const cvEducation = approved
    .filter((item) => item.kind === "education")
    .map((item) => item.value);
  const education = (cvEducation.length ? cvEducation : input.education ?? [])
    .slice(0, 8)
    .map((credential, index) => ({
      id: `education-${index + 1}`,
      credential: credential.slice(0, 140),
      institution: "",
      period: "",
      summary: "",
    }));
  const customFirstProject = input.firstProject
    ? [
        {
          id: crypto.randomUUID(),
          title: input.firstProject.title,
          summary: input.firstProject.summary,
          technologies: [],
          link: "",
          caseStudySlug:
            input.firstProject.title
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-|-$/g, "")
              .slice(0, 70) || "first-project",
          role: "",
          period: "",
          challenge: "",
          approach: "",
          outcome: "",
          mediaIds: [],
        },
      ]
    : template.document.content.projects;

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
    skills: selectedSkills,
    content: {
      ...template.document.content,
      about: {
        heading: template.document.content.about.heading || "About",
        body: (fact("intro") ?? input.intro).slice(0, 900),
      },
      experience: template.document.content.experience,
      education: education.length ? education : template.document.content.education,
      projects: customFirstProject,
      contact: {
        ...template.document.content.contact,
        socials: input.website
          ? [{ id: crypto.randomUUID(), platform: "website", url: input.website }]
          : template.document.content.contact.socials,
      },
    },
    publishing: template.document.publishing,
    provenance: input.cv ? { cv: input.cv } : undefined,
  };
  const guided = input.interview ? applyGuidedInterview(document, input.interview) : document;
  return input.templateId ? applyTemplatePresentation(guided, input.templateId) : guided;
}
