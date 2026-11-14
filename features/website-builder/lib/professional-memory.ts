import type { SupabaseClient } from "@supabase/supabase-js";

export type ApprovedMemory = { id: string; fact: string; source_note: string; created_at: string };

export async function ownedMemoryContext(supabase: SupabaseClient, projectId: string, ownerId: string) {
  const { data: project } = await supabase.from("website_projects").select("id,variant_of_project_id").eq("id", projectId).eq("owner_id", ownerId).maybeSingle();
  if (!project) return null;
  return { canonicalId: project.variant_of_project_id || project.id, projectId: project.id };
}

export async function approvedMemory(supabase: SupabaseClient, canonicalId: string, ownerId: string): Promise<ApprovedMemory[]> {
  const { data, error } = await supabase.from("website_professional_memory").select("id,fact,source_note,created_at").eq("canonical_project_id", canonicalId).eq("owner_id", ownerId).is("revoked_at", null).order("created_at", { ascending: false }).limit(30);
  if (error) throw new Error("Professional memory is unavailable. Apply migration 009.");
  return data ?? [];
}
