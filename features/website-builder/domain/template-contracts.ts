import type { SiteDocument } from "./site-document";
import { templateOptions } from "./site-document";
import { UNIFIED_WEBSITE_TEMPLATES, type WebsiteTemplateCategory } from "../ecosystem-bridge";

export { templateOptions };
export type TemplateId = (typeof templateOptions)[number];

export type TemplateContract = {
  id: TemplateId;
  name: string;
  category: WebsiteTemplateCategory;
  categoryLabel: string;
  isDefault?: boolean;
  mode: "2d" | "3d";
  description: string;
  audience: string;
  seoUseCase: string;
  presentation: {
    accent: SiteDocument["design"]["accent"];
    background: SiteDocument["design"]["background"];
    heroAlignment: SiteDocument["design"]["heroAlignment"];
    sceneFamily: SiteDocument["scene"]["family"];
    scenePreset: SiteDocument["scene"]["preset"];
    motion: SiteDocument["scene"]["motion"];
    intensity: number;
  };
};

const TEMPLATE_DISPLAY_OVERRIDES: Partial<
  Record<TemplateId, { name: string; description: string; audience: string }>
> = {
  "doitwithai-flagship": {
    name: "DoItWithAI Multi-Tool Directory & Publication",
    description:
      "Modeled on doitwithai.tools: pre-loaded with 5 AI SEO tools, 5 matching pillar blog posts, prompt vault, and 1-click access to 126+ catalog tools.",
    audience: "Multi-tool AI platforms, SEO directories, and editorial publications",
  },
  "micro-saas-launchpad": {
    name: "Single-Tool AI Website & Micro-SaaS Launchpad",
    description:
      "Built for promoting one standalone AI tool (pre-loaded with AI Meta Title & Description Generator, live SERP pixel preview, 3 pages, and 5 SEO blog posts).",
    audience: "Single-tool creators, micro-SaaS founders, and focused utility sites",
  },
};

export const TEMPLATE_CONTRACTS: readonly TemplateContract[] = UNIFIED_WEBSITE_TEMPLATES.map((t) => {
  const override = TEMPLATE_DISPLAY_OVERRIDES[t.id];
  return {
    id: t.id,
    name: override?.name ?? t.name,
    category: t.category,
    categoryLabel: t.categoryLabel,
    isDefault: t.isDefault,
    mode: t.mode,
    description: override?.description ?? t.description,
    audience: override?.audience ?? t.audience,
    seoUseCase: t.seoUseCase,
    presentation: {
      accent: t.presentation.accent,
      background: t.presentation.background,
      heroAlignment: t.presentation.heroAlignment,
      sceneFamily: t.presentation.sceneFamily,
      scenePreset: t.presentation.scenePreset,
      motion: t.presentation.motion,
      intensity: t.presentation.intensity,
    },
  };
});

export function getTemplateContract(id: TemplateId): TemplateContract {
  return TEMPLATE_CONTRACTS.find((template) => template.id === id) ?? TEMPLATE_CONTRACTS[0];
}

export function applyTemplatePresentation(document: SiteDocument, id: TemplateId): SiteDocument {
  const { presentation } = getTemplateContract(id);
  return {
    ...document,
    design: {
      template: id,
      accent: presentation.accent,
      background: presentation.background,
      heroAlignment: presentation.heroAlignment,
    },
    scene: {
      ...document.scene,
      family: presentation.sceneFamily,
      preset: presentation.scenePreset,
      motion: presentation.motion,
      intensity: presentation.intensity,
      focusedSkill: id === "velocity-atelier" ? null : document.scene.focusedSkill,
    },
  };
}

export function isFlatTemplate(id: string): boolean {
  const found = TEMPLATE_CONTRACTS.find((t) => t.id === id);
  return found ? found.mode === "2d" : true;
}

export function isBlogFirstTemplate(id: string): boolean {
  const found = TEMPLATE_CONTRACTS.find((t) => t.id === id);
  return found?.category === "blog-editorial";
}

/**
 * Strictly the 3 original Voxfolio collection layouts (`rose-studio`, `midnight-bento`, `olive-journal`).
 * Do NOT include the 7 DoItWithAI Flagship templates here, so they render via `EditorialFlagshipHero`
 * and `EditorialFlagshipSections` instead of falling back to `rose-studio`.
 */
export function isCollectionTemplate(id: string): boolean {
  return ["rose-studio", "midnight-bento", "olive-journal"].includes(id);
}

export function isEditorialFlagshipTemplate(id: string): boolean {
  return [
    "doitwithai-flagship",
    "authority-niche-blog",
    "creator-newsletter-hub",
    "founder-authority-brand",
    "consultant-lead-engine",
    "micro-saas-launchpad",
    "startup-service-agency",
  ].includes(id);
}

export function isLightTemplate(id: string): boolean {
  return ["authority-niche-blog", "professional-2d", "rose-studio", "olive-journal"].includes(id);
}
