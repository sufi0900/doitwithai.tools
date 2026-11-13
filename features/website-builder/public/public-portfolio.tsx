"use client";

import { useEffect, useState } from "react";
import type { SiteDocument } from "@/features/website-builder/domain/site-document";
import { PortfolioNavigation, PortfolioSections } from "@/features/website-builder/portfolio/portfolio-sections";
import { SceneRenderer } from "@/features/website-builder/scene/scene-renderer";
import { ShareFeedbackWidget } from "./share-feedback-widget";
import { isFlatTemplate, isCollectionTemplate, isLightTemplate } from "@/features/website-builder/domain/template-contracts";
import { CollectionHero } from "@/features/website-builder/portfolio/collection-templates";
import { EditorialFlagshipHero, isEditorialFlagshipTemplate } from "@/features/website-builder/portfolio/editorial-flagship-templates";
import { ProfessionalHeroAside } from "@/features/website-builder/portfolio/professional-hero-aside";
import { VisitorVox } from "./visitor-vox";

const backgroundClass: Record<SiteDocument["design"]["background"], string> = {
  obsidian: "bg-obsidian",
  midnight: "bg-midnight",
  ink: "bg-ink",
  plum: "bg-plum",
  cloud: "bg-cloud",
  ivory: "bg-ivory",
};

export function PublicPortfolio({
  document,
  slug,
  basePath,
  shareToken,
  isShared,
}: { document: SiteDocument; slug: string; basePath?: string; shareToken?: string; isShared?: boolean }) {
  const path = basePath ?? `/p/${slug}`;
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(preference.matches);
    sync();
    preference.addEventListener("change", sync);
    return () => preference.removeEventListener("change", sync);
  }, []);
  const focusedSkill = document.skills.find((skill) => skill.id === document.scene.focusedSkill);
  const isLightTheme = isLightTemplate(document.design.template);
  const initials = document.identity.name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "AI";
  return (
    <main
      className={`website-builder-scope studio public-site template-${document.design.template} ${isCollectionTemplate(document.design.template) ? "collection-theme" : ""} ${backgroundClass[document.design.background] ?? "bg-obsidian"} ${isLightTheme ? "light-theme" : ""}`}
      data-accent={document.design.accent}
    >
      <header className="public-nav">
        <a className="public-identity" href="#">
          <i>{initials}</i>
          <strong>{document.identity.name}</strong>
        </a>
        <PortfolioNavigation document={document} publicBasePath={path} />
        {document.content.contact.email ? (
          <a className="public-contact-link" href="#contact">
            Contact
          </a>
        ) : (
          <span />
        )}
      </header>
      <div className="portfolio-preview" aria-label={`${document.identity.name}'s website`}>
        {isCollectionTemplate(document.design.template) ? (
          <CollectionHero document={document} publicBasePath={path} />
        ) : isEditorialFlagshipTemplate(document.design.template) ? (
          <EditorialFlagshipHero document={document} publicBasePath={path} />
        ) : (
          <section className={`portfolio-hero align-${document.design.heroAlignment}`}>
            <div className="ambient-grid" />
            <div className="portfolio-copy">
              <p className="availability">
                <i />
                {document.identity.availability}
              </p>
              <p className="kicker">
                {document.opportunity.status === "canonical"
                  ? "DIGITAL SITE & PORTFOLIO"
                  : document.opportunity.title || "OPPORTUNITY SITE"}
              </p>
              <h1>{document.identity.name}</h1>
              <h2>{document.identity.role}</h2>
              <p className="intro">{document.identity.intro}</p>
              <div className="hero-actions">
                <a href={`${path}/projects`}>View selected work</a>
                <a className="ghost" href="#contact">
                  Start a conversation
                </a>
              </div>
              {focusedSkill && (
                <div className="focus-card">
                  <span>FEATURED CAPABILITY</span>
                  <strong>{focusedSkill.label}</strong>
                  <p>Capability level {focusedSkill.level}/5</p>
                </div>
              )}
            </div>
            {document.design.template === "professional-2d" && <ProfessionalHeroAside document={document} />}
            {!isFlatTemplate(document.design.template) && (
              <div className="scene-stage">
                <SceneRenderer document={document} execute={() => undefined} reducedMotion={reducedMotion} />
              </div>
            )}
          </section>
        )}
        <PortfolioSections document={document} publicBasePath={path} />
      </div>
      <footer className="public-footer">
        <span>
          Built with <a href="/tools/ai-website-builder">DoItWithAI Studio</a>
        </span>
        <small>Published revision {document.revision}</small>
      </footer>
      {isShared && shareToken && <ShareFeedbackWidget shareToken={shareToken} />}
      {!isShared && document.opportunity.status === "canonical" && document.visitor.enabled && (
        <VisitorVox slug={slug} name={document.identity.name} />
      )}
    </main>
  );
}
