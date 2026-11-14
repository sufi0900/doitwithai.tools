import { RichDocumentView } from "@/features/website-builder/content/rich-document-view";
import type { RichNode } from "@/features/website-builder/domain/rich-document";
import { isCollectionTemplate, isLightTemplate } from "@/features/website-builder/domain/template-contracts";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import type { SiteDocument } from "@/features/website-builder/domain/site-document";
import { renderInlineText } from "@/features/website-builder/content/inline-text";
import { createElement } from "react";
import { CinematicBackdrop } from "@/features/website-builder/portfolio/cinematic-backdrop";

type Page = SiteDocument["publishing"]["pages"][number];
type Post = SiteDocument["publishing"]["posts"][number];

export function PublicContentPage({ document, portfolioSlug, item, kind, basePath }: { document: SiteDocument; portfolioSlug: string; item: Page | Post; kind: "page" | "post"; basePath?: string }) {
  const path = basePath ?? `/p/${portfolioSlug}`;
  const cover = document.media.assets.find((asset) => asset.id === item.coverMediaId);
  return <main className={`website-builder-scope published-content-page bg-${document.design.background} template-${document.design.template} ${isCollectionTemplate(document.design.template) ? "collection-theme" : ""} ${isLightTemplate(document.design.template) ? "light-theme" : ""}`} data-accent={document.design.accent}>
    <ContentNav document={document} basePath={path} />
    <article className="published-content-shell"><CinematicBackdrop variant="portal" />
      <header className="published-content-hero"><p className="section-eyebrow">{kind === "post" ? "JOURNAL" : "PAGE"}</p><h1>{item.title}</h1>{kind === "post" && "excerpt" in item && item.excerpt && <p>{item.excerpt}</p>}{kind === "post" && "tags" in item && item.tags.length > 0 && <div>{item.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>}</header>
      {cover && <figure className="published-content-cover"><Image src={cover.url} alt={cover.alt} fill sizes="(max-width: 900px) 94vw, 1040px" priority unoptimized /></figure>}
      <StructuredContent document={document} blocks={item.blocks} richContent={item.richContent} />
      <footer className="published-content-footer"><a href={kind === "post" ? `${path}/blog` : path}><ArrowLeft size={16} />{kind === "post" ? "Back to the journal" : `Back to ${document.identity.name}`}</a></footer>
    </article>
  </main>;
}

export function PublicBlogIndex({ document, portfolioSlug, basePath }: { document: SiteDocument; portfolioSlug: string; basePath?: string }) {
  const path = basePath ?? `/p/${portfolioSlug}`;
  const posts = document.publishing.posts.filter((post) => post.status === "published").sort((a, b) => String(b.publishedAt).localeCompare(String(a.publishedAt)));
  return <main className={`website-builder-scope published-content-page bg-${document.design.background} template-${document.design.template} ${isCollectionTemplate(document.design.template) ? "collection-theme" : ""} ${isLightTemplate(document.design.template) ? "light-theme" : ""}`} data-accent={document.design.accent}><ContentNav document={document} basePath={path} /><section className="blog-index"><header><p className="section-eyebrow">JOURNAL</p><h1>Ideas, process and field notes</h1><p>Published by {document.identity.name}</p></header><div>{posts.map((post) => { const cover = document.media.assets.find((asset) => asset.id === post.coverMediaId); return <article key={post.id}>{cover && <div className="blog-card-cover"><Image src={cover.url} alt={cover.alt} fill sizes="(max-width: 760px) 94vw, 430px" unoptimized /></div>}<div><span>{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("en", { year: "numeric", month: "short", day: "numeric" }) : "Published"}</span><h2>{post.title}</h2><p>{post.excerpt || post.seoDescription}</p><div>{post.tags.map((tag) => <em key={tag}>{tag}</em>)}</div><a href={`${path}/blog/${post.slug}`}>Read article <ArrowUpRight size={15} /></a></div></article>; })}</div></section></main>;
}

export function StructuredContent({ document, blocks, richContent }: { document: SiteDocument; blocks: Page["blocks"]; richContent?:RichNode }) {
  if(richContent) return <div className="structured-content"><RichDocumentView node={richContent} document={document}/></div>;
  return <div className="structured-content">{blocks.map((block) => {
    if (block.type === "heading") return createElement(block.headingLevel, { key: block.id }, renderInlineText(block.text));
    if (block.type === "paragraph") return <p key={block.id}>{renderInlineText(block.text)}</p>;
    if (block.type === "quote") return <blockquote key={block.id}>{renderInlineText(block.text)}</blockquote>;
    if (block.type === "list") return <ul key={block.id}>{block.items.map((item, index) => <li key={`${block.id}-${index}`}>{renderInlineText(item)}</li>)}</ul>;
    if (block.type === "ordered-list") return <ol key={block.id}>{block.items.map((item, index) => <li key={`${block.id}-${index}`}>{renderInlineText(item)}</li>)}</ol>;
    const asset = document.media.assets.find((candidate) => candidate.id === block.mediaId);
    return asset ? <figure key={block.id}><div><Image src={asset.url} alt={asset.alt} fill sizes="(max-width: 900px) 94vw, 860px" unoptimized /></div><figcaption>{asset.alt}</figcaption></figure> : null;
  })}</div>;
}

function ContentNav({ document, basePath }: { document: SiteDocument; basePath: string }) {
  const template = document.design.template;
  const isSingleTool = template === "micro-saas-launchpad";
  const isMultiTool = template === "doitwithai-flagship";
  return (
    <header className="case-study-nav">
      <a href={basePath}>
        <ArrowLeft size={16} />
        {document.identity.name}
      </a>
      <nav>
        {isSingleTool ? (
          <a href={`${basePath}#tool-workspace`}>⚡ Live AI Tool</a>
        ) : isMultiTool ? (
          <a href={`${basePath}/projects`}>🧰 Tools ({document.content.projects.length})</a>
        ) : (
          document.content.visibility.projects &&
          document.content.projects.length > 0 && <a href={`${basePath}/projects`}>Projects</a>
        )}
        {document.publishing.pages
          .filter((page) => page.status === "published")
          .map((page) => (
            <a key={page.id} href={`${basePath}/pages/${page.slug}`}>
              {page.navigationLabel}
            </a>
          ))}
        {document.publishing.posts.some((post) => post.status === "published") && (
          <a href={`${basePath}/blog`}>Blog</a>
        )}
      </nav>
    </header>
  );
}
