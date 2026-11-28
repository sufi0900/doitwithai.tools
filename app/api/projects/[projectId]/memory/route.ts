import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/features/website-builder/lib/supabase/server";
import { approvedMemory, ownedMemoryContext } from "@/features/website-builder/lib/professional-memory";

export const maxDuration = 30;


const newMemory = z.object({ fact: z.string().trim().min(3).max(500), sourceNote: z.string().trim().min(3).max(200) }).strict();
const revokeMemory = z.object({ id: z.string().uuid() });
type Context = { params: { projectId: string } };

async function authorize({ params }: Context) {
  const { projectId } = params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const context = await ownedMemoryContext(supabase, projectId, user.id);
  return context ? { supabase, user, ...context } : null;
}

export async function GET(_: Request, context: Context) {
  const owner = await authorize(context);
  if (!owner) return NextResponse.json({ error: "Project not found." }, { status: 404 });
  try { return NextResponse.json({ facts: await approvedMemory(owner.supabase, owner.canonicalId, owner.user.id) }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Professional memory unavailable." }, { status: 503 }); }
}

export async function POST(request: Request, context: Context) {
  const owner = await authorize(context);
  if (!owner) return NextResponse.json({ error: "Project not found." }, { status: 404 });
  const input = newMemory.safeParse(await request.json().catch(() => null));
  if (!input.success) return NextResponse.json({ error: "Add a fact and where you verified it." }, { status: 400 });
  const { data, error } = await owner.supabase.from("website_professional_memory").insert({ owner_id: owner.user.id, canonical_project_id: owner.canonicalId, fact: input.data.fact, source_note: input.data.sourceNote }).select("id,fact,source_note,created_at").single();
  return error ? NextResponse.json({ error: "Could not save the approved fact. Apply migration 009." }, { status: 503 }) : NextResponse.json({ fact: data }, { status: 201 });
}

export async function DELETE(request: Request, context: Context) {
  const owner = await authorize(context);
  if (!owner) return NextResponse.json({ error: "Project not found." }, { status: 404 });
  const input = revokeMemory.safeParse(await request.json().catch(() => null));
  if (!input.success) return NextResponse.json({ error: "Choose a saved fact." }, { status: 400 });
  const { data, error } = await owner.supabase.from("website_professional_memory").update({ revoked_at: new Date().toISOString() }).eq("id", input.data.id).eq("canonical_project_id", owner.canonicalId).eq("owner_id", owner.user.id).is("revoked_at", null).select("id").maybeSingle();
  return error || !data ? NextResponse.json({ error: "Fact not found." }, { status: 404 }) : NextResponse.json({ revoked: true });
}
