import { siteDocumentSchema, type SiteDocument } from "./site-document";
type Item = SiteDocument["publishing"]["pages"][number] | SiteDocument["publishing"]["posts"][number];
export function missingPublicationFields(item: Item, kind: "page" | "post", document: SiteDocument) {
  const collection = kind === "page" ? document.publishing.pages : document.publishing.posts;
  const missing = [!item.title.trim() && "title", (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.slug) || collection.some(other => other.id !== item.id && other.slug === item.slug)) && "unique public URL", !item.seoTitle.trim() && "SEO title", !item.seoDescription.trim() && "SEO description", !item.blocks.some(b => b.type === "image" ? document.media.assets.some(a => a.id === b.mediaId) : b.type === "list" || b.type === "ordered-list" ? b.items.some(t => t.trim()) : b.text.trim()) && "content"];
  if (kind === "post" && "excerpt" in item) {
    missing.push(!item.excerpt.trim() && "excerpt");
    const isWriterBridgePost = Boolean("sourceArticleProjectId" in item && item.sourceArticleProjectId);
    if (!isWriterBridgePost) {
      missing.push(!document.media.assets.some(a => a.id === item.coverMediaId) && "cover image");
    }
  }
  return missing.filter(Boolean) as string[];
}
export const homePublicationGroups = ["hero", "about", "experience", "education", "skills", "projects", "contact", "design", "structure", "visitor"] as const;
export function publicationChoices(draft: SiteDocument, live?: SiteDocument) {
  const rows = homePublicationGroups.map(key => ({ key: String(key), label: key === "visitor" ? "Visitor Do It AI settings" : key === "structure" ? "Homepage order and visibility" : key === "design" ? "Template and design" : `${key[0].toUpperCase()}${key.slice(1)}`, missing: [] as string[], required: !live }));
  for (const kind of ["page", "post"] as const) {
    const entries = kind === "page" ? draft.publishing.pages : draft.publishing.posts;
    const previous = kind === "page" ? live?.publishing.pages : live?.publishing.posts;
    for (const item of entries) rows.push({key:`${kind}:${item.id}`,label:`${kind === "post" ? "Article" : "Page"}: ${item.title}${previous?.some(p=>p.id===item.id) ? " (live)" : " (draft)"}`,missing:missingPublicationFields(item,kind,draft),required:false});
    for (const item of previous ?? []) if (!entries.some(e=>e.id===item.id)) rows.push({key:`${kind}:${item.id}`,label:`Remove ${kind}: ${item.title}`,missing:[],required:false});
  }
  return rows;
}
export function buildPublicationSnapshot(draft: SiteDocument, live: SiteDocument | undefined, selected: string[], itemAction?: {kind:"page"|"post";id:string;status:"draft"|"published"}) {
  const chosen = new Set(selected);
  if (!live && homePublicationGroups.some(k=>!chosen.has(k))) throw new Error("Your first publication must include all homepage sections.");
  const result = structuredClone(live ?? draft);
  result.projectId=draft.projectId; result.revision=draft.revision; result.updatedAt=draft.updatedAt;
  result.opportunity=structuredClone(draft.opportunity);
  if (chosen.has("hero")) result.identity=structuredClone(draft.identity);
  if (chosen.has("about")) result.content.about=structuredClone(draft.content.about);
  for (const key of ["experience","education","projects","contact"] as const) if(chosen.has(key)) Object.assign(result.content,{[key]:structuredClone(draft.content[key])});
  if(chosen.has("skills")) result.skills=structuredClone(draft.skills);
  if(chosen.has("design")){result.design=structuredClone(draft.design);result.scene=structuredClone(draft.scene);}
  if(chosen.has("structure")){result.content.order=[...draft.content.order];result.content.visibility={...draft.content.visibility};}
  if(chosen.has("visitor")) result.visitor=structuredClone(draft.visitor);
  if(chosen.has("hero")||chosen.has("about")){result.media.headshotUrl=draft.media.headshotUrl;result.media.headshotAlt=draft.media.headshotAlt;}
  for(const kind of ["page","post"] as const){
    const key=kind==="page"?"pages":"posts";
    const previous=live?.publishing[key]??[];
    const next: Item[]=previous.filter(item=>!chosen.has(`${kind}:${item.id}`));
    for(const item of draft.publishing[key]) if(chosen.has(`${kind}:${item.id}`)){
      const status=itemAction?.kind===kind&&itemAction.id===item.id?itemAction.status:"published";
      if(status==="draft") continue;
      const missing=missingPublicationFields(item,kind,draft);
      if(missing.length) throw new Error(`${item.title}: complete ${missing.join(", ")}.`);
      next.push({...structuredClone(item),status:"published",publishedAt:item.publishedAt??new Date().toISOString()});
    }
    if(new Set(next.map(item=>item.slug)).size !== next.length) throw new Error(`Two selected/live ${key} share a URL. Select both renamed items or give them different public URLs.`);
    Object.assign(result.publishing,{[key]:next});
  }
  const needed=new Set<string>();
  result.content.projects.forEach(p=>p.mediaIds.forEach(id=>needed.add(id)));
  [...result.publishing.pages,...result.publishing.posts].forEach(p=>{needed.add(p.coverMediaId);p.blocks.forEach(b=>needed.add(b.mediaId));});
  const assets=new Map((live?.media.assets??[]).map(a=>[a.id,a]));
  const draftNeeded=new Set<string>();
  if(chosen.has("projects")) draft.content.projects.forEach(p=>p.mediaIds.forEach(id=>draftNeeded.add(id)));
  for(const kind of ["page","post"] as const) for(const item of draft.publishing[kind==="page"?"pages":"posts"]) if(chosen.has(`${kind}:${item.id}`)){draftNeeded.add(item.coverMediaId);item.blocks.forEach(b=>draftNeeded.add(b.mediaId));}
  draft.media.assets.forEach(a=>{if(draftNeeded.has(a.id)) assets.set(a.id,a);});
  result.media.assets=[...assets.values()].filter(a=>needed.has(a.id));
  return siteDocumentSchema.parse(result);
}

export function hasPublicationChanges(draft: SiteDocument, live?: SiteDocument) {
  if (!live) return true;
  try {
    const candidate=buildPublicationSnapshot(draft,live,publicationChoices(draft,live).filter(row=>!row.missing.length).map(row=>row.key));
    const normalize=(value:SiteDocument)=>JSON.stringify(value,(key,item)=>["revision","updatedAt","publishedAt"].includes(key)?undefined:item);
    return normalize(candidate)!==normalize(live);
  } catch { return true; }
}
