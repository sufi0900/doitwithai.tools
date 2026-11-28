"use client";

import { authorizedWebsiteFetch } from "@/features/website-builder/lib/supabase/browser";
import { requestJson } from "@/features/website-builder/studio/use-draft-save";
import Link from "next/link";
import { Check, ExternalLink, Pencil, Settings2, Sparkles, X, Bot } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createSupabaseBrowserClient } from "@/features/website-builder/lib/supabase/browser";

type Project = { id: string; name: string; creation_mode: string; template_id: string | null; revision: number; updated_at: string; variant_of_project_id: string | null; source_revision: number | null; opportunity_status: "canonical" | "draft" | "review" | "published" | "archived"; visitorEnabled: boolean; publication: { slug: string; revision: number; published_at: string } | null };

export function ProjectDashboard({ projects: initialProjects, email }: { projects: Project[]; email: string }) {
  const router = useRouter();
  const [projects, setProjects] = useState(initialProjects);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");
  const [renameError, setRenameError] = useState("");
  const [renaming, setRenaming] = useState(false);
  const [variantFor, setVariantFor] = useState<Project | null>(null);
  const [variantName, setVariantName] = useState("");
  const [variantTitle, setVariantTitle] = useState("");
  const [variantBrief, setVariantBrief] = useState("");
  const [variantAudience, setVariantAudience] = useState("");
  const [variantError, setVariantError] = useState("");
  const [creatingVariant, setCreatingVariant] = useState(false);

  const [deleting,setDeleting]=useState("");
  async function deleteProject(project:Project){
    if(!window.confirm(`Delete “${project.name}”? Its published page and saved content will be removed. This cannot be undone.`))return;
    setDeleting(project.id);setRenameError("");
    try{await requestJson(`/api/projects/${project.id}`,{method:"DELETE"});setProjects(current=>current.filter(p=>p.id!==project.id));}
    catch(cause){setRenameError(cause instanceof Error?cause.message:"Could not delete. Please retry.");}
    finally{setDeleting("");}
  }
  async function signOut() { const client = await createSupabaseBrowserClient(); await client.auth.signOut(); router.push("/do-it-ai?signin=1"); router.refresh(); }
  function beginRename(project: Project) { setEditingId(project.id); setDraftName(project.name); setRenameError(""); }
  function cancelRename() { setEditingId(null); setDraftName(""); setRenameError(""); }
  async function saveName(projectId: string) {
    const name = draftName.trim();
    if (!name) return setRenameError("Enter a project name.");
    setRenaming(true); setRenameError("");
    const response = await authorizedWebsiteFetch(`/api/projects/${projectId}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "rename", name }) });
    const result = await response.json().catch(() => ({ error: "Could not rename the project." }));
    setRenaming(false);
    if (!response.ok) return setRenameError(result.error ?? "Could not rename the project.");
    setProjects((current) => current.map((project) => project.id === projectId ? { ...project, name: result.name } : project));
    cancelRename();
  }
  function openVariant(project: Project) {
    setVariantFor(project); setVariantName(`${project.name} — opportunity`); setVariantTitle(""); setVariantBrief(""); setVariantAudience(""); setVariantError("");
  }
  async function createVariant() {
    if (!variantFor) return;
    if (!variantName.trim() || !variantTitle.trim() || variantBrief.trim().length < 20) return setVariantError("Add a project name, a clear opportunity title, and a brief of at least 20 characters.");
    setCreatingVariant(true); setVariantError("");
    try {
      const response = await authorizedWebsiteFetch(`/api/projects/${variantFor.id}/variants`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name: variantName, title: variantTitle, brief: variantBrief, audience: variantAudience }) });
      const result = await response.json().catch(() => ({ error: "Could not create the opportunity variant." }));
      if (!response.ok || !result.projectId) return setVariantError(result.error ?? "Could not create the opportunity variant.");
      router.push(`/do-it-ai/website-studio/${result.projectId}`);
    } catch { setVariantError("The opportunity request was interrupted. Your canonical portfolio was not changed."); }
    finally { setCreatingVariant(false); }
  }

  return <main className="website-builder-scope flow-page wide"><header className="flow-nav"><div className="flow-nav-start"><Link href="/ai-website-builder">Website Builder</Link><span>{email}</span></div><Link className="flow-brand" href="/do-it-ai">DOITWITHAI STUDIO</Link><button className="text-action" onClick={signOut}>Sign out</button></header>
    <div className="dashboard-heading"><div><p className="eyebrow">YOUR WORKSPACE</p><h1>Saved portfolios</h1><p>Your main portfolios and their opportunity pages are below. Open Settings to manage Visitor AI Agent for each portfolio.</p></div><Link className="primary-action" href="/ai-website-builder/start">Create new</Link></div>
    <p className="dashboard-group-heading">Main portfolios · {projects.filter((entry) => !entry.variant_of_project_id).length}</p>
    {renameError && <div className="form-message dashboard-message">{renameError}</div>}
    <section className="project-grid">{projects.some((entry) => !entry.variant_of_project_id) ? projects.filter((entry) => !entry.variant_of_project_id).map((project) => <article className="project-card" key={project.id}>
      {editingId === project.id ? <div className="project-rename"><label htmlFor={`rename-${project.id}`}>Project name</label><div><input id={`rename-${project.id}`} autoFocus value={draftName} maxLength={80} onChange={(event) => setDraftName(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") saveName(project.id); if (event.key === "Escape") cancelRename(); }} /><button type="button" disabled={renaming} onClick={() => saveName(project.id)} aria-label="Save project name"><Check size={17} /></button><button type="button" onClick={cancelRename} aria-label="Cancel rename"><X size={17} /></button></div></div> : <>
        <div className="project-link"><span>{project.creation_mode}</span><h2>{project.name}</h2><p>{project.template_id?.replaceAll("-", " ") ?? "AI-guided foundation"}</p><small>Draft revision {project.revision} · Updated {new Date(project.updated_at).toLocaleDateString()}</small><small className="visitor-status">Visitor AI Agent: {project.visitorEnabled ? project.publication ? "enabled; check Settings for pending documents" : "enabled in draft; publish to activate" : "off"}</small>{project.publication ? <div className="project-live-state"><i />Live at <code>/p/{project.publication.slug}</code><small>Published revision {project.publication.revision}</small></div> : <div className="project-draft-state">Not published yet</div>}</div>
        <div className="project-card-actions"><button type="button" className="danger-action" disabled={deleting===project.id} onClick={()=>void deleteProject(project)}>{deleting===project.id?"Deleting…":"Delete"}</button><Link href={`/do-it-ai/website-studio/${project.id}`}><Settings2 size={15} />Edit Studio</Link><Link href={`/do-it-ai/website-studio/${project.id}/settings`}><Bot size={15} />Visitor AI Agent settings</Link><button type="button" onClick={() => openVariant(project)}><Sparkles size={15} />Create opportunity page</button>{project.publication && <Link className="live-link" href={`/p/${project.publication.slug}`} target="_blank"><ExternalLink size={15} />View live</Link>}<button type="button" onClick={() => beginRename(project)}><Pencil size={15} />Rename</button></div>
      </>}
    </article>) : <div className="empty-projects"><h2>No saved portfolios yet</h2><p>Choose a guided setup or a curated template to create the first one.</p></div>}</section>
    <p className="dashboard-group-heading">Opportunity pages · {projects.filter((entry) => entry.variant_of_project_id).length}</p>
    <section className="project-grid opportunity-list">{projects.filter((entry) => entry.variant_of_project_id).map((project) => <article className="project-card" key={project.id}><div className="project-link"><span>{project.opportunity_status} opportunity page</span><h2>{project.name}</h2><p>Based on {projects.find((item) => item.id === project.variant_of_project_id)?.name ?? "a main portfolio"} · source revision {project.source_revision ?? "—"}</p><small>Draft revision {project.revision}</small>{project.publication ? <div className="project-live-state"><i />Live at <code>/p/{project.publication.slug}</code></div> : <div className="project-draft-state">Review and publish when ready</div>}</div><div className="project-card-actions"><button type="button" className="danger-action" disabled={deleting===project.id} onClick={()=>void deleteProject(project)}>{deleting===project.id?"Deleting…":"Delete"}</button><Link href={`/do-it-ai/website-studio/${project.id}`}><Settings2 size={15} />Review & edit</Link>{project.publication && <Link className="live-link" href={`/p/${project.publication.slug}`} target="_blank"><ExternalLink size={15} />View public page</Link>}</div></article>)}{!projects.some((entry) => entry.variant_of_project_id) && <div className="empty-projects"><h2>No opportunity pages yet</h2><p>Use Create opportunity page on a main portfolio to make a tailored, separately reviewable version.</p></div>}</section>
    {variantFor && <div className="publish-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setVariantFor(null); }}><section className="publish-dialog opportunity-dialog" role="dialog" aria-modal="true" aria-labelledby="opportunity-title"><header><div><span className="eyebrow">OPPORTUNITY VARIANT</span><h2 id="opportunity-title">Tailor a separate portfolio</h2></div><button type="button" aria-label="Close" onClick={() => setVariantFor(null)}><X size={18} /></button></header><p>This creates an isolated draft from <strong>{variantFor.name}</strong>. The canonical portfolio is never changed automatically.</p><label>Variant project name<input value={variantName} maxLength={80} onChange={(event) => setVariantName(event.target.value)} /></label><label>Opportunity title<input value={variantTitle} placeholder="AI builder collaboration" maxLength={120} onChange={(event) => setVariantTitle(event.target.value)} /></label><label>Opportunity brief<textarea value={variantBrief} placeholder="Who is this for, what matters, and what should this version emphasize?" maxLength={2400} rows={5} onChange={(event) => setVariantBrief(event.target.value)} /></label><label>Audience (optional)<input value={variantAudience} placeholder="Founder, accelerator, hiring team…" maxLength={160} onChange={(event) => setVariantAudience(event.target.value)} /></label>{variantError && <p className="form-message">{variantError}</p>}<footer><button type="button" className="secondary-action" onClick={() => setVariantFor(null)}>Cancel</button><button type="button" className="primary-action" disabled={creatingVariant} onClick={createVariant}>{creatingVariant ? "Creating…" : "Create reviewable variant"}</button></footer></section></div>}
  </main>;
}
