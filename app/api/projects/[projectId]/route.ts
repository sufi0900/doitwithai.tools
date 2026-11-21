import { NextResponse } from "next/server";
import { z } from "zod";
import { siteDocumentSchema } from "@/features/website-builder/domain/site-document";
import { createSupabaseServerClient } from "@/features/website-builder/lib/supabase/server";

export const maxDuration = 30;


const saveSchema = z.object({ document: siteDocumentSchema, expectedRevision: z.number().int().nonnegative(), source: z.enum(["manual", "voice", "autosave"]).default("autosave") });
const renameSchema = z.object({ action: z.literal("rename"), name: z.string().trim().min(1).max(80) });

export async function GET(_: Request, { params }: { params: { projectId: string } }) {
  const { projectId } = params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data, error } = await supabase
    .from("website_projects")
    .select("id,name,document,revision,updated_at")
    .eq("id", projectId)
    .eq("owner_id", user.id)
    .single();
  if (error || !data) return NextResponse.json({ error: "Project not found" }, { status: 404 });
  const { data: pub } = await supabase
    .from("website_publications")
    .select("slug,document,revision,published_at")
    .eq("project_id", projectId)
    .is("superseded_at", null)
    .maybeSingle();
  return NextResponse.json({
    project: data,
    publication: pub ? { slug: pub.slug, revision: pub.revision, published_at: pub.published_at, document: pub.document } : null,
    publishedDocument: pub?.document ?? null,
  });
}

export async function PATCH(request: Request, { params }: { params: { projectId: string } }) {
  const { projectId } = params;
  const body: unknown = await request.json();
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rename = renameSchema.safeParse(body);
  if (rename.success) {
    const { data, error } = await supabase.from("website_projects").update({ name: rename.data.name }).eq("id", projectId).select("name").single();
    if (error || !data) return NextResponse.json({ error: error?.message ?? "Project not found" }, { status: error ? 500 : 404 });
    return NextResponse.json({ name: data.name });
  }

  const input = saveSchema.safeParse(body);
  if (!input.success || input.data.document.projectId !== projectId) return NextResponse.json({ error: input.success ? "Project ID mismatch." : input.error.issues.map(issue=>`${issue.path.join(".")}: ${issue.message}`).slice(0,3).join("; ") }, { status: 400 });
  const { data, error } = await supabase.rpc("save_website_project", { p_project_id: projectId, p_document: input.data.document, p_expected_revision: input.data.expectedRevision, p_source: input.data.source });
  if (error) return NextResponse.json({ error: error.message, code: error.message.includes("revision_conflict") ? "REVISION_CONFLICT" : "SAVE_FAILED" }, { status: error.message.includes("revision_conflict") ? 409 : 500 });
  return NextResponse.json({ revision: data });
}

export async function DELETE(_: Request, {params}:{params:{projectId:string}}) {
 const {projectId}=params;
 const db=await createSupabaseServerClient();
 const {data:{user}}=await db.auth.getUser();
 if(!user)return NextResponse.json({error:"Unauthorized"},{status:401});
 const {data:children,error:childError}=await db.from("website_projects").select("id").eq("owner_id",user.id).eq("variant_of_project_id",projectId).limit(1);
 if(childError)return NextResponse.json({error:childError.message},{status:500});
 if(children?.length)return NextResponse.json({error:"Delete this portfolio’s opportunity pages first, so they do not lose their source portfolio."},{status:409});
 const {data,error}=await db.from("website_projects").delete().eq("id",projectId).eq("owner_id",user.id).select("id").maybeSingle();
 if(error)return NextResponse.json({error:error.message},{status:500});
 if(!data)return NextResponse.json({error:"Project not found."},{status:404});
 return NextResponse.json({deleted:true});
}
