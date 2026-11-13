"use client";

import { ArrowDown, ArrowUp, Check, FileText, GripVertical, ImagePlus, List, ListOrdered, Plus, Send, Trash2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import type { SiteCommand } from "@/features/website-builder/domain/commands";
import type { SiteDocument } from "@/features/website-builder/domain/site-document";
import { requestJson } from "./use-draft-save";
import { DocumentEditor } from "@/features/website-builder/content/document-editor";
import { missingPublicationFields } from "@/features/website-builder/domain/publication-selection";
import { normalizePublishingSlug } from "@/features/website-builder/domain/commands";
import { RichTextField } from "@/features/website-builder/content/rich-text";
import { deriveImageAlt } from "@/features/website-builder/domain/media";
import { WriterStudioBridgeCard } from "./WriterStudioBridgeCard";

type Kind = "page" | "post";
type Publishable = SiteDocument["publishing"]["pages"][number] | SiteDocument["publishing"]["posts"][number];
type Props = { document: SiteDocument; publishedDocument?: SiteDocument; execute: (command: SiteCommand) => void; kind: Kind; canUploadMedia: boolean; selectedItemId?: string; onSelect?: (itemId: string) => void; onPreviewListing?: () => void; onPublishItem?: (kind: Kind, itemId: string, status: "draft" | "published") => void; publishingItemId?: string; publishError?: string; canDirectPublish?: boolean; ensureSaved?: () => Promise<number>; seededNotes?: { id: number; text: string }; publicSiteSlug?: string };

export function PublishingEditor({ document, publishedDocument, execute, kind, canUploadMedia, selectedItemId, onSelect, onPreviewListing, onPublishItem, publishingItemId = "", publishError = "", canDirectPublish = false, ensureSaved, seededNotes, publicSiteSlug }: Props) {
  const collection = kind === "page" ? document.publishing.pages : document.publishing.posts;
  const selectedId = selectedItemId && collection.some((entry) => entry.id === selectedItemId) ? selectedItemId : collection[0]?.id ?? "";
  useEffect(() => { if (selectedId && selectedId !== selectedItemId) onSelect?.(selectedId); }, [onSelect, selectedId, selectedItemId]);
  const item = collection.find((entry) => entry.id === selectedId);
  const isPage = kind === "page";
  const readiness = item ? publicationReadiness(item, kind, document) : [];
  const ready = readiness.every((entry) => entry.complete);
  const isPublishing = Boolean(item && (publishingItemId === item.id || publishingItemId === "__snapshot__"));
  const publishedCollection = kind === "page" ? publishedDocument?.publishing.pages : publishedDocument?.publishing.posts;
  const publishedItem = item ? publishedCollection?.find((entry) => entry.id === item.id) : undefined;
  const isLive = publishedItem?.status === "published";
  const hasUnpublishedChanges = item ? !publishedItem || JSON.stringify({...item,status:undefined,publishedAt:undefined}) !== JSON.stringify({...publishedItem,status:undefined,publishedAt:undefined}) : false;
  const statusLabel = isLive ? hasUnpublishedChanges ? "published · changes pending" : "published" : "draft";

  return <section className="publishing-editor">
    <div className="content-explainer"><strong>{isPage ? "Standalone site pages" : "Blog posts"}</strong><p>{isPage ? "Create long-form pages such as a detailed About page, Services, Process, or Resources. Published pages can appear in your site navigation." : "Create articles here. Every published article is collected automatically on one Blog page—articles are never added as separate navigation tabs."}</p></div>
    <header><div><strong>{isPage ? "Site pages" : "Articles"}</strong><small>{collection.length}/{isPage ? 12 : 24} · drafts stay private</small></div><div className="publishing-header-actions">{!isPage && collection.length > 0 && <button type="button" className="secondary-action" onClick={onPreviewListing}>Preview Blog listing</button>}<button type="button" disabled={collection.length >= (isPage ? 12 : 24)} onClick={() => execute({ type: "publishing.add", kind })}><Plus size={15} />New {isPage ? "page" : "article"}</button></div></header>
    {collection.length > 0 && <div className="publishing-picker">{collection.map((entry) => <button type="button" className={entry.id === selectedId ? "active" : ""} key={entry.id} onClick={() => onSelect?.(entry.id)}><FileText size={14} /><span>{entry.title}<small>{publishedCollection?.some(p=>p.id===entry.id)?"published":"draft"} · /{entry.slug}</small></span></button>)}</div>}
    {!item ? <div className="portfolio-empty-state">Create your first {isPage ? "standalone page" : "blog article"}.</div> : <>
      <div className="publishable-toolbar"><span className={`content-status ${isLive ? "published" : "draft"}`}>{statusLabel}</span><button type="button" className="secondary-action" disabled={!isLive || isPublishing} onClick={() => onPublishItem?.(kind, item.id, "draft")}><Check size={14} />{isLive ? `Unpublish ${isPage ? "page" : "article"}` : "Saved as draft"}</button><button type="button" className="primary-action" disabled={!ready || !canDirectPublish || (isLive && !hasUnpublishedChanges) || isPublishing} onClick={() => onPublishItem?.(kind, item.id, "published")}><Send size={14} />{isPublishing ? "Publishing…" : isLive ? "Publish changes" : `Publish ${isPage ? "page" : "article"}`}</button><button type="button" className="danger-action" onMouseDown={e=>e.preventDefault()} disabled={isPublishing} onClick={() => {if(window.confirm(`Remove ${item.title}? If it is live, select its removal in Publish website to remove it from the public site.`)) execute({ type: "publishing.remove", kind, itemId: item.id });}}><Trash2 size={14} />Remove</button></div>
      <div className="publication-readiness"><strong>Publication readiness</strong><p>{isPage ? "Published pages can appear in the portfolio navigation." : "Publishing here saves the draft, updates the immutable portfolio snapshot, and adds the article to the single Blog listing automatically."}</p><ul>{readiness.map((entry) => <li className={entry.complete ? "complete" : ""} key={entry.label}>{entry.complete ? <Check size={13} /> : <span />}{entry.label}</li>)}</ul>{!canDirectPublish && <small>Save this portfolio and configure its public URL before publishing individual content.</small>}</div>
      {publishError && <p className="form-message">{publishError}</p>}
      <BufferedField label="Title" value={item.title} maxLength={120} onCommit={(value) => execute({ type: "publishing.update", kind, itemId: item.id, field: "title", value })} />
      <BufferedField label="Public URL" prefix={isPage ? "/pages/" : "/blog/"} value={item.slug} maxLength={80} onCommit={(value) => execute({ type: "publishing.update", kind, itemId: item.id, field: "slug", value })} />
      {isPage && <BufferedField label="Navigation label" value={"navigationLabel" in item ? item.navigationLabel : ""} maxLength={40} onCommit={(value) => execute({ type: "publishing.update", kind, itemId: item.id, field: "navigationLabel", value })} />}
      {!isPage && <><BufferedField label="Article excerpt" value={"excerpt" in item ? item.excerpt : ""} maxLength={320} multiline allowEmpty onCommit={(value) => execute({ type: "publishing.update", kind, itemId: item.id, field: "excerpt", value })} /><BufferedField label="Tags (comma separated)" value={"tags" in item ? item.tags.join(", ") : ""} maxLength={260} allowEmpty onCommit={(value) => execute({ type: "publishing.update", kind, itemId: item.id, field: "tags", value: value.split(",").map((tag) => tag.trim()).filter(Boolean) })} /></>}
      <DirectImageField label="Cover image" document={document} selectedMediaId={item.coverMediaId} enabled={canUploadMedia} execute={execute} onSelect={(mediaId) => execute({ type: "publishing.update", kind, itemId: item.id, field: "coverMediaId", value: mediaId })} />
      <SeoEditor item={item} kind={kind} execute={execute} />
      {!isPage && <WriterStudioBridgeCard key={item.id} document={document} post={item as SiteDocument["publishing"]["posts"][number]} publicSiteSlug={publicSiteSlug} />}
      <DocumentEditor key={item.id} site={document} kind={kind} item={item} execute={execute} enabled={canUploadMedia} /><details><summary>Advanced block controls</summary>{item.richContent ? <p>This page uses the continuous editor above. Edit there to preserve its formatting.</p> : <BlockEditor document={document} kind={kind} item={item} execute={execute} canUploadMedia={canUploadMedia} />}</details>
    </>}
  </section>;
}

function publicationReadiness(item: Publishable, kind: Kind, document: SiteDocument) {
  const hasContent = !missingPublicationFields(item,kind,document).includes("content");
  const base = [
    { label: "Title", complete: Boolean(item.title.trim()) },
    { label: "Unique public URL", complete: !missingPublicationFields(item,kind,document).includes("unique public URL") },
    { label: "SEO title", complete: Boolean(item.seoTitle.trim()) },
    { label: "SEO description", complete: Boolean(item.seoDescription.trim()) },
    { label: "Page content", complete: hasContent },
  ];
  if (kind === "page") return base;
  const post = item as SiteDocument["publishing"]["posts"][number];
  return [base[0], base[1], { label: "Article excerpt", complete: Boolean(post.excerpt.trim()) }, { label: "Cover image", complete: Boolean(post.coverMediaId && document.media.assets.some((asset) => asset.id === post.coverMediaId)) }, ...base.slice(2)];
}

function BlockEditor({ document: siteDocument, kind, item, execute, canUploadMedia }: { document: SiteDocument; kind: Kind; item: Publishable; execute: (command: SiteCommand) => void; canUploadMedia: boolean }) {
  const types = ["heading", "paragraph", "quote", "list", "ordered-list", "image"] as const;
  const labels: Record<(typeof types)[number], string> = { heading: "Heading", paragraph: "Text", quote: "Quote", list: "Bullets", "ordered-list": "Numbered list", image: "Image" };
  const [draggingId, setDraggingId] = useState("");
  const [dropTargetId, setDropTargetId] = useState("");
  const longPressTimer = useRef<number | undefined>(undefined);
  const touchDragging = useRef("");
  const moveBlock = (blockId: string, targetId: string) => {
    const targetIndex = item.blocks.findIndex((block) => block.id === targetId);
    if (targetIndex >= 0 && blockId !== targetId) execute({ type: "block.moveTo", kind, itemId: item.id, blockId, targetIndex });
  };
  const endTouchDrag = () => {
    window.clearTimeout(longPressTimer.current);
    if (touchDragging.current && dropTargetId) moveBlock(touchDragging.current, dropTargetId);
    touchDragging.current = ""; setDraggingId(""); setDropTargetId("");
  };
  return <section className="block-editor"><header><div><strong>Page content</strong><small>{item.blocks.length}/40 blocks</small></div><div>{types.map((type) => <button type="button" key={type} disabled={item.blocks.length >= 40} onClick={() => execute({ type: "block.add", kind, itemId: item.id, blockType: type })}>{type === "ordered-list" ? <ListOrdered size={12} /> : type === "list" ? <List size={12} /> : type === "image" ? <ImagePlus size={12} /> : <Plus size={12} />}{labels[type]}</button>)}</div></header>
    <p className="block-editor-help">The page title is the only H1. Drag the handle, long-press it on touch screens, or use the arrow buttons to reorder blocks.</p>
    <div className="block-list">{item.blocks.map((block, index) => <div className="block-with-insert" key={block.id}><article data-block-id={block.id} className={`${draggingId === block.id ? "dragging" : ""} ${dropTargetId === block.id ? "drop-target" : ""}`} draggable onDragStart={(event) => { event.dataTransfer.effectAllowed = "move"; event.dataTransfer.setData("text/plain", block.id); setDraggingId(block.id); }} onDragOver={(event) => { event.preventDefault(); setDropTargetId(block.id); }} onDrop={(event) => { event.preventDefault(); moveBlock(event.dataTransfer.getData("text/plain") || draggingId, block.id); setDraggingId(""); setDropTargetId(""); }} onDragEnd={() => { setDraggingId(""); setDropTargetId(""); }}><header><span className="block-kind"><button type="button" className="drag-handle" aria-label={`Drag ${labels[block.type]} block`} title="Drag or long-press to reorder" onPointerDown={(event) => { if (event.pointerType === "mouse") return; event.currentTarget.setPointerCapture(event.pointerId); longPressTimer.current = window.setTimeout(() => { touchDragging.current = block.id; setDraggingId(block.id); }, 350); }} onPointerMove={(event) => { if (!touchDragging.current) return; const target = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>("[data-block-id]"); if (target?.dataset.blockId) setDropTargetId(target.dataset.blockId); }} onPointerUp={endTouchDrag} onPointerCancel={endTouchDrag}><GripVertical size={14} /></button>{labels[block.type]}</span><div><button type="button" disabled={index === 0} aria-label="Move block up" onClick={() => execute({ type: "block.move", kind, itemId: item.id, blockId: block.id, direction: "up" })}><ArrowUp size={13} /></button><button type="button" disabled={index === item.blocks.length - 1} aria-label="Move block down" onClick={() => execute({ type: "block.move", kind, itemId: item.id, blockId: block.id, direction: "down" })}><ArrowDown size={13} /></button><button type="button" aria-label="Remove block" onClick={() => execute({ type: "block.remove", kind, itemId: item.id, blockId: block.id })}><Trash2 size={13} /></button></div></header>
      {block.type === "heading" && <div className="heading-block-fields"><label className="field"><span>Heading level</span><select value={block.headingLevel} onChange={(event) => execute({ type: "block.update", kind, itemId: item.id, blockId: block.id, field: "headingLevel", value: event.target.value })}>{["h2", "h3", "h4", "h5", "h6"].map((level) => <option key={level} value={level}>{level.toUpperCase()}</option>)}</select></label><BufferedField label="Heading" value={block.text} maxLength={180} onCommit={(value) => execute({ type: "block.update", kind, itemId: item.id, blockId: block.id, field: "text", value })} /></div>}
      {(block.type === "paragraph" || block.type === "quote") && <RichTextField label="Content" value={block.text} maxLength={3000} onCommit={(value) => execute({ type: "block.update", kind, itemId: item.id, blockId: block.id, field: "text", value })} />}
      {(block.type === "list" || block.type === "ordered-list") && <RichTextField label={`${block.type === "ordered-list" ? "Numbered" : "Bullet"} items (one per line)`} value={block.items.join("\n")} maxLength={3600} onCommit={(value) => execute({ type: "block.update", kind, itemId: item.id, blockId: block.id, field: "items", value: value.split("\n").map((line) => line.trim()).filter(Boolean) })} />}
      {block.type === "image" && <DirectImageField label="Content image" document={siteDocument} selectedMediaId={block.mediaId} enabled={canUploadMedia} execute={execute} onSelect={(mediaId) => execute({ type: "block.update", kind, itemId: item.id, blockId: block.id, field: "mediaId", value: mediaId })} />}
    </article><BlockInsertMenu disabled={item.blocks.length >= 40} labels={labels} afterBlockId={block.id} onInsert={(blockType, afterBlockId) => execute({ type: "block.add", kind, itemId: item.id, blockType, afterBlockId })} /></div>)}</div>
  </section>;
}

function BlockInsertMenu({ disabled, labels, afterBlockId, onInsert }: { disabled: boolean; labels: Record<"heading" | "paragraph" | "quote" | "list" | "ordered-list" | "image", string>; afterBlockId: string; onInsert: (type: "heading" | "paragraph" | "quote" | "list" | "ordered-list" | "image", afterBlockId: string) => void }) {
  const types = Object.keys(labels) as Array<keyof typeof labels>;
  return <details className="inline-block-insert"><summary aria-label="Insert a content block here"><Plus size={14} /><span>Insert here</span></summary><div>{types.map((type) => <button type="button" key={type} disabled={disabled} onClick={(event) => { onInsert(type, afterBlockId); event.currentTarget.closest("details")?.removeAttribute("open"); }}>{labels[type]}</button>)}</div></details>;
}

function SeoEditor({ item, kind, execute }: { item: Publishable; kind: Kind; execute: (command: SiteCommand) => void }) {
  const title = item.seoTitle || item.title;
  const description = item.seoDescription || ("excerpt" in item ? item.excerpt : "");
  return <details className="seo-settings" open><summary>Search and social settings</summary><p className="seo-hierarchy-note">The page title above renders as H1. Content headings begin at H2 and can descend through H6.</p><BufferedField label={`SEO title · ${item.seoTitle.length}/70`} value={item.seoTitle} maxLength={70} allowEmpty onCommit={(value) => execute({ type: "publishing.update", kind, itemId: item.id, field: "seoTitle", value })} /><BufferedField label={`SEO description · ${item.seoDescription.length}/170`} value={item.seoDescription} maxLength={170} multiline allowEmpty onCommit={(value) => execute({ type: "publishing.update", kind, itemId: item.id, field: "seoDescription", value })} /><div className="serp-preview" aria-label="Search result preview"><small>your-portfolio.com/{kind === "page" ? "pages" : "blog"}/{item.slug}</small><strong>{title}</strong><p>{description || "Add a concise description to control how this content is introduced in search and social previews."}</p></div></details>;
}

function DirectImageField({ label, document, selectedMediaId, enabled, execute, onSelect }: { label: string; document: SiteDocument; selectedMediaId: string; enabled: boolean; execute: (command: SiteCommand) => void; onSelect: (mediaId: string) => void }) {
  const [alt, setAlt] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const selected = document.media.assets.find((asset) => asset.id === selectedMediaId);
  async function upload(file: File) {
    if (document.media.assets.length >= 24) return setError("The media library is full. Remove an unused image before uploading another one.");
    setBusy(true); setError("");
    const generatedAlt = deriveImageAlt(file.name, alt);
    const data = new FormData(); data.set("image", file); data.set("alt", generatedAlt);
    try {
      const result = await requestJson(`/api/projects/${document.projectId}/media`, { method: "POST", body: data });
      execute({ type: "media.addAsset", asset: result.asset }); onSelect(result.asset.id); setAlt("");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "The image upload was interrupted."); }
    finally { setBusy(false); }
  }
  return <section className="direct-image-field"><strong>{label}</strong>{selected && <div className="direct-image-preview"><Image src={selected.url} alt={selected.alt} fill sizes="260px" unoptimized /></div>}
    {selected && <BufferedField label="Image alternative text" value={selected.alt} maxLength={180} onCommit={(value) => execute({ type: "media.updateAsset", mediaId: selected.id, alt: value })} />}
    {enabled ? <><label className="optional-alt"><span>Alternative text <em>optional before upload</em></span><input aria-label={`${label} alternative text`} placeholder="You can improve this after uploading" value={alt} maxLength={180} onChange={(event) => setAlt(event.target.value)} /></label><label className="direct-upload-button"><input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy || document.media.assets.length >= 24} onChange={(event) => { const file = event.target.files?.[0]; if (file) void upload(file); event.currentTarget.value = ""; }} />{busy ? "Uploading…" : document.media.assets.length >= 24 ? "Media library full" : selected ? "Upload replacement" : "Upload image"}</label><small className="upload-help">JPG, PNG, or WebP · maximum 3 MB. If left blank, a temporary description is generated from the filename.</small></> : <p className="guardrail-note">Save this portfolio to your account before uploading an image.</p>}
    {document.media.assets.length > 0 && <details><summary>Or reuse an uploaded image</summary><select value={selectedMediaId} onChange={(event) => onSelect(event.target.value)}><option value="">No image</option>{document.media.assets.map((asset) => <option key={asset.id} value={asset.id}>{asset.alt}</option>)}</select></details>}
    {selected && <button type="button" className="secondary-action" onClick={() => onSelect("")}>Remove from this content</button>}{error && <p className="form-message">{error}</p>}
  </section>;
}

function BufferedField({ label, value, maxLength, multiline = false, allowEmpty = false, prefix, onCommit }: { label: string; value: string; maxLength: number; multiline?: boolean; allowEmpty?: boolean; prefix?: string; onCommit: (value: string) => void }) {
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);
  const normalized = useMemo(() => prefix ? normalizePublishingSlug(draft) : draft.trim(), [draft,prefix]);
  useEffect(() => { if (normalized === value || (!allowEmpty && !normalized)) return; const timer = window.setTimeout(() => onCommit(normalized), 700); return () => window.clearTimeout(timer); }, [allowEmpty, normalized, onCommit, value]);
  const commit = () => { if(prefix) setDraft(normalized); if (!allowEmpty && !normalized) setDraft(value); else if (normalized !== value) onCommit(normalized); };
  return <label className="field"><span>{label}</span>{prefix && <small>{prefix}{draft}</small>}{multiline ? <textarea value={draft} maxLength={maxLength} rows={5} onChange={(event) => setDraft(event.target.value)} onBlur={commit} /> : <input value={draft} maxLength={maxLength} onChange={(event) => setDraft(event.target.value)} onBlur={commit} />}</label>;
}
