import { browserAccounts } from "@/features/tools-workspace/supabase";
import type { AssistantThread } from "./article-assistant";

export async function openAssistantHistory(projectId: string) {
  const client = await browserAccounts();
  if (!client) return null;
  // The authenticated client and RLS check ownership on every database call.
  const { data } = await client.auth.getSession();
  const userId = data.session?.user.id;
  if (!userId) return null;
  let queued = Promise.resolve();
  return {
    userId,
    async read() {
      const { data: rows, error } = await client.from("writer_assistant_threads")
        .select("payload,saved_at").eq("user_id", userId).eq("project_id", projectId)
        .order("saved_at", { ascending: false }).limit(30).abortSignal(AbortSignal.timeout(6000));
      if (error) throw error;
      return (rows || []).map((row) => ({ ...row.payload, savedAt: row.saved_at })) as AssistantThread[];
    },
    write(thread: AssistantThread) {
      const next = queued.catch(() => {}).then(async () => {
        const { error } = await client.from("writer_assistant_threads").upsert({
          user_id: userId, project_id: projectId, thread_id: thread.id,
          payload: thread, saved_at: thread.savedAt || Date.now(),
        }, { onConflict: "user_id,project_id,thread_id" }).abortSignal(AbortSignal.timeout(8000));
        if (error) throw error;
      });
      queued = next;
      return next;
    },
    watchAccount(onChange: () => void) {
      const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
        if (session?.user.id !== userId) onChange();
      });
      return () => subscription.unsubscribe();
    },
  };
}

export function mergeAssistantHistory(local: AssistantThread[], remote: AssistantThread[]) {
  const merged = new Map<string, AssistantThread>();
  for (const thread of [...remote, ...local]) {
    const stamped = merged.get(thread.id);
    if (!stamped || (thread.savedAt || 0) >= (stamped.savedAt || 0)) merged.set(thread.id, thread);
  }
  return [...merged.values()].sort((a, b) => (b.savedAt || 0) - (a.savedAt || 0)).slice(0, 30);
}
