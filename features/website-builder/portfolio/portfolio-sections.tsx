import { HomepageJournal } from "./homepage-journal";
import { isBlogFirstTemplate, isCollectionTemplate } from "@/features/website-builder/domain/template-contracts";
import { CollectionSections } from "./collection-templates";
import { EditorialFlagshipSections, isEditorialFlagshipTemplate } from "./editorial-flagship-templates";
import { ArrowUpRight, Globe2, Mail, MapPin } from "lucide-react";
import Image from "next/image";
import type { PortfolioSection, SiteDocument } from "@/features/website-builder/domain/site-document";
import { projectsForPresentation } from "@/features/website-builder/domain/opportunity";
import { CinematicBackdrop } from "./cinematic-backdrop";
import { ProfessionalPortfolioSections } from "./professional-portfolio-sections";
import { CinemaRoot, SectionScene, type CinemaKind } from "./section-cinema";
import { isCinematicTemplate } from "./section-cinema-math";

const sectionLabels: Record<PortfolioSection, string> = {
  about: "About",
  experience: "Experience",
  skills: "Skills",
  projects: "Projects",
  contact: "Contact",
};

export function PortfolioNavigation({ document, publicBasePath, onNavigateSection, onNavigatePage, onNavigateBlog }: { document: SiteDocument; publicBasePath?: string; onNavigateSection?: (section: PortfolioSection) => void; onNavigatePage?: (pageId: string) => void; onNavigateBlog?: () => void }) {
  return <nav className="portfolio-site-nav" aria-label="Portfolio sections">
    {document.content.order.filter((section) => document.content.visibility[section]).map((section) => <a key={section} href={publicBasePath && section === "projects" ? `${publicBasePath}/projects` : `#${section}`} onClick={onNavigateSection ? (event) => { event.preventDefault(); onNavigateSection(section); } : undefined}>{sectionLabels[section]}</a>)}
    {publicBasePath && document.publishing.pages.filter((page) => page.status === "published").map((page) => <a key={page.id} href={`${publicBasePath}/pages/${page.slug}`}>{page.navigationLabel}</a>)}
    {publicBasePath && document.publishing.posts.some((post) => post.status === "published") && <a href={`${publicBasePath}/blog`}>Blog</a>}
    {!publicBasePath && onNavigatePage && document.publishing.pages.map((page) => <button type="button" key={page.id} onClick={() => onNavigatePage(page.id)}>{page.navigationLabel}</button>)}
    {!publicBasePath && onNavigateBlog && document.publishing.posts.length > 0 && <button type="button" onClick={onNavigateBlog}>Blog</button>}
  </nav>;
}

export function PortfolioSections(props: { document: SiteDocument; editing?: boolean; publicBasePath?: string; onOpenPage?: (id: string) => void; onOpenPost?: (id: string) => void }) {
  if (isEditorialFlagshipTemplate(props.document.design.template)) {
    return (
      <EditorialFlagshipSections
        document={props.document}
        editing={props.editing}
        publicBasePath={props.publicBasePath}
        onOpenPage={props.onOpenPage}
        onOpenPost={props.onOpenPost}
      />
    );
  }
  const blogFirst = isBlogFirstTemplate(props.document.design.template);
  return blogFirst
    ? <><HomepageJournal document={props.document} publicBasePath={props.publicBasePath} onOpenPost={props.onOpenPost} /><PortfolioSectionBody {...props} /></>
    : <><PortfolioSectionBody {...props} /><HomepageJournal document={props.document} publicBasePath={props.publicBasePath} onOpenPost={props.onOpenPost} /></>;
}

function PortfolioSectionBody({ document, editing = false, publicBasePath, onOpenPage }: { document: SiteDocument; editing?: boolean; publicBasePath?: string; onOpenPage?: (pageId: string) => void }) {
  if (isCollectionTemplate(document.design.template)) return <CollectionSections document={document} editing={editing} publicBasePath={publicBasePath} onOpenPage={onOpenPage} />;
  if (document.design.template === "professional-2d") return <ProfessionalPortfolioSections document={document} editing={editing} publicBasePath={publicBasePath} onOpenPage={onOpenPage} />;
  const cinematic = isCinematicTemplate(document.design.template);
  return <CinemaRoot enabled={cinematic} template={document.design.template} motion={document.scene.motion} intensity={document.scene.intensity}>
    {document.content.order.map((section) => document.content.visibility[section] ? <Section key={section} section={section} document={document} editing={editing} cinematic={cinematic} publicBasePath={publicBasePath} onOpenPage={onOpenPage} /> : null)}
  </CinemaRoot>;
}

function Section({ section, document, editing, cinematic, publicBasePath, onOpenPage }: { section: PortfolioSection; document: SiteDocument; editing: boolean; cinematic: boolean; publicBasePath?: string; onOpenPage?: (pageId: string) => void }) {
  if (section === "about") {
    const body = document.content.about.body || document.identity.intro;
    const aboutPage = document.publishing.pages.find((page) => page.slug === "about" && (!publicBasePath || page.status === "published"));
    return <section id="about" className={`portfolio-section about-section ${document.media.headshotUrl ? "has-headshot" : ""}`}><SectionHeading eyebrow="PROFILE" title={document.content.about.heading} kind="about" cinematic={cinematic} template={document.design.template} /><div className="about-layout">{document.media.headshotUrl && <div className="about-headshot"><Image src={document.media.headshotUrl} alt={document.media.headshotAlt || `${document.identity.name} headshot`} fill sizes="(max-width: 780px) 78vw, 340px" unoptimized /></div>}<div><p className="about-copy">{body}</p>{aboutPage && (publicBasePath ? <a className="section-detail-link" href={`${publicBasePath}/pages/about`}>Read full profile <ArrowUpRight size={15} /></a> : onOpenPage ? <button type="button" className="section-detail-link preview-detail-button" onClick={() => onOpenPage(aboutPage.id)}>Preview detailed About <ArrowUpRight size={15} /></button> : null)}</div></div></section>;
  }
  if (section === "experience") {
    const hasJourney = document.content.experience.length || document.content.education.length;
    if (!hasJourney && !editing) return null;
    return <section id="experience" className="portfolio-section"><SectionHeading eyebrow="JOURNEY" title="Experience & education" kind="experience" cinematic={cinematic} template={document.design.template} />{hasJourney ? <div className="experience-list">{document.content.experience.map((item) => <article key={item.id}><div><span>{item.period || "Present"}</span><i /></div><div><h3>{item.role}</h3>{item.organization && <strong>{item.organization}</strong>}<p>{item.summary}</p></div></article>)}{document.content.education.map((item) => <article key={item.id} className="education-entry"><div><span>{item.period || "Education"}</span><i /></div><div><h3>{item.credential}</h3>{item.institution && <strong>{item.institution}</strong>}<p>{item.summary}</p></div></article>)}</div> : <EmptyState label="Add experience or education entries from the Content editor." />}</section>;
  }
  if (section === "skills") return <section id="skills" className="portfolio-section"><SectionHeading eyebrow="CAPABILITIES" title="Core skills" kind="skills" cinematic={cinematic} template={document.design.template} /><div className="capability-grid">{document.skills.map((skill) => <article key={skill.id}><span>{String(skill.level).padStart(2, "0")}/05</span><h3>{skill.label}</h3><div><i style={{ width: `${skill.level * 20}%` }} /></div></article>)}</div></section>;
  if (section === "projects") {
    const selectedProjects = projectsForPresentation(document);
    if (!selectedProjects.length && !editing) return null;
    const projects = publicBasePath ? selectedProjects.slice(0, 4) : selectedProjects;
    return <section id="projects" className="portfolio-section"><SectionHeading eyebrow="SELECTED WORK" title="Projects" kind="projects" cinematic={cinematic} template={document.design.template} />{projects.length ? <><div className="work-grid">{projects.map((project, index) => { const cover = document.media.assets.find((asset) => project.mediaIds.includes(asset.id)); const caseStudyHref = publicBasePath && project.caseStudySlug ? `${publicBasePath}/projects/${project.caseStudySlug}` : ""; return <article key={project.id} className={cover ? "has-project-cover" : ""}>{cover && <div className="project-card-cover"><Image src={cover.url} alt={cover.alt} fill sizes="(max-width: 780px) 90vw, 420px" unoptimized /></div>}<span>0{index + 1}</span><h3>{project.title}</h3><p>{project.summary}</p><div className="technology-list">{project.technologies.map((technology) => <em key={technology}>{technology}</em>)}</div><div className="project-links">{caseStudyHref && <a href={caseStudyHref}>Read case study <ArrowUpRight size={15} /></a>}{project.link && <a href={project.link} target="_blank" rel="noreferrer">Visit project <ArrowUpRight size={15} /></a>}</div></article>; })}</div>{publicBasePath && selectedProjects.length > 0 && <a className="section-detail-link" href={`${publicBasePath}/projects`}>View all projects <ArrowUpRight size={15} /></a>}</> : <EmptyState label="Add selected work in Content → Projects." />}</section>;
  }
  const contact = document.content.contact;
  if (!contact.email && !contact.location && !contact.socials.length && !editing) return null;
  return <section id="contact" className="portfolio-section contact-section">{cinematic && <SectionScene kind="contact" template={document.design.template} />}<p className="section-eyebrow">CONTACT</p><h2>{contact.heading}</h2><div>{contact.email ? <a className="contact-cta" href={`mailto:${contact.email}`}><Mail size={17} />{contact.cta}</a> : editing ? <span className="contact-cta disabled"><Mail size={17} />Add an email to activate</span> : null}{contact.location && <span className="contact-location"><MapPin size={16} />{contact.location}</span>}</div>{contact.socials.length > 0 && <nav className="social-links" aria-label="Social profiles">{contact.socials.map((item) => <a key={item.id} href={item.url} target="_blank" rel="noreferrer" aria-label={socialLabels[item.platform]} title={socialLabels[item.platform]}><SocialIcon platform={item.platform} /></a>)}</nav>}</section>;
}

const socialLabels: Record<SiteDocument["content"]["contact"]["socials"][number]["platform"], string> = { facebook: "Facebook", instagram: "Instagram", linkedin: "LinkedIn", x: "X", youtube: "YouTube", tiktok: "TikTok", github: "GitHub", website: "Website", medium: "Medium", pinterest: "Pinterest" };

function SocialIcon({ platform }: { platform: keyof typeof socialLabels }) {
  if (platform === "website") return <Globe2 size={18} />;
  const marks: Record<Exclude<keyof typeof socialLabels, "website">, string> = { facebook: "f", instagram: "◎", linkedin: "in", x: "𝕏", youtube: "▶", tiktok: "♪", github: "GH", medium: "M", pinterest: "P" };
  return <span aria-hidden="true">{marks[platform]}</span>;
}

function SectionHeading({ eyebrow, title, kind, cinematic, template }: { eyebrow: string; title: string; kind: CinemaKind; cinematic: boolean; template: string }) {
  const variant = eyebrow === "PROFILE" ? "portal" : eyebrow === "CAPABILITIES" ? "orbit" : "grid";
  return <>{cinematic ? <SectionScene kind={kind} template={template} /> : <CinematicBackdrop variant={variant} />}<header className="section-heading"><p className="section-eyebrow">{eyebrow}</p><h2>{title}</h2></header></>;
}

function EmptyState({ label }: { label: string }) {
  return <div className="portfolio-empty-state">{label}</div>;
}
