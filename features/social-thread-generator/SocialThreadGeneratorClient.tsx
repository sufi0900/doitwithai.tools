"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Copy,
  Download,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import {
  buildDeterministicThread,
  DEFAULT_THREAD_INPUT,
  type ThreadGeneratorInput,
  type ThreadGeneratorResult,
  type ThreadPlatform,
} from "./model";

export default function SocialThreadGeneratorClient() {
  const [input, setInput] = useState<ThreadGeneratorInput>(
    DEFAULT_THREAD_INPUT,
  );
  const [aiThread, setAiThread] = useState<ThreadGeneratorResult | null>(null);
  const [activeHookIndex, setActiveHookIndex] = useState(0);
  const [loadingAi, setLoadingAi] = useState(false);
  const [toast, setToast] = useState("");

  const deterministicThread = useMemo(
    () => buildDeterministicThread(input),
    [input],
  );
  const thread = aiThread || deterministicThread;

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2600);
  }

  function updateField<K extends keyof ThreadGeneratorInput>(
    key: K,
    val: ThreadGeneratorInput[K],
  ) {
    setAiThread(null);
    setInput((prev) => ({ ...prev, [key]: val }));
  }

  async function handleGenerateAiThread() {
    setLoadingAi(true);
    try {
      const res = await fetch("/api/ai-tools/social-thread-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (data?.thread) {
        setAiThread(data.thread);
        notify(`Generated AI ${input.platform} thread!`);
      }
    } catch {
      notify("Updated social thread posts.");
    } finally {
      setLoadingAi(false);
    }
  }

  const displayedPosts = useMemo(() => {
    const selectedHook =
      thread.hookOptions[activeHookIndex]?.hookText ||
      thread.hookOptions[0]?.hookText ||
      "";
    return thread.posts.map((p, idx) => {
      if (idx !== 0 || !selectedHook) return p;
      const prefix = input.includeNumbering ? `1/${p.total}\n\n` : "";
      const text = `${prefix}${selectedHook}`;
      return {
        ...p,
        text,
        charCount: text.length,
        withinLimit: text.length <= p.maxChars,
      };
    });
  }, [thread, activeHookIndex, input.includeNumbering]);

  function downloadThreadTxt() {
    const full = displayedPosts
      .map((p) => `--- POST ${p.index}/${p.total} (${p.role}) ---\n${p.text}`)
      .join("\n\n");
    const blob = new Blob([full], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "social-thread-draft.txt";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    notify("Downloaded full thread (.TXT)!");
  }

  return (
    <section
      aria-label="X and Threads Viral Thread Splitter Workspace"
      className="mx-auto w-full max-w-6xl overflow-x-clip px-4 py-10 sm:px-6"
    >
      {toast && (
        <div
          role="status"
          className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2.5 text-xs font-bold text-emerald-800 dark:text-emerald-300"
        >
          <CheckCircle2 size={15} />
          <span>{toast}</span>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.98fr)_minmax(0,1.02fr)]">
        {/* LEFT COLUMN: SOURCE CONTENT & HOOK SWITCHER */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-[#111827] sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 text-lg font-extrabold">
                <MessageSquare size={19} className="text-[#5271ff]" />
                1. Thread Source Notes &amp; Platform Rules
              </h2>
              <button
                type="button"
                onClick={handleGenerateAiThread}
                disabled={loadingAi}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#3452d1] px-4 py-2 text-xs font-extrabold text-white shadow-sm hover:bg-[#2842b5] disabled:opacity-60"
              >
                <Sparkles size={14} />
                {loadingAi ? "Crafting Thread…" : "Generate AI Viral Thread"}
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                    Target Network Limit
                  </label>
                  <select
                    value={input.platform}
                    onChange={(e) =>
                      updateField("platform", e.target.value as ThreadPlatform)
                    }
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold dark:border-slate-700 dark:bg-slate-900"
                  >
                    <option value="X (Twitter)">
                      X / Twitter (280 chars/post)
                    </option>
                    <option value="Threads">
                      Meta Threads (500 chars/post)
                    </option>
                    <option value="LinkedIn Slide Text">
                      LinkedIn Carousel Copy (320 chars/slide)
                    </option>
                  </select>
                </div>

                <div className="flex items-end pb-2">
                  <label className="flex cursor-pointer items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200">
                    <input
                      type="checkbox"
                      checked={input.includeNumbering}
                      onChange={(e) =>
                        updateField("includeNumbering", e.target.checked)
                      }
                      className="h-4 w-4 accent-[#3452d1]"
                    />
                    Include post counter (1/{displayedPosts.length})
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                  Thread Headline / Core Topic
                </label>
                <input
                  type="text"
                  value={input.topicOrHeadline}
                  onChange={(e) =>
                    updateField("topicOrHeadline", e.target.value)
                  }
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-bold dark:border-slate-700 dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                  Paste Article Draft, Bullet Points or Key Takeaways
                </label>
                <textarea
                  rows={9}
                  value={input.sourceContent}
                  onChange={(e) => updateField("sourceContent", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-3.5 text-xs leading-6 dark:border-slate-700 dark:bg-slate-900"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                    Final Post Link (CTA URL)
                  </label>
                  <input
                    type="text"
                    value={input.ctaUrl}
                    onChange={(e) => updateField("ctaUrl", e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-mono text-xs dark:border-slate-700 dark:bg-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                    Creator Handle
                  </label>
                  <input
                    type="text"
                    value={input.authorHandle}
                    onChange={(e) =>
                      updateField("authorHandle", e.target.value)
                    }
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-900"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Post #1 Hook Angle Switcher */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-[#111827] sm:p-6">
            <h3 className="text-base font-extrabold">
              2. Switch Post #1 Viral Hook Angle
            </h3>
            <div className="mt-3 space-y-2.5">
              {thread.hookOptions.map((h, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setActiveHookIndex(i);
                    notify(`Switched Post #1 to "${h.angle}"!`);
                  }}
                  className={`w-full rounded-xl border p-3.5 text-left text-xs transition ${
                    activeHookIndex === i
                      ? "border-[#3452d1] bg-[#3452d1]/10 dark:border-[#5271ff] dark:bg-[#5271ff]/20"
                      : "border-slate-200 bg-slate-50/70 hover:border-[#5271ff] dark:border-slate-800 dark:bg-slate-900/50"
                  }`}
                >
                  <span className="rounded-full bg-[#3452d1] px-2.5 py-0.5 text-[10px] font-extrabold text-white">
                    {h.angle}
                  </span>
                  <p className="mt-2 whitespace-pre-wrap font-semibold text-slate-900 dark:text-white">
                    {h.hookText}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: NUMBERED MULTI-POST THREAD CARDS */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-[#111827]">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#5271ff]">
                {input.platform} Thread Preview
              </span>
              <h3 className="text-base font-black">
                {displayedPosts.length} Connected Posts ({thread.maxCharsPerPost}{" "}
                char limit)
              </h3>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={async () => {
                  const all = displayedPosts.map((p) => p.text).join("\n\n---\n\n");
                  await navigator.clipboard.writeText(all);
                  notify("Copied entire thread to clipboard!");
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#3452d1] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#2842b5]"
              >
                <Copy size={13} />
                Copy All {displayedPosts.length} Posts
              </button>
              <button
                type="button"
                onClick={downloadThreadTxt}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold dark:border-slate-700 dark:bg-slate-800"
              >
                <Download size={13} /> .TXT
              </button>
            </div>
          </div>

          {displayedPosts.map((post) => (
            <div
              key={post.index}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-[#111827]"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#3452d1] text-xs font-black text-white">
                    {post.index}
                  </span>
                  <strong className="text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    {post.role}
                  </strong>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-0.5 font-mono text-[11px] font-extrabold ${
                      post.withinLimit
                        ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                        : "bg-rose-500/15 text-rose-700 dark:text-rose-300"
                    }`}
                  >
                    {post.charCount} / {post.maxChars}c
                  </span>
                  <button
                    type="button"
                    onClick={async () => {
                      await navigator.clipboard.writeText(post.text);
                      notify(`Copied Post #${post.index}!`);
                    }}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-slate-50 px-2.5 py-1 text-xs font-bold hover:border-[#5271ff] dark:border-slate-700 dark:bg-slate-800"
                  >
                    <Copy size={12} /> Copy Post #{post.index}
                  </button>
                </div>
              </div>

              <p className="mt-3 whitespace-pre-wrap break-words rounded-xl border border-slate-200/80 bg-slate-50 p-3.5 text-sm leading-6 text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100">
                {post.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
