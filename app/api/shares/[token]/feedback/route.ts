import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/features/website-builder/lib/supabase/server";
import { hashShareToken, validShareToken } from "@/features/website-builder/domain/opportunity-share";

export const maxDuration = 30;


const submitSchema = z.object({
  clarity: z.number().int().min(1).max(5),
  relevance: z.number().int().min(1).max(5),
  presentation: z.number().int().min(1).max(5),
  comment: z.string().trim().max(2000).optional(),
});

export async function POST(
  request: Request,
  { params }: { params: { token: string } }
) {
  const { token } = params;
  if (!validShareToken(token)) return NextResponse.json({ error: "Invalid share token." }, { status: 400 });

  const body = await request.json().catch(() => null);
  const parsed = submitSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid feedback." }, { status: 400 });

  const supabase = await createSupabaseServerClient();
  const hash = hashShareToken(token);

  // Verify share exists and is active via the same RPC logic
  const { data: share, error: shareError } = await supabase
    .from("website_opportunity_shares")
    .select("id, owner_id")
    .eq("token_hash", hash)
    .is("revoked_at", null)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  if (shareError || !share) return NextResponse.json({ error: "Share link not found or expired." }, { status: 404 });

  const { error } = await supabase.from("website_share_feedback").insert({
    share_id: share.id,
    owner_id: share.owner_id,
    clarity: parsed.data.clarity,
    relevance: parsed.data.relevance,
    presentation: parsed.data.presentation,
    comment: parsed.data.comment ?? null,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true }, { status: 201 });
}