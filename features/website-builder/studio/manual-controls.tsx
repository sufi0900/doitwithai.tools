"use client";

import { authorizedWebsiteFetch } from "@/features/website-builder/lib/supabase/browser";
import { ArrowDown, ArrowUp, ExternalLink, Eye, EyeOff, GripVertical, Plus, RotateCcw, Share2, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import ToolUrlInput from "@/features/tool-ui/ToolUrlInput";
import { normalizePublishingSlug } from "@/features/website-builder/domain/commands";
import type { SiteCommand } from "@/features/website-builder/domain/commands";
import { accentOptions, backgroundOptions, sceneFamilyOptions, socialPlatformOptions, type PortfolioSection, type SiteDocument } from "@/features/website-builder/domain/site-document";
import { PublishingEditor } from "./publishing-editor";
import { CatalogToolInstaller } from "./CatalogToolInstaller";
import { getCatalogToolBySlug, resolveCatalogToolSlug, shouldApplyHeroOverride } from "@/features/website-builder/domain/catalog-tool-resolver";
import { getTransferredToolManifestEntry } from "@/features/website-builder/tools/transferred-tool-manifest";
import { deriveImageAlt } from "@/features/website-builder/domain/media";
import { getTemplatesByCategory, type WebsiteTemplateCategory } from "@/features/website-builder/ecosystem-bridge";
import { getTemplateContract, isFlatTemplate } from "@/features/website-builder/domain/template-contracts";
import { reviewOpportunity } from "@/features/website-builder/domain/opportunity-review";
import { OpportunityPlanner } from "./opportunity-planner";
import { OpportunitySourceReview } from "./opportunity-source-review";
import { OpportunityShare } from "./opportunity-share";
import { ProfessionalMemory } from "./professional-memory";
import { AgentHealth } from "./agent-health";

export type PreviewTarget = { section: string; itemId?: string };
type Props = { ensureSaved?:()=>Promise<number>; document: SiteDocument; publishedDocument?: SiteDocument; execute: (command: SiteCommand) => void; panel: "content" | "design" | "scene" | "opportunity"; canUploadMedia?: boolean; previewTarget?: PreviewTarget; onPreviewTarget?: (target: PreviewTarget) => void; onPublishItem?: (kind: "page" | "post", itemId: string, status: "draft" | "published") => void; publishingItemId?: string; itemPublishError?: string; canDirectPublish?: boolean; blogNotesSeed?: { id: number; text: string }; publicSiteSlug?: string };

export function ManualControls({ document, publishedDocument, execute, panel, canUploadMedia = false, previewTarget, onPreviewTarget, onPublishItem, publishingItemId = "", itemPublishError = "", canDirectPublish = false, ensureSaved, blogNotesSeed, publicSiteSlug }: Props) {
  const activeTemplate = getTemplateContract(document.design.template);
  const flat = isFlatTemplate(document.design.template);
  const [newSkill, setNewSkill] = useState("");
  const contentDestinations = ["hero", "about", "experience", "education", "skills", "projects", "site pages", "blog posts", "contact", "page structure", "media library"];
  const contentSection = previewTarget?.section ?? "hero";
  const selectContentSection = (section: string) => {
    const itemId = section === "site pages" ? document.publishing.pages[0]?.id : section === "blog posts" ? document.publishing.posts[0]?.id : undefined;
    onPreviewTarget?.({ section, itemId });
  };

  if (panel === "opportunity") return (
    <div className="control-stack opportunity-workspace">
      <nav className="studio-section-nav opportunity-nav" aria-label="Opportunity workspace"><a href="#opportunity-details">Details</a>{document.opportunity.status !== "canonical" && <><a href="#opportunity-source">Source review</a><a href="#opportunity-planning">Suggestions</a>{canUploadMedia && <a href="#opportunity-sharing">Sharing</a>}</>}</nav>
      <div className="opportunity-workspace-block" id="opportunity-details"><OpportunityEditor document={document} execute={execute} /></div>
      {canUploadMedia && <><ProfessionalMemory document={document} /><AgentHealth projectId={document.projectId} /></>}
      {document.opportunity.status !== "canonical" && <><div className="opportunity-workspace-block" id="opportunity-source"><OpportunitySourceReview document={document} ensureSaved={ensureSaved} /></div><div className="opportunity-workspace-block" id="opportunity-planning"><OpportunityPlanner document={document} ensureSaved={ensureSaved} execute={execute} enabled={canUploadMedia} /></div>{canUploadMedia && <div className="opportunity-workspace-block" id="opportunity-sharing"><OpportunityShare document={document} publishedDocument={publishedDocument} /></div>}</>}
    </div>
  );

  if (panel === "content") return (
    <div className="control-stack">
      <nav className="studio-section-nav" aria-label="Edit portfolio content">{contentDestinations.map((destination) => <button type="button" key={destination} className={contentSection === destination ? "active" : ""} aria-current={contentSection === destination ? "page" : undefined} onClick={() => selectContentSection(destination)}>{destination}</button>)}</nav>
      <section className="template-editing-guide"><strong>{activeTemplate.name}</strong><p>{activeTemplate.description}</p>{flat && <small>One shared profile photo appears in the hero. Add project cover images for a complete visual portfolio.</small>}</section>
      <Select label="Editing" value={contentSection} options={contentDestinations} onChange={selectContentSection} />
      {contentSection === "hero" && <>
        {flat && <HeadshotUploader document={document} execute={execute} enabled={canUploadMedia} />}
        <BufferedField label="Name" value={document.identity.name} maxLength={60} onCommit={(value) => execute({ type: "identity.set", field: "name", value })} />
        <BufferedField label="Professional role" value={document.identity.role} maxLength={80} onCommit={(value) => execute({ type: "identity.set", field: "role", value })} />
        <BufferedField label="Introduction" value={document.identity.intro} maxLength={220} multiline onCommit={(value) => execute({ type: "identity.set", field: "intro", value })} />
        <BufferedField label="Availability" value={document.identity.availability} maxLength={80} onCommit={(value) => execute({ type: "identity.set", field: "availability", value })} />
      </>}
      {contentSection === "about" && <>
        <HeadshotUploader document={document} execute={execute} enabled={canUploadMedia} />
        <BufferedField label="Section heading" value={document.content.about.heading} maxLength={80} onCommit={(value) => execute({ type: "content.setAbout", field: "heading", value })} />
        <BufferedField label="Professional overview" value={document.content.about.body} maxLength={900} multiline allowEmpty onCommit={(value) => execute({ type: "content.setAbout", field: "body", value })} />
        {document.publishing.pages.some((page) => page.slug === "about") ? <div className="detail-page-ready"><p className="guardrail-note">Your detailed About page is available under Content → Site pages. The homepage keeps this shorter overview for a balanced layout.</p><button type="button" className="secondary-action" onClick={() => { const page = document.publishing.pages.find((entry) => entry.slug === "about"); if (page) onPreviewTarget?.({ section: "site pages", itemId: page.id }); }}>Preview detailed About page</button></div> : <button type="button" className="create-detail-page" onClick={() => execute({ type: "publishing.add", kind: "page", title: "About" })}><Plus size={15} />Create detailed About page</button>}
      </>}
      {contentSection === "experience" && <section className="collection-editor"><header><div><strong>Experience</strong><small>{document.content.experience.length}/8 entries</small></div><button type="button" disabled={document.content.experience.length >= 8} onClick={() => execute({ type: "experience.add" })}><Plus size={15} />Add</button></header>{document.content.experience.map((item) => <article key={item.id}>
        <div className="collection-title"><strong>{item.role}</strong><button type="button" aria-label={`Remove ${item.role}`} onClick={() => execute({ type: "experience.remove", itemId: item.id })}><Trash2 size={14} /></button></div>
        <BufferedField label="Role" value={item.role} maxLength={100} onCommit={(value) => execute({ type: "experience.update", itemId: item.id, field: "role", value })} />
        <BufferedField label="Organization" value={item.organization} maxLength={100} allowEmpty onCommit={(value) => execute({ type: "experience.update", itemId: item.id, field: "organization", value })} />
        <BufferedField label="Period" value={item.period} maxLength={80} allowEmpty onCommit={(value) => execute({ type: "experience.update", itemId: item.id, field: "period", value })} />
        <BufferedField label="Summary" value={item.summary} maxLength={500} multiline allowEmpty onCommit={(value) => execute({ type: "experience.update", itemId: item.id, field: "summary", value })} />
      </article>)}</section>}
      {contentSection === "skills" &&
      <section className="skill-editor" aria-labelledby="skill-editor-title">
        <div className="skill-editor-heading"><div><strong id="skill-editor-title">Featured skills</strong><small>{flat ? "Shown in your template’s capability layout." : "Shown as interactive nodes in the 3D scene."}</small></div><span>{document.skills.length}/8</span></div>
        <div className="skill-list">
          {document.skills.map((skill) => <div className="skill-row" key={skill.id}>
            <BufferedInput ariaLabel={`Edit ${skill.label}`} value={skill.label} maxLength={32} onCommit={(label) => execute({ type: "skill.update", skillId: skill.id, label })} />
            <label className="skill-level"><span>Level</span><select aria-label={`${skill.label} level`} value={skill.level} onChange={(event) => execute({ type: "skill.update", skillId: skill.id, level: Number(event.target.value) })}>{[1, 2, 3, 4, 5].map((level) => <option key={level}>{level}</option>)}</select></label>
            <button type="button" className="icon-action danger" aria-label={`Remove ${skill.label}`} onClick={() => execute({ type: "skill.remove", skillId: skill.id })}><Trash2 size={15} /></button>
          </div>)}
        </div>
        <div className="skill-add"><input aria-label="New skill" placeholder="Add another skill" value={newSkill} maxLength={32} onChange={(event) => setNewSkill(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && newSkill.trim()) { event.preventDefault(); execute({ type: "skill.add", label: newSkill }); setNewSkill(""); } }} /><button type="button" disabled={!newSkill.trim() || document.skills.length >= 8} onClick={() => { execute({ type: "skill.add", label: newSkill }); setNewSkill(""); }}><Plus size={15} />Add</button></div>
      </section>}
      {contentSection === "education" && <section className="collection-editor"><header><div><strong>Education</strong><small>{document.content.education.length}/8 entries</small></div><button type="button" disabled={document.content.education.length >= 8} onClick={() => execute({ type: "education.add" })}><Plus size={15} />Add</button></header>{document.content.education.map((item) => <article key={item.id}>
        <div className="collection-title"><strong>{item.credential}</strong><button type="button" aria-label={`Remove ${item.credential}`} onClick={() => execute({ type: "education.remove", itemId: item.id })}><Trash2 size={14} /></button></div>
        <BufferedField label="Credential" value={item.credential} maxLength={140} onCommit={(value) => execute({ type: "education.update", itemId: item.id, field: "credential", value })} />
        <BufferedField label="Institution" value={item.institution} maxLength={120} allowEmpty onCommit={(value) => execute({ type: "education.update", itemId: item.id, field: "institution", value })} />
        <BufferedField label="Period" value={item.period} maxLength={80} allowEmpty onCommit={(value) => execute({ type: "education.update", itemId: item.id, field: "period", value })} />
        <BufferedField label="Details" value={item.summary} maxLength={500} multiline allowEmpty onCommit={(value) => execute({ type: "education.update", itemId: item.id, field: "summary", value })} />
      </article>)}</section>}
      {contentSection === "projects" && (
        <ProjectsToolsStudioEditor
          document={document}
          execute={execute}
          previewTarget={previewTarget}
          onPreviewTarget={onPreviewTarget}
        />
      )}
      {contentSection === "media library" && <MediaLibrary document={document} execute={execute} enabled={canUploadMedia} />}
      {contentSection === "site pages" && <PublishingEditor key="site-pages" document={document} publishedDocument={publishedDocument} execute={execute} kind="page" canUploadMedia={canUploadMedia} selectedItemId={previewTarget?.itemId} onSelect={(itemId) => onPreviewTarget?.({ section: "site pages", itemId })} onPublishItem={onPublishItem} publishingItemId={publishingItemId} publishError={itemPublishError} canDirectPublish={canDirectPublish} />}
      {contentSection === "blog posts" && <PublishingEditor key="blog-posts" document={document} publishedDocument={publishedDocument} execute={execute} kind="post" canUploadMedia={canUploadMedia} selectedItemId={previewTarget?.itemId === "__index__" ? undefined : previewTarget?.itemId} onSelect={(itemId) => onPreviewTarget?.({ section: "blog posts", itemId })} onPreviewListing={() => onPreviewTarget?.({ section: "blog posts", itemId: "__index__" })} onPublishItem={onPublishItem} publishingItemId={publishingItemId} publishError={itemPublishError} canDirectPublish={canDirectPublish} ensureSaved={ensureSaved} seededNotes={blogNotesSeed} publicSiteSlug={publicSiteSlug} />}
      {contentSection === "contact" && <>
        <BufferedField label="Section heading" value={document.content.contact.heading} maxLength={100} onCommit={(value) => execute({ type: "content.setContact", field: "heading", value })} />
        <BufferedField label="Email" value={document.content.contact.email} maxLength={120} allowEmpty onCommit={(value) => execute({ type: "content.setContact", field: "email", value })} />
        <BufferedField label="Location" value={document.content.contact.location} maxLength={100} allowEmpty onCommit={(value) => execute({ type: "content.setContact", field: "location", value })} />
        <BufferedField label="Button label" value={document.content.contact.cta} maxLength={60} onCommit={(value) => execute({ type: "content.setContact", field: "cta", value })} />
        <SocialLinksEditor document={document} execute={execute} />
      </>}
      {contentSection === "page structure" && <PageStructureEditor document={document} execute={execute} />}
      <p className="guardrail-note">Text edits save when you leave a field or five seconds after typing stops. This keeps undo history meaningful.</p>
    </div>
  );

  if (panel === "design") return (
    <div className="control-stack">
      <div className="template-defaults-reset-card"><div style={{ display: "grid", gap: "2px" }}><strong style={{ fontSize: "12.5px", color: "#f8fafc" }}>Active Template: {activeTemplate.name}</strong><small style={{ fontSize: "11px", color: "#94a3b8" }}>Reset or load this template&apos;s pre-configured AI tools, pages &amp; 5 SEO blog posts:</small></div><button type="button" className="secondary-action template-reset-action" onClick={() => execute({ type: "design.applyTemplateDefaults", value: document.design.template })}><span>↻ Load {activeTemplate.name} Default Content</span></button></div><section className="studio-template-picker" aria-labelledby="template-picker-title"><header><strong id="template-picker-title">Website template</strong><small>16 templates across 4 categories · click any template to preview its layout and default content.</small></header><div className="template-category-list">{([ ["blog-editorial", "Blogging & SEO Publications"], ["personal-brand", "Personal Brand & Advisory"], ["startup-saas", "Startup, SaaS & AI Tools"], ["interactive-3d-portfolio", "Interactive 3D Cinemas"] ] as readonly [WebsiteTemplateCategory, string][]).map(([catId, catTitle]) => { const items = getTemplatesByCategory(catId); return <div key={catId} className="template-category-group"><p className="template-category-header">{catTitle} ({items.length})</p>{items.map((template) => <button type="button" key={template.id} className={document.design.template === template.id ? "selected" : ""} aria-pressed={document.design.template === template.id} onClick={() => execute({ type: "design.setTemplate", value: template.id })}><i aria-hidden="true" /><span><strong>{template.name}{template.isDefault ? " · Flagship" : ""}</strong><small>{template.description}</small></span></button>)}</div>; })}</div></section>
      <Select label="Accent" value={document.design.accent} options={[...accentOptions]} onChange={(value) => execute({ type: "design.setAccent", value: value as never })} />
      {!flat && <Select label="Background" value={document.design.background} options={[...backgroundOptions]} onChange={(value) => execute({ type: "design.setBackground", value: value as never })} />}
      {!flat && <Select label="Hero alignment" value={document.design.heroAlignment} options={["left", "center", "right"]} onChange={(value) => execute({ type: "design.setHeroAlignment", value: value as never })} />}
      <p className="guardrail-note">Only approved design tokens are exposed, so contrast, spacing and hierarchy remain stable.</p>
    </div>
  );

  if (flat) return <div className="control-stack"><section className="template-editing-guide"><h3>{activeTemplate.name}</h3><p>This template uses a portrait and responsive typography. Edit your photo under Content → Hero, and use Design to change the accent.</p><p>Choose a cinematic template to configure an interactive 3D scene.</p></section></div>;

  return (
    <div className="control-stack">
      <Select label="Scene family" value={document.scene.family} options={[...sceneFamilyOptions]} onChange={(value) => execute({ type: "scene.setFamily", value: value as never })} />
      <Select label="Scene preset" value={document.scene.preset} options={["cosmic", "architect", "minimal"]} onChange={(value) => execute({ type: "scene.setPreset", value: value as never })} />
      <Select label="Motion" value={document.scene.motion} options={["calm", "dynamic", "still"]} onChange={(value) => execute({ type: "scene.setMotion", value: value as never })} />
      <Field label={`Visual intensity · ${Math.round(document.scene.intensity * 100)}%`}><input type="range" min="0.4" max="1.4" step="0.1" value={document.scene.intensity} onChange={(event) => execute({ type: "scene.setIntensity", value: Number(event.target.value) })} /></Field>
      <Field label="Focus a skill"><select value={document.scene.focusedSkill ?? ""} onChange={(event) => execute({ type: "scene.focusSkill", skillId: event.target.value || null })}><option value="">No focus</option>{document.skills.map((skill) => <option key={skill.id} value={skill.id}>{skill.label}</option>)}</select></Field>
      <p className="guardrail-note">The scene is parameter-driven. Voice and manual controls never generate or execute Three.js code.</p>
    </div>
  );
}

function SocialLinksEditor({ document, execute }: { document: SiteDocument; execute: (command: SiteCommand) => void }) {
  const [platform, setPlatform] = useState<(typeof socialPlatformOptions)[number]>("linkedin");
  const [url, setUrl] = useState("");
  const validUrl = /^https?:\/\/[^\s]+$/i.test(url.trim());
  const add = () => { if (!validUrl) return; execute({ type: "social.add", platform, url: url.trim() }); setUrl(""); };
  return <section className="social-editor"><header><div><Share2 size={16} /><span><strong>Social profiles</strong><small>Clickable icons appear in the Contact section.</small></span></div><em>{document.content.contact.socials.length}/10</em></header><div className="social-list">{document.content.contact.socials.map((item) => <article key={item.id}><select aria-label="Social platform" value={item.platform} onChange={(event) => execute({ type: "social.update", itemId: item.id, platform: event.target.value as typeof item.platform })}>{socialPlatformOptions.map((option) => <option key={option} value={option}>{option[0].toUpperCase() + option.slice(1)}</option>)}</select><BufferedInput ariaLabel={`${item.platform} URL`} value={item.url} maxLength={300} onCommit={(value) => { if (/^https?:\/\/[^\s]+$/i.test(value)) execute({ type: "social.update", itemId: item.id, url: value }); }} /><button type="button" className="icon-action danger" aria-label={`Remove ${item.platform} link`} onClick={() => execute({ type: "social.remove", itemId: item.id })}><Trash2 size={15} /></button></article>)}</div><div className="social-add"><select aria-label="New social platform" value={platform} onChange={(event) => setPlatform(event.target.value as typeof platform)}>{socialPlatformOptions.map((option) => <option key={option} value={option}>{option[0].toUpperCase() + option.slice(1)}</option>)}</select><ToolUrlInput aria-label="Social profile URL" type="url" placeholder="https://…" value={url} onChange={(event) => setUrl(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); add(); } }} /><button type="button" disabled={!validUrl || document.content.contact.socials.length >= 10} onClick={add}><Plus size={14} />Add</button></div>{url && !validUrl && <small className="field-error">Use a complete URL beginning with https:// or http://.</small>}</section>;
}

function OpportunityEditor({ document, execute }: { document: SiteDocument; execute: (command: SiteCommand) => void }) {
  const variant = document.opportunity;
  if (variant.status === "canonical") return <section className="opportunity-editor"><header><div><strong>Opportunity versions</strong><small>Start from this approved canonical portfolio, then tailor a separate reviewable version.</small></div></header><p className="guardrail-note">Opportunity variants are created from <strong>My projects</strong>. They preserve this portfolio as the source of truth and can be published to their own URL only after your review.</p><button type="button" className="secondary-action" onClick={() => window.location.assign("/do-it-ai")}>Open My projects</button></section>;
  const selected = new Set(variant.includedProjectIds);
  const review = reviewOpportunity(document);
  const toggleProject = (id: string) => {
    const next = selected.has(id) ? [...selected].filter((item) => item !== id) : [...selected, id];
    execute({ type: "opportunity.setIncludedProjects", projectIds: next });
  };
  return <section className="opportunity-editor"><header><div><strong>Opportunity version</strong><small>Source revision {variant.sourceRevision ?? "—"} · changes stay isolated until you publish this variant.</small></div><em>{variant.status}</em></header><BufferedField label="Opportunity title" value={variant.title} maxLength={120} onCommit={(value) => execute({ type: "opportunity.set", field: "title", value })} /><BufferedField label="Audience" value={variant.audience} maxLength={160} allowEmpty onCommit={(value) => execute({ type: "opportunity.set", field: "audience", value })} /><BufferedField label="Brief" value={variant.brief} maxLength={2400} multiline onCommit={(value) => execute({ type: "opportunity.set", field: "brief", value })} /><section className="opportunity-review" aria-label="Opportunity review"><header><div><strong>Review before publishing</strong><small>Only this independent version changes; the canonical portfolio remains untouched.</small></div><em className={review.ready ? "ready" : ""}>{review.ready ? "Ready" : "Incomplete"}</em></header><ul>{review.checks.map((check) => <li key={check.label} className={check.complete ? "complete" : ""}><span aria-hidden="true">{check.complete ? "✓" : ""}</span>{check.label}</li>)}</ul>{review.sourceAvailable ? <div className="opportunity-diff"><strong>Difference from source</strong>{review.changes.map((change) => <p key={change}>{change}</p>)}</div> : <p className="opportunity-legacy-note">This older variant has no source snapshot. Its approval checklist still applies; create a new variant for a complete source comparison.</p>}</section><Field label="Review status"><select value={variant.status} onChange={(event) => execute({ type: "opportunity.setStatus", status: event.target.value as "draft" | "review" | "published" | "archived" })}><option value="draft">Draft</option><option value="review" disabled={!review.ready}>Ready for review</option><option value="published">Published</option><option value="archived">Archived</option></select></Field><Field label="Share visibility"><select value={variant.visibility} onChange={(event) => execute({ type: "opportunity.setVisibility", visibility: event.target.value as "private" | "shared" | "public" })}><option value="private">Private</option><option value="shared">Shareable after publishing</option><option value="public">Public after publishing</option></select></Field><div className="opportunity-projects"><strong>Evidence to feature</strong><small>Select only existing approved case studies. This does not delete projects from the canonical portfolio.</small>{document.content.projects.map((project) => <label key={project.id}><input type="checkbox" checked={selected.has(project.id)} onChange={() => toggleProject(project.id)} />{project.title}</label>)}</div><BufferedField label="Owner approval notes" value={variant.approvalNotes} maxLength={1200} multiline allowEmpty onCommit={(value) => execute({ type: "opportunity.set", field: "approvalNotes", value })} /><p className="guardrail-note">The agent may propose copy and ordering, but only your approved portfolio evidence is available to this version. Publishing remains an explicit owner action.</p></section>;
}

function PageStructureEditor({ document, execute }: { document: SiteDocument; execute: (command: SiteCommand) => void }) {
  const [dragging, setDragging] = useState<PortfolioSection | null>(null);
  const [over, setOver] = useState<PortfolioSection | null>(null);
  const longPress = useRef<number | null>(null);
  const finish = (target = over) => {
    if (dragging && target) execute({ type: "section.moveTo", section: dragging, targetIndex: document.content.order.indexOf(target) });
    setDragging(null); setOver(null);
    if (longPress.current) window.clearTimeout(longPress.current);
    longPress.current = null;
  };
  return <section className="section-manager"><p>Drag sections into the order you want. Arrow controls remain available for keyboard users.</p>{document.content.order.map((section, index) => <div key={section} data-section={section} className={`${dragging === section ? "dragging" : ""} ${over === section ? "drop-target" : ""}`} draggable onDragStart={(event) => { setDragging(section); event.dataTransfer.effectAllowed = "move"; }} onDragOver={(event) => { event.preventDefault(); setOver(section); }} onDrop={(event) => { event.preventDefault(); finish(section); }} onDragEnd={() => finish(null)}>
    <button type="button" className="section-drag-handle" aria-label={`Drag ${section} to reorder`} onPointerDown={(event) => { if (event.pointerType === "mouse") return; longPress.current = window.setTimeout(() => setDragging(section), 350); }} onPointerMove={(event) => { if (!dragging || event.pointerType === "mouse") return; const target = globalThis.document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>("[data-section]")?.dataset.section as PortfolioSection | undefined; if (target) setOver(target); }} onPointerUp={() => finish()} onPointerCancel={() => finish(null)}><GripVertical size={15} /></button>
    <span>{section}</span><button type="button" disabled={index === 0} aria-label={`Move ${section} up`} onClick={() => execute({ type: "section.move", section, direction: "up" })}><ArrowUp size={14} /></button><button type="button" disabled={index === document.content.order.length - 1} aria-label={`Move ${section} down`} onClick={() => execute({ type: "section.move", section, direction: "down" })}><ArrowDown size={14} /></button><button type="button" aria-label={`${document.content.visibility[section] ? "Hide" : "Show"} ${section}`} onClick={() => execute({ type: "section.setVisible", section, value: !document.content.visibility[section] })}>{document.content.visibility[section] ? <Eye size={14} /> : <EyeOff size={14} />}</button>
  </div>)}</section>;
}

function MediaLibrary({ document, execute, enabled }: { document: SiteDocument; execute: (command: SiteCommand) => void; enabled: boolean }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [alt, setAlt] = useState("");
  async function upload(file: File) {
    if (document.media.assets.length >= 24) return setError("The media library is full. Remove an unused image first.");
    setBusy(true); setError("");
    const generatedAlt = deriveImageAlt(file.name, alt);
    const data = new FormData(); data.set("image", file); data.set("alt", generatedAlt);
    try {
      const response = await authorizedWebsiteFetch(`/api/projects/${document.projectId}/media`, { method: "POST", body: data });
      const result = await response.json();
      if (!response.ok) return setError(result.error ?? "Could not upload this image.");
      execute({ type: "media.addAsset", asset: result.asset }); setAlt("");
    } catch { setError("The image upload was interrupted."); }
    finally { setBusy(false); }
  }
  return <section className="media-library-editor"><header><div><strong>Reusable media library</strong><small>{document.media.assets.length}/24 images · JPG, PNG, or WebP · 3 MB each</small></div></header>
    {enabled ? <><div className="media-upload-box"><input aria-label="Image alternative text" placeholder="Optional now—review after upload" value={alt} maxLength={180} onChange={(event) => setAlt(event.target.value)} /><label className="headshot-upload"><input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy || document.media.assets.length >= 24} onChange={(event) => { const file = event.target.files?.[0]; if (file) void upload(file); event.currentTarget.value = ""; }} />{busy ? "Uploading…" : document.media.assets.length >= 24 ? "Library full" : "Upload image"}</label></div><small className="upload-help">Alternative text is optional before upload and editable afterward.</small></> : <p className="guardrail-note">Save this portfolio to your account before uploading project images.</p>}
    {error && <p className="form-message">{error}</p>}
    <div className="media-library-grid">{document.media.assets.map((asset) => <article key={asset.id}><div><Image src={asset.url} alt={asset.alt} fill sizes="120px" unoptimized /></div><BufferedField label="Alternative text" value={asset.alt} maxLength={180} onCommit={(value) => execute({ type: "media.updateAsset", mediaId: asset.id, alt: value })} /><button type="button" className="danger-action" onClick={() => execute({ type: "media.removeAsset", mediaId: asset.id })}><Trash2 size={14} />Remove from library</button></article>)}</div>
  </section>;
}

function ProjectGallery({ project, document, execute }: { project: SiteDocument["content"]["projects"][number]; document: SiteDocument; execute: (command: SiteCommand) => void }) {
  return <div className="project-gallery-editor"><strong>Case-study gallery</strong><small>Upload directly from the Media library section or select up to eight existing images here.</small>{document.media.assets.length ? <div>{document.media.assets.map((asset) => { const selected = project.mediaIds.includes(asset.id); return <label key={asset.id} className={selected ? "selected" : ""}><Image src={asset.url} alt="" fill sizes="72px" unoptimized /><input type="checkbox" checked={selected} disabled={!selected && project.mediaIds.length >= 8} onChange={() => execute({ type: selected ? "project.detachMedia" : "project.attachMedia", itemId: project.id, mediaId: asset.id })} /><span>{asset.alt}</span></label>; })}</div> : <p>No images uploaded yet. Use Content → Media library, then return here to attach them.</p>}</div>;
}

function HeadshotUploader({ document, execute, enabled }: { document: SiteDocument; execute: (command: SiteCommand) => void; enabled: boolean }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function upload(file: File) {
    setBusy(true); setError("");
    const data = new FormData(); data.set("headshot", file);
    try {
      const response = await authorizedWebsiteFetch(`/api/projects/${document.projectId}/headshot`, { method: "POST", body: data });
      const result = await response.json();
      if (!response.ok) return setError(result.error ?? "Could not upload the headshot.");
      execute({ type: "media.setHeadshot", url: result.url, alt: `${document.identity.name} headshot` });
    } catch { setError("The headshot upload was interrupted."); }
    finally { setBusy(false); }
  }
  return <section className="headshot-editor"><div className="headshot-preview">{document.media.headshotUrl ? <Image src={document.media.headshotUrl} alt={document.media.headshotAlt || `${document.identity.name} headshot`} fill sizes="(max-width: 700px) 130px, 320px" unoptimized /> : <span>{initials(document.identity.name)}</span>}</div><div><strong>Profile portrait</strong><small>JPG, PNG, or WebP · maximum 3 MB</small>{enabled ? <label className="headshot-upload"><input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={(event) => { const file = event.target.files?.[0]; if (file) void upload(file); }} />{busy ? "Uploading…" : document.media.headshotUrl ? "Replace image" : "Upload image"}</label> : <small>Save this portfolio to your account before uploading media.</small>}{document.media.headshotUrl && <><BufferedField label="Portrait alternative text" value={document.media.headshotAlt} maxLength={160} allowEmpty onCommit={(alt) => execute({ type: "media.setHeadshot", url: document.media.headshotUrl, alt })} /><button type="button" onClick={() => execute({ type: "media.setHeadshot", url: "", alt: "" })}>Remove</button></>}{error && <em>{error}</em>}</div></section>;
}

function initials(name: string) { return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "VF"; }

function BufferedInput({ value, maxLength, onCommit, ariaLabel }: { value: string; maxLength: number; onCommit: (value: string) => void; ariaLabel: string }) {
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);
  useEffect(() => {
    if (draft.trim() === value || !draft.trim()) return;
    const timer = window.setTimeout(() => onCommit(draft.trim()), 700);
    return () => window.clearTimeout(timer);
  }, [draft, onCommit, value]);
  const commit = () => { const next = draft.trim(); if (!next) setDraft(value); else if (next !== value) onCommit(next); };
  return <input aria-label={ariaLabel} value={draft} maxLength={maxLength} onChange={(event) => setDraft(event.target.value)} onBlur={commit} />;
}

function ProjectsToolsStudioEditor({
  document,
  execute,
  previewTarget,
  onPreviewTarget,
}: {
  document: SiteDocument;
  execute: (command: SiteCommand) => void;
  previewTarget?: PreviewTarget;
  onPreviewTarget?: (target: PreviewTarget) => void;
}) {
  const isSingleTool = document.design.template === "micro-saas-launchpad";
  const isToolTemplate = isSingleTool || document.design.template === "doitwithai-flagship";
  const projects = document.content.projects;

  const [selectedId, setSelectedId] = useState<string>(projects[0]?.id ?? "");
  const [activeTab, setActiveTab] = useState<"hero" | "inputs" | "theme" | "story">("hero");
  const [hexDraft, setHexDraft] = useState("");
  const [bgDraft, setBgDraft] = useState("");

  useEffect(() => {
    if (previewTarget?.section === "projects" && previewTarget.itemId && previewTarget.itemId !== "__index__") {
      if (projects.some((p) => p.id === previewTarget.itemId)) {
        setSelectedId(previewTarget.itemId);
        return;
      }
    }
    if (!projects.some((p) => p.id === selectedId)) {
      setSelectedId(projects[0]?.id ?? "");
    }
  }, [previewTarget, projects, selectedId]);

  const activeItem = projects.find((p) => p.id === selectedId) ?? projects[0];
  useEffect(() => {
    setHexDraft(activeItem?.toolAccentHex ?? "");
    setBgDraft(activeItem?.toolBackgroundHex ?? "");
  }, [activeItem?.id, activeItem?.toolAccentHex, activeItem?.toolBackgroundHex]);

  const resolvedCatalogSlug = resolveCatalogToolSlug(activeItem);
  const catalogTool = getCatalogToolBySlug(resolvedCatalogSlug);
  const manifestEntry = getTransferredToolManifestEntry(resolvedCatalogSlug);
  const isUpdateAvailable = Boolean(
    manifestEntry && activeItem?.installedToolVersion !== manifestEntry.versionLabel,
  );
  const heroOverrideFlags = activeItem
    ? shouldApplyHeroOverride(activeItem, catalogTool)
    : { title: false, summary: false, role: false, period: false, technologies: false };
  const hasAnyHeroCustomization =
    Boolean(resolvedCatalogSlug) &&
    (heroOverrideFlags.title ||
      heroOverrideFlags.summary ||
      heroOverrideFlags.role ||
      heroOverrideFlags.period ||
      heroOverrideFlags.technologies ||
      Boolean(activeItem?.heroHighlights?.length));

  function restoreOriginalHeroCopy() {
    if (!activeItem || !catalogTool) return;
    const autoBadges = Array.from(
      new Set([
        ...(catalogTool.categories || []),
        ...(catalogTool.topics || []),
        ...(catalogTool.tags || []).slice(0, 4),
      ]),
    )
      .map((item) => item.trim().slice(0, 32))
      .filter(Boolean)
      .slice(0, 6);
    execute({ type: "project.update", itemId: activeItem.id, field: "title", value: catalogTool.name.slice(0, 100) });
    execute({ type: "project.update", itemId: activeItem.id, field: "summary", value: catalogTool.description.slice(0, 500) });
    execute({ type: "project.update", itemId: activeItem.id, field: "role", value: "" });
    execute({ type: "project.update", itemId: activeItem.id, field: "period", value: "" });
    execute({ type: "project.update", itemId: activeItem.id, field: "technologies", value: autoBadges });
    execute({ type: "project.update", itemId: activeItem.id, field: "heroHighlights", value: [] });
  }

  const TOOL_ACCENT_SWATCHES = [
    { label: "Cyan", hex: "#22d3ee" },
    { label: "Indigo", hex: "#6366f1" },
    { label: "Emerald", hex: "#10b981" },
    { label: "Violet", hex: "#a78bfa" },
    { label: "Amber", hex: "#f59e0b" },
    { label: "Rose", hex: "#f43f5e" },
  ];

  const TOOL_BACKGROUND_SWATCHES = [
    { label: "Deep Navy", hex: "#070d19" },
    { label: "Midnight", hex: "#050b18" },
    { label: "Slate Ink", hex: "#0f172a" },
    { label: "Crisp White", hex: "#ffffff" },
    { label: "Ivory Paper", hex: "#f8fafc" },
  ];

  return (
    <div style={{ display: "grid", gap: "12px", minWidth: 0, maxWidth: "100%" }}>
      <CatalogToolInstaller document={document} execute={execute} />

      <section className="collection-editor" style={{ minWidth: 0 }}>
        <header style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
          <div style={{ minWidth: 0 }}>
            <strong>
              {isSingleTool
                ? "Flagship Tool Landing Page"
                : isToolTemplate
                  ? `Installed AI Tools (${projects.length}/8)`
                  : `Tools & Projects (${projects.length}/8)`}
            </strong>
            <small>
              {isSingleTool
                ? "Select & customize the live landing page on Home"
                : "Click a tool below to preview & customize its landing page"}
            </small>
          </div>
          {!isSingleTool && (
            <button
              type="button"
              disabled={projects.length >= 8}
              onClick={() => execute({ type: "project.add" })}
              style={{ flexShrink: 0 }}
            >
              <Plus size={14} /> Custom Tool
            </button>
          )}
        </header>

        <div className="tool-studio-list">
          {projects.map((item, index) => {
            const isSelected = activeItem?.id === item.id;
            const itemCatalogSlug = resolveCatalogToolSlug(item);
            return (
              <div
                key={item.id}
                className={`tool-studio-row ${isSelected ? "selected" : ""}`}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px", minWidth: 0 }}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedId(item.id);
                      onPreviewTarget?.({ section: "projects", itemId: item.id });
                    }}
                    style={{
                      flex: 1,
                      minWidth: 0,
                      textAlign: "left",
                      background: "transparent",
                      border: 0,
                      padding: 0,
                      cursor: "pointer",
                      display: "grid",
                      gap: "3px",
                    }}
                  >
                    <span style={{ fontSize: "10px", fontWeight: 700, color: itemCatalogSlug ? "#38bdf8" : "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      {String(index + 1).padStart(2, "0")} · {itemCatalogSlug ? `Transferred /tools/${itemCatalogSlug}` : "Custom Interactive Tool"}
                    </span>
                    <strong style={{ fontSize: "12.5px", color: "#f8fafc", lineHeight: 1.3, overflowWrap: "anywhere" }}>
                      {item.title}
                    </strong>
                  </button>
                  <div style={{ display: "flex", alignItems: "center", gap: "3px", flexShrink: 0 }}>
                    <button
                      type="button"
                      disabled={index === 0}
                      aria-label={`Move ${item.title} up`}
                      onClick={() => execute({ type: "project.move", itemId: item.id, direction: "up" })}
                      style={{ padding: "4px", borderRadius: "6px", border: "1px solid var(--line)", background: "rgba(255,255,255,0.04)", cursor: index === 0 ? "not-allowed" : "pointer" }}
                    >
                      <ArrowUp size={13} />
                    </button>
                    <button
                      type="button"
                      disabled={index === projects.length - 1}
                      aria-label={`Move ${item.title} down`}
                      onClick={() => execute({ type: "project.move", itemId: item.id, direction: "down" })}
                      style={{ padding: "4px", borderRadius: "6px", border: "1px solid var(--line)", background: "rgba(255,255,255,0.04)", cursor: index === projects.length - 1 ? "not-allowed" : "pointer" }}
                    >
                      <ArrowDown size={13} />
                    </button>
                    <button
                      type="button"
                      aria-label={`Remove ${item.title}`}
                      onClick={() => execute({ type: "project.remove", itemId: item.id })}
                      style={{ padding: "4px", borderRadius: "6px", border: "1px solid rgba(253,164,175,0.3)", background: "rgba(253,164,175,0.08)", color: "#fda4af", cursor: "pointer" }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center" }}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedId(item.id);
                      onPreviewTarget?.({ section: "projects", itemId: item.id });
                    }}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                      padding: "4px 9px",
                      borderRadius: "7px",
                      border: isSelected ? "1px solid var(--accent)" : "1px solid var(--line)",
                      background: isSelected ? "rgba(var(--accent-rgb), 0.16)" : "rgba(255,255,255,0.04)",
                      color: isSelected ? "#ffffff" : "#cbd5e1",
                      fontSize: "11px",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    <ExternalLink size={11} />
                    {isSelected ? "Editing & Previewing" : "Preview & Customize"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {activeItem && (
          <article style={{ minWidth: 0, maxWidth: "100%", display: "grid", gap: "11px", marginTop: "6px" }}>
            <div style={{ display: "grid", gap: "3px", borderBottom: "1px solid var(--line)", paddingBottom: "8px" }}>
              <span style={{ fontSize: "10px", fontWeight: 800, color: "var(--accent)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                TOOL LANDING PAGE STUDIO CUSTOMIZER
              </span>
              <strong style={{ fontSize: "13.5px", color: "#ffffff", overflowWrap: "anywhere" }}>
                {activeItem.title}
              </strong>
              {resolvedCatalogSlug && (
                <small style={{ color: "#94a3b8", fontSize: "11px" }}>
                  Live source: <code>/tools/{resolvedCatalogSlug}</code>
                  {activeItem.installedToolVersion && (
                    <> · Installed <code>{activeItem.installedToolVersion}</code></>
                  )}
                </small>
              )}
              {resolvedCatalogSlug && manifestEntry && (isUpdateAvailable || activeItem.previousToolSnapshot) && (
                <div
                  style={{
                    marginTop: "6px",
                    padding: "8px 10px",
                    borderRadius: "9px",
                    background: isUpdateAvailable ? "rgba(245, 158, 11, 0.1)" : "rgba(16, 185, 129, 0.08)",
                    border: isUpdateAvailable
                      ? "1px solid rgba(245, 158, 11, 0.35)"
                      : "1px solid rgba(16, 185, 129, 0.28)",
                    display: "grid",
                    gap: "6px",
                    fontSize: "11px",
                    color: "#e2e8f0",
                  }}
                >
                  <span>
                    {isUpdateAvailable ? (
                      <>
                        New Upstream Version Detected (<code>{manifestEntry.versionLabel}</code> vs{" "}
                        <code>{activeItem.installedToolVersion || "unversioned"}</code>). Sync while
                        keeping a rollback snapshot.
                      </>
                    ) : (
                      <>
                        Running latest upstream version (<code>{manifestEntry.versionLabel}</code>).
                        Previous snapshot available for rollback.
                      </>
                    )}
                  </span>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {isUpdateAvailable && (
                      <button
                        type="button"
                        onClick={() =>
                          execute({
                            type: "project.syncCatalogToolVersion",
                            itemId: activeItem.id,
                            versionLabel: manifestEntry.versionLabel,
                            metaTitle: manifestEntry.metaTitle,
                            metaDescription: manifestEntry.metaDescription,
                            title: catalogTool?.name,
                            summary: catalogTool?.description,
                            overwriteCustomCopy: false,
                          })
                        }
                        style={{
                          padding: "5px 10px",
                          borderRadius: "7px",
                          border: "1px solid rgba(245, 158, 11, 0.45)",
                          background: "rgba(245, 158, 11, 0.18)",
                          color: "#fde68a",
                          fontSize: "11px",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        Update to Latest ({manifestEntry.versionLabel})
                      </button>
                    )}
                    {activeItem.previousToolSnapshot && (
                      <button
                        type="button"
                        onClick={() =>
                          execute({
                            type: "project.revertCatalogToolVersion",
                            itemId: activeItem.id,
                          })
                        }
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          padding: "5px 10px",
                          borderRadius: "7px",
                          border: "1px solid rgba(148, 163, 184, 0.35)",
                          background: "rgba(15, 23, 42, 0.78)",
                          color: "#cbd5e1",
                          fontSize: "11px",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        <RotateCcw size={11} /> Revert to Previous Version
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            <nav className="tool-studio-tabs" aria-label="Tool landing page customization tabs">
              <button
                type="button"
                className={activeTab === "hero" ? "active" : ""}
                onClick={() => setActiveTab("hero")}
              >
                1. Hero &amp; Copy
              </button>
              <button
                type="button"
                className={activeTab === "inputs" ? "active" : ""}
                onClick={() => setActiveTab("inputs")}
              >
                2. Default Inputs
              </button>
              <button
                type="button"
                className={activeTab === "theme" ? "active" : ""}
                onClick={() => setActiveTab("theme")}
              >
                3. Theme &amp; Colors
              </button>
              <button
                type="button"
                className={activeTab === "story" ? "active" : ""}
                onClick={() => setActiveTab("story")}
              >
                4. Story &amp; FAQs
              </button>
            </nav>

            {activeTab === "hero" && (
              <div key={`${activeItem.id}-hero`} style={{ display: "grid", gap: "10px", minWidth: 0 }}>
                {resolvedCatalogSlug && (
                  <div
                    style={{
                      padding: "8px 10px",
                      borderRadius: "9px",
                      background: "rgba(56, 189, 248, 0.08)",
                      border: "1px solid rgba(56, 189, 248, 0.28)",
                      display: "grid",
                      gap: "6px",
                      fontSize: "11px",
                      color: "#cbd5e1",
                    }}
                  >
                    <span>
                      {hasAnyHeroCustomization
                        ? "Custom Hero overrides active on transferred landing page."
                        : "Showing exact main-website Hero copy as-is. Edit any field below to customize."}
                    </span>
                    {hasAnyHeroCustomization && catalogTool && (
                      <button
                        type="button"
                        onClick={restoreOriginalHeroCopy}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "5px",
                          padding: "5px 9px",
                          borderRadius: "7px",
                          border: "1px solid rgba(56, 189, 248, 0.35)",
                          background: "rgba(15, 23, 42, 0.8)",
                          color: "#7dd3fc",
                          fontSize: "11px",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        <RotateCcw size={12} /> Restore Original Main-Site Hero
                      </button>
                    )}
                  </div>
                )}
                <BufferedField
                  label="Landing Page H1 Title"
                  value={activeItem.title}
                  maxLength={100}
                  onCommit={(value) => execute({ type: "project.update", itemId: activeItem.id, field: "title", value })}
                />
                <BufferedField
                  label={`SEO Meta Title (${(activeItem.metaTitle ?? manifestEntry?.metaTitle ?? activeItem.title).length}/60 recommended)`}
                  value={activeItem.metaTitle ?? ""}
                  maxLength={120}
                  allowEmpty
                  placeholder={manifestEntry?.metaTitle || `${activeItem.title} | ${document.identity.name}`}
                  onCommit={(value) => execute({ type: "project.update", itemId: activeItem.id, field: "metaTitle", value })}
                />
                <BufferedField
                  label={`SEO Meta Description (${(activeItem.metaDescription ?? manifestEntry?.metaDescription ?? activeItem.summary).length}/155 recommended)`}
                  value={activeItem.metaDescription ?? ""}
                  maxLength={320}
                  multiline
                  allowEmpty
                  placeholder={manifestEntry?.metaDescription || activeItem.summary}
                  onCommit={(value) => execute({ type: "project.update", itemId: activeItem.id, field: "metaDescription", value })}
                />
                <BufferedField
                  label="Hero Lead Subtitle"
                  value={activeItem.summary}
                  maxLength={500}
                  multiline
                  allowEmpty
                  onCommit={(value) => execute({ type: "project.update", itemId: activeItem.id, field: "summary", value })}
                />
                <BufferedField
                  label="Hero Eyebrow / Kicker"
                  value={activeItem.role}
                  maxLength={100}
                  allowEmpty
                  placeholder="e.g. On-Page SEO · Free AI Tool"
                  onCommit={(value) => execute({ type: "project.update", itemId: activeItem.id, field: "role", value })}
                />
                <BufferedField
                  label="Feature Badges (comma separated)"
                  value={activeItem.technologies.join(", ")}
                  maxLength={260}
                  allowEmpty
                  placeholder="600px Pixel Guard, Live SERP Preview, Free"
                  onCommit={(value) =>
                    execute({
                      type: "project.update",
                      itemId: activeItem.id,
                      field: "technologies",
                      value: value.split(",").map((entry) => entry.trim()).filter(Boolean),
                    })
                  }
                />
                <BufferedField
                  label="Right Hero Card Heading"
                  value={activeItem.period}
                  maxLength={80}
                  allowEmpty
                  placeholder="e.g. What This Tool Generates"
                  onCommit={(value) => execute({ type: "project.update", itemId: activeItem.id, field: "period", value })}
                />
                <BufferedField
                  label="Right Hero Card Highlights (one bullet per line, max 6)"
                  value={(activeItem.heroHighlights ?? []).join("\n")}
                  maxLength={960}
                  multiline
                  allowEmpty
                  placeholder={"Instant Audit: Inspect 28 SEO factors live\nZero Login: Runs inside the visitor browser"}
                  onCommit={(value) =>
                    execute({
                      type: "project.update",
                      itemId: activeItem.id,
                      field: "heroHighlights",
                      value: value
                        .split(/\r?\n/)
                        .map((line) => line.trim().slice(0, 160))
                        .filter(Boolean)
                        .slice(0, 6),
                    })
                  }
                />
                <BufferedField
                  label="URL Slug"
                  value={activeItem.caseStudySlug}
                  maxLength={80}
                  onCommit={(value) =>
                    execute({
                      type: "project.update",
                      itemId: activeItem.id,
                      field: "caseStudySlug",
                      value: normalizePublishingSlug(value),
                    })
                  }
                />
              </div>
            )}

            {activeTab === "inputs" && (
              <div key={`${activeItem.id}-inputs`} style={{ display: "grid", gap: "10px", minWidth: 0 }}>
                <p className="guardrail-note" style={{ margin: 0 }}>
                  Pre-fill the transferred tool&apos;s interactive input fields and primary CTA button label for every visitor who opens this landing page.
                </p>
                <BufferedField
                  label="Default Primary Input (Topic / URL / Keyword)"
                  value={activeItem.defaultInput ?? ""}
                  maxLength={2000}
                  allowEmpty
                  placeholder="e.g. Best AI Workflow Tools for Agencies"
                  onCommit={(value) =>
                    execute({ type: "project.update", itemId: activeItem.id, field: "defaultInput", value })
                  }
                />
                <BufferedField
                  label="Default Secondary Input / Draft Content"
                  value={activeItem.defaultSecondaryInput ?? ""}
                  maxLength={4000}
                  multiline
                  allowEmpty
                  placeholder="Optional default draft text, HTML snippet, or description pre-loaded into the tool textarea..."
                  onCommit={(value) =>
                    execute({ type: "project.update", itemId: activeItem.id, field: "defaultSecondaryInput", value })
                  }
                />
                <BufferedField
                  label="Custom Primary Action Button Label"
                  value={activeItem.customCtaLabel ?? ""}
                  maxLength={90}
                  allowEmpty
                  placeholder="e.g. Run Free SEO Analysis"
                  onCommit={(value) =>
                    execute({ type: "project.update", itemId: activeItem.id, field: "customCtaLabel", value })
                  }
                />
              </div>
            )}

            {activeTab === "theme" && (
              <div key={`${activeItem.id}-theme`} style={{ display: "grid", gap: "11px", minWidth: 0 }}>
                <Field label="Landing Page Theme Mode">
                  <select
                    value={activeItem.toolThemeMode ?? "auto"}
                    onChange={(event) =>
                      execute({
                        type: "project.update",
                        itemId: activeItem.id,
                        field: "toolThemeMode",
                        value: event.target.value,
                      })
                    }
                  >
                    <option value="auto">Match Website Theme (Auto)</option>
                    <option value="dark">Dark Mode Surface</option>
                    <option value="light">Light Mode Surface</option>
                  </select>
                </Field>

                <div style={{ display: "grid", gap: "6px" }}>
                  <span style={{ color: "#b4bed1", fontSize: "12px", fontWeight: 600 }}>
                    Per-Tool Accent Color Override
                  </span>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <input
                      type="color"
                      aria-label="Pick tool accent color"
                      value={/^#[0-9a-f]{6}$/i.test(hexDraft) ? hexDraft : "#22d3ee"}
                      onChange={(e) => {
                        setHexDraft(e.target.value);
                        execute({
                          type: "project.update",
                          itemId: activeItem.id,
                          field: "toolAccentHex",
                          value: e.target.value,
                        });
                      }}
                      style={{ width: "42px", height: "36px", padding: "2px", borderRadius: "8px", border: "1px solid var(--line)", background: "transparent", cursor: "pointer", flexShrink: 0 }}
                    />
                    <input
                      type="text"
                      aria-label="Tool accent hex color"
                      value={hexDraft}
                      maxLength={32}
                      placeholder="#22d3ee (inherits site accent)"
                      onChange={(e) => setHexDraft(e.target.value)}
                      onBlur={() =>
                        execute({
                          type: "project.update",
                          itemId: activeItem.id,
                          field: "toolAccentHex",
                          value: hexDraft.trim(),
                        })
                      }
                      style={{
                        flex: 1,
                        minWidth: 0,
                        padding: "8px 10px",
                        borderRadius: "8px",
                        border: "1px solid var(--line)",
                        background: "rgba(0,0,0,0.25)",
                        color: "var(--text)",
                        fontSize: "12px",
                      }}
                    />
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center" }}>
                    {TOOL_ACCENT_SWATCHES.map((swatch) => (
                      <button
                        key={swatch.hex}
                        type="button"
                        title={`${swatch.label} (${swatch.hex})`}
                        aria-label={`Set accent ${swatch.label}`}
                        onClick={() => {
                          setHexDraft(swatch.hex);
                          execute({
                            type: "project.update",
                            itemId: activeItem.id,
                            field: "toolAccentHex",
                            value: swatch.hex,
                          });
                        }}
                        style={{
                          width: "24px",
                          height: "24px",
                          borderRadius: "999px",
                          border: activeItem.toolAccentHex === swatch.hex ? "2px solid #ffffff" : "1px solid rgba(255,255,255,0.25)",
                          background: swatch.hex,
                          cursor: "pointer",
                        }}
                      />
                    ))}
                    {activeItem.toolAccentHex && (
                      <button
                        type="button"
                        onClick={() => {
                          setHexDraft("");
                          execute({
                            type: "project.update",
                            itemId: activeItem.id,
                            field: "toolAccentHex",
                            value: "",
                          });
                        }}
                        style={{
                          padding: "4px 8px",
                          borderRadius: "7px",
                          border: "1px solid var(--line)",
                          background: "rgba(255,255,255,0.05)",
                          color: "#cbd5e1",
                          fontSize: "10.5px",
                          cursor: "pointer",
                        }}
                      >
                        Use Site Default
                      </button>
                    )}
                  </div>
                </div>

                <div style={{ display: "grid", gap: "6px", paddingTop: "6px", borderTop: "1px solid var(--line)" }}>
                  <span style={{ color: "#b4bed1", fontSize: "12px", fontWeight: 600 }}>
                    Per-Tool Background Color Override
                  </span>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <input
                      type="color"
                      aria-label="Pick tool background color"
                      value={/^#[0-9a-f]{6}$/i.test(bgDraft) ? bgDraft : "#070d19"}
                      onChange={(e) => {
                        setBgDraft(e.target.value);
                        execute({
                          type: "project.update",
                          itemId: activeItem.id,
                          field: "toolBackgroundHex",
                          value: e.target.value,
                        });
                      }}
                      style={{ width: "42px", height: "36px", padding: "2px", borderRadius: "8px", border: "1px solid var(--line)", background: "transparent", cursor: "pointer", flexShrink: 0 }}
                    />
                    <input
                      type="text"
                      aria-label="Tool background hex color"
                      value={bgDraft}
                      maxLength={32}
                      placeholder="#070d19 (inherits website surface)"
                      onChange={(e) => setBgDraft(e.target.value)}
                      onBlur={() =>
                        execute({
                          type: "project.update",
                          itemId: activeItem.id,
                          field: "toolBackgroundHex",
                          value: bgDraft.trim(),
                        })
                      }
                      style={{
                        flex: 1,
                        minWidth: 0,
                        padding: "8px 10px",
                        borderRadius: "8px",
                        border: "1px solid var(--line)",
                        background: "rgba(0,0,0,0.25)",
                        color: "var(--text)",
                        fontSize: "12px",
                      }}
                    />
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center" }}>
                    {TOOL_BACKGROUND_SWATCHES.map((swatch) => (
                      <button
                        key={swatch.hex}
                        type="button"
                        title={`${swatch.label} (${swatch.hex})`}
                        aria-label={`Set background ${swatch.label}`}
                        onClick={() => {
                          setBgDraft(swatch.hex);
                          execute({
                            type: "project.update",
                            itemId: activeItem.id,
                            field: "toolBackgroundHex",
                            value: swatch.hex,
                          });
                        }}
                        style={{
                          width: "24px",
                          height: "24px",
                          borderRadius: "6px",
                          border: activeItem.toolBackgroundHex === swatch.hex ? "2px solid var(--accent)" : "1px solid rgba(148,163,184,0.45)",
                          background: swatch.hex,
                          cursor: "pointer",
                        }}
                      />
                    ))}
                    {activeItem.toolBackgroundHex && (
                      <button
                        type="button"
                        onClick={() => {
                          setBgDraft("");
                          execute({
                            type: "project.update",
                            itemId: activeItem.id,
                            field: "toolBackgroundHex",
                            value: "",
                          });
                        }}
                        style={{
                          padding: "4px 8px",
                          borderRadius: "7px",
                          border: "1px solid var(--line)",
                          background: "rgba(255,255,255,0.05)",
                          color: "#cbd5e1",
                          fontSize: "10.5px",
                          cursor: "pointer",
                        }}
                      >
                        Use Site Default
                      </button>
                    )}
                  </div>
                </div>

                <div style={{ display: "grid", gap: "8px", paddingTop: "4px", borderTop: "1px solid var(--line)" }}>
                  <span style={{ color: "#b4bed1", fontSize: "12px", fontWeight: 600 }}>
                    Landing Page Sections
                  </span>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#e2e8f0", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={Boolean(activeItem.hideEducationSection)}
                      onChange={(e) =>
                        execute({
                          type: "project.update",
                          itemId: activeItem.id,
                          field: "hideEducationSection",
                          value: e.target.checked,
                        })
                      }
                    />
                    <span>Hide Educational / How-It-Works Sections</span>
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#e2e8f0", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={Boolean(activeItem.hideFaqSection)}
                      onChange={(e) =>
                        execute({
                          type: "project.update",
                          itemId: activeItem.id,
                          field: "hideFaqSection",
                          value: e.target.checked,
                        })
                      }
                    />
                    <span>Hide FAQ Accordion Section</span>
                  </label>
                </div>
              </div>
            )}

            {activeTab === "story" && (
              <div key={`${activeItem.id}-story`} style={{ display: "grid", gap: "10px", minWidth: 0 }}>
                <CustomFaqsEditor
                  faqs={activeItem.customFaqs ?? []}
                  onChange={(nextFaqs) =>
                    execute({
                      type: "project.update",
                      itemId: activeItem.id,
                      field: "customFaqs",
                      value: nextFaqs,
                    })
                  }
                />
                <BufferedField
                  label="Methodology Note: Problem / Challenge"
                  value={activeItem.challenge}
                  maxLength={1200}
                  multiline
                  allowEmpty
                  onCommit={(value) =>
                    execute({ type: "project.update", itemId: activeItem.id, field: "challenge", value })
                  }
                />
                <BufferedField
                  label="Methodology Note: Approach"
                  value={activeItem.approach}
                  maxLength={1800}
                  multiline
                  allowEmpty
                  onCommit={(value) =>
                    execute({ type: "project.update", itemId: activeItem.id, field: "approach", value })
                  }
                />
                <BufferedField
                  label="Methodology Note: Outcome"
                  value={activeItem.outcome}
                  maxLength={1200}
                  multiline
                  allowEmpty
                  onCommit={(value) =>
                    execute({ type: "project.update", itemId: activeItem.id, field: "outcome", value })
                  }
                />
                <BufferedField
                  label="External Reference URL (Optional)"
                  value={activeItem.link}
                  maxLength={300}
                  allowEmpty
                  onCommit={(value) =>
                    execute({ type: "project.update", itemId: activeItem.id, field: "link", value })
                  }
                />
                <ProjectGallery project={activeItem} document={document} execute={execute} />
              </div>
            )}
          </article>
        )}
      </section>
    </div>
  );
}

function CustomFaqsEditor({
  faqs,
  onChange,
}: {
  faqs: Array<{ question: string; answer: string }>;
  onChange: (next: Array<{ question: string; answer: string }>) => void;
}) {
  const [drafts, setDrafts] = useState(faqs);

  useEffect(() => {
    setDrafts(faqs);
  }, [faqs]);

  function commitDrafts(next: Array<{ question: string; answer: string }>) {
    const valid = next
      .map((item) => ({
        question: item.question.trim().slice(0, 220),
        answer: item.answer.trim().slice(0, 1200),
      }))
      .filter((item) => item.question.length > 0 && item.answer.length > 0);
    onChange(valid);
  }

  return (
    <div style={{ display: "grid", gap: "8px", padding: "10px", borderRadius: "10px", border: "1px solid var(--line)", background: "rgba(15, 23, 42, 0.45)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
        <div>
          <strong style={{ fontSize: "12px", color: "#f8fafc", display: "block" }}>
            Custom Landing Page FAQs ({drafts.length}/8)
          </strong>
          <small style={{ fontSize: "10.5px", color: "#94a3b8" }}>
            {drafts.length > 0 ? "Replaces original FAQ items." : "Leave empty to keep main-site FAQs."}
          </small>
        </div>
        <button
          type="button"
          disabled={drafts.length >= 8}
          onClick={() => {
            const next = [
              ...drafts,
              {
                question: "How does this tool help my workflow?",
                answer: "Enter your inputs above and generate actionable results right in your browser.",
              },
            ];
            setDrafts(next);
            commitDrafts(next);
          }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            padding: "5px 9px",
            borderRadius: "7px",
            border: "1px solid rgba(56, 189, 248, 0.35)",
            background: "rgba(56, 189, 248, 0.12)",
            color: "#7dd3fc",
            fontSize: "11px",
            fontWeight: 700,
            cursor: drafts.length >= 8 ? "not-allowed" : "pointer",
          }}
        >
          <Plus size={12} /> Add FAQ
        </button>
      </div>

      {drafts.map((faq, idx) => (
        <div key={idx} style={{ display: "grid", gap: "6px", padding: "8px", borderRadius: "8px", background: "rgba(0,0,0,0.22)", border: "1px solid var(--line)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "10.5px", fontWeight: 700, color: "var(--accent)" }}>FAQ #{idx + 1}</span>
            <button
              type="button"
              aria-label={`Remove FAQ ${idx + 1}`}
              onClick={() => {
                const next = drafts.filter((_, i) => i !== idx);
                setDrafts(next);
                commitDrafts(next);
              }}
              style={{ border: 0, background: "transparent", color: "#fda4af", cursor: "pointer", padding: "2px" }}
            >
              <Trash2 size={13} />
            </button>
          </div>
          <input
            type="text"
            value={faq.question}
            maxLength={220}
            placeholder="FAQ Question..."
            onChange={(e) => {
              const next = drafts.map((item, i) => (i === idx ? { ...item, question: e.target.value } : item));
              setDrafts(next);
            }}
            onBlur={() => commitDrafts(drafts)}
          />
          <textarea
            rows={2}
            value={faq.answer}
            maxLength={1200}
            placeholder="FAQ Answer..."
            onChange={(e) => {
              const next = drafts.map((item, i) => (i === idx ? { ...item, answer: e.target.value } : item));
              setDrafts(next);
            }}
            onBlur={() => commitDrafts(drafts)}
          />
        </div>
      ))}

      {drafts.length > 0 && (
        <button
          type="button"
          onClick={() => {
            setDrafts([]);
            onChange([]);
          }}
          style={{
            padding: "5px 9px",
            borderRadius: "7px",
            border: "1px solid var(--line)",
            background: "transparent",
            color: "#cbd5e1",
            fontSize: "11px",
            cursor: "pointer",
          }}
        >
          Clear Custom FAQs (Restore Original)
        </button>
      )}
    </div>
  );
}

function BufferedField({ label, value, maxLength, multiline = false, allowEmpty = false, placeholder, onCommit }: { label: string; value: string; maxLength: number; multiline?: boolean; allowEmpty?: boolean; placeholder?: string; onCommit: (value: string) => void }) {
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);
  useEffect(() => {
    if (draft.trim() === value || (!allowEmpty && !draft.trim())) return;
    const timer = window.setTimeout(() => onCommit(draft.trim()), 700);
    return () => window.clearTimeout(timer);
  }, [allowEmpty, draft, onCommit, value]);
  const commit = () => { const next = label.toLowerCase().includes("slug") ? normalizePublishingSlug(draft) : draft.trim(); setDraft(next); if (!allowEmpty && !next) setDraft(value); else if (next !== value) onCommit(next); };
  return <Field label={label}>{multiline ? <textarea value={draft} maxLength={maxLength} rows={4} placeholder={placeholder} onChange={(event) => setDraft(event.target.value)} onBlur={commit} /> : <input value={draft} maxLength={maxLength} placeholder={placeholder} onChange={(event) => setDraft(event.target.value)} onBlur={commit} />}</Field>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="field"><span>{label}</span>{children}</label>; }
function Select({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) { return <Field label={label}><select value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option key={option}>{option}</option>)}</select></Field>; }
