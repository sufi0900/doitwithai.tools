import type { VoiceToolResult } from "./voice-tools";

/** Stop after the first rejected action; previously applied edits remain undoable revisions. */
export async function executeAssistantSteps<T extends { name: string; arguments: unknown }>(calls: T[], run: (call: T) => Promise<VoiceToolResult>) {
  const completed: VoiceToolResult[] = [];
  if (calls.length > 12) return { completed, error: "This request has more than 12 actions. Split it into two requests so none are missed." };
  for (const call of calls) {
    const result = await run(call);
    if (!result.ok) {
      const errorMessage = "error" in result ? result.error : "Action stopped.";
      return { completed, error: errorMessage };
    }
    completed.push(result);
  }
  return { completed, error: null };
}
