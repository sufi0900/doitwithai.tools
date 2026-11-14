"use client";

import React from "react";
import { isCollectionTemplate, isLightTemplate } from "@/features/website-builder/domain/template-contracts";
import { ArrowLeft, Wrench } from "lucide-react";
import Image from "next/image";
import type { SiteDocument } from "@/features/website-builder/domain/site-document";
import { InteractiveWebsiteToolRunner } from "@/features/website-builder/tools/InteractiveWebsiteToolRunner";

export function PublicCaseStudy({
  document,
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
    .map((id) => document.media.assets.find((asset) => asset.id === id))
    .filter((asset): asset is SiteDocument["media"]["assets"][number] => Boolean(asset));

  const template = document.design.template;
  const isToolPage =
    template === "doitwithai-flagship" ||
    template === "micro-saas-launchpad" ||
    project.role.toLowerCase().includes("tool") ||
    project.role.toLowerCase().includes("utility") ||
    project.caseStudySlug.includes("generator") ||
    project.caseStudySlug.includes("analyzer") ||
    project.caseStudySlug.includes("checker") ||
    project.caseStudySlug.includes("tool");

  const hasBlog = document.publishing.posts.some((p) => p.status === "published");
  const publishedPages = document.publishing.pages.filter((p) => p.status === "published");

  return (
    <main
      className={`website-builder-scope case-study-page bg-${document.design.background} template-${document.design.template} ${isCollectionTemplate(document.design.template) ? "collection-theme" : ""} ${isLightTemplate(document.design.template) ? "light-theme" : ""}`}
      data-accent={document.design.accent}
    >
      <header className="case-study-nav">
        <a href={path}>
          <ArrowLeft size={16} />
          {document.identity.name}
        </a>
        <nav style={{ display: "flex", gap: "14px", flexWrap: "wrap", alignItems: "center" }}>
          {template !== "micro-saas-launchpad" && (
            <a href={`${path}/projects`} style={{ fontWeight: 700, color: "#38bdf8" }}>
              {isToolPage ? `🧰 All Tools (${document.content.projects.length})` : "All Projects"}
            </a>
          )}
          {hasBlog && <a href={`${path}/blog`}>Blog &amp; Guides</a>}
          {publishedPages.map((page) => (
            <a key={page.id} href={`${path}/pages/${page.slug}`}>
              {page.navigationLabel}
            </a>
          ))}
        </nav>
      </header>

      <article className="case-study-shell" style={{ maxWidth: "1180px", margin: "0 auto", display: "grid", gap: "28px" }}>
        <header className="case-study-hero">
          <p className="section-eyebrow" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
            {isToolPage ? (
              <>
                <Wrench size={14} /> LIVE IN-SITE AI TOOL · {project.role || "FREE BROWSER UTILITY"}
              </>
            ) : (
              "PROJECT CASE STUDY"
            )}
          </p>
          <h1>{project.title}</h1>
          <p>{project.summary}</p>
          <dl>
            {project.role && (
              <div>
                <dt>{isToolPage ? "Category" : "Role"}</dt>
                <dd>{project.role}</dd>
              </div>
            )}
            {project.period && (
              <div>
                <dt>{isToolPage ? "Status" : "Period"}</dt>
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

        {isToolPage && (
          <section aria-label={`Interactive ${project.title} workspace`}>
            <InteractiveWebsiteToolRunner
              tool={project}
              siteName={document.identity.name}
              siteSlug={portfolioSlug}
              allTools={document.content.projects.length > 1 ? document.content.projects : undefined}
            />
          </section>
        )}

        {gallery[0] && (
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

        <div className="case-study-story">
          {project.challenge && (
            <section>
              <p className="section-eyebrow">{isToolPage ? "WHY THIS TOOL MATTERS" : "THE CHALLENGE"}</p>
              <h2>{isToolPage ? "The SEO & workflow bottleneck it solves" : "What needed to change"}</h2>
              <p>{project.challenge}</p>
            </section>
          )}
          {project.approach && (
            <section>
              <p className="section-eyebrow">{isToolPage ? "HOW THE ENGINE WORKS" : "THE APPROACH"}</p>
              <h2>{isToolPage ? "Under-the-hood optimization methodology" : "How the work was shaped"}</h2>
              <p>{project.approach}</p>
            </section>
          )}
          {project.outcome && (
            <section>
              <p className="section-eyebrow">{isToolPage ? "VERIFIED OUTPUTS" : "THE OUTCOME"}</p>
              <h2>{isToolPage ? "What you get on every run" : "What the work delivered"}</h2>
              <p>{project.outcome}</p>
            </section>
          )}
        </div>

        {gallery.length > 1 && (
          <section className="case-study-gallery" aria-label="Project gallery">
            {gallery.slice(1).map((asset) => (
              <figure key={asset.id}>
                <Image src={asset.url} alt={asset.alt} fill sizes="(max-width: 720px) 94vw, 520px" unoptimized />
                <figcaption>{asset.alt}</figcaption>
              </figure>
            ))}
          </section>
        )}

        <footer className="case-study-footer" style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <a href={template === "micro-saas-launchpad" ? path : `${path}/projects`}>
            <ArrowLeft size={16} />
            {isToolPage
              ? template === "micro-saas-launchpad"
                ? `Back to ${document.identity.name} Home`
                : `Back to All ${document.content.projects.length} Tools`
              : "Back to all projects"}
          </a>
          {hasBlog && (
            <a href={`${path}/blog`}>Explore companion SEO guides &amp; articles →</a>
          )}
        </footer>
      </article>
    </main>
  );
}
