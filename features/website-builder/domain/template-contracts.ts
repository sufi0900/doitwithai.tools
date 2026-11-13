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

export const TEMPLATE_CONTRACTS: readonly TemplateContract[] = UNIFIED_WEBSITE_TEMPLATES.map((t) => ({
  id: t.id,
  name: t.name,
  category: t.category,
  categoryLabel: t.categoryLabel,
  isDefault: t.isDefault,
  mode: t.mode,
  description: t.description,
  audience: t.audience,
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
}));

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

export function isCollectionTemplate(id: string): boolean {
  return ["doitwithai-flagship", "authority-niche-blog", "creator-newsletter-hub", "rose-studio", "midnight-bento", "olive-journal", "micro-saas-launchpad"].includes(id);
}

export function isLightTemplate(id: string): boolean {
  return ["authority-niche-blog", "professional-2d", "rose-studio", "olive-journal"].includes(id);
}
