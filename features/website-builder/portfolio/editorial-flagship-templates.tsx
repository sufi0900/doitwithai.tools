"use client";

import Image from "next/image";
import { ArrowUpRight, BookOpen, Compass, Layers3, Newspaper, Rocket, Sparkles, UserCheck } from "lucide-react";
import type { SiteDocument } from "@/features/website-builder/domain/site-document";
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
