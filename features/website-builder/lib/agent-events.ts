import { createSupabaseServerClient } from "./supabase/server";

export async function recordAgentEvent(event: { ownerId: string; projectId: string; operation: "chat" | "opportunity_plan"; outcome: "ok" | "local_fallback" | "provider_unavailable"; provider?: "nebius" | "openrouter" | "gemini" | "openai"; attempts?: number }) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: project, error: projectError } = await supabase.from("website_projects").select("id,variant_of_project_id").eq("id", event.projectId).eq("owner_id", event.ownerId).maybeSingle();
    if (projectError || !project) return;
    const { data: settings, error: settingsError } = await supabase.from("website_agent_settings").select("enabled").eq("canonical_project_id", project.variant_of_project_id || project.id).eq("owner_id", event.ownerId).maybeSingle();
    if (settingsError || !settings?.enabled) return;
    const { error } = await supabase.from("website_agent_events").insert({ owner_id: event.ownerId, project_id: event.projectId, operation: event.operation, outcome: event.outcome, provider: event.provider ?? null, attempts: event.attempts ?? 0 });
    if (error) console.warn("Agent event unavailable", { operation: event.operation, code: error.code });
  } catch { /* Telemetry must never block an owner's edit. */ }
}
