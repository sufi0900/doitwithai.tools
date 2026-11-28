import { NextResponse } from "next/server";
import { z } from "zod";
import { validateSiteDocument } from "@/features/website-builder/domain/site-document";
import { revisionSummary } from "@/features/website-builder/domain/revision-history";
import { createSupabaseServerClient } from "@/features/website-builder/lib/supabase/server";

export const maxDuration = 30;


const restoreSchema = z.object({ targetRevision: z.number().int().nonnegative(), expectedRevision: z.number().int().nonnegative() });

export async function GET(_: Request, { params }: { params: { projectId: string } }) {
  const { projectId } = params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const [{ data, error }, { data: live }] = await Promise.all([
    supabase.from("website_revisions").select("revision,source,created_at,document").eq("project_id", projectId).order("revision", { ascending: false }).limit(50),
    supabase.from("website_publications").select("revision").eq("project_id", projectId).is("superseded_at", null).maybeSingle(),
  ]);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const revisions = (data ?? []).flatMap((item) => {
    try {
      const document = validateSiteDocument(item.document);
      return [{ revision: item.revision, source: item.source, createdAt: item.created_at, summary: revisionSummary(document) }];
    } catch { return []; }
  });
  return NextResponse.json({ revisions, publishedRevision: live?.revision ?? null });
}

export async function POST(request: Request, { params }: { params: { projectId: string } }) {
  const { projectId } = params;
  const input = restoreSchema.safeParse(await request.json());
  if (!input.success) return NextResponse.json({ error: "Invalid restore request" }, { status: 400 });
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data, error } = await supabase.rpc("restore_website_revision", { p_project_id: projectId, p_target_revision: input.data.targetRevision, p_expected_revision: input.data.expectedRevision });
  if (error) {
    const conflict = error.message.includes("revision_conflict");
    return NextResponse.json({ error: conflict ? "The project changed before restoration. Refresh and try again." : error.message, code: conflict ? "REVISION_CONFLICT" : "RESTORE_FAILED" }, { status: conflict ? 409 : 500 });
  }
  return NextResponse.json({ revision: data });
}
