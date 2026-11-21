"use client";

import { useEffect, useState, type FormEvent } from "react";
import { agencyRequest } from "./agency-request";
import { agentName, channels } from "@/lib/ai-agency/panels";
import { specialists } from "@/lib/ai-agency/specialists";
import type { KnowledgeRow } from "./KnowledgeReview";

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

const SPECIALIST_QUICK_ACTIONS: Record<
  string,
  { label: string; prompt: string; subtitle: string }
> = {
  writer: {
    label: "Draft Section via Specialist",
    prompt:
      "Draft a fact-checked, SEO-optimized article outline and opening section for our highest-priority queued topic.",
    subtitle:
      "Generates a live draft grounded in your approved website knowledge base.",
  },
  keywords: {
    label: "Ask Keyword Strategist",
    prompt:
      "Propose 5 low-competition keyword cluster topics that do not overlap with our existing sitemap URLs.",
    subtitle: "Finds non-overlapping topic clusters aligned to your domain niche.",
  },
  visual: {
    label: "Draft Visual Brief",
    prompt:
      "Create a hero graphic and 4-step process infographic brief matching our approved brand palette.",
    subtitle: "Prepares structured visual specs for your Brand Studio.",
  },
  qa: {
    label: "Run Pre-Publish QA Check",
    prompt:
      "Review our latest specialist draft for factual accuracy, citations, and on-page SEO readiness.",
    subtitle: "Audits drafts before CMS delivery.",
  },
  technical: {
    label: "Run Technical Checklist",
    prompt:
      "Audit our indexed sitemap coverage, crawl files, and top priority technical SEO fixes.",
    subtitle: "Reviews crawlability, metadata, and site structure.",
  },
  refresh: {
    label: "Find Refresh Wins",
    prompt:
      "Identify which existing indexed pages would benefit most from a title, H1, and meta description refresh.",
    subtitle: "Targets striking-distance CTR and on-page improvements.",
  },
  pr: {
    label: "Plan AI Visibility Pitch",
    prompt:
      "Suggest 3 authority link-building and AI-citation angles tailored to our domain.",
    subtitle: "Strengthens brand mentions across search and AI answer engines.",
  },
  pinterest: {
    label: "Generate Pin Pack",
    prompt:
      "Create 3 high-CTR Pinterest pin titles and descriptions for our latest published article.",
    subtitle: "Stages ready-to-save Pinterest channel drafts directly into Social Ledger.",
  },
  linkedin: {
    label: "Generate LinkedIn Carousel",
    prompt:
      "Write an 8-slide LinkedIn carousel breakdown based on our core offering and latest article.",
    subtitle: "Stages structured B2B LinkedIn drafts directly into Social Ledger.",
  },
  facebook: {
    label: "Generate Community Post",
    prompt:
      "Write a concise, discussion-starting Facebook post highlighting a practical tip from our site.",
    subtitle: "Stages community-focused Facebook drafts directly into Social Ledger.",
  },
  video: {
    label: "Generate 60s Video Script",
    prompt:
      "Write a tight 60-second TikTok/Reels script (hook, problem, 3 steps, CTA) for our primary topic.",
    subtitle: "Stages short-form vertical video storyboards directly into Social Ledger.",
  },
  hub: {
    label: "Generate 4-Channel Social Pack",
    prompt:
      "Create a coordinated multi-channel social distribution plan across Pinterest, LinkedIn, Facebook, and TikTok/Reels.",
    subtitle:
      "Generates and saves live drafts across Pinterest, LinkedIn, Facebook, and Video.",
  },
};

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function countLinks(text: string): number {
  const matches = text.match(/https?:\/\/[^\s)]+/gi);
  return matches ? matches.length : 0;
}

export function PanelLedger({
  agent,
  openChannel,
  onStartAction,
  onOpenQa,
  website,
  version = 0,
}: {
  agent: string;
  openChannel?: (view: string) => void;
  onStartAction?: (agentId: string, prompt: string) => void;
  onOpenQa?: () => void;
  website?: KnowledgeRow | null;
  version?: number;
}) {
  const [data, setData] = useState<History>(),
    [notice, setNotice] = useState("");
  const [revision, setRevision] = useState(0);
  const [socialTopic, setSocialTopic] = useState("");
  const [generatingSocial, setGeneratingSocial] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const quickAction = SPECIALIST_QUICK_ACTIONS[agent];
  const isSocialChannel = channels.some((c) => c.id === agent);
  const isSocialOrHub = isSocialChannel || agent === "hub";

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
      setNotice("Saved draft to your channel ledger.");
    } catch (err) {
      setNotice(
        err instanceof Error ? err.message : "Could not save channel draft.",
      );
    }
  }

  async function handleGenerateSocialInPanel(e: FormEvent) {
    e.preventDefault();
    if (generatingSocial) return;
    setGeneratingSocial(true);
    setNotice(
      agent === "hub"
        ? "Generating 4-channel social distribution pack in real time…"
        : `Generating live ${agentName(agent)} draft and saving to Social Ledger…`,
    );
    try {
      const topicClean =
        socialTopic.trim() ||
        website?.profile?.name ||
        website?.domain ||
        "latest article";

      if (agent === "hub") {
        const res = await agencyRequest("/api/ai-employee-agency/run-agent-step", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            stepIndex: 4,
            siteName: website?.profile?.name || website?.domain,
            siteUrl: website?.domain,
            articleTitle: topicClean,
            targetKeyword: topicClean,
          }),
        });
        const result = (await res.json().catch(() => ({}))) as {
          ok?: boolean;
          error?: string;
          socialDraftsSaved?: number;
        };
        if (!res.ok || !result.ok) {
          throw new Error(result.error || "Could not generate 4-channel social pack.");
        }
        setSocialTopic("");
        setRevision((v) => v + 1);
        setNotice(
          `Saved ${result.socialDraftsSaved ?? 4} channel drafts across Pinterest, LinkedIn, Facebook, and Video.`,
        );
      } else {
        const prompt = `${quickAction?.prompt || "Generate a channel draft."} Focus specifically on: "${topicClean}".`;
        const chatRes = await agencyRequest("/api/ai-employee-agency/agent-chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: prompt, agentId: agent }),
        });
        const chatData = (await chatRes.json().catch(() => ({}))) as {
          workId?: string;
          error?: string;
        };
        if (!chatRes.ok) {
          throw new Error(chatData.error || "Specialist generation failed.");
        }
        if (chatData.workId) {
          await agencyRequest("/api/ai-employee-agency/panel", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ workId: chatData.workId }),
          }).catch(() => undefined);
        }
        setSocialTopic("");
        setRevision((v) => v + 1);
        setNotice(`Generated and staged live ${agentName(agent)} draft.`);
      }
    } catch (err) {
      setNotice(
        err instanceof Error ? err.message : "Social generation failed.",
      );
    } finally {
      setGeneratingSocial(false);
    }
  }

  function handleCopyText(id: string, text: string) {
    void navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId((prev) => (prev === id ? null : prev)), 1800);
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
      {/* Direct In-Panel Generator for Social Hub & 4 Social Channels */}
      {isSocialOrHub ? (
        <form
          onSubmit={handleGenerateSocialInPanel}
          className="space-y-3 rounded-xl border border-slate-800 bg-[#0B0F17] p-4"
        >
          <div className="min-w-0">
            <p className="text-xs font-semibold text-white">
              {agent === "hub"
                ? "Social & Video Distribution Workbench"
                : `${agentName(agent)} Direct Generator`}
            </p>
            <p className="mt-0.5 break-words text-xs text-slate-400">
              {quickAction?.subtitle}
            </p>
          </div>
          <div className="flex flex-col gap-2.5 sm:flex-row">
            <input
              type="text"
              value={socialTopic}
              onChange={(e) => setSocialTopic(e.target.value)}
              disabled={generatingSocial}
              placeholder="Enter article title, keyword, or offer to promote (or leave blank for brand default)…"
              className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-[#111827] px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={generatingSocial}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
            >
              {generatingSocial && (
                <span className="h-2 w-2 rounded-full bg-white animate-ping" />
              )}
              <span>
                {generatingSocial
                  ? "Generating Live…"
                  : `${quickAction?.label || "Generate Draft"} →`}
              </span>
            </button>
          </div>
        </form>
      ) : quickAction && onStartAction ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-[#0B0F17] p-4">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-white">{agentName(agent)}</p>
            <p className="mt-0.5 break-words text-xs text-slate-400">
              {quickAction.subtitle}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onStartAction(agent, quickAction.prompt)}
            className="w-full shrink-0 rounded-lg bg-[#2563EB] px-4 py-2 text-center text-xs font-semibold text-white transition hover:bg-blue-500 sm:w-auto"
          >
            {quickAction.label} →
          </button>
        </div>
      ) : null}

      {notice && (
        <p className="text-sm text-slate-300" role="status">
          {notice}
        </p>
      )}

      {data?.counts && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {channels.map((c) => (
            <button
              key={c.id}
              type="button"
              className="min-w-0 rounded-xl border border-slate-800 bg-[#0B0F17] p-4 text-left transition hover:border-blue-600/60 hover:bg-slate-900"
              onClick={() => openChannel?.(c.label)}
            >
              <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-400">
                Channel
              </p>
              <strong className="mt-1 block truncate text-sm font-semibold text-slate-100">
                {c.label}
              </strong>
              <p className="mt-1 font-mono text-xs text-slate-400">
                {data.counts?.[c.id] ?? 0} ledger entries
              </p>
            </button>
          ))}
        </div>
      )}

      {data?.upcoming && (
        <div className="space-y-2 rounded-xl border border-slate-800 bg-[#0B0F17] p-4">
          <h2 className="text-sm font-semibold text-slate-100">
            Upcoming channel queue
          </h2>
          {data.upcoming.length === 0 ? (
            <p className="text-xs text-slate-400">
              No dated social entries scheduled ahead.
            </p>
          ) : (
            <div className="divide-y divide-slate-800/80">
              {data.upcoming.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-2 py-2 text-xs"
                >
                  <span className="shrink-0 font-mono text-slate-400">
                    {item.payload.day}
                  </span>
                  <span className="min-w-0 flex-1 break-words font-medium text-slate-200">
                    {channels.find((c) => c.id === item.payload.channel)?.label} ·{" "}
                    {item.payload.title}
                  </span>
                  <span className="shrink-0 rounded-full border border-slate-700 px-2 py-0.5 text-[11px] text-slate-300">
                    {item.payload.status || "scheduled"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {data?.social && isSocialChannel && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base font-semibold text-slate-100">
              Channel activity
            </h2>
            <span className="rounded-full border border-slate-700 bg-[#0B0F17] px-2.5 py-0.5 text-xs text-slate-300">
              {!data.connected
                ? "Publishing connector unconfigured"
                : data.autoPublish
                  ? "Automatic publishing enabled"
                  : "Approval required for publishing"}
            </span>
          </div>
          {data.social.length === 0 && (
            <p className="text-sm text-slate-400">
              No channel activity recorded yet. Use the generator above to stage your first draft.
            </p>
          )}
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
                className="min-w-0 rounded-xl border border-slate-800 bg-[#0B0F17] p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs font-medium text-blue-400">
                    {agentName(agent)} · {payload.status || "Recorded"}{" "}
                    {payload.day && "· " + payload.day}
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopyText(
                        id,
                        `${payload.title || ""}\n\n${payload.description || ""}`.trim(),
                      )
                    }
                    className="rounded border border-slate-700 bg-[#111827] px-2 py-0.5 text-[10px] font-medium text-slate-300 hover:text-white"
                  >
                    {copiedId === id ? "Copied" : "Copy"}
                  </button>
                </div>
                <h3 className="mt-2 break-words font-semibold text-slate-100">
                  {payload.title}
                </h3>
                <p className="mt-1 break-words whitespace-pre-wrap text-sm text-slate-300">
                  {payload.description}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  {data.connected &&
                    (payload.status === "draft" ||
                      payload.status === "needs_review") && (
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
          <h2 className="text-base font-semibold text-slate-100">
            {agent === "writer" ? "Completed Article Drafts" : "Specialist work ledger"}
          </h2>
          {data.work.length === 0 && (
            <p className="text-sm text-slate-400">
              No saved work from this specialist yet. Use the live workbench above to run a task.
            </p>
          )}
          <div className="space-y-2.5">
            {data.work.map((w) => {
              const words = countWords(w.result);
              const links = countLinks(w.result);
              return (
                <details
                  key={w.id}
                  className="min-w-0 rounded-lg border border-slate-800 bg-[#0B0F17] p-3.5"
                >
                  <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-2 text-sm font-medium text-slate-200">
                    <span className="min-w-0 flex-1 break-words">{w.task}</span>
                    {agent === "writer" && (
                      <span className="shrink-0 font-mono text-[11px] text-slate-400">
                        {words.toLocaleString()} words · {links} links
                      </span>
                    )}
                  </summary>
                  <div className="mt-3 space-y-3 border-t border-slate-800 pt-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopyText(w.id, w.result)}
                        className="rounded-md border border-slate-700 bg-[#111827] px-2.5 py-1 text-[11px] font-medium text-slate-200 hover:border-blue-500/60 hover:text-white"
                      >
                        {copiedId === w.id ? "Copied Markdown" : "Copy Markdown"}
                      </button>
                      {agent === "writer" && onOpenQa && (
                        <button
                          type="button"
                          onClick={onOpenQa}
                          className="rounded-md bg-[#2563EB] px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-blue-500"
                        >
                          Open in QA &amp; Auto-Publish →
                        </button>
                      )}
                      {isSocialChannel && (
                        <button
                          type="button"
                          className="rounded-md bg-[#2563EB] px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-blue-500"
                          onClick={() => saveDraft(w.id)}
                        >
                          Save to channel drafts
                        </button>
                      )}
                    </div>
                    <p className="max-h-96 overflow-y-auto break-words whitespace-pre-wrap text-sm leading-relaxed text-slate-300">
                      {w.result}
                    </p>
                  </div>
                </details>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}

export function PanelChat({
  agent,
  initialPrompt = "",
  website,
  counts,
  close,
  onSaved,
}: {
  agent: string;
  initialPrompt?: string;
  website?: KnowledgeRow | null;
  counts?: { published: number; ready: number; queued: number };
  close: () => void;
  onSaved: () => void;
}) {
  const [activeAgent, setActiveAgent] = useState(agent);
  const [text, setText] = useState(initialPrompt);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [turns, setTurns] = useState<
    { prompt: string; reply: string; responder: string }[]
  >([]);

  useEffect(() => {
    setActiveAgent(agent);
  }, [agent]);

  useEffect(() => {
    if (initialPrompt) setText(initialPrompt);
  }, [initialPrompt]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [close]);

  const maturityLabel =
    website?.profile?.domain_maturity === "established_site"
      ? "Established Site Mode"
      : "New Site Mode";

  const quickPrompts = [
    `Summarize our current status (${counts ? `${counts.published + counts.ready} written, ${counts.queued} queued` : "live queue"}) and recommend the highest-impact next step.`,
    `Based on ${maturityLabel}, what should we prioritize first for ${website?.domain || "our site"}?`,
    "Draft a concise 5-point SEO & AI visibility checklist tailored to our domain.",
  ];

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
    <div
      className="fixed inset-0 z-[10000] flex justify-end bg-black/60 backdrop-blur-[2px]"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <aside
        aria-label={agentName(activeAgent) + " chat drawer"}
        className="flex h-dvh w-full max-w-md flex-col border-l border-slate-800 bg-[#0B0F17] text-slate-100 shadow-2xl"
      >
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-800 px-5 py-4">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-400">
              AI Agency Copilot · {maturityLabel}
            </p>
            <h2 className="truncate text-base font-semibold text-slate-100">
              {agentName(activeAgent)}
            </h2>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Close Copilot drawer"
            className="shrink-0 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            Close
          </button>
        </header>

        <div className="shrink-0 border-b border-slate-800/80 bg-[#111827]/70 px-5 py-3">
          <label className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
            <span>Active responder</span>
            <select
              value={activeAgent}
              disabled={busy}
              onChange={(e) => setActiveAgent(e.target.value)}
              className="min-w-0 max-w-full rounded-lg border border-slate-700 bg-[#0B0F17] px-2.5 py-1.5 text-xs font-medium text-slate-100"
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

        <div
          className="min-h-0 flex-1 space-y-3 overflow-y-auto px-5 py-4"
          aria-live="polite"
        >
          {turns.length === 0 ? (
            <div className="space-y-3 pt-2">
              <p className="text-sm leading-relaxed text-slate-400">
                Ask about your articles, sitemap inventory, or assign a task to{" "}
                <strong className="text-slate-200">{agentName(activeAgent)}</strong>.
              </p>
              <div className="space-y-2">
                {quickPrompts.map((q) => (
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
                <div className="ml-4 break-words rounded-xl border border-blue-500/30 bg-blue-600/15 px-3.5 py-2.5 text-sm text-blue-100 sm:ml-8">
                  {t.prompt}
                </div>
                <div className="mr-2 break-words rounded-xl border border-slate-800 bg-[#111827] px-3.5 py-3 text-sm text-slate-200 sm:mr-4">
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
            className="mx-5 mb-2 break-words rounded-lg border border-rose-500/40 bg-rose-950/50 px-3.5 py-2.5 text-xs text-rose-200"
          >
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="shrink-0 border-t border-slate-800 bg-[#111827]/80 p-4"
        >
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
              className="shrink-0 rounded-lg bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
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
