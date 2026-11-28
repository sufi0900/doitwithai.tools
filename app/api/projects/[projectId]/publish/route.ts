import { buildPublicationSnapshot, publicationChoices } from "@/features/website-builder/domain/publication-selection";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/features/website-builder/lib/supabase/server";
import { publishRequestSchema } from "@/features/website-builder/domain/publication";
import { validateSiteDocument } from "@/features/website-builder/domain/site-document";
import { reviewOpportunity } from "@/features/website-builder/domain/opportunity-review";

export const maxDuration = 30;


export async function POST(request: Request, { params }: { params: { projectId: string } }) {
  const { projectId } = params;
  const input = publishRequestSchema.safeParse(await request.json());
  if (!input.success) return NextResponse.json({ error: "Use 3–64 lowercase letters, numbers, and single hyphens for the public URL." }, { status: 400 });
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data: project } = await supabase.from("website_projects").select("document,revision").eq("id", projectId).eq("owner_id", user.id).single();
  if (!project) return NextResponse.json({ error: "Project not found." }, { status: 404 });
  if (project.revision !== input.data.expectedRevision) return NextResponse.json({ error: "The draft changed before publishing. Save the latest revision first." }, { status: 409 });
  const document = validateSiteDocument(project.document);
  if (document.opportunity.status !== "canonical") {
    if (!reviewOpportunity(document).ready) return NextResponse.json({ error: "Complete the opportunity review checklist before publishing." }, { status: 400 });
    if (document.opportunity.visibility === "private") return NextResponse.json({ error: "Private variants cannot be published. Choose Shared for a revocable private link or Public for a discoverable portfolio." }, { status: 400 });
  }
  const {data:live,error:liveError}=await supabase.from("website_publications").select("id,document").eq("project_id",projectId).is("superseded_at",null).maybeSingle();
  if(liveError) return NextResponse.json({error:"Could not load the live version. Retry before publishing."},{status:503});
  let snapshot;
  try { snapshot=buildPublicationSnapshot(document,live?validateSiteDocument(live.document):undefined,input.data.selection??publicationChoices(document,live?.document).filter(row=>!row.missing.length).map(row=>row.key),input.data.itemAction); }
  catch(cause){return NextResponse.json({error:cause instanceof Error?cause.message:"Check your selected content."},{status:400});}
  const { data, error } = await supabase.rpc("publish_website_snapshot", { p_project_id: projectId, p_slug: input.data.slug, p_expected_revision: input.data.expectedRevision, p_snapshot:snapshot, p_expected_publication_id:live?.id??null });
  if (error) {
    if(error.message.includes("publication_conflict")) return NextResponse.json({error:"Another session published this portfolio. Reload to review the latest live version before publishing."},{status:409});
    const conflict = error.message.includes("revision_conflict");
    const slugConflict = error.message.includes("duplicate key");
    const missingFunction = error.code === "PGRST202" || error.code === "42883";
    return NextResponse.json({ error: conflict ? "The draft changed before publishing. Wait for it to save, then try again." : slugConflict ? "That public URL is already in use." : missingFunction ? "This Supabase project cannot find the publication function. Apply migration 016_publication_snapshot.sql in the Supabase project connected to this environment, then refresh its API schema and retry. Earlier published sites remain live." : `Publication failed (${error.code ?? "database error"}): ${error.message}`, code: missingFunction ? "PUBLICATION_MIGRATION_MISSING" : conflict ? "REVISION_CONFLICT" : "PUBLISH_FAILED" }, { status: conflict ? 409 : slugConflict ? 409 : 500 });
  }
  let warning: string | undefined;
  if (snapshot.opportunity.status === "canonical" && snapshot.visitor.enabled) {
    const { error: knowledgeError } = await supabase.rpc("publish_website_visitor_documents", { p_project_id: projectId });
    if (knowledgeError) warning = "Website published. Visitor AI Agent documents could not be activated; apply migration 015 and publish Visitor AI Agent settings again.";
  }
  revalidatePath(`/p/${input.data.slug}`, "layout");
  return NextResponse.json({ publication: data?.[0], document:snapshot, warning });
}

export async function DELETE(_: Request, { params }: { params: { projectId: string } }) {
  const { projectId } = params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { error } = await supabase.rpc("unpublish_website", { p_project_id: projectId });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ unpublished: true });
}

export async function GET(_:Request,{params}:{params:{projectId:string}}){
 const {projectId}=params;const db=await createSupabaseServerClient();const {data:{user}}=await db.auth.getUser();
 if(!user)return NextResponse.json({error:"Unauthorized"},{status:401});
 const {data,error}=await db.from("website_publications").select("slug").eq("project_id",projectId).eq("owner_id",user.id).is("superseded_at",null).maybeSingle();
 if(error)return NextResponse.json({error:error.message},{status:500});return NextResponse.json({publication:data});
}
