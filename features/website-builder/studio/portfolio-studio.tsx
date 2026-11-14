"use client";

import { Clock3, Copy, Eye, Globe2, Layers3, Maximize2, Minimize2, Palette, PanelRightOpen, Redo2, RotateCcw, Save, Share2, Type, Undo2, Volume2, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useMemo, useReducer, useRef, useState } from "react";
import type { SiteCommand } from "@/features/website-builder/domain/commands";
import type { PortfolioSection, SiteDocument } from "@/features/website-builder/domain/site-document";
import { hasPublicationChanges, publicationChoices } from "@/features/website-builder/domain/publication-selection";
import { useDraftSave, requestJson } from "./use-draft-save";
import { normalizePublicationSlug } from "@/features/website-builder/domain/publication";
import { guestClaimPath } from "@/features/website-builder/domain/user-lifecycle";
import { ManualControls, type PreviewTarget } from "./manual-controls";
import { initialStudioState, studioReducer } from "./studio-reducer";
import { useAssemblyAIAgent } from "@/features/website-builder/voice/use-assemblyai-agent";
import type { VoiceToolResult } from "@/features/website-builder/voice/voice-tools";
import { VoicePanel } from "@/features/website-builder/voice/voice-panel";
import { RevisionHistory } from "./revision-history";
import { PortfolioNavigation, PortfolioSections } from "@/features/website-builder/portfolio/portfolio-sections";
import { StructuredContent } from "@/features/website-builder/public/public-content";
import Image from "next/image";
import { scrollPreviewContainer } from "./preview-navigation";
import { SceneRenderer } from "@/features/website-builder/scene/scene-renderer";
import { isFlatTemplate, isCollectionTemplate, isLightTemplate } from "@/features/website-builder/domain/template-contracts";
import { CollectionHero } from "@/features/website-builder/portfolio/collection-templates";
import { EditorialFlagshipHero, isEditorialFlagshipTemplate } from "@/features/website-builder/portfolio/editorial-flagship-templates";
import { ProfessionalHeroAside } from "@/features/website-builder/portfolio/professional-hero-aside";

import {
  DEMO_STUDIO_STORAGE_KEY,
  publishLocalWebsiteProject,
  saveLocalWebsiteDraft,
  unpublishLocalWebsiteProject,
} from "@/features/website-builder/lib/local-websites-store";

const STORAGE_KEY = DEMO_STUDIO_STORAGE_KEY;

type Publication = { slug: string; revision: number; published_at: string; document?: SiteDocument };

export function PortfolioStudio({ initialDocument, projectName = "Demo portfolio", persistence = "local", initialPublication, authenticated = false, userEmail, welcomeFromVox = false }: { initialDocument?: SiteDocument; projectName?: string; persistence?: "local" | "server"; initialPublication?: Publication; authenticated?: boolean; userEmail?: string; welcomeFromVox?: boolean }) {
  const [state, dispatch] = useReducer(studioReducer, initialStudioState);
  const hydratedDocument = useRef(initialDocument);
  const { saved, error: saveError, flush, revision: serverRevision, acceptExternal } = useDraftSave(state.present, state.hydrated, persistence === "server", initialDocument?.revision ?? 0);
  const latestDraft = useRef(state.present);
  latestDraft.current = state.present;
  const [reducedMotion, setReducedMotion] = useState(false);
  const [previewOnly, setPreviewOnly] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const publishBusy=useRef(false);
  const [publishing, setPublishing] = useState(false);
  const [publication, setPublication] = useState<Publication | undefined>(initialPublication);
  const [publishedDocument, setPublishedDocument] = useState<SiteDocument | undefined>(initialPublication?.document);
  const [selectedPublication, setSelectedPublication] = useState<string[]>([]);
  const voiceReviewRef = useRef<{ id: string; selection: string[]; draft: string; slug: string } | null>(null);
  const [publishingItemId, setPublishingItemId] = useState("");

  const [publishError, setPublishError] = useState("");
  const [slug, setSlug] = useState(initialPublication?.slug ?? normalizePublicationSlug(projectName));
  const [historyOpen, setHistoryOpen] = useState(false);
  const [previewTarget, setPreviewTarget] = useState<PreviewTarget>({ section: "hero" });
  const [editorWidth, setEditorWidth] = useState(300);
  const [voiceWidth, setVoiceWidth] = useState(320);
  const [editorExpanded, setEditorExpanded] = useState(false);
  const [voiceHidden, setVoiceHidden] = useState(false);
  const [mobileView, setMobileView] = useState<"canvas" | "editor" | "voice">("canvas");
  const [blogNotesSeed, setBlogNotesSeed] = useState<{ id: number; text: string }>();
  const [showVoiceWelcome, setShowVoiceWelcome] = useState(persistence === "server");
  const autoWelcomeAttempted = useRef(false);
  const [itemPublishError, setItemPublishError] = useState("");
  const [dismissedError,setDismissedError]=useState("");
  const visibleError=state.lastCommandError || itemPublishError || saveError;

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(preference.matches);
    sync();
    preference.addEventListener("change", sync);
    let stored: unknown = hydratedDocument.current;
    if (!stored || (hydratedDocument.current?.projectId === "demo-portfolio" && !window.location.search.includes("template="))) {
      try {
        const cached = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
        if (cached) stored = cached;
      } catch {
        /* Keep initialDocument */
      }
    }
    dispatch({ type: "hydrate", document: stored });
    return () => preference.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const existing = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    const link = existing ?? document.head.appendChild(document.createElement("link"));
    const previous = link.href;
    link.rel = "icon";
    link.href = state.present.media.headshotUrl || initialsFavicon(state.present.identity.name, state.present.design.accent);
    return () => { link.href = previous; if (!existing) link.remove(); };
  }, [state.present.design.accent, state.present.identity.name, state.present.media.headshotUrl]);

  useEffect(() => {
    if (persistence !== "server" || !state.hydrated || !saved || saveError) return;
    const timer = window.setInterval(async () => {
      if (document.visibilityState !== "visible" || document.activeElement?.matches("input,textarea,[contenteditable=true]")) return;
      const before = latestDraft.current;
      try {
        const result = await requestJson(`/api/projects/${before.projectId}`, { cache: "no-store" });
        if (result.project.revision <= serverRevision.current || latestDraft.current !== before) return;
        acceptExternal(result.project.document, result.project.revision);
        dispatch({type:"hydrate", document:result.project.document});
      } catch { /* Retry external refresh later; local edits are retained. */ }
    }, 12000);
    return () => window.clearInterval(timer);
  }, [persistence, state.hydrated, saved, saveError, acceptExternal, serverRevision]);

  const executeManual = useCallback((command: SiteCommand) => dispatch({ type: "execute", command, source: "manual" }), []);
  const executeVoice = useCallback((command: SiteCommand, next?: SiteDocument) => dispatch({ type: "execute", command, source: "voice", next }), []);
  const undoVoice = useCallback(() => dispatch({ type: "undo", source: "voice" }), []);
  const navigateFromAssistant = useCallback((target: { section: string; itemId?: string; panel?: "content" | "design" | "scene" | "opportunity" }) => {
    setPreviewOnly(false);
    setEditorExpanded(false);
    setPreviewTarget({ section: target.section, ...(target.itemId ? { itemId: target.itemId } : {}) });
    dispatch({ type: "selectPanel", panel: target.panel ?? "content" });
  }, []);
  async function voicePublication(action: "review" | "confirm", values: Record<string, unknown>): Promise<VoiceToolResult> {
    if (persistence !== "server" || !authenticated) return { ok: false, error: "Sign in and save the portfolio before publishing." };
    if (action === "review") {
      voiceReviewRef.current = null;
      const document = latestDraft.current;
      if (document.opportunity.status !== "canonical" && document.opportunity.visibility === "private") return { ok: false, error: "This opportunity is private. Choose Shared or Public in its review panel before publishing.", };
      const scope = values.scope;
      if (scope !== "website" && scope !== "post" && scope !== "page") return { ok: false, error: "Choose website, post, or page to publish." };
      const choices = publicationChoices(document, publishedDocument);
      let selection: string[];
      if (scope === "website") selection = choices.filter(row => !row.missing.length).map(row => row.key);
      else {
        const key = `${scope}:${String(values.item_id ?? "")}`;
        const row = choices.find(item => item.key === key);
        if (!row) return { ok: false, error: `Choose an existing ${scope} by its ID first.` };
        if (row.missing.length) { navigateFromAssistant({ section: scope === "post" ? "blog posts" : "site pages", itemId: String(values.item_id), panel: "content" }); return { ok: false, error: `Complete ${row.missing.join(", ")} for ${row.label} before publishing.` }; }
        selection = publishedDocument ? [key] : [...choices.filter(item => item.required).map(item => item.key), key];
      }
      if (selection.length === 0 || normalizePublicationSlug(slug).length < 3) return { ok: false, error: "Select publishable content and a valid public URL before reviewing." };
      const id = crypto.randomUUID();
      voiceReviewRef.current = { id, selection, draft: JSON.stringify(document), slug: normalizePublicationSlug(slug) };
      setSelectedPublication(selection); setPublishOpen(true);
      return { ok: true, reviewId: id, message: `Publication review ${id}. The public URL is /p/${normalizePublicationSlug(slug)}. Selected: ${selection.map(key => choices.find(row => row.key === key)?.label ?? key).join(", ")}. ${choices.filter(row=>row.missing.length).length} incomplete items remain private. Ask for explicit confirmation of exactly this selection on a separate turn.` };
    }
    const review = voiceReviewRef.current;
    if (!review || values.review_id !== review.id) return { ok: false, error: "The publication review expired. Review the items again before publishing." };
    if (JSON.stringify(latestDraft.current) !== review.draft || normalizePublicationSlug(slug) !== review.slug || JSON.stringify(selectedPublication) !== JSON.stringify(review.selection)) {
      voiceReviewRef.current = null;
      return { ok: false, error: "The draft, URL, or selected items changed. Review the new publication before confirming." };
    }
    voiceReviewRef.current = null;
    return performPublication(review.selection);
  }
  const voice = useAssemblyAIAgent({ document: state.present, execute: executeVoice, undo: undoVoice, navigate: navigateFromAssistant, publication: voicePublication, focus: { section: previewTarget.section, panel: state.selectedPanel, itemId: previewTarget.itemId }, welcomeToStudio: welcomeFromVox });
  useEffect(() => {
    if (!welcomeFromVox || autoWelcomeAttempted.current) return;
    autoWelcomeAttempted.current = true;
    // A granted microphone does not guarantee permission to autoplay audio.
    // Keep the one-click welcome available when the browser declines playback.
    if (!navigator.permissions?.query) return;
    void navigator.permissions.query({ name: "microphone" as PermissionName }).then(permission => {
      const audioPolicy = (navigator as Navigator & { getAutoplayPolicy?: (type: "audiocontext") => string }).getAutoplayPolicy?.("audiocontext");
      if (permission.state === "granted" && (navigator.userActivation?.isActive || audioPolicy === "allowed")) void voice.start();
    }).catch(() => undefined);
  // The welcome only attempts once on arrival, not on every voice status update.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [welcomeFromVox]);
  useEffect(() => {
    if (!welcomeFromVox || !("speechSynthesis" in window)) return;
    const announcement = new SpeechSynthesisUtterance("Congratulations! Your private portfolio draft is ready.");
    announcement.lang = "en-US";
    window.speechSynthesis.speak(announcement);
    return () => window.speechSynthesis.cancel();
  }, [welcomeFromVox]);
  useEffect(() => {
    if (!showVoiceWelcome || !["listening", "speaking", "processing"].includes(voice.status)) return;
    const timer = window.setTimeout(() => setShowVoiceWelcome(false), reducedMotion ? 250 : 1900);
    return () => window.clearTimeout(timer);
  }, [showVoiceWelcome, voice.status, reducedMotion]);
  const focusedSkill = useMemo(() => state.present.skills.find((skill) => skill.id === state.present.scene.focusedSkill), [state.present]);
  const portfolioHasUnpublishedChanges = useMemo(() => Boolean(publication && (hasPublicationChanges(state.present, publishedDocument))), [publication, publishedDocument, state.present]);

  const publishChoices = publicationChoices(state.present, publishedDocument);
  function openPublication() {
    voiceReviewRef.current = null;
    setPublishError("");
    setSelectedPublication(publicationChoices(latestDraft.current, publishedDocument).filter(row=>!row.missing.length).map(row=>row.key));
    setPublishOpen(true);
  }
  async function performPublication(selection: string[], itemAction?: {kind:"page"|"post";id:string;status:"draft"|"published"}): Promise<VoiceToolResult> {
    if (publishBusy.current) return { ok: false, error: "Publication is already in progress." };
    voiceReviewRef.current = null;
    publishBusy.current=true;
    setPublishing(true); setPublishError(""); setItemPublishError("");
    if(itemAction) setPublishingItemId(itemAction.id);
    try {
      const confirmedRevision = await flush();
      if (persistence !== "server") {
        const targetId = latestDraft.current.projectId === "demo-portfolio" ? "demo-local-site" : latestDraft.current.projectId;
        saveLocalWebsiteDraft(targetId, { ...latestDraft.current, projectId: targetId }, projectName);
        const localResult = publishLocalWebsiteProject(targetId, normalizePublicationSlug(slug), selection, itemAction);
        setPublishedDocument(localResult.document);
        setPublication({ ...localResult.publication, document: localResult.document });
        setPublishOpen(false);
        return { ok: true, message: `Published locally at /p/${localResult.publication.slug} (stored in browser localStorage).` };
      }
      const result = await requestJson(`/api/projects/${latestDraft.current.projectId}/publish`, {method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({slug:normalizePublicationSlug(slug),expectedRevision:confirmedRevision,selection,itemAction})});
      setPublishedDocument(result.document); setPublication({...result.publication,document:result.document});
      setPublishOpen(false);
      if(result.warning) setItemPublishError(result.warning);
      return { ok: true, message: `Published the confirmed selection at /p/${normalizePublicationSlug(slug)}.${result.warning ? ` Warning: ${result.warning}` : ""}` };
    } catch(cause) {
      const message=cause instanceof Error?cause.message:"Publishing failed. Please retry.";
      if(itemAction) setItemPublishError(message); else setPublishError(message);
      return { ok: false, error: message };
    } finally { publishBusy.current=false; setPublishing(false); setPublishingItemId(""); }
  }
  function publishItem(kind:"page"|"post",itemId:string,status:"draft"|"published") {
    if(!publishedDocument) { openPublication(); setItemPublishError("Publish the website once using the main dialog, then publish individual articles independently."); return; }
    void performPublication([`${kind}:${itemId}`],{kind,id:itemId,status});
  }
  async function unpublish() {
    setPublishing(true); setPublishError("");
    try {
      if (persistence !== "server") {
        unpublishLocalWebsiteProject(state.present.projectId);
        setPublication(undefined);setPublishedDocument(undefined);setPublishOpen(false);
        return;
      }
      await requestJson(`/api/projects/${state.present.projectId}/publish`,{method:"DELETE"});
      setPublication(undefined);setPublishedDocument(undefined);setPublishOpen(false);
    } catch(cause) {setPublishError(cause instanceof Error?cause.message:"Could not unpublish. Please retry.");}
    finally {setPublishing(false);}
  }

  const editorPanelRef = useRef<HTMLElement>(null);
  useEffect(() => { editorPanelRef.current?.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" }); }, [state.selectedPanel, previewTarget.section, reducedMotion]);

  return (
    <main className={`website-builder-scope studio studio-workspace ${previewOnly ? "preview-only" : ""} ${editorExpanded ? "editor-expanded" : ""} ${isLightTemplate(state.present.design.template) ? "light-theme" : ""}`} data-accent={state.present.design.accent} data-mobile-view={mobileView}>
      {showVoiceWelcome && <div className="vox-studio-welcome" role="presentation"><section role="dialog" aria-modal="true" aria-labelledby="vox-welcome-title"><div className="vox-celebration" aria-hidden="true"><span>✦</span><span>✧</span><span>✦</span><span>✧</span><span>✦</span></div><p className="eyebrow">{welcomeFromVox ? "YOUR PRIVATE DRAFT IS READY" : "WELCOME BACK TO YOUR STUDIO"}</p><h2 id="vox-welcome-title">{welcomeFromVox ? "Congratulations! Your private draft is ready." : "Continue your website with Do It AI Agent"}</h2><p>{welcomeFromVox ? "Your website is saved privately. Explore the editor on the left, your live canvas in the center and Do It AI Agent on the right." : "Do It AI Agent can help with the section you are viewing. Start the microphone to give it permission, or continue editing on your own."}</p>{voice.error && <p role="alert">{voice.error}</p>}<div className="vox-welcome-actions"><button className="primary-action" type="button" disabled={voice.status === "connecting"} onClick={() => { if (welcomeFromVox && "speechSynthesis" in window) window.speechSynthesis.cancel(); setVoiceHidden(false); setEditorExpanded(false); if (!voice.active || voice.status === "error") void voice.start(); else setShowVoiceWelcome(false); }}>{voice.status === "connecting" ? "Connecting AI Agent…" : "Continue with Do It AI Agent 🎙"}</button><button className="secondary-action" type="button" onClick={() => setShowVoiceWelcome(false)}>Explore Studio</button></div><small>Microphone access starts only when you press Continue with Do It AI Agent. Publishing publicly is a separate step.</small></section></div>}
      <header className="topbar">
        <div className="brand"><span className="brand-mark"><Layers3 size={19} /></span><div><strong>DOITWITHAI STUDIO</strong><small>{projectName}</small></div></div>
        <div className="project-state"><span className={saved ? "saved" : "saving"}><Save size={14} />{saveError || (saved ? persistence === "server" ? "Saved to cloud" : "Saved locally" : "Saving…")}</span><i />Revision {state.present.revision}</div>
        <div className="top-actions">
          <button type="button" onClick={() => dispatch({ type: "undo", source: "manual" })} disabled={!state.past.length} aria-label="Undo"><Undo2 size={17} /></button>
          <button type="button" onClick={() => dispatch({ type: "redo" })} disabled={!state.future.length} aria-label="Redo"><Redo2 size={17} /></button>
          <button type="button" className="preview-button" onClick={() => { if (previewOnly) setPreviewOnly(false); else { setEditorExpanded(false); setPreviewOnly(true); } }}><Eye size={16} />{previewOnly ? "Exit preview" : "Preview"}</button>
          <button type="button" className="publish-button" onClick={openPublication}><Globe2 size={16} />{publication ? portfolioHasUnpublishedChanges ? "Changes pending" : `Live (/p/${publication.slug})` : "Publish"}</button>
          {persistence === "server" && <button type="button" onClick={() => setHistoryOpen(true)}><Clock3 size={16} />History</button>}
          <Link className="top-link" href={`/ai-content-writer?targetSiteId=${encodeURIComponent(state.present.projectId)}`}>Write Blog Post</Link>
          <Link className="top-link" href="/do-it-ai?view=websites">My Websites</Link>
          {authenticated && userEmail && <span className="account-pill" title={userEmail} aria-label={`Signed in as ${userEmail}`}>{userEmail.slice(0, 1).toUpperCase()}</span>}
        </div>
      </header>

      {!previewOnly && <nav className="mobile-workspace-nav" aria-label="Mobile Studio workspace">
        <button type="button" aria-pressed={mobileView === "canvas"} onClick={() => { setEditorExpanded(false); setMobileView("canvas"); }}>Canvas</button>
        <button type="button" aria-pressed={mobileView === "editor"} onClick={() => setMobileView("editor")}>Edit</button>
        <button type="button" aria-pressed={mobileView === "voice"} onClick={() => { setVoiceHidden(false); setMobileView("voice"); }}>Do It AI Agent{voice.active ? " · Live" : ""}</button>
      </nav>}
      <div className="workspace" style={{ gridTemplateColumns: previewOnly ? undefined : editorExpanded ? (voiceHidden ? "minmax(0, 1fr)" : "minmax(0, 7fr) minmax(280px, 3fr)") : `${editorWidth}px minmax(420px,1fr) ${voiceHidden ? "0px" : `${voiceWidth}px`}` }}>
        <aside className="editor-panel" ref={editorPanelRef}>
          <div className="panel-intro"><div className="panel-title-row"><div><p className="eyebrow">PROJECT · PERSONAL PORTFOLIO</p><h1>Shape the experience</h1></div><button type="button" title={editorExpanded ? "Restore workspace" : "Expand editor"} aria-label={editorExpanded ? "Restore workspace" : "Expand editor"} onClick={() => { if (!editorExpanded && window.innerWidth <= 900 && !voice.active) setVoiceHidden(true); if (window.innerWidth <= 900) setMobileView("editor"); setEditorExpanded(value => !value); }}>{editorExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}</button></div><p>Use direct controls for precision. Ask the voice agent for broader changes.</p></div>
          <nav className="editor-tabs" aria-label="Editor sections">
            <Tab active={state.selectedPanel === "content"} label="Content" icon={<Type size={16} />} onClick={() => dispatch({ type: "selectPanel", panel: "content" })} />
            <Tab active={state.selectedPanel === "design"} label="Design" icon={<Palette size={16} />} onClick={() => dispatch({ type: "selectPanel", panel: "design" })} />
            <Tab active={state.selectedPanel === "scene"} label="3D Scene" icon={<Layers3 size={16} />} onClick={() => dispatch({ type: "selectPanel", panel: "scene" })} />
            <Tab active={state.selectedPanel === "opportunity"} label="Opportunities" icon={<Share2 size={16} />} onClick={() => dispatch({ type: "selectPanel", panel: "opportunity" })} />
          </nav>
          {state.lastCommandError && <p className="form-message" role="alert">{state.lastCommandError}</p>}
          <div className="expanded-editor-surface"><ManualControls ensureSaved={flush} document={state.present} publishedDocument={publishedDocument} execute={executeManual} panel={state.selectedPanel} canUploadMedia={persistence === "server" && authenticated} previewTarget={previewTarget} onPreviewTarget={setPreviewTarget} onPublishItem={publishItem} publishingItemId={publishingItemId || (publishing ? "__snapshot__" : "")} itemPublishError={itemPublishError} canDirectPublish={slug.length >= 3} blogNotesSeed={blogNotesSeed} publicSiteSlug={publication?.slug} /></div>
          {persistence !== "server" && <button type="button" className="reset-button" onClick={() => { if (window.confirm("Reset this draft? You can undo this action.")) dispatch({ type: "reset" }); }}><RotateCcw size={14} />Reset demo</button>}
        </aside>

        {!previewOnly && !editorExpanded && <button type="button" className="panel-resizer editor-resizer" style={{ left: editorWidth - 3 }} aria-label="Resize content editor" onPointerDown={(event) => beginResize(event, editorWidth, setEditorWidth, 260, 620, 1)} />}

        {!editorExpanded && <section className="preview-shell" aria-label="Live portfolio preview">
          <div className="preview-chrome"><span /><span /><span /><p>portfolio.preview</p><em>LIVE CANVAS</em></div>
          <StudioPreview document={state.present} target={previewTarget} focusedSkill={focusedSkill} execute={executeManual} reducedMotion={reducedMotion} onNavigate={setPreviewTarget} />
        </section>}

        {!previewOnly && !editorExpanded && !voiceHidden && <button type="button" className="panel-resizer voice-resizer" style={{ right: voiceWidth - 3 }} aria-label="Resize voice assistant" onPointerDown={(event) => beginResize(event, voiceWidth, setVoiceWidth, 260, 520, -1)} />}
        {!previewOnly && !voiceHidden && <VoicePanel {...voice} contextHint={state.selectedPanel === "content" && previewTarget.section === "blog posts" ? "Tell Do It AI Agent your article idea or open it directly in the AI Content Writer Studio for deep SEO generation." : state.selectedPanel === "opportunity" ? "Do It AI Agent can explain this opportunity variant and open its source review." : state.selectedPanel === "design" ? "Describe the visual mood or template category you want. Do It AI Agent can switch templates and accents." : state.selectedPanel === "content" && previewTarget.section === "site pages" ? "Do It AI Agent can help structure your page and navigate to the details you want to edit." : undefined} suggestedRequest={state.selectedPanel === "opportunity" ? "Show the opportunity source review" : state.selectedPanel === "design" ? "Show the design panel" : state.selectedPanel === "content" && previewTarget.section === "blog posts" ? "Open in AI Content Writer" : undefined} onUseConversationNotes={state.selectedPanel === "content" && previewTarget.section === "blog posts" ? () => { const notes = voice.transcript.filter(item => item.speaker === "user" && item.final).slice(-8).map(item => item.text).join("\n").slice(0, 3000); if (notes) setBlogNotesSeed({ id: Date.now(), text: notes }); } : undefined} onHide={() => { setVoiceHidden(true); setMobileView("canvas"); }} />}
        {!previewOnly && voiceHidden && <button type="button" className="restore-voice" onClick={() => { setVoiceHidden(false); setMobileView("voice"); }}><PanelRightOpen size={16} />{voice.active ? "Do It AI Agent is active · show conversation" : "Show AI studio agent"}</button>}
      </div>
      {visibleError && visibleError!==dismissedError && <div className="studio-error-toast" role="alert"><strong>Action needs attention</strong><button type="button" aria-label="Dismiss notification" onClick={()=>setDismissedError(visibleError)}>Dismiss</button><p>{visibleError}</p>{saveError && <button type="button" onClick={()=>void flush().catch(()=>undefined)}>Retry saving</button>}</div>}
      <footer className="command-footer"><span>One governed command pipeline</span><p>Manual edit <b>→</b> validation <b>→</b> revision <b>→</b> undo</p><p>Voice tool <b>→</b> validation <b>→</b> revision <b>→</b> undo</p></footer>
      {publishOpen && <div className="publish-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) { voiceReviewRef.current = null; setPublishOpen(false); } }}>
        <section className="publish-dialog" role="dialog" aria-modal="true" aria-labelledby="publish-title">
          <header><div><span className="eyebrow">IMMUTABLE PUBLICATION</span><h2 id="publish-title">Choose what goes live</h2></div><button type="button" aria-label="Close publishing dialog" onClick={() => { voiceReviewRef.current = null; setPublishOpen(false); }}><X size={18} /></button></header>
          <p>Selected items update the live website. Unselected items keep their current live version; new unselected drafts stay private.</p>
          {state.present.opportunity.status !== "canonical" && <div className="publication-guidance"><strong>You are editing an independent opportunity page.</strong><p>Hero and About edits here belong to this opportunity, not your main portfolio.</p>{state.present.opportunity.canonicalProjectId && <Link href={`/do-it-ai/website-studio/${state.present.opportunity.canonicalProjectId}`}>Open main portfolio</Link>}{state.present.opportunity.visibility === "private" && <><p>This opportunity is private. Choose its visibility before publishing.</p><button type="button" onClick={() => { setPublishOpen(false); dispatch({type:"selectPanel",panel:"opportunity"}); }}>Review visibility and approval</button></>}</div>}
          <div className="publication-selection"><button type="button" disabled={publishing} onClick={()=>setSelectedPublication(publishChoices.filter(row=>!row.missing.length).map(row=>row.key))}>Select all ready items</button><button type="button" disabled={publishing} onClick={()=>setSelectedPublication(publishChoices.filter(row=>row.required).map(row=>row.key))}>Clear optional items</button>{publishChoices.map(row=><label key={row.key}><input type="checkbox" disabled={publishing || row.required || Boolean(row.missing.length)} checked={selectedPublication.includes(row.key)} onChange={event=>setSelectedPublication(current=>event.target.checked?[...current,row.key]:current.filter(key=>key!==row.key))}/><span>{row.label}{row.missing.length>0 && <small>Complete: {row.missing.join(", ")} <button type="button" onClick={event=>{event.preventDefault();setPublishOpen(false);setPreviewOnly(false);dispatch({type:"selectPanel",panel:"content"});const [kind,itemId]=row.key.split(":");setPreviewTarget({section:kind==="post"?"blog posts":"site pages",itemId});}}>Review fields</button></small>}</span></label>)}</div>
          <label>Public URL slug<div className="slug-field"><span>/p/</span><input value={slug} maxLength={64} onChange={(event) => setSlug(normalizePublicationSlug(event.target.value))} /></div></label>
          {publication && <div className="live-publication"><strong>Currently live</strong><a href={`/p/${publication.slug}`} target="_blank" rel="noreferrer">/p/{publication.slug}</a><span>Revision {publication.revision}</span><button type="button" aria-label="Copy public URL" onClick={() => navigator.clipboard.writeText(`${window.location.origin}/p/${publication.slug}`)}><Copy size={15} /> Copy URL</button></div>}
          {publishError && <p className="form-message">{publishError}</p>}
          <footer><button type="button" className="secondary-action" onClick={() => { voiceReviewRef.current = null; setPublishOpen(false); }}>Cancel</button>{publication && <button type="button" className="danger-action" disabled={publishing} onClick={unpublish}>Unpublish</button>}<button type="button" className="primary-action" disabled={publishing || slug.length < 3 || !selectedPublication.length || (state.present.opportunity.status !== "canonical" && state.present.opportunity.visibility === "private")} onClick={() => void performPublication(selectedPublication)}>{publishing ? "Saving & publishing…" : "Publish selected items"}</button></footer>
          {!saved && !saveError && <small>Your latest edits will save first, then your selected items will publish.</small>}
          {saveError && <small>The last save failed. “Publish selected items” will retry it before publishing.</small>}
        </section>
      </div>}
      {historyOpen && <RevisionHistory projectId={state.present.projectId} currentRevision={serverRevision.current} onClose={() => setHistoryOpen(false)} onRestored={() => window.location.reload()} />}
    </main>
  );
}

function StudioPreview({ document, target, focusedSkill, execute, reducedMotion, onNavigate }: { document: SiteDocument; target: PreviewTarget; focusedSkill?: SiteDocument["skills"][number]; execute: (command: SiteCommand) => void; reducedMotion: boolean; onNavigate: (target: PreviewTarget) => void }) {
  const previewRef = useRef<HTMLDivElement>(null);
  const previousPreviewMode = useRef(target.section === "site pages" || target.section === "blog posts" ? "standalone" : "home");
  useLayoutEffect(() => {
    const container = previewRef.current;
    if (!container) return;
    const mode = target.section === "site pages" || target.section === "blog posts" ? "standalone" : "home";
    const changedRoute = previousPreviewMode.current !== mode;
    previousPreviewMode.current = mode;
    const frame = window.requestAnimationFrame(() => scrollPreviewContainer(container, target, reducedMotion || changedRoute ? "auto" : "smooth"));
    return () => window.cancelAnimationFrame(frame);
  }, [reducedMotion, target]);
  const item = target.section === "site pages" ? document.publishing.pages.find((entry) => entry.id === target.itemId) : target.section === "blog posts" ? document.publishing.posts.find((entry) => entry.id === target.itemId) : undefined;
  if (target.section === "blog posts" && target.itemId === "__index__") return <StudioBlogIndex document={document} onNavigate={onNavigate} />;
  if (target.section === "site pages" || target.section === "blog posts") { const cover = item ? document.media.assets.find((asset) => asset.id === item.coverMediaId) : undefined; return <div ref={previewRef} className={`portfolio-preview content-draft-preview bg-${document.design.background} template-${document.design.template} ${isCollectionTemplate(document.design.template) ? "collection-theme" : ""} ${isLightTemplate(document.design.template) ? "light-theme" : ""}`} data-accent={document.design.accent}><button type="button" className="preview-back-button" onClick={() => onNavigate({ section: "hero" })}>← Back to homepage preview</button>{item ? <article><p className="section-eyebrow">{target.section === "blog posts" ? "BLOG ARTICLE PREVIEW" : "SITE PAGE PREVIEW"}</p><h1>{item.title}</h1>{"excerpt" in item && item.excerpt && <p className="draft-excerpt">{item.excerpt}</p>}{cover && <figure className="published-content-cover draft-cover"><Image src={cover.url} alt={cover.alt} fill sizes="(max-width: 900px) 94vw, 900px" unoptimized /></figure>}<StructuredContent document={document} blocks={item.blocks} richContent={item.richContent} /></article> : <div className="portfolio-empty-state">Create an item to preview it here.</div>}</div>; }
  const navigateSection = (section: PortfolioSection) => onNavigate({ section });
  const sceneHint = document.scene.family === "kinetic-gallery" ? "Move to shift perspective · Select a skill" : document.scene.family === "velocity-roadster" ? "Move to steer the light · Watch the road flow" : document.scene.family === "professional-2d" || document.scene.family === "doitwithai-editorial-grid" ? "" : "Drag to orbit · Scroll to zoom · Select a skill";
  return <div ref={previewRef} className={`portfolio-preview bg-${document.design.background} template-${document.design.template} ${isCollectionTemplate(document.design.template) ? "collection-theme" : ""} ${isLightTemplate(document.design.template) ? "light-theme" : ""}`} data-accent={document.design.accent}><PortfolioNavigation document={document} onNavigateSection={navigateSection} onNavigatePage={(itemId) => onNavigate({ section: "site pages", itemId })} onNavigateBlog={() => onNavigate({ section: "blog posts", itemId: "__index__" })} />{isEditorialFlagshipTemplate(document.design.template) ? <EditorialFlagshipHero document={document} navigate={(section) => section === "blog" ? onNavigate({ section: "blog posts", itemId: "__index__" }) : onNavigate({ section })} onOpenPost={(itemId) => onNavigate({ section: "blog posts", itemId })} /> : isCollectionTemplate(document.design.template) ? <CollectionHero document={document} navigate={navigateSection} /> : <div className={`portfolio-hero align-${document.design.heroAlignment}`}><div className="ambient-grid" /><div className="portfolio-copy"><p className="availability"><i />{document.identity.availability}</p><p className="kicker">DESIGNING USEFUL DIGITAL SYSTEMS</p><h2>{document.identity.name}</h2><h3>{document.identity.role}</h3><p className="intro">{document.identity.intro}</p><div className="hero-actions"><button type="button" onClick={() => navigateSection("projects")}>View selected work</button><button type="button" className="ghost" onClick={() => navigateSection("contact")}>Start a conversation</button></div>{focusedSkill && <div className="focus-card"><span>SCENE FOCUS</span><strong>{focusedSkill.label}</strong><p>Capability level {focusedSkill.level}/5</p></div>}</div>{document.design.template === "professional-2d" && <ProfessionalHeroAside document={document} />}{!isFlatTemplate(document.design.template) && <div className="scene-stage"><SceneRenderer document={document} execute={execute} reducedMotion={reducedMotion} />{sceneHint && <div className="scene-caption"><Volume2 size={14} /><span>{sceneHint}</span></div>}</div>}</div>}<PortfolioSections document={document} editing onOpenPost={(itemId)=>onNavigate({section:"blog posts",itemId})} onOpenPage={(itemId) => onNavigate({ section: "site pages", itemId })} /></div>;
}

function StudioBlogIndex({ document, onNavigate }: { document: SiteDocument; onNavigate: (target: PreviewTarget) => void }) {
  return <div className={`portfolio-preview content-draft-preview studio-blog-index bg-${document.design.background} template-${document.design.template} ${isCollectionTemplate(document.design.template) ? "collection-theme" : ""} ${isLightTemplate(document.design.template) ? "light-theme" : ""}`} data-accent={document.design.accent}><button type="button" className="preview-back-button" onClick={() => onNavigate({ section: "hero" })}>← Back to homepage preview</button><section className="blog-index"><header><p className="section-eyebrow">BLOG LISTING PREVIEW</p><h1>Ideas, process and field notes</h1><p>Draft and published articles by {document.identity.name}</p></header>{document.publishing.posts.length ? <div>{document.publishing.posts.map((post) => { const cover = document.media.assets.find((asset) => asset.id === post.coverMediaId); return <article key={post.id}>{cover && <div className="blog-card-cover"><Image src={cover.url} alt={cover.alt} fill sizes="430px" unoptimized /></div>}<div><span>{post.status}</span><h2>{post.title}</h2><p>{post.excerpt || "Add an excerpt to introduce this article."}</p><button type="button" onClick={() => onNavigate({ section: "blog posts", itemId: post.id })}>Open article preview</button></div></article>; })}</div> : <div className="portfolio-empty-state">Create an article to populate this Blog listing.</div>}</section></div>;
}

function beginResize(event: React.PointerEvent, initial: number, update: (value: number) => void, min: number, max: number, direction: 1 | -1) {
  event.preventDefault();
  const origin = event.clientX;
  const move = (pointer: PointerEvent) => update(Math.min(max, Math.max(min, initial + (pointer.clientX - origin) * direction)));
  const stop = () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", stop); };
  window.addEventListener("pointermove", move); window.addEventListener("pointerup", stop);
}

function Tab({ active, label, icon, onClick }: { active: boolean; label: string; icon: React.ReactNode; onClick: () => void }) {
  return <button type="button" className={active ? "active" : ""} onClick={onClick}>{icon}{label}</button>;
}

function initialsFavicon(name: string, accent: string) {
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "VF";
  const colors: Record<string, string> = { cyan: "#4deeea", violet: "#a78bfa", coral: "#fb7185", lime: "#a3e635", rose: "#d94c89", blue: "#75aaff", olive: "#78834b", indigo: "#6366f1" };
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="${colors[accent] ?? colors.cyan}"/><text x="32" y="41" text-anchor="middle" font-family="Arial,sans-serif" font-size="24" font-weight="800" fill="#061013">${initials}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
