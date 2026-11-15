"use client";

import React, { useEffect } from "react";
import { isCollectionTemplate, isLightTemplate } from "@/features/website-builder/domain/template-contracts";
import { ArrowLeft, ArrowUpRight, Wrench } from "lucide-react";
import Image from "next/image";
import type { SiteDocument } from "@/features/website-builder/domain/site-document";
import {
  InteractiveWebsiteToolRunner,
  resolveCatalogToolSlug,
  resolveToolVisualPalette,
} from "@/features/website-builder/tools/InteractiveWebsiteToolRunner";

export function PublicCaseStudy({
  document: siteDoc,
  portfolioSlug,
  project,
  basePath,
}: {
  document: SiteDocument;
  portfolioSlug: string;
  project: SiteDocument["content"]["projects"][number];
  basePath?: string;
}) {
  const path = basePath ?? `/p/${portfolioSlug}`;
  const gallery = project.mediaIds
    .map((id) => siteDoc.media.assets.find((asset) => asset.id === id))
    .filter((asset): asset is SiteDocument["media"]["assets"][number] => Boolean(asset));

  const template = siteDoc.design.template;
  const isTransferredCatalogTool = Boolean(resolveCatalogToolSlug(project));
  const isToolPage =
    isTransferredCatalogTool ||
    template === "doitwithai-flagship" ||
    template === "micro-saas-launchpad" ||
    project.role.toLowerCase().includes("tool") ||
    project.role.toLowerCase().includes("utility") ||
    project.caseStudySlug.includes("generator") ||
    project.caseStudySlug.includes("analyzer") ||
    project.caseStudySlug.includes("checker") ||
    project.caseStudySlug.includes("tool");

  const hasBlog = siteDoc.publishing.posts.some((p) => p.status === "published");
  const publishedPages = siteDoc.publishing.pages.filter((p) => p.status === "published");

  const effectiveMetaTitle = project.metaTitle?.trim() || `${project.title} | ${siteDoc.identity.name}`;
  const effectiveMetaDescription = project.metaDescription?.trim() || project.summary;

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.document.title = effectiveMetaTitle;
    if (effectiveMetaDescription) {
      let metaEl = window.document.querySelector<HTMLMetaElement>('meta[name="description"]');
      if (!metaEl) {
        metaEl = window.document.createElement("meta");
        metaEl.name = "description";
        window.document.head.appendChild(metaEl);
      }
      metaEl.content = effectiveMetaDescription;
    }
  }, [effectiveMetaTitle, effectiveMetaDescription]);

  const palette = resolveToolVisualPalette(project, siteDoc.design.accent, siteDoc.design.background);

  return (
    <main
      className={`website-builder-scope case-study-page bg-${siteDoc.design.background} template-${siteDoc.design.template} ${isCollectionTemplate(siteDoc.design.template) ? "collection-theme" : ""} ${isLightTemplate(siteDoc.design.template) || palette.isLight ? "light-theme" : ""}`}
      data-accent={siteDoc.design.accent}
      style={{
        background: palette.backgroundHex,
        color: palette.textPrimary,
      }}
    >
      <header
        className="case-study-nav"
        style={{
          borderBottom: `1px solid ${palette.accentHex}33`,
        }}
      >
        <a href={path} style={{ color: palette.textPrimary }}>
          <ArrowLeft size={16} />
          {siteDoc.identity.name}
        </a>
        <nav style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center" }}>
          <a href={path}>Home</a>
          {template !== "micro-saas-launchpad" && (
            <a href={`${path}/projects`} style={{ fontWeight: 700, color: palette.accentHex }}>
              {isToolPage ? `Tools (${siteDoc.content.projects.length})` : "All Projects"}
            </a>
          )}
          {hasBlog && <a href={`${path}/blog`}>Blog &amp; Guides</a>}
          {publishedPages.map((page) => (
            <a key={page.id} href={`${path}/pages/${page.slug}`}>
              {page.navigationLabel}
            </a>
          ))}
          <a href={`${path}#contact`}>Contact</a>
        </nav>
      </header>

      <article
        className="case-study-shell"
        style={{
          width: "100%",
          maxWidth: isToolPage ? "none" : "1180px",
          padding: isToolPage ? 0 : undefined,
          margin: "0 auto",
          display: "grid",
          gap: isToolPage ? "0" : "28px",
        }}
      >
        {!isToolPage && (
          <header className="case-study-hero">
            <p className="section-eyebrow" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <Wrench size={14} /> {project.role || "PROJECT CASE STUDY"}
            </p>
            <h1>{project.title}</h1>
            <p>{project.summary}</p>
            <dl>
              {project.role && (
                <div>
                  <dt>Category</dt>
                  <dd>{project.role}</dd>
                </div>
              )}
              {project.period && (
                <div>
                  <dt>Period</dt>
                  <dd>{project.period}</dd>
                </div>
              )}
              {project.technologies.length > 0 && (
                <div>
                  <dt>Capabilities</dt>
                  <dd>{project.technologies.join(" · ")}</dd>
                </div>
              )}
            </dl>
          </header>
        )}

        {isToolPage && (
          <section
            aria-label={`Interactive ${project.title} landing page`}
            style={{ width: "100%" }}
          >
            <InteractiveWebsiteToolRunner
              tool={project}
              siteName={siteDoc.identity.name}
              siteSlug={portfolioSlug}
              publicBasePath={path}
              siteAccent={siteDoc.design.accent}
              siteBackground={siteDoc.design.background}
            />
          </section>
        )}

        {!isToolPage && gallery[0] && (
          <figure className="case-study-cover">
            <Image
              src={gallery[0].url}
              alt={gallery[0].alt}
              fill
              sizes="(max-width: 900px) 94vw, 1120px"
              priority
              unoptimized
            />
          </figure>
        )}

        {!isToolPage && (
          <div className="case-study-story">
            {project.challenge && (
              <section>
                <p className="section-eyebrow">THE CHALLENGE</p>
                <h2>What needed to change</h2>
                <p>{project.challenge}</p>
              </section>
            )}
            {project.approach && (
              <section>
                <p className="section-eyebrow">THE APPROACH</p>
                <h2>How the work was shaped</h2>
                <p>{project.approach}</p>
              </section>
            )}
            {project.outcome && (
              <section>
                <p className="section-eyebrow">THE OUTCOME</p>
                <h2>What the work delivered</h2>
                <p>{project.outcome}</p>
              </section>
            )}
          </div>
        )}

        {!isToolPage && gallery.length > 1 && (
          <section className="case-study-gallery" aria-label="Project gallery">
            {gallery.slice(1).map((asset) => (
              <figure key={asset.id}>
                <Image src={asset.url} alt={asset.alt} fill sizes="(max-width: 720px) 94vw, 520px" unoptimized />
                <figcaption>{asset.alt}</figcaption>
              </figure>
            ))}
          </section>
        )}

        <footer
          className="case-study-footer"
          style={{
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
            ...(isToolPage
              ? { maxWidth: "1240px", width: "100%", margin: "0 auto", padding: "20px 24px 40px" }
              : {}),
          }}
        >
          <a href={template === "micro-saas-launchpad" ? path : `${path}/projects`} style={{ color: palette.accentHex }}>
            <ArrowLeft size={16} />
            {isToolPage
              ? template === "micro-saas-launchpad"
                ? `Back to ${siteDoc.identity.name} Home`
                : `Back to All ${siteDoc.content.projects.length} Tools`
              : "Back to all projects"}
          </a>
          {hasBlog && (
            <a href={`${path}/blog`} style={{ color: palette.accentHex, fontWeight: 700 }}>
              Read Supporting SEO Guides &amp; Tutorials →
            </a>
          )}
          {project.link && !isToolPage && (
            <a href={project.link} target="_blank" rel="noreferrer" style={{ color: palette.accentHex }}>
              Visit external link <ArrowUpRight size={15} />
            </a>
          )}
        </footer>
      </article>
    </main>
  );
}
