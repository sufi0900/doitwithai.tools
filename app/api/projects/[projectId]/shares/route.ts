import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/features/website-builder/lib/supabase/server";
import { validateSiteDocument } from "@/features/website-builder/domain/site-document";
import { createShareToken } from "@/features/website-builder/domain/opportunity-share";

export const maxDuration = 30;


async function ownedProject(projectId: string) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, project: null };
  const { data: project } = await supabase.from("website_projects").select("document").eq("id", projectId).eq("owner_id", user.id).single();
  return { supabase, user, project };
}

export async function GET(_: Request, { params }: { params: { projectId: string } }) {
  const { projectId } = params;
  const { supabase, user, project } = await ownedProject(projectId);
  if (!user || !project) return NextResponse.json({ error: "Project not found." }, { status: 404 });
  const { data: publication } = await supabase.from("website_publications").select("id").eq("project_id", projectId).is("superseded_at", null).maybeSingle();
  if (!publication) return NextResponse.json({ shares: [] });
  const { data, error } = await supabase.from("website_opportunity_shares").select("id,created_at,expires_at,revoked_at").eq("project_id", projectId).eq("publication_id", publication.id).order("created_at", { ascending: false }).limit(25);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const ids = (data ?? []).map((share) => share.id);
  const { data: opens } = ids.length ? await supabase.from("website_share_opens").select("share_id").in("share_id", ids) : { data: [] as { share_id: string }[] };
  return NextResponse.json({ shares: (data ?? []).map((share) => ({ ...share, openCount: opens?.filter((open) => open.share_id === share.id).length ?? 0 })) });
}

export async function POST(_: Request, { params }: { params: { projectId: string } }) {
  const { projectId } = params;
  const { supabase, user, project } = await ownedProject(projectId);
  if (!user || !project) return NextResponse.json({ error: "Project not found." }, { status: 404 });
  const doc = validateSiteDocument(project.document);
  if (doc.opportunity.status === "canonical" || doc.opportunity.visibility !== "shared") return NextResponse.json({ error: "Set this opportunity to Shared visibility first." }, { status: 400 });
  const { data: pub } = await supabase.from("website_publications").select("id,document").eq("project_id", projectId).is("superseded_at", null).maybeSingle();
  if (!pub || validateSiteDocument(pub.document).opportunity.visibility !== "shared") return NextResponse.json({ error: "Publish this shared opportunity version first." }, { status: 400 });
  const { token, hash } = createShareToken();
  const expiresAt = new Date(Date.now() + 7 * 86400_000).toISOString();
  const { data, error } = await supabase.from("website_opportunity_shares").insert({ project_id: projectId, publication_id: pub.id, owner_id: user.id, token_hash: hash, expires_at: expiresAt }).select("id,expires_at").single();
  if (error || !data) return NextResponse.json({ error: error?.message ?? "Could not create a share link." }, { status: 500 });
  return NextResponse.json({ share: data, url: `/s/${token}` }, { status: 201 });
}

export async function DELETE(request: Request, { params }: { params: { projectId: string } }) {
  const { projectId } = params;
  const input = z.object({ shareId: z.string().uuid() }).safeParse(await request.json().catch(() => null));
  if (!input.success) return NextResponse.json({ error: "Select a valid share link." }, { status: 400 });
  const { supabase, user, project } = await ownedProject(projectId);
  if (!user || !project) return NextResponse.json({ error: "Project not found." }, { status: 404 });
  const { data, error } = await supabase.from("website_opportunity_shares").update({ revoked_at: new Date().toISOString() }).eq("id", input.data.shareId).eq("project_id", projectId).eq("owner_id", user.id).select("id").single();
  return error || !data ? NextResponse.json({ error: "Share link not found." }, { status: 404 }) : NextResponse.json({ revoked: true });
}
