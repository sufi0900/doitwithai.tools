import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/features/website-builder/lib/supabase/server";

export const maxDuration = 30;


const submitSchema = z.object({
  clarity: z.number().int().min(1).max(5),
  relevance: z.number().int().min(1).max(5),
  presentation: z.number().int().min(1).max(5),
  comment: z.string().trim().max(2000).optional(),
});

export async function POST(
  request: Request,
  { params }: { params: { projectId: string; shareId: string } }
) {
  const { projectId, shareId } = params;
  const body = await request.json().catch(() => null);
  const parsed = submitSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid feedback." }, { status: 400 });

  const supabase = await createSupabaseServerClient();
  // Verify share exists, is active, and belongs to this project
  const { data: share, error: shareError } = await supabase
    .from("website_opportunity_shares")
    .select("id, owner_id, project_id, revoked_at, expires_at")
    .eq("id", shareId)
    .eq("project_id", projectId)
    .is("revoked_at", null)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  if (shareError || !share) return NextResponse.json({ error: "Share link not found or expired." }, { status: 404 });

  const { error } = await supabase.from("website_share_feedback").insert({
    share_id: shareId,
    owner_id: share.owner_id,
    clarity: parsed.data.clarity,
    relevance: parsed.data.relevance,
    presentation: parsed.data.presentation,
    comment: parsed.data.comment ?? null,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true }, { status: 201 });
}

export async function GET(
  _: Request,
  { params }: { params: { projectId: string; shareId: string } }
) {
  const { projectId, shareId } = params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Verify ownership
  const { data: share } = await supabase
    .from("website_opportunity_shares")
    .select("id")
    .eq("id", shareId)
    .eq("project_id", projectId)
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!share) return NextResponse.json({ error: "Share not found." }, { status: 404 });

  const { data, error } = await supabase
    .from("website_share_feedback")
    .select("clarity,relevance,presentation,comment,submitted_at")
    .eq("share_id", shareId)
    .order("submitted_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const feedback = (data ?? []).map((f) => ({
    clarity: f.clarity,
    relevance: f.relevance,
    presentation: f.presentation,
    comment: f.comment,
    submittedAt: f.submitted_at,
  }));

  // Compute averages
  const avg = feedback.length
    ? {
        clarity: Math.round(feedback.reduce((s, f) => s + f.clarity, 0) / feedback.length * 10) / 10,
        relevance: Math.round(feedback.reduce((s, f) => s + f.relevance, 0) / feedback.length * 10) / 10,
        presentation: Math.round(feedback.reduce((s, f) => s + f.presentation, 0) / feedback.length * 10) / 10,
      }
    : null;

  return NextResponse.json({ feedback, average: avg, count: feedback.length });
}