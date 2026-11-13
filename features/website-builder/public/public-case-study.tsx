import { isCollectionTemplate, isLightTemplate } from "@/features/website-builder/domain/template-contracts";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import type { SiteDocument } from "@/features/website-builder/domain/site-document";

export function PublicCaseStudy({ document, portfolioSlug, project, basePath }: { document: SiteDocument; portfolioSlug: string; project: SiteDocument["content"]["projects"][number]; basePath?: string }) {
  const path = basePath ?? `/p/${portfolioSlug}`;
  const gallery = project.mediaIds.map((id) => document.media.assets.find((asset) => asset.id === id)).filter((asset): asset is SiteDocument["media"]["assets"][number] => Boolean(asset));
  return <main className={`website-builder-scope case-study-page bg-${document.design.background} template-${document.design.template} ${isCollectionTemplate(document.design.template) ? "collection-theme" : ""} ${isLightTemplate(document.design.template) ? "light-theme" : ""}`} data-accent={document.design.accent}>
    <header className="case-study-nav"><a href={path}><ArrowLeft size={16} />{document.identity.name}</a>{project.link && <a href={project.link} target="_blank" rel="noreferrer">Visit project <ArrowUpRight size={15} /></a>}</header>
    <article className="case-study-shell">
      <header className="case-study-hero"><p className="section-eyebrow">PROJECT CASE STUDY</p><h1>{project.title}</h1><p>{project.summary}</p><dl>{project.role && <div><dt>Role</dt><dd>{project.role}</dd></div>}{project.period && <div><dt>Period</dt><dd>{project.period}</dd></div>}{project.technologies.length > 0 && <div><dt>Stack</dt><dd>{project.technologies.join(" · ")}</dd></div>}</dl></header>
      {gallery[0] && <figure className="case-study-cover"><Image src={gallery[0].url} alt={gallery[0].alt} fill sizes="(max-width: 900px) 94vw, 1120px" priority unoptimized /></figure>}
      <div className="case-study-story">
        {project.challenge && <section><p className="section-eyebrow">THE CHALLENGE</p><h2>What needed to change</h2><p>{project.challenge}</p></section>}
        {project.approach && <section><p className="section-eyebrow">THE APPROACH</p><h2>How the work was shaped</h2><p>{project.approach}</p></section>}
        {project.outcome && <section><p className="section-eyebrow">THE OUTCOME</p><h2>What the work delivered</h2><p>{project.outcome}</p></section>}
      </div>
      {gallery.length > 1 && <section className="case-study-gallery" aria-label="Project gallery">{gallery.slice(1).map((asset) => <figure key={asset.id}><Image src={asset.url} alt={asset.alt} fill sizes="(max-width: 720px) 94vw, 520px" unoptimized /><figcaption>{asset.alt}</figcaption></figure>)}</section>}
      <footer className="case-study-footer"><a href={`${path}#projects`}><ArrowLeft size={16} />Back to all projects</a></footer>
    </article>
  </main>;
}
