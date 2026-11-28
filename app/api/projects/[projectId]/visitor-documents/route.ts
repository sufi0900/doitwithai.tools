import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/features/website-builder/lib/supabase/server";
import { extractVisitorText, MAX_VISITOR_DOCUMENT_COUNT } from "@/features/website-builder/lib/visitor-document";

export const maxDuration = 30;


export const runtime = "nodejs";
async function owner(projectId: string) {
  const db = await createSupabaseServerClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return null;
  const { data: project } = await db.from("website_projects").select("id,variant_of_project_id").eq("id", projectId).eq("owner_id", user.id).maybeSingle();
  return project && !project.variant_of_project_id ? { db, user } : null;
}
export async function GET(_: Request, { params }: { params: { projectId: string } }) {
  const { projectId } = params;
  const session = await owner(projectId);
  if (!session) return NextResponse.json({ error: "Portfolio not found." }, { status: 404 });
  const { data, error } = await session.db.from("website_visitor_documents").select("id,file_name,created_at,published,body").eq("project_id", projectId).order("created_at", { ascending: false });
  return error ? NextResponse.json({ error: error.message }, { status: 500 }) : NextResponse.json({ documents: data }, { headers: { "Cache-Control": "no-store" } });
}
export async function POST(request: Request, { params }: { params: { projectId: string } }) {
  const { projectId } = params;
  const session = await owner(projectId);
  if (!session) return NextResponse.json({ error: "Portfolio not found." }, { status: 404 });
  const { count, error: countError } = await session.db.from("website_visitor_documents").select("id", { count: "exact", head: true }).eq("project_id", projectId);
  if (countError) return NextResponse.json({ error: countError.message }, { status: 500 });
  if ((count ?? 0) >= MAX_VISITOR_DOCUMENT_COUNT) return NextResponse.json({ error: "Remove a document before adding another (10 maximum)." }, { status: 409 });
  const file = (await request.formData().catch(() => null))?.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Select a document." }, { status: 400 });
  try {
    const body = await extractVisitorText(file);
    const { data, error } = await session.db.from("website_visitor_documents").insert({ project_id: projectId, owner_id: session.user.id, file_name: file.name.slice(0, 180), body }).select("id,file_name,created_at,published,body").single();
    return error ? NextResponse.json({ error: error.message }, { status: 500 }) : NextResponse.json({ document: data }, { status: 201 });
  } catch (cause) { return NextResponse.json({ error: cause instanceof Error ? cause.message : "Could not read the document." }, { status: 422 }); }
}
export async function DELETE(request: Request, { params }: { params: { projectId: string } }) {
  const { projectId } = params;
  const session = await owner(projectId);
  if (!session) return NextResponse.json({ error: "Portfolio not found." }, { status: 404 });
  const id = (await request.json().catch(() => null))?.id;
  if (typeof id !== "string" || !/^[a-f0-9-]{36}$/i.test(id)) return NextResponse.json({ error: "Invalid document." }, { status: 400 });
  const { error } = await session.db.from("website_visitor_documents").delete().eq("id", id).eq("project_id", projectId);
  return error ? NextResponse.json({ error: error.message }, { status: 500 }) : NextResponse.json({ deleted: true });
}
