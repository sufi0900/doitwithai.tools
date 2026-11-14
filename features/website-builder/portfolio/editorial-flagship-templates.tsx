"use client";

import { useState } from "react";
import Image from "next/image";
import {
  ArrowUpRight,
  BookOpen,
  BriefcaseBusiness,
  Clock,
  Compass,
  Globe2,
  GraduationCap,
  Layers3,
  Mail,
  MapPin,
  Newspaper,
  Rocket,
  Search,
  Sparkles,
  UserCheck,
} from "lucide-react";
import type { PortfolioSection, SiteDocument } from "@/features/website-builder/domain/site-document";
import { projectsForPresentation } from "@/features/website-builder/domain/opportunity";
import { isBlogFirstTemplate } from "@/features/website-builder/domain/template-contracts";

const FLAGSHIP_TEMPLATE_IDS = new Set([
  "doitwithai-flagship",
  "authority-niche-blog",
  "creator-newsletter-hub",
  "founder-authority-brand",
  "consultant-lead-engine",
  "micro-saas-launchpad",
  "startup-service-agency",
]);

export function isEditorialFlagshipTemplate(id: string): boolean {
  return FLAGSHIP_TEMPLATE_IDS.has(id);
}

const TEMPLATE_META: Record<
  string,
  { kicker: string; primaryLabel: string; secondaryLabel: string; badge: string }
> = {
  "doitwithai-flagship": {
    kicker: "DOITWITHAI FLAGSHIP · EDITORIAL & PRODUCT HUB",
    primaryLabel: "Explore latest writing",
    secondaryLabel: "Start a conversation",
    badge: "Obsidian & Indigo System",
  },
  "authority-niche-blog": {
    kicker: "AUTHORITY PUBLICATION · TOPIC CLUSTERS",
    primaryLabel: "Read top guides",
    secondaryLabel: "Editorial contact",
    badge: "SEO Magazine Architecture",
  },
  "creator-newsletter-hub": {
    kicker: "CREATOR DISPATCH · NEWSLETTER & ESSAYS",
    primaryLabel: "Browse all issues",
    secondaryLabel: "Work together",
    badge: "Reader-First Light Edition",
  },
  "founder-authority-brand": {
    kicker: "FOUNDER AUTHORITY · PROOF & PERSPECTIVE",
    primaryLabel: "Selected outcomes",
    secondaryLabel: "Book an intro",
    badge: "Executive Proof",
  },
  "consultant-lead-engine": {
    kicker: "STRATEGIC ADVISORY · CLIENT IMPACT",
    primaryLabel: "Review client engagements",
    secondaryLabel: "Request advisory",
    badge: "B2B Lead Engine",
  },
  "micro-saas-launchpad": {
    kicker: "PRODUCT LAUNCHPAD · DOCS & CHANGELOG",
    primaryLabel: "Explore product work",
    secondaryLabel: "Talk to the team",
    badge: "SaaS & AI Tools",
  },
  "startup-service-agency": {
    kicker: "PRODUCT STUDIO · DESIGN & ENGINEERING",
    primaryLabel: "See studio launches",
    secondaryLabel: "Scope a build",
    badge: "Studio Showcase",
  },
};

function TemplateIcon({ id }: { id: string }) {
  switch (id) {
    case "authority-niche-blog":
      return <BookOpen size={16} />;
    case "creator-newsletter-hub":
      return <Newspaper size={16} />;
    case "founder-authority-brand":
      return <UserCheck size={16} />;
    case "consultant-lead-engine":
      return <Compass size={16} />;
    case "micro-saas-launchpad":
      return <Rocket size={16} />;
    case "startup-service-agency":
      return <Layers3 size={16} />;
    default:
      return <Sparkles size={16} />;
  }
}

export function EditorialFlagshipHero({
  document,
  publicBasePath,
  navigate,
  onOpenPost,
}: {
  document: SiteDocument;
  publicBasePath?: string;
  navigate?: (section: "projects" | "contact" | "blog") => void;
  onOpenPost?: (id: string) => void;
}) {
  const template = document.design.template;
  const meta = TEMPLATE_META[template] ?? TEMPLATE_META["doitwithai-flagship"];
  const blogFirst = isBlogFirstTemplate(template);
  const Title = publicBasePath ? "h1" : "h2";
  const Role = publicBasePath ? "h2" : "h3";
  const posts = document.publishing.posts
    .filter((post) => !publicBasePath || post.status === "published")
    .slice(0, 3);
  const featuredPost = posts[0];
  const featuredCover = featuredPost
    ? document.media.assets.find((asset) => asset.id === featuredPost.coverMediaId)
    : undefined;

  return (
    <section
      className={`portfolio-hero flagship-hero flagship-${template} align-${document.design.heroAlignment}`}
      id="hero"
    >
      <div className="ambient-grid" />
      <div className="portfolio-copy flagship-copy">
        <div className="flagship-meta-row">
          <p className="availability">
            <i />
            {document.identity.availability}
          </p>
          <span className="flagship-badge">
            <TemplateIcon id={template} />
            {meta.badge}
          </span>
        </div>
        <p className="kicker">{meta.kicker}</p>
        <Title>{document.identity.name}</Title>
        <Role>{document.identity.role}</Role>
        <p className="intro">{document.identity.intro}</p>
        <div className="hero-actions">
          {publicBasePath ? (
            <a href={blogFirst ? `${publicBasePath}/blog` : `${publicBasePath}/projects`}>
              {meta.primaryLabel}
              <ArrowUpRight size={15} />
            </a>
          ) : (
            <button
              type="button"
              onClick={() =>
                blogFirst && posts.length > 0 && onOpenPost
                  ? onOpenPost("__index__")
                  : navigate?.("projects")
              }
            >
              {meta.primaryLabel}
              <ArrowUpRight size={15} />
            </button>
          )}
          {publicBasePath ? (
            <a className="ghost" href="#contact">
              {meta.secondaryLabel}
            </a>
          ) : (
            <button type="button" className="ghost" onClick={() => navigate?.("contact")}>
              {meta.secondaryLabel}
            </button>
          )}
        </div>
      </div>

      <aside className="flagship-aside" aria-label="Featured snapshot">
        <div className="flagship-aside-card">
          {document.media.headshotUrl ? (
            <div className="flagship-portrait-row">
              <div className="flagship-portrait-thumb">
                <Image
                  src={document.media.headshotUrl}
                  alt={document.media.headshotAlt || document.identity.name}
                  fill
                  sizes="96px"
                  unoptimized
                />
              </div>
              <div>
                <strong>{document.identity.name}</strong>
                <small>{document.content.contact.location || document.identity.role}</small>
              </div>
            </div>
          ) : (
            <div className="flagship-aside-header">
              <span>{blogFirst ? "FEATURED PUBLICATION" : "SYSTEM SNAPSHOT"}</span>
              <TemplateIcon id={template} />
            </div>
          )}

          {featuredPost ? (
            <div className="flagship-featured-post">
              {featuredCover && (
                <div className="flagship-post-cover">
                  <Image
                    src={featuredCover.url}
                    alt={featuredCover.alt}
                    fill
                    sizes="360px"
                    unoptimized
                  />
                </div>
              )}
              <span>LATEST ARTICLE</span>
              <h4>{featuredPost.title}</h4>
              <p>{featuredPost.excerpt || featuredPost.seoDescription || "Ready for editorial review."}</p>
              {publicBasePath ? (
                <a href={`${publicBasePath}/blog/${featuredPost.slug}`}>
                  Read article <ArrowUpRight size={14} />
                </a>
              ) : (
                onOpenPost && (
                  <button type="button" onClick={() => onOpenPost(featuredPost.id)}>
                    Preview article <ArrowUpRight size={14} />
                  </button>
                )
              )}
            </div>
          ) : (
            <div className="flagship-metrics-grid">
              <div>
                <strong>{document.publishing.posts.length}</strong>
                <span>Articles</span>
              </div>
              <div>
                <strong>{document.content.projects.length}</strong>
                <span>Case studies</span>
              </div>
              <div>
                <strong>{document.skills.length}</strong>
                <span>Core areas</span>
              </div>
              <div>
                <strong>{document.publishing.pages.length}</strong>
                <span>Custom pages</span>
              </div>
            </div>
          )}
        </div>
      </aside>
    </section>
  );
}

type FlagshipSectionCopy = {
  journalEyebrow: string;
  journalTitle: string;
  journalEmpty: string;
  projectsEyebrow: string;
  projectsTitle: string;
  skillsEyebrow: string;
  skillsTitle: string;
  experienceEyebrow: string;
  experienceTitle: string;
  aboutEyebrow: string;
  contactEyebrow: string;
  allPostsLabel: string;
  allProjectsLabel: string;
};

const FLAGSHIP_SECTION_COPY: Record<string, FlagshipSectionCopy> = {
  "doitwithai-flagship": {
    journalEyebrow: "EDITORIAL PUBLICATION · DISPATCHES & GUIDES",
    journalTitle: "Featured articles & deep dives",
    journalEmpty: "Publish or draft articles in Blog Manager to populate the flagship publication hub.",
    projectsEyebrow: "SELECTED WORK · CASE STUDIES",
    projectsTitle: "Systems, tools & shipped initiatives",
    skillsEyebrow: "CAPABILITIES · CORE EXPERTISE",
    skillsTitle: "Focused stack & domain strengths",
    experienceEyebrow: "TRACK RECORD · BACKGROUND",
    experienceTitle: "Experience & education",
    aboutEyebrow: "EDITORIAL PROFILE",
    contactEyebrow: "DIRECT INQUIRY",
    allPostsLabel: "Explore full publication",
    allProjectsLabel: "View all case studies",
  },
  "authority-niche-blog": {
    journalEyebrow: "TOPIC CLUSTERS · EVERGREEN GUIDES",
    journalTitle: "Research-backed guides & comparisons",
    journalEmpty: "Add pillar guides and topic-tagged articles to build your niche magazine library.",
    projectsEyebrow: "RECOMMENDED TOOLS & BUILDS",
    projectsTitle: "Curated projects & benchmarks",
    skillsEyebrow: "EDITORIAL BEAT · SPECIALTIES",
    skillsTitle: "Research & subject-matter depth",
    experienceEyebrow: "AUTHOR CREDENTIALS",
    experienceTitle: "Editorial history & education",
    aboutEyebrow: "ABOUT THE EDITOR",
    contactEyebrow: "SYNDICATION & COLLABORATION",
    allPostsLabel: "Browse all articles",
    allProjectsLabel: "See all benchmarks",
  },
  "creator-newsletter-hub": {
    journalEyebrow: "CREATOR DISPATCH · ISSUE ARCHIVE",
    journalTitle: "Recent newsletter editions & essays",
    journalEmpty: "Draft your next issue in Blog Manager to showcase your newsletter archive here.",
    projectsEyebrow: "RELEASES & SPONSORED WORK",
    projectsTitle: "Selected collaborations & artifacts",
    skillsEyebrow: "THEMES · CREATIVE FOCUS",
    skillsTitle: "What this publication explores",
    experienceEyebrow: "TIMELINE · MILESTONES",
    experienceTitle: "Career highlights & background",
    aboutEyebrow: "MEET THE WRITER",
    contactEyebrow: "SPONSORSHIPS & NOTES",
    allPostsLabel: "Read every issue",
    allProjectsLabel: "View full portfolio",
  },
  "founder-authority-brand": {
    journalEyebrow: "THOUGHT LEADERSHIP · OPERATOR NOTES",
    journalTitle: "Selected essays & strategic memos",
    journalEmpty: "Add essays and keynote perspectives to reinforce founder credibility.",
    projectsEyebrow: "VENTURES · PROOF OF EXECUTION",
    projectsTitle: "Flagship ventures & case studies",
    skillsEyebrow: "ADVISORY DOMAINS",
    skillsTitle: "Executive capabilities",
    experienceEyebrow: "LEADERSHIP RECORD",
    experienceTitle: "Board, operating & academic record",
    aboutEyebrow: "FOUNDER THESIS",
    contactEyebrow: "ADVISORY & SPEAKING",
    allPostsLabel: "Read all memos",
    allProjectsLabel: "Explore all ventures",
  },
  "consultant-lead-engine": {
    journalEyebrow: "INSIGHTS · CLIENT PLAYBOOKS",
    journalTitle: "Teardowns, audits & transformation briefs",
    journalEmpty: "Publish strategic playbooks and client teardown articles to convert organic traffic.",
    projectsEyebrow: "CLIENT RESULTS · CASE STUDIES",
    projectsTitle: "Documented engagements & outcomes",
    skillsEyebrow: "CONSULTING PRACTICE",
    skillsTitle: "Advisory capabilities & tooling",
    experienceEyebrow: "ENGAGEMENT HISTORY",
    experienceTitle: "Prior roles & credentials",
    aboutEyebrow: "PRACTICE OVERVIEW",
    contactEyebrow: "BOOK A DISCOVERY CALL",
    allPostsLabel: "View all playbooks",
    allProjectsLabel: "Inspect all engagements",
  },
  "micro-saas-launchpad": {
    journalEyebrow: "CHANGELOG · PRODUCT NOTES",
    journalTitle: "Release notes, ship logs & guides",
    journalEmpty: "Document product updates, tutorials, and changelogs as blog posts.",
    projectsEyebrow: "SHIPPED PRODUCTS · SUITE",
    projectsTitle: "Built software, APIs & workflows",
    skillsEyebrow: "TECHNICAL ARCHITECTURE",
    skillsTitle: "Engineering & product stack",
    experienceEyebrow: "BUILDER BACKGROUND",
    experienceTitle: "Shipping history & education",
    aboutEyebrow: "STUDIO MANIFESTO",
    contactEyebrow: "PRODUCT SUPPORT & DEMOS",
    allPostsLabel: "All release notes",
    allProjectsLabel: "Explore all products",
  },
  "startup-service-agency": {
    journalEyebrow: "AGENCY PERSPECTIVES · PLAYBOOKS",
    journalTitle: "Delivery insights & technical writing",
    journalEmpty: "Share sprint methodologies and client growth breakdowns in Blog Manager.",
    projectsEyebrow: "CLIENT WORK · SHIPPED ENGAGEMENTS",
    projectsTitle: "Recent product & brand launches",
    skillsEyebrow: "SERVICE PILLARS",
    skillsTitle: "Core studio capabilities",
    experienceEyebrow: "STUDIO PEDIGREE",
    experienceTitle: "Leadership experience & credentials",
    aboutEyebrow: "HOW WE PARTNER",
    contactEyebrow: "START A PROJECT",
    allPostsLabel: "Read studio writing",
    allProjectsLabel: "See all client work",
  },
};

const FLAGSHIP_SOCIAL_LABELS: Record<
  SiteDocument["content"]["contact"]["socials"][number]["platform"],
  string
> = {
  facebook: "Facebook",
  instagram: "Instagram",
  linkedin: "LinkedIn",
  x: "X",
  youtube: "YouTube",
  tiktok: "TikTok",
  github: "GitHub",
  website: "Website",
  medium: "Medium",
  pinterest: "Pinterest",
};

function estimateReadingMinutes(blocks: SiteDocument["publishing"]["posts"][number]["blocks"]): number {
  const words = blocks.reduce((total, block) => {
    const textWords = block.text ? block.text.trim().split(/\s+/).filter(Boolean).length : 0;
    const itemWords = block.items.reduce(
      (sum, item) => sum + item.trim().split(/\s+/).filter(Boolean).length,
      0,
    );
    return total + textWords + itemWords;
  }, 0);
  return Math.max(1, Math.round(words / 200));
}

function FlagshipJournalSection({
  document,
  editing,
  publicBasePath,
  onOpenPost,
  copy,
}: {
  document: SiteDocument;
  editing: boolean;
  publicBasePath?: string;
  onOpenPost?: (id: string) => void;
  copy: FlagshipSectionCopy;
}) {
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const visiblePosts = document.publishing.posts.filter(
    (post) => !publicBasePath || post.status === "published",
  );
  if (!visiblePosts.length && !editing) return null;

  const uniqueTags = Array.from(
    new Set(visiblePosts.flatMap((post) => post.tags.map((tag) => tag.trim()).filter(Boolean))),
  ).slice(0, 8);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredPosts = visiblePosts.filter((post) => {
    const matchesTag = selectedTag === "all" || post.tags.includes(selectedTag);
    if (!matchesTag) return false;
    if (!normalizedQuery) return true;
    return (
      post.title.toLowerCase().includes(normalizedQuery) ||
      post.excerpt.toLowerCase().includes(normalizedQuery) ||
      post.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery))
    );
  });

  const leadPost = filteredPosts[0] ?? null;
  const secondaryPosts = filteredPosts.slice(1, publicBasePath ? 7 : 9);

  const renderPostTrigger = (
    post: SiteDocument["publishing"]["posts"][number],
    label: string,
    className: string,
  ) => {
    if (publicBasePath) {
      return (
        <a className={className} href={`${publicBasePath}/blog/${post.slug}`}>
          {label}
          <ArrowUpRight size={15} />
        </a>
      );
    }
    if (onOpenPost) {
      return (
        <button type="button" className={className} onClick={() => onOpenPost(post.id)}>
          {label}
          <ArrowUpRight size={15} />
        </button>
      );
    }
    return null;
  };

  return (
    <section id="blog" className="flagship-section flagship-journal-section">
      <header className="flagship-section-header">
        <div>
          <span className="flagship-section-eyebrow">
            <BookOpen size={14} aria-hidden="true" />
            {copy.journalEyebrow}
          </span>
          <h2>{copy.journalTitle}</h2>
        </div>
        {publicBasePath && visiblePosts.length > 0 && (
          <a className="flagship-section-all-link" href={`${publicBasePath}/blog`}>
            {copy.allPostsLabel}
            <ArrowUpRight size={15} />
          </a>
        )}
      </header>

      {visiblePosts.length > 0 && (
        <div className="flagship-journal-toolbar">
          <div className="flagship-tag-filter" role="group" aria-label="Filter articles by topic">
            <button
              type="button"
              data-active={selectedTag === "all"}
              onClick={() => setSelectedTag("all")}
            >
              All ({visiblePosts.length})
            </button>
            {uniqueTags.map((tag) => (
              <button
                type="button"
                key={tag}
                data-active={selectedTag === tag}
                onClick={() => setSelectedTag(tag === selectedTag ? "all" : tag)}
              >
                {tag}
              </button>
            ))}
          </div>
          {visiblePosts.length > 1 && (
            <label className="flagship-journal-search">
              <Search size={14} aria-hidden="true" />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search articles..."
                aria-label="Search articles"
              />
            </label>
          )}
        </div>
      )}

      {!visiblePosts.length ? (
        <p className="flagship-empty">{copy.journalEmpty}</p>
      ) : !filteredPosts.length ? (
        <div className="flagship-empty">
          No articles match &ldquo;{searchQuery || selectedTag}&rdquo;.{" "}
          <button
            type="button"
            className="flagship-inline-reset"
            onClick={() => {
              setSelectedTag("all");
              setSearchQuery("");
            }}
          >
            Reset filter
          </button>
        </div>
      ) : (
        <div className="flagship-journal-layout">
          {leadPost && (() => {
            const cover = document.media.assets.find((asset) => asset.id === leadPost.coverMediaId);
            const mins = estimateReadingMinutes(leadPost.blocks);
            return (
              <article className={`flagship-lead-article ${cover ? "has-cover" : ""}`}>
                {cover && (
                  <div className="flagship-article-cover flagship-lead-cover">
                    <Image
                      src={cover.url}
                      alt={cover.alt || leadPost.title}
                      fill
                      sizes="(max-width: 780px) 92vw, 520px"
                      unoptimized
                    />
                  </div>
                )}
                <div className="flagship-article-body">
                  <div className="flagship-article-meta">
                    <span className="flagship-lead-badge">LEAD STORY</span>
                    <span>
                      <Clock size={12} aria-hidden="true" />
                      {mins} min read
                    </span>
                    {!publicBasePath && leadPost.status === "draft" && (
                      <span className="flagship-draft-pill">Draft</span>
                    )}
                  </div>
                  <h3>{leadPost.title}</h3>
                  {leadPost.excerpt && <p>{leadPost.excerpt}</p>}
                  {leadPost.tags.length > 0 && (
                    <div className="flagship-tag-row">
                      {leadPost.tags.map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>
                  )}
                  <div className="flagship-card-footer">
                    {renderPostTrigger(leadPost, "Read full article", "flagship-article-cta")}
                  </div>
                </div>
              </article>
            );
          })()}

          {secondaryPosts.length > 0 && (
            <div className="flagship-article-grid">
              {secondaryPosts.map((post) => {
                const cover = document.media.assets.find((asset) => asset.id === post.coverMediaId);
                const mins = estimateReadingMinutes(post.blocks);
                return (
                  <article key={post.id} className="flagship-article-card">
                    {cover && (
                      <div className="flagship-article-cover">
                        <Image
                          src={cover.url}
                          alt={cover.alt || post.title}
                          fill
                          sizes="(max-width: 780px) 90vw, 360px"
                          unoptimized
                        />
                      </div>
                    )}
                    <div className="flagship-article-body">
                      <div className="flagship-article-meta">
                        <span>
                          <Clock size={12} aria-hidden="true" />
                          {mins} min read
                        </span>
                        {!publicBasePath && post.status === "draft" && (
                          <span className="flagship-draft-pill">Draft</span>
                        )}
                      </div>
                      <h3>{post.title}</h3>
                      {post.excerpt && <p>{post.excerpt}</p>}
                      {post.tags.length > 0 && (
                        <div className="flagship-tag-row">
                          {post.tags.slice(0, 3).map((tag) => (
                            <span key={tag}>{tag}</span>
                          ))}
                        </div>
                      )}
                      <div className="flagship-card-footer">
                        {renderPostTrigger(post, "Read article", "flagship-article-cta")}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

/** Complete publication, showcase, capability, credential, and conversion sections for all 7 Flagship templates. */
export function EditorialFlagshipSections({
  document,
  editing = false,
  publicBasePath,
  onOpenPage,
  onOpenPost,
}: {
  document: SiteDocument;
  editing?: boolean;
  publicBasePath?: string;
  onOpenPage?: (id: string) => void;
  onOpenPost?: (id: string) => void;
}) {
  const templateId = document.design.template;
  const copy = FLAGSHIP_SECTION_COPY[templateId] ?? FLAGSHIP_SECTION_COPY["doitwithai-flagship"];
  const blogFirst = isBlogFirstTemplate(templateId);
  const work = projectsForPresentation(document);
  const contact = document.content.contact;
  const visiblePages = document.publishing.pages.filter(
    (page) => !publicBasePath || page.status === "published",
  );
  const aboutPage = visiblePages.find((page) => page.slug === "about");

  const renderPortfolioSection = (section: PortfolioSection) => {
    if (!document.content.visibility[section]) return null;

    if (section === "about") {
      return (
        <section id="about" key={section} className="flagship-section flagship-about-section">
          <header className="flagship-section-header">
            <div>
              <span className="flagship-section-eyebrow">
                <UserCheck size={14} aria-hidden="true" />
                {copy.aboutEyebrow}
              </span>
              <h2>{document.content.about.heading}</h2>
            </div>
          </header>
          <div className="flagship-about-grid">
            <p className="flagship-about-copy">{document.content.about.body || document.identity.intro}</p>
            <aside className="flagship-about-card">
              <strong>{document.identity.role}</strong>
              <span className="flagship-availability-chip">{document.identity.availability}</span>
              {contact.location && (
                <span className="flagship-location-line">
                  <MapPin size={14} aria-hidden="true" />
                  {contact.location}
                </span>
              )}
              {aboutPage && (
                publicBasePath ? (
                  <a className="flagship-section-all-link" href={`${publicBasePath}/pages/about`}>
                    Read full profile
                    <ArrowUpRight size={15} />
                  </a>
                ) : (
                  onOpenPage && (
                    <button
                      type="button"
                      className="flagship-section-all-link"
                      onClick={() => onOpenPage(aboutPage.id)}
                    >
                      Preview About page
                      <ArrowUpRight size={15} />
                    </button>
                  )
                )
              )}
            </aside>
          </div>
          {visiblePages.length > 0 && (
            <div className="flagship-pages-strip" aria-label="Custom site pages">
              {visiblePages.map((page) =>
                publicBasePath ? (
                  <a key={page.id} href={`${publicBasePath}/pages/${page.slug}`}>
                    {page.navigationLabel}
                    <ArrowUpRight size={14} />
                  </a>
                ) : onOpenPage ? (
                  <button key={page.id} type="button" onClick={() => onOpenPage(page.id)}>
                    {page.navigationLabel}
                    <ArrowUpRight size={14} />
                  </button>
                ) : null,
              )}
            </div>
          )}
        </section>
      );
    }

    if (section === "projects") {
      if (!editing && !work.length) return null;
      const displayProjects = publicBasePath ? work.slice(0, 6) : work;
      return (
        <section id="projects" key={section} className="flagship-section flagship-projects-section">
          <header className="flagship-section-header">
            <div>
              <span className="flagship-section-eyebrow">
                <Layers3 size={14} aria-hidden="true" />
                {copy.projectsEyebrow}
              </span>
              <h2>{copy.projectsTitle}</h2>
            </div>
            {publicBasePath && work.length > 0 && (
              <a className="flagship-section-all-link" href={`${publicBasePath}/projects`}>
                {copy.allProjectsLabel}
                <ArrowUpRight size={15} />
              </a>
            )}
          </header>
          {displayProjects.length ? (
            <div className="flagship-project-grid">
              {displayProjects.map((project, index) => {
                const cover = document.media.assets.find((asset) =>
                  project.mediaIds.includes(asset.id),
                );
                return (
                  <article key={project.id} className="flagship-project-card">
                    {cover && (
                      <div className="flagship-project-cover">
                        <Image
                          src={cover.url}
                          alt={cover.alt || project.title}
                          fill
                          sizes="(max-width: 780px) 92vw, 480px"
                          unoptimized
                        />
                      </div>
                    )}
                    <div className="flagship-project-body">
                      <span className="flagship-project-index">
                        {project.role || `CASE STUDY ${String(index + 1).padStart(2, "0")}`}
                        {project.period ? ` · ${project.period}` : ""}
                      </span>
                      <h3>{project.title}</h3>
                      <p>{project.summary}</p>
                      {project.outcome && (
                        <p className="flagship-project-outcome">
                          <strong>Outcome:</strong> {project.outcome}
                        </p>
                      )}
                      {project.technologies.length > 0 && (
                        <div className="flagship-tag-row">
                          {project.technologies.map((tech) => (
                            <span key={tech}>{tech}</span>
                          ))}
                        </div>
                      )}
                      <div className="flagship-card-footer">
                        {publicBasePath && project.caseStudySlug && (
                          <a
                            className="flagship-article-cta"
                            href={`${publicBasePath}/projects/${project.caseStudySlug}`}
                          >
                            Read case study
                            <ArrowUpRight size={15} />
                          </a>
                        )}
                        {project.link && (
                          <a
                            className="flagship-article-cta"
                            href={project.link}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Visit project
                            <ArrowUpRight size={15} />
                          </a>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <p className="flagship-empty">Add selected projects and case studies from Studio Content.</p>
          )}
        </section>
      );
    }

    if (section === "skills") {
      if (!editing && !document.skills.length) return null;
      return (
        <section id="skills" key={section} className="flagship-section flagship-skills-section">
          <header className="flagship-section-header">
            <div>
              <span className="flagship-section-eyebrow">
                <Sparkles size={14} aria-hidden="true" />
                {copy.skillsEyebrow}
              </span>
              <h2>{copy.skillsTitle}</h2>
            </div>
          </header>
          {document.skills.length ? (
            <div className="flagship-skills-grid">
              {document.skills.map((skill, index) => (
                <article key={skill.id} className="flagship-skill-card">
                  <div className="flagship-skill-top">
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <small>{skill.level}/5</small>
                  </div>
                  <h3>{skill.label}</h3>
                  <div className="flagship-skill-bar" aria-label={`Proficiency ${skill.level} of 5`}>
                    <i style={{ width: `${skill.level * 20}%` }} />
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="flagship-empty">Add core skills and topic pillars in Studio.</p>
          )}
        </section>
      );
    }

    if (section === "experience") {
      const hasJourney =
        document.content.experience.length > 0 || document.content.education.length > 0;
      if (!editing && !hasJourney) return null;
      return (
        <section id="experience" key={section} className="flagship-section flagship-career-section">
          <header className="flagship-section-header">
            <div>
              <span className="flagship-section-eyebrow">
                <Compass size={14} aria-hidden="true" />
                {copy.experienceEyebrow}
              </span>
              <h2>{copy.experienceTitle}</h2>
            </div>
          </header>
          <div className="flagship-career-grid">
            <div className="flagship-career-column">
              <h3>
                <BriefcaseBusiness size={17} aria-hidden="true" />
                Experience
              </h3>
              {document.content.experience.length ? (
                document.content.experience.map((item) => (
                  <article key={item.id} className="flagship-career-entry">
                    <time>{item.period || "Present"}</time>
                    <h4>{item.role}</h4>
                    {item.organization && <strong>{item.organization}</strong>}
                    {item.summary && <p>{item.summary}</p>}
                  </article>
                ))
              ) : (
                editing && <p className="flagship-empty">Add experience entries in Studio Content.</p>
              )}
            </div>
            <div className="flagship-career-column">
              <h3>
                <GraduationCap size={18} aria-hidden="true" />
                Education
              </h3>
              {document.content.education.length ? (
                document.content.education.map((item) => (
                  <article key={item.id} className="flagship-career-entry">
                    <time>{item.period || "Education"}</time>
                    <h4>{item.credential}</h4>
                    {item.institution && <strong>{item.institution}</strong>}
                    {item.summary && <p>{item.summary}</p>}
                  </article>
                ))
              ) : (
                editing && <p className="flagship-empty">Add education credentials in Studio Content.</p>
              )}
            </div>
          </div>
        </section>
      );
    }

    if (!editing && !contact.email && !contact.location && !contact.socials.length) return null;
    return (
      <section id="contact" key={section} className="flagship-section flagship-contact-section">
        <header className="flagship-section-header">
          <div>
            <span className="flagship-section-eyebrow">
              <Rocket size={14} aria-hidden="true" />
              {copy.contactEyebrow}
            </span>
            <h2>{contact.heading}</h2>
          </div>
        </header>
        <div className="flagship-contact-card">
          <div className="flagship-contact-actions">
            {contact.email ? (
              <a className="flagship-contact-cta" href={`mailto:${contact.email}`}>
                <Mail size={17} aria-hidden="true" />
                {contact.cta}
                <ArrowUpRight size={16} />
              </a>
            ) : (
              editing && (
                <span className="flagship-contact-cta disabled">
                  <Mail size={17} aria-hidden="true" />
                  Add a contact email in Studio to activate
                </span>
              )
            )}
            {contact.location && (
              <span className="flagship-location-line">
                <MapPin size={15} aria-hidden="true" />
                {contact.location}
              </span>
            )}
          </div>
          {contact.socials.length > 0 && (
            <nav className="flagship-social-row" aria-label="Social links">
              {contact.socials.map((item) => (
                <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer">
                  <Globe2 size={14} aria-hidden="true" />
                  {FLAGSHIP_SOCIAL_LABELS[item.platform]}
                  <ArrowUpRight size={13} aria-hidden="true" />
                </a>
              ))}
            </nav>
          )}
        </div>
      </section>
    );
  };

  const orderedWithoutContact = document.content.order.filter((item) => item !== "contact");
  const hasContactAtEnd = document.content.order.includes("contact");

  return (
    <div className={`flagship-sections flagship-sections-${templateId}`}>
      {blogFirst ? (
        <>
          <FlagshipJournalSection
            document={document}
            editing={editing}
            publicBasePath={publicBasePath}
            onOpenPost={onOpenPost}
            copy={copy}
          />
          {document.content.order.map((section) => renderPortfolioSection(section))}
        </>
      ) : (
        <>
          {orderedWithoutContact.map((section) => renderPortfolioSection(section))}
          <FlagshipJournalSection
            document={document}
            editing={editing}
            publicBasePath={publicBasePath}
            onOpenPost={onOpenPost}
            copy={copy}
          />
          {hasContactAtEnd && renderPortfolioSection("contact")}
        </>
      )}
    </div>
  );
}
