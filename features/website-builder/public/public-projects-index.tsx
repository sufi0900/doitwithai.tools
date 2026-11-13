import { isCollectionTemplate, isLightTemplate } from "@/features/website-builder/domain/template-contracts";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import type { SiteDocument } from "@/features/website-builder/domain/site-document";
import { projectsForPresentation } from "@/features/website-builder/domain/opportunity";

export function PublicProjectsIndex({ document, portfolioSlug, basePath }: { document: SiteDocument; portfolioSlug: string; basePath?: string }) {
  const path = basePath ?? `/p/${portfolioSlug}`;
  const projects = projectsForPresentation(document);
  return <main className={`website-builder-scope published-content-page bg-${document.design.background} template-${document.design.template} ${isCollectionTemplate(document.design.template) ? "collection-theme" : ""} ${isLightTemplate(document.design.template) ? "light-theme" : ""}`} data-accent={document.design.accent}>
    <header className="case-study-nav"><a href={path}><ArrowLeft size={16} />{document.identity.name}</a></header>
    <section className="projects-index"><header><p className="section-eyebrow">SELECTED WORK</p><h1>Projects and case studies</h1><p>A complete collection of work by {document.identity.name}.</p></header><div>{projects.map((project) => { const cover = project.mediaIds.map((id) => document.media.assets.find((asset) => asset.id === id)).find(Boolean); return <article key={project.id}>{cover && <div><Image src={cover.url} alt={cover.alt} fill sizes="(max-width: 760px) 94vw, 430px" unoptimized /></div>}<section><span>{project.period || "Project"}</span><h2>{project.title}</h2><p>{project.summary}</p><div>{project.technologies.map((technology) => <em key={technology}>{technology}</em>)}</div>{project.caseStudySlug && <a href={`${path}/projects/${project.caseStudySlug}`}>Read case study <ArrowUpRight size={15} /></a>}</section></article>; })}</div></section>
  </main>;
}
