import { ArrowDownRight, ArrowUpRight, BookOpen, BriefcaseBusiness, GraduationCap, Mail, MapPin, MoveUpRight, Sparkles } from "lucide-react";
import Image from "next/image";
import type { PortfolioSection, SiteDocument } from "@/features/website-builder/domain/site-document";
import { projectsForPresentation } from "@/features/website-builder/domain/opportunity";

/** A separate, print-inspired portfolio composition. It shares content and publication rules with 3D templates. */
export function ProfessionalPortfolioSections({ document, editing, publicBasePath, onOpenPage }: { document: SiteDocument; editing: boolean; publicBasePath?: string; onOpenPage?: (id: string) => void }) {
  const projects = projectsForPresentation(document);
  const aboutPage = document.publishing.pages.find((page) => page.slug === "about" && (!publicBasePath || page.status === "published"));
  const contact = document.content.contact;
  return <div className="professional-sections">
    {document.content.order.map((section: PortfolioSection) => {
      if (!document.content.visibility[section]) return null;
      if (section === "about") return <section id="about" className="professional-section professional-about" key={section}>
        <ProfessionalHeading number="01" eyebrow="The person behind the work" title={document.content.about.heading} />
        <div className="professional-about-grid">
          <div className="professional-portrait">{document.media.headshotUrl ? <Image src={document.media.headshotUrl} alt={document.media.headshotAlt || `${document.identity.name} portrait`} fill sizes="(max-width: 780px) 90vw, 470px" unoptimized /> : <div aria-hidden="true" className="professional-portrait-placeholder"><span>{document.identity.name.split(/\s+/).map((part) => part[0]).slice(0, 2).join("")}</span><small>A story worth telling</small></div>}</div>
          <div className="professional-about-copy"><Sparkles size={22} strokeWidth={1.5} aria-hidden="true" /><p>{document.content.about.body || document.identity.intro}</p><div className="professional-about-meta"><span>{document.identity.role}</span>{contact.location && <span>{contact.location}</span>}</div>{aboutPage && (publicBasePath ? <a className="professional-text-link" href={`${publicBasePath}/pages/about`}>Discover my story <ArrowUpRight size={17} /></a> : onOpenPage ? <button className="professional-text-link" type="button" onClick={() => onOpenPage(aboutPage.id)}>Discover my story <ArrowUpRight size={17} /></button> : null)}</div>
        </div>
      </section>;
      if (section === "experience") {
        if (!editing && !document.content.experience.length && !document.content.education.length) return null;
        return <section id="experience" className="professional-section professional-journey" key={section}><ProfessionalHeading number="02" eyebrow="A record of practice" title="Experience & education" />
          <div className="professional-journey-grid"><div><h3><BriefcaseBusiness size={18} /> Experience</h3>{document.content.experience.length ? document.content.experience.map((item) => <article key={item.id}><span className="professional-date">{item.period || "Present"}</span><h4>{item.role}</h4><strong>{item.organization}</strong><p>{item.summary}</p></article>) : editing && <p>Add experience in the editor.</p>}</div><div><h3><GraduationCap size={19} /> Education</h3>{document.content.education.length ? document.content.education.map((item) => <article key={item.id}><span className="professional-date">{item.period || "Education"}</span><h4>{item.credential}</h4><strong>{item.institution}</strong><p>{item.summary}</p></article>) : editing && <p>Add education in the editor.</p>}</div></div>
        </section>;
      }
      if (section === "skills") return <section id="skills" className="professional-section professional-skills" key={section}><ProfessionalHeading number="03" eyebrow="How I contribute" title="What I bring to the table" /><p className="professional-section-intro">An evolving toolkit built through real work, curiosity, and care.</p><div className="professional-skills-grid">{document.skills.map((skill, index) => <article key={skill.id}><span className="professional-skill-icon" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><h3>{skill.label}</h3><small>{["", "Exploring", "Building", "Practicing", "Proficient", "Advanced"][skill.level]}</small><ArrowUpRight size={17} aria-hidden="true" /></article>)}</div></section>;
      if (section === "projects") {
        if (!editing && !projects.length) return null;
        return <section id="projects" className="professional-section professional-work" key={section}><ProfessionalHeading number="04" eyebrow="Selected outcomes" title="Work worth sharing" /><div className="professional-work-grid">{projects.slice(0, publicBasePath ? 4 : undefined).map((project, index) => { const cover = document.media.assets.find((asset) => project.mediaIds.includes(asset.id));return <article key={project.id}><div className="professional-work-cover">{cover ? <Image src={cover.url} alt={cover.alt} fill sizes="(max-width: 780px) 90vw, 550px" unoptimized /> : <span aria-hidden="true">{String(index + 1).padStart(2, "0")}<MoveUpRight size={36} /></span>}</div><div className="professional-work-detail"><span>PROJECT / {String(index + 1).padStart(2, "0")}</span><h3>{project.title}</h3><p>{project.summary}</p><div className="professional-tags">{project.technologies.map((tag) => <small key={tag}>{tag}</small>)}</div><div className="professional-work-links">{publicBasePath && project.caseStudySlug && <a href={`${publicBasePath}/projects/${project.caseStudySlug}`}>View case study <ArrowUpRight size={16} /></a>}{project.link && <a href={project.link} target="_blank" rel="noopener noreferrer">Visit project <ArrowUpRight size={16} /></a>}</div></div></article>})}</div>{publicBasePath && projects.length > 0 && <a className="professional-text-link professional-all-work" href={`${publicBasePath}/projects`}>Explore all projects <ArrowUpRight size={17} /></a>}{editing && !projects.length && <p>Add projects in the editor to fill this collection.</p>}</section>;
      }
      if (!editing && !contact.email && !contact.location && !contact.socials.length) return null;
      return <section id="contact" className="professional-section professional-contact" key={section}><span className="professional-contact-mark"><ArrowDownRight size={32} strokeWidth={1.4} /></span><p className="professional-eyebrow">05 / LET&apos;S CONNECT</p><h2>{contact.heading}</h2><p>Have a project or a question? I would love to hear what you are working on.</p><div className="professional-contact-actions">{contact.email ? <a className="professional-contact-cta" href={`mailto:${contact.email}`}><Mail size={18} />{contact.cta}<ArrowUpRight size={18} /></a> : editing && <span>Add an email to enable contact</span>}{contact.location && <span className="professional-location"><MapPin size={16} />{contact.location}</span>}</div>{contact.socials.length > 0 && <nav className="professional-socials" aria-label="Social profiles">{contact.socials.map((social) => <a key={social.id} href={social.url} target="_blank" rel="noopener noreferrer" aria-label={social.platform}><BookOpen size={16} aria-hidden="true" />{social.platform}<ArrowUpRight size={13} aria-hidden="true" /></a>)}</nav>}</section>;
    })}
  </div>;
}

function ProfessionalHeading({ number, eyebrow, title }: { number: string; eyebrow: string; title: string }) {
  return <header className="professional-heading"><span>{number} / {eyebrow}</span><h2>{title}</h2><div aria-hidden="true" /></header>;
}
