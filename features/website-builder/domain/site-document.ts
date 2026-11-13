import { z } from "zod";
import { richNodeSchema } from "./rich-document";

export const accentOptions = ["indigo", "cyan", "violet", "coral", "lime", "rose", "blue", "olive"] as const;
export const backgroundOptions = ["obsidian", "midnight", "ink", "plum", "cloud", "ivory"] as const;
export const alignmentOptions = ["left", "center", "right"] as const;
export const scenePresetOptions = ["cosmic", "architect", "minimal"] as const;
export const motionOptions = ["calm", "dynamic", "still"] as const;
export const templateOptions = ["doitwithai-flagship", "authority-niche-blog", "olive-journal", "creator-newsletter-hub", "founder-authority-brand", "consultant-lead-engine", "rose-studio", "professional-2d", "micro-saas-launchpad", "midnight-bento", "startup-service-agency", "cinematic-orbit", "architectural-grid", "editorial-depth", "kinetic-gallery", "velocity-atelier"] as const;
export const sceneFamilyOptions = ["doitwithai-editorial-grid", "orbital-showcase", "constellation-field", "kinetic-gallery", "velocity-roadster", "professional-2d"] as const;
export const cvFactKindOptions = ["name", "role", "intro", "skill", "education", "experience"] as const;
export const portfolioSectionOptions = ["about", "experience", "skills", "projects", "contact"] as const;
export const structuredBlockTypeOptions = ["heading", "paragraph", "quote", "list", "ordered-list", "image"] as const;
export const socialPlatformOptions = ["facebook", "instagram", "linkedin", "x", "youtube", "tiktok", "github", "website", "medium", "pinterest"] as const;
export const opportunityStatusOptions = ["canonical", "draft", "review", "published", "archived"] as const;
export const opportunityVisibilityOptions = ["private", "shared", "public"] as const;
export const opportunityTypeOptions = ["freelance-proposal", "hackathon-submission", "accelerator-application", "partnership", "job-application", "contract-role", "custom"] as const;
export type OpportunityType = typeof opportunityTypeOptions[number];

const publicHttpUrl = z.string().url().refine((value) => value.startsWith("https://") || value.startsWith("http://"), "Use an http or https URL.");

export const structuredBlockSchema = z.object({
  id: z.string().min(1),
  type: z.enum(structuredBlockTypeOptions),
  text: z.string().trim().max(3000).default(""),
  headingLevel: z.enum(["h2", "h3", "h4", "h5", "h6"]).default("h2"),
  items: z.array(z.string().trim().min(1).max(300)).max(12).default([]),
  mediaId: z.string().max(120).default(""),
});

const publishableBaseSchema = z.object({
  id: z.string().min(1),
  title: z.string().trim().min(1).max(120),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(80),
  seoTitle: z.string().trim().max(70).default(""),
  seoDescription: z.string().trim().max(170).default(""),
  coverMediaId: z.string().max(120).default(""),
  status: z.enum(["draft", "published"]).default("draft"),
  publishedAt: z.string().nullable().default(null),
  blocks: z.array(structuredBlockSchema).max(200).default([]),
  richContent: richNodeSchema.optional(),
});

const customPageSchema = publishableBaseSchema.extend({
  navigationLabel: z.string().trim().min(1).max(40).default("Page"),
});

const blogPostSchema = publishableBaseSchema.extend({
  excerpt: z.string().trim().max(320).default(""),
  tags: z.array(z.string().trim().min(1).max(32)).max(8).default([]),
  sourceArticleProjectId: z.string().trim().max(120).optional(),
  pillarClusterSlug: z.string().trim().max(80).optional(),
});

const opportunitySchema = z.object({
  status: z.enum(opportunityStatusOptions).default("canonical"),
  canonicalProjectId: z.string().uuid().nullable().default(null),
  variantOfProjectId: z.string().uuid().nullable().default(null),
  sourceRevision: z.number().int().nonnegative().nullable().default(null),
  name: z.string().trim().max(80).default(""),
  type: z.enum(opportunityTypeOptions).default("custom"),
  title: z.string().trim().max(120).default(""),
  brief: z.string().trim().max(2_400).default(""),
  audience: z.string().trim().max(160).default(""),
  objective: z.string().trim().max(500).default(""),
  deadline: z.string().nullable().default(null),
  confidentiality: z.enum(["private", "public", "shared"]).default("private"),
  visibility: z.enum(opportunityVisibilityOptions).default("private"),
  slug: z.string().trim().max(80).default(""),
  includedProjectIds: z.array(z.string().min(1)).max(8).default([]),
  approvalNotes: z.string().trim().max(1_200).default(""),
  heroOverride: z.string().trim().max(220).default(""),
  projectOrder: z.array(z.string().min(1)).max(8).default([]),
  sourceSnapshot: z.object({
    name: z.string().trim().max(60),
    role: z.string().trim().max(80),
    intro: z.string().trim().max(220),
    aboutHeading: z.string().trim().max(80),
    aboutBody: z.string().trim().max(900),
    projectIds: z.array(z.string().min(1)).max(8),
  }).default({ name: "", role: "", intro: "", aboutHeading: "", aboutBody: "", projectIds: [] }),
}).default({ status: "canonical", canonicalProjectId: null, variantOfProjectId: null, sourceRevision: null, name: "", type: "custom", title: "", brief: "", audience: "", objective: "", deadline: null, confidentiality: "private", visibility: "private", slug: "", includedProjectIds: [], approvalNotes: "", heroOverride: "", projectOrder: [], sourceSnapshot: { name: "", role: "", intro: "", aboutHeading: "", aboutBody: "", projectIds: [] } });

export const DEFAULT_PORTFOLIO_CONTENT = {
  order: [...portfolioSectionOptions],
  visibility: { about: true, experience: true, skills: true, projects: true, contact: true },
  about: { heading: "About", body: "" },
  experience: [] as Array<{ id: string; role: string; organization: string; period: string; summary: string }>,
  education: [] as Array<{ id: string; credential: string; institution: string; period: string; summary: string }>,
  projects: [] as Array<{ id: string; title: string; summary: string; technologies: string[]; link: string; caseStudySlug: string; role: string; period: string; challenge: string; approach: string; outcome: string; mediaIds: string[] }>,
  contact: { heading: "Let’s build something useful", email: "", location: "", cta: "Start a conversation", socials: [] as Array<{ id: string; platform: typeof socialPlatformOptions[number]; url: string }> },
};

const portfolioContentSchema = z.object({
  order: z.array(z.enum(portfolioSectionOptions)).length(portfolioSectionOptions.length).refine((items) => new Set(items).size === portfolioSectionOptions.length, "Section order must contain each section once."),
  visibility: z.object({ about: z.boolean(), experience: z.boolean(), skills: z.boolean(), projects: z.boolean(), contact: z.boolean() }),
  about: z.object({ heading: z.string().trim().min(1).max(80), body: z.string().trim().max(900) }),
  experience: z.array(z.object({ id: z.string().min(1), role: z.string().trim().min(1).max(100), organization: z.string().trim().max(100), period: z.string().trim().max(80), summary: z.string().trim().max(500) })).max(8),
  education: z.array(z.object({ id: z.string().min(1), credential: z.string().trim().min(1).max(140), institution: z.string().trim().max(120), period: z.string().trim().max(80), summary: z.string().trim().max(500) })).max(8).default([]),
  projects: z.array(z.object({
    id: z.string().min(1),
    title: z.string().trim().min(1).max(100),
    summary: z.string().trim().max(500),
    technologies: z.array(z.string().trim().min(1).max(32)).max(8),
    link: z.union([z.literal(""), z.string().url()]),
    caseStudySlug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(80).or(z.literal("")).default(""),
    role: z.string().trim().max(100).default(""),
    period: z.string().trim().max(80).default(""),
    challenge: z.string().trim().max(1200).default(""),
    approach: z.string().trim().max(1800).default(""),
    outcome: z.string().trim().max(1200).default(""),
    mediaIds: z.array(z.string().min(1)).max(8).default([]),
  })).max(8),
  contact: z.object({ heading: z.string().trim().min(1).max(100), email: z.union([z.literal(""), z.string().email()]), location: z.string().trim().max(100), cta: z.string().trim().min(1).max(60), socials: z.array(z.object({ id: z.string().min(1), platform: z.enum(socialPlatformOptions), url: publicHttpUrl })).max(10).default([]) }),
});

export const approvedCvFactSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(cvFactKindOptions),
  value: z.string().trim().min(1).max(220),
  sourceExcerpt: z.string().trim().min(1).max(320),
});

export const cvProvenanceSchema = z.object({
  sourceId: z.string().min(1),
  fileName: z.string().min(1).max(180),
  mediaType: z.string().min(1).max(120),
  importedAt: z.string(),
  originalStored: z.literal(false),
  approvedFacts: z.array(approvedCvFactSchema).max(40),
});

export const siteDocumentSchema = z.object({
  schemaVersion: z.literal(1),
  projectId: z.string().min(1),
  revision: z.number().int().nonnegative(),
  updatedAt: z.string(),
  identity: z.object({
    name: z.string().trim().min(1).max(60),
    role: z.string().trim().min(1).max(80),
    intro: z.string().trim().min(1).max(220),
    availability: z.string().trim().min(1).max(80),
  }),
  design: z.object({
    template: z.enum(templateOptions).default("doitwithai-flagship"),
    accent: z.enum(accentOptions),
    background: z.enum(backgroundOptions),
    heroAlignment: z.enum(alignmentOptions),
  }),
  scene: z.object({
    family: z.enum(sceneFamilyOptions).default("doitwithai-editorial-grid"),
    preset: z.enum(scenePresetOptions),
    motion: z.enum(motionOptions),
    intensity: z.number().min(0.4).max(1.4),
    focusedSkill: z.string().nullable(),
  }),
  skills: z.array(z.object({ id: z.string(), label: z.string().min(1).max(32), level: z.number().min(1).max(5) })).max(8),
  content: portfolioContentSchema.default(DEFAULT_PORTFOLIO_CONTENT),
  media: z.object({
    headshotUrl: z.union([z.literal(""), z.string().url()]),
    headshotAlt: z.string().trim().max(160),
    assets: z.array(z.object({
      id: z.string().min(1),
      url: z.string().url(),
      storagePath: z.string().min(1).max(500),
      alt: z.string().trim().min(1).max(180),
      createdAt: z.string(),
    })).max(24).default([]),
  }).default({ headshotUrl: "", headshotAlt: "", assets: [] }),
  publishing: z.object({
    pages: z.array(customPageSchema).max(12).default([]),
    posts: z.array(blogPostSchema).max(24).default([]),
  }).default({ pages: [], posts: [] }),
  visitor: z.object({
    enabled: z.boolean().default(false),
    facts: z.array(z.object({ id: z.string().uuid(), text: z.string().trim().min(10).max(900), source: z.string().trim().min(1).max(120) })).max(24).default([]),
  }).default({ enabled: false, facts: [] }),
  opportunity: opportunitySchema,
  guidedInterview: z.object({
    goal: z.enum(["win-clients", "showcase-work", "find-role"]),
    audience: z.enum(["clients", "employers", "collaborators"]),
    tone: z.enum(["bold", "structured", "minimal"]),
    motion: z.enum(["immersive", "balanced", "reduced"]),
    emphasis: z.enum(["skills", "story", "results"]),
  }).optional(),
  provenance: z.object({ cv: cvProvenanceSchema.optional() }).optional(),
});

export type SiteDocument = z.infer<typeof siteDocumentSchema>;
export type Accent = SiteDocument["design"]["accent"];
export type Background = SiteDocument["design"]["background"];
export type HeroAlignment = SiteDocument["design"]["heroAlignment"];
export type ScenePreset = SiteDocument["scene"]["preset"];
export type MotionMode = SiteDocument["scene"]["motion"];
export type PortfolioSection = typeof portfolioSectionOptions[number];
export type ApprovedCvFact = z.infer<typeof approvedCvFactSchema>;
export type CvProvenance = z.infer<typeof cvProvenanceSchema>;

export const DEFAULT_SITE_DOCUMENT: SiteDocument = {
  schemaVersion: 1,
  projectId: "demo-portfolio",
  revision: 0,
  updatedAt: new Date(0).toISOString(),
  identity: {
    name: "Sufian Mustafa",
    role: "AI-Augmented Web Creator",
    intro: "I combine web engineering, search strategy and AI automation to turn complex ideas into useful digital products.",
    availability: "Available for selected projects",
  },
  design: { template: "doitwithai-flagship", accent: "indigo", background: "obsidian", heroAlignment: "left" },
  scene: { family: "doitwithai-editorial-grid", preset: "architect", motion: "calm", intensity: 0.65, focusedSkill: null },
  skills: [
    { id: "web", label: "Next.js", level: 5 },
    { id: "seo", label: "Technical SEO", level: 5 },
    { id: "ai", label: "AI Automation", level: 4 },
    { id: "content", label: "Content Systems", level: 4 },
    { id: "strategy", label: "Growth Strategy", level: 4 },
  ],
  content: {
    ...DEFAULT_PORTFOLIO_CONTENT,
    about: { heading: "About", body: "I design and build focused digital experiences where strategy, content, and engineering reinforce each other." },
    experience: [
      { id: "experience-1", role: "AI-Augmented Web Creator", organization: "Independent", period: "Current", summary: "Building reusable web systems that combine product thinking, search strategy, and responsible AI workflows." },
    ],
    education: [],
    projects: [
      { id: "project-1", title: "DoItWithAI Studio", summary: "A voice-and-AI website and blog builder with governed editing, revision history, and 1-click SEO publishing.", technologies: ["Next.js", "Supabase", "Three.js"], link: "", caseStudySlug: "doitwithai-studio", role: "Product architecture and implementation", period: "2026", challenge: "Turn website and blog creation into a safe, editable workflow without allowing AI or voice commands to bypass validation.", approach: "Built one typed document and command pipeline shared by manual editing, voice tools, revisions, restoration, and publication.", outcome: "Created a reusable foundation for governed website creation and immutable public releases.", mediaIds: [] },
    ],
    contact: { heading: "Let's build something useful", email: "", location: "Available remotely", cta: "Start a conversation", socials: [] },
  },
  media: { headshotUrl: "", headshotAlt: "", assets: [] },
  publishing: { pages: [], posts: [] },
  visitor: { enabled: false, facts: [] },
  opportunity: { status: "canonical", canonicalProjectId: null, variantOfProjectId: null, sourceRevision: null, name: "", type: "custom", title: "", brief: "", audience: "", objective: "", deadline: null, confidentiality: "private", visibility: "private", slug: "", includedProjectIds: [], approvalNotes: "", heroOverride: "", projectOrder: [], sourceSnapshot: { name: "", role: "", intro: "", aboutHeading: "", aboutBody: "", projectIds: [] } },
};

export function validateSiteDocument(value: unknown): SiteDocument {
  return siteDocumentSchema.parse(value);
}
