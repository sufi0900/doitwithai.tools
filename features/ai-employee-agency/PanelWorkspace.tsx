"use client";

import { useEffect, useState, type FormEvent } from "react";
import { agencyRequest } from "./agency-request";
import { agentName, channels } from "@/lib/ai-agency/panels";
import { specialists } from "@/lib/ai-agency/specialists";

type Work = { id: string; task: string; result: string; created_at: string };
type Social = {
  id: string;
  created_at: string;
  payload: {
    channel?: string;
    title?: string;
    description?: string;
    status?: string;
    day?: string;
    target_url?: string;
  };
};
type History = {
  connected?: boolean;
  autoPublish?: boolean;
  work: Work[];
  social: Social[];
  upcoming?: Social[];
  counts?: Record<string, number>;
};

export function PanelLedger({
  agent,
  openChannel,
  version = 0,
}: {
  agent: string;
  openChannel?: (view: string) => void;
  version?: number;
}) {
  const [data, setData] = useState<History>(),
    [notice, setNotice] = useState("");
  const [revision, setRevision] = useState(0);

  async function publish(id: string) {
    try {
      const res = await agencyRequest("/api/ai-employee-agency/social-delivery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, approve: true }),
      });
      const result = await res.json();
      if (!res.ok) throw Error(result.error);
      setRevision((v) => v + 1);
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Delivery unavailable.");
    }
  }

  async function saveDraft(workId: string) {
    try {
      const res = await agencyRequest("/api/ai-employee-agency/panel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workId }),
      });
      const result = await res.json();
      if (!res.ok) throw Error(result.error);
      setRevision((v) => v + 1);
    } catch (err) {
      setNotice(
        err instanceof Error ? err.message : "Could not save channel draft.",
      );
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    setData(undefined);
    setNotice("Loading history…");
    agencyRequest(
      "/api/ai-employee-agency/panel?agent=" + encodeURIComponent(agent),
      { signal: controller.signal },
    )
      .then(async (r) => {
        const result = await r.json();
        if (!r.ok) throw Error(result.error);
        if (!controller.signal.aborted) {
          setData(result);
          setNotice("");
        }
      })
      .catch((err) => {
        if (!controller.signal.aborted) setNotice(err.message);
      });
    return () => controller.abort();
  }, [agent, version, revision]);

  return (
    <section
      className="space-y-4 rounded-xl border border-slate-800 bg-[#111827] p-5"
      aria-label="Panel history"
    >
      {notice && <p className="text-sm text-slate-400" role="status">{notice}</p>}
      {data?.counts && (
        <div className="grid gap-3 sm:grid-cols-2">
          {channels.map((c) => (
            <button
              key={c.id}
              className="rounded-xl border border-slate-800 bg-[#0B0F17] p-4 text-left transition hover:border-blue-600/60 hover:bg-slate-900"
              onClick={() => openChannel?.(c.label)}
            >
              <strong className="text-slate-100">{c.label}</strong>
              <p className="mt-1 text-sm text-slate-400">{data.counts?.[c.id]} ledger entries</p>
            </button>
          ))}
        </div>
      )}
      {data?.upcoming && (
        <>
          <h2 className="text-base font-semibold text-slate-100">Upcoming channel work</h2>
          {data.upcoming.length === 0 && <p className="text-sm text-slate-400">No dated entries ahead.</p>}
          {data.upcoming.map((item) => (
            <p key={item.id} className="text-sm text-slate-300">
              {item.payload.day} ·{" "}
              {channels.find((c) => c.id === item.payload.channel)?.label} ·{" "}
              {item.payload.title} · {item.payload.status}
            </p>
          ))}
        </>
      )}
      {data?.social && channels.some((c) => c.id === agent) && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base font-semibold text-slate-100">Channel activity</h2>
            <span className="rounded-full border border-slate-700 bg-[#0B0F17] px-2.5 py-0.5 text-xs text-slate-300">
              {!data.connected
                ? "Publishing connector unconfigured"
                : data.autoPublish
                  ? "Automatic publishing enabled"
                  : "Approval required for publishing"}
            </span>
          </div>
          {data.social.length === 0 && <p className="text-sm text-slate-400">No channel activity recorded.</p>}
          <div
            className={
              agent === "pinterest" || agent === "video"
                ? "grid items-start gap-3 sm:grid-cols-2"
                : "space-y-3"
            }
          >
            {data.social.map(({ id, payload }) => (
              <article
                key={id}
                className="rounded-xl border border-slate-800 bg-[#0B0F17] p-4"
              >
                <p className="text-xs font-medium text-blue-400">
                  {agentName(agent)} · {payload.status || "Recorded"}{" "}
                  {payload.day && "· " + payload.day}
                </p>
                <h3 className="mt-2 font-semibold text-slate-100">{payload.title}</h3>
                <p className="mt-1 whitespace-pre-wrap text-sm text-slate-300">{payload.description}</p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  {data.connected &&
                    (payload.status === "draft" || payload.status === "needs_review") && (
                      <button
                        className="rounded-lg bg-[#2563EB] px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-500"
                        onClick={() => publish(id)}
                      >
                        Approve and publish
                      </button>
                    )}
                  {payload.target_url &&
                    /^https?:\/\//i.test(payload.target_url) && (
                      <a
                        className="text-xs text-blue-400 underline hover:text-blue-300"
                        href={payload.target_url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Source article
                      </a>
                    )}
                </div>
              </article>
            ))}
          </div>
        </>
      )}
      {data?.work && (
        <>
          <h2 className="text-base font-semibold text-slate-100">Specialist work</h2>
          {data.work.length === 0 && (
            <p className="text-sm text-slate-400">No saved work from this specialist yet.</p>
          )}
          <div className="space-y-2">
            {data.work.map((w) => (
              <details
                key={w.id}
                className="rounded-lg border border-slate-800 bg-[#0B0F17] p-3"
              >
                <summary className="cursor-pointer text-sm font-medium text-slate-200">{w.task}</summary>
                <p className="mt-2 whitespace-pre-wrap text-sm text-slate-300">{w.result}</p>
                {channels.some((c) => c.id === agent) && (
                  <button
                    className="mt-3 rounded-lg bg-[#2563EB] px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-500"
                    onClick={() => saveDraft(w.id)}
                  >
                    Save to channel drafts
                  </button>
                )}
              </details>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

const QUICK_PROMPTS = [
  "How many articles are published right now?",
  "Summarize our workspace status and next priority.",
  "Draft a concise 5-point SEO checklist for our domain.",
];

export function PanelChat({
  agent,
  close,
  onSaved,
}: {
  agent: string;
  close: () => void;
  onSaved: () => void;
}) {
  const [activeAgent, setActiveAgent] = useState(agent);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [turns, setTurns] = useState<{ prompt: string; reply: string; responder: string }[]>([]);

  useEffect(() => {
    setActiveAgent(agent);
  }, [agent]);

  async function sendPrompt(promptText: string) {
    const clean = promptText.trim();
    if (busy || !clean) return;
    setBusy(true);
    setError("");
    try {
      const response = await agencyRequest("/api/ai-employee-agency/agent-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: clean, agentId: activeAgent }),
      });
      const result = await response.json();
      if (!response.ok) throw Error(result.error || "Copilot request failed.");
      setTurns((old) => [
        ...old,
        {
          prompt: clean,
          reply: result.replyText,
          responder: result.agentName || agentName(activeAgent),
        },
      ]);
      setText("");
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chat unavailable.");
    } finally {
      setBusy(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    void sendPrompt(text);
  }

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/50 backdrop-blur-[2px]">
      <aside
        aria-label={agentName(activeAgent) + " chat drawer"}
        className="flex h-full w-full max-w-md flex-col border-l border-slate-800 bg-[#0B0F17] text-slate-100 shadow-2xl"
      >
        <header className="flex items-center justify-between gap-3 border-b border-slate-800 px-5 py-4">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-400">
              AI Agency Copilot
            </p>
            <h2 className="truncate text-base font-semibold text-slate-100">
              {agentName(activeAgent)}
            </h2>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Close Copilot drawer"
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            Close
          </button>
        </header>

        <div className="border-b border-slate-800/80 bg-[#111827]/70 px-5 py-3">
          <label className="flex items-center justify-between gap-2 text-xs text-slate-400">
            <span>Active responder</span>
            <select
              value={activeAgent}
              disabled={busy}
              onChange={(e) => setActiveAgent(e.target.value)}
              className="rounded-lg border border-slate-700 bg-[#0B0F17] px-2.5 py-1.5 text-xs font-medium text-slate-100"
            >
              <option value="copilot">Workspace Copilot</option>
              <option value="chief">Chief AI Officer</option>
              {specialists.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4" aria-live="polite">
          {turns.length === 0 ? (
            <div className="space-y-3 pt-2">
              <p className="text-sm leading-relaxed text-slate-400">
                Ask about your published articles, sitemap inventory, or assign a draft to{" "}
                <strong className="text-slate-200">{agentName(activeAgent)}</strong>.
              </p>
              <div className="space-y-2">
                {QUICK_PROMPTS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    disabled={busy}
                    onClick={() => void sendPrompt(q)}
                    className="block w-full rounded-lg border border-slate-800 bg-[#111827] px-3.5 py-2.5 text-left text-xs text-slate-300 transition hover:border-blue-600/60 hover:text-white"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            turns.map((t, i) => (
              <div className="space-y-2" key={i}>
                <div className="ml-8 rounded-xl border border-blue-500/30 bg-blue-600/15 px-3.5 py-2.5 text-sm text-blue-100">
                  {t.prompt}
                </div>
                <div className="mr-4 rounded-xl border border-slate-800 bg-[#111827] px-3.5 py-3 text-sm text-slate-200">
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    {t.responder}
                  </p>
                  <p className="whitespace-pre-wrap leading-relaxed">{t.reply}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {error && (
          <div
            role="alert"
            className="mx-5 mb-2 rounded-lg border border-rose-500/40 bg-rose-950/50 px-3.5 py-2.5 text-xs text-rose-200"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="border-t border-slate-800 bg-[#111827]/80 p-4">
          <div className="flex gap-2">
            <input
              autoFocus
              className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-[#0B0F17] px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
              aria-label={"Message " + agentName(activeAgent)}
              placeholder={`Message ${agentName(activeAgent)}…`}
              maxLength={8000}
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={busy}
            />
            <button
              type="submit"
              className="rounded-lg bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
              disabled={busy || !text.trim()}
            >
              {busy ? "Sending…" : "Send"}
            </button>
          </div>
        </form>
      </aside>
    </div>
  );
}
