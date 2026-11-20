"use client";

import { useEffect, useState, type FormEvent } from "react";
import { agencyRequest } from "./agency-request";
import { agentName, channels } from "@/lib/ai-agency/panels";

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
  connected?:boolean; autoPublish?:boolean;
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
  async function publish(id:string) {
    try {
      const res=await agencyRequest('/api/ai-employee-agency/social-delivery',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,approve:true})});
      const result=await res.json();if(!res.ok) throw Error(result.error);setRevision(v=>v+1);
    } catch(err){setNotice(err instanceof Error?err.message:'Delivery unavailable.');}
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
      className="space-y-3 rounded-xl border border-slate-700 bg-slate-900 p-5"
      aria-label="Panel history"
    >
      {notice && <p role="status">{notice}</p>}
      {data?.counts && (
        <div className="grid gap-3 sm:grid-cols-2">
          {channels.map((c) => (
            <button
              key={c.id}
              className="rounded-xl border border-slate-700 p-4 text-left hover:bg-slate-800"
              onClick={() => openChannel?.(c.label)}
            >
              <strong>{c.label}</strong>
              <p>{data.counts?.[c.id]} ledger entries</p>
            </button>
          ))}
        </div>
      )}
      {data?.upcoming && (
        <>
          <h2 className="font-semibold">Upcoming channel work</h2>
          {data.upcoming.length === 0 && <p>No dated entries ahead.</p>}
          {data.upcoming.map((item) => (
            <p key={item.id}>
              {item.payload.day} ·{" "}
              {channels.find((c) => c.id === item.payload.channel)?.label} ·{" "}
              {item.payload.title} · {item.payload.status}
            </p>
          ))}
        </>
      )}
      {data?.social && channels.some((c) => c.id === agent) && (
        <>
          <h2 className="text-lg font-semibold">Channel activity</h2><p>{!data.connected?'Publishing connector unconfigured':data.autoPublish?'Automatic publishing enabled':'Approval required for publishing'}</p>
          {data.social.length === 0 && <p>No channel activity recorded.</p>}
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
                className={
                  agent === "pinterest"
                    ? "rounded-3xl border border-rose-900 bg-slate-950 p-5"
                    : agent === "video"
                      ? "rounded-2xl border border-teal-800 bg-black p-5"
                      : "max-w-xl rounded-lg border border-slate-700 bg-slate-950 p-4"
                }
              >
                <p className="text-xs text-blue-300">
                  {agentName(agent)} · {payload.status || "Recorded"}{" "}
                  {payload.day && "· " + payload.day}
                </p>
                <h3 className="mt-2 font-semibold">{payload.title}</h3>
                <p className="whitespace-pre-wrap">{payload.description}</p>
                {data.connected && (payload.status==='draft' || payload.status==='needs_review') && <button className="rounded bg-blue-700 p-2" onClick={()=>publish(id)}>Approve and publish</button>}
                {payload.target_url &&
                  /^https?:\/\//i.test(payload.target_url) && (
                    <a
                      className="underline"
                      href={payload.target_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Source article
                    </a>
                  )}
              </article>
            ))}
          </div>
        </>
      )}
      {data?.work && (
        <>
          <h2 className="text-lg font-semibold">Specialist work</h2>
          {data.work.length === 0 && (
            <p>No saved work from this specialist yet.</p>
          )}
          {data.work.map((w) => (
            <details key={w.id}>
              <summary>{w.task}</summary>
              <p className="whitespace-pre-wrap p-2">{w.result}</p>
              {channels.some((c) => c.id === agent) && (
                <button
                  className="rounded bg-blue-800 px-3 py-2"
                  onClick={() => saveDraft(w.id)}
                >
                  Save to channel drafts
                </button>
              )}
            </details>
          ))}
        </>
      )}
    </section>
  );
}

export function PanelChat({
  agent,
  close,
  onSaved,
}: {
  agent: string;
  close: () => void;
  onSaved: () => void;
}) {
  const [text, setText] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const [turns, setTurns] = useState<{ prompt: string; reply: string }[]>([]);
  async function send(e: FormEvent) {
    e.preventDefault();
    if (busy || !text.trim()) return;
    setBusy(true);
    setError("");
    try {
      const response = await agencyRequest(
        "/api/ai-employee-agency/agent-chat",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text, agentId: agent }),
        },
      );
      const result = await response.json();
      if (!response.ok) throw Error(result.error);
      setTurns((old) => [...old, { prompt: text, reply: result.replyText }]);
      setText("");
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chat unavailable.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <aside
      aria-label={agentName(agent) + " chat"}
      className="sticky bottom-2 z-20 rounded-xl border border-blue-700 bg-slate-950 p-4 shadow-xl"
    >
      <header className="flex items-center justify-between">
        <h2 className="font-semibold">{agentName(agent)}</h2>
        <button onClick={close}>Close</button>
      </header>
      <div className="max-h-52 overflow-auto" aria-live="polite">
        {turns.map((t, i) => (
          <div className="space-y-2 py-2" key={i}>
            <p className="text-blue-300">{t.prompt}</p>
            <p className="whitespace-pre-wrap">{t.reply}</p>
          </div>
        ))}
      </div>
      <form onSubmit={send} className="mt-3 flex gap-2">
        <input
          autoFocus
          className="min-w-0 flex-1 rounded bg-slate-800 p-2"
          aria-label={"Message " + agentName(agent)}
          maxLength={8000}
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={busy}
        />
        <button
          className="rounded bg-blue-700 px-4"
          disabled={busy || !text.trim()}
        >
          {busy ? "Sending…" : "Send"}
        </button>
      </form>
      {error && <p role="alert">{error}</p>}
    </aside>
  );
}
