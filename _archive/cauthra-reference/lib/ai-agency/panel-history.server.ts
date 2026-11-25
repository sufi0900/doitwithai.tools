import type { SupabaseClient } from "@supabase/supabase-js";
import { channels } from "./panels";

export async function panelHistory(
  db: SupabaseClient,
  workspace: string,
  agent: string,
  limit: number,
) {
  const channel = channels.some((c) => c.id === agent);
  const [work, social] = await Promise.all([
    db
      .from("agency_specialist_work")
      .select("id,task,result,created_at")
      .eq("workspace_id", workspace)
      .eq("specialist", agent)
      .order("created_at", { ascending: false })
      .limit(limit),
    channel
      ? db
          .from("social_ledger")
          .select("id,payload,created_at")
          .eq("workspace_id", workspace)
          .eq("payload->>channel", agent)
          .order("created_at", { ascending: false })
          .limit(limit)
      : Promise.resolve({ data: [], error: null }),
  ]);
  if (work.error || social.error) throw Error("Workspace history unavailable.");
  return { work: work.data || [], social: social.data || [] };
}
