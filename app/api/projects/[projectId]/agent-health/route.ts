import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/features/website-builder/lib/supabase/server";
import { ownedMemoryContext } from "@/features/website-builder/lib/professional-memory";

export const maxDuration = 30;


type Context = { params: { projectId: string } };

async function authorize({ params }: Context) {
  const { projectId } = params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const project = await ownedMemoryContext(supabase, projectId, user.id);
  return project ? { supabase, user, ...project } : null;
}

export async function GET(_: Request, context: Context) {
  const owner = await authorize(context);
  if (!owner) return NextResponse.json({ error: "Project not found." }, { status: 404 });
  const [eventsResult, settingsResult] = await Promise.all([
    owner.supabase.from("website_agent_events").select("operation,outcome,provider,attempts").eq("owner_id", owner.user.id).eq("project_id", owner.projectId).gte("created_at", new Date(Date.now() - 30 * 86400_000).toISOString()).order("created_at", { ascending: false }).limit(1000),
    owner.supabase.from("website_agent_settings").select("enabled").eq("canonical_project_id", owner.canonicalId).eq("owner_id", owner.user.id).maybeSingle(),
  ]);
  if (eventsResult.error || settingsResult.error) return NextResponse.json({ error: "Agent activity unavailable. Apply migrations 009 and 010." }, { status: 503 });
  const events = eventsResult.data ?? [];
  return NextResponse.json({ enabled: settingsResult.data?.enabled === true, sampledEvents: events.length, truncated: events.length === 1000, providerSuccesses: events.filter((event) => event.outcome === "ok").length, localFallbacks: events.filter((event) => event.outcome === "local_fallback").length, providerFailures: events.filter((event) => event.outcome === "provider_unavailable").length, byProvider: { nebius: events.filter((event) => event.provider === "nebius").length, openrouter: events.filter((event) => event.provider === "openrouter").length, gemini: events.filter((event) => event.provider === "gemini").length, openai: events.filter((event) => event.provider === "openai").length }, windowDays: 30 });
}

export async function PUT(request: Request, context: Context) {
  const owner = await authorize(context);
  if (!owner) return NextResponse.json({ error: "Project not found." }, { status: 404 });
  const input = z.object({ enabled: z.boolean() }).strict().safeParse(await request.json().catch(() => null));
  if (!input.success) return NextResponse.json({ error: "Choose whether to record activity." }, { status: 400 });
  const { error } = await owner.supabase.from("website_agent_settings").upsert({ canonical_project_id: owner.canonicalId, owner_id: owner.user.id, enabled: input.data.enabled, updated_at: new Date().toISOString() }, { onConflict: "canonical_project_id" });
  if (error) return NextResponse.json({ error: "Could not update activity preference. Apply migration 010." }, { status: 503 });
  return NextResponse.json({ enabled: input.data.enabled });
}

export async function DELETE(_: Request, context: Context) {
  const owner = await authorize(context);
  if (!owner) return NextResponse.json({ error: "Project not found." }, { status: 404 });
  const { error } = await owner.supabase.from("website_agent_events").delete().eq("owner_id", owner.user.id).eq("project_id", owner.projectId);
  if (error) return NextResponse.json({ error: "Could not clear agent activity. Apply migration 010." }, { status: 503 });
  return NextResponse.json({ cleared: true });
}
