"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { ArrowUp, Database, Globe2, Loader2, Plus, Sparkles, X } from "lucide-react";
import { RichPreview } from "./ArticleEditor";
import { safeUrl } from "./model";
import { type AssistantReply, type Passage } from "./article-assistant";
import s from "./article-assistant.module.css";

type Turn = { question: string; answer?: AssistantReply };
type Thread = { id: string; passage?: Passage; turns: Turn[] };
export type AssistantLaunch = { id: string; passage?: Passage };

export function ArticleAssistant({
  projectId, title, launch, dark, onClose, onSwitchThread, getContext, getDirectReply, renderActions, revision,
}: {
  projectId: string;
  title: string;
  launch: AssistantLaunch;
  dark: boolean;
  onClose: () => void;
  onSwitchThread: () => void;
  getContext: () => { article: string; diagnostics: string };
  getDirectReply: (question: string) => AssistantReply | undefined;
  renderActions: (answer: AssistantReply, passage?: Passage) => ReactNode;
  revision?: ReactNode;
}) {
  return <Conversation key={launch.id} {...{ projectId, title, launch, dark, onClose, onSwitchThread, getContext, getDirectReply, renderActions, revision }} />;
}

function Conversation({ projectId, title, launch, dark, onClose, onSwitchThread, getContext, getDirectReply, renderActions, revision }: Parameters<typeof ArticleAssistant>[0]) {
  const storageKey = `writer-assistant:v1:${projectId}`;
  const newThread = (passage?: Passage): Thread => ({ id: crypto.randomUUID(), passage, turns: [] });
  const [threads, setThreads] = useState<Thread[]>([]);
  const [active, setActive] = useState<Thread>(() => newThread(launch.passage));
  const [ready, setReady] = useState(false);
  const [draft, setDraft] = useState("");
  const [web, setWeb] = useState(false);
  const [pending, setPending] = useState<"web" | "workspace" | "reply" | null>(null);
  const [error, setError] = useState("");
  const request = useRef<AbortController | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const end = useRef<HTMLDivElement>(null);
  const composer = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(storageKey) || "[]");
      if (Array.isArray(stored)) {
        const valid = stored.filter((t: Thread) => t && typeof t.id === "string" && Array.isArray(t.turns) &&
          t.turns.every((turn) => typeof turn?.question === "string" && (!turn.answer ||
            (typeof turn.answer.reply === "string" && Array.isArray(turn.answer.cards)))));
        setThreads(valid);
        const recentArticleChat = valid.find((item: Thread) => !item.passage);
        if (!launch.passage && recentArticleChat) setActive(recentArticleChat);
      }
    } catch {}
    setReady(true);
    const node = dialog.current;
    node?.showModal();
    composer.current?.focus();
    return () => { request.current?.abort(); node?.close(); };
  }, [storageKey, launch]);

  useEffect(() => {
    if (!ready || !active.turns.length) return;
    const next = [active, ...threads.filter((item) => item.id !== active.id)].slice(0, 30);
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      setError("This browser couldn’t save the conversation.");
    }
    // The current thread and history are merged on each turn.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, ready]);

  useEffect(() => { end.current?.scrollIntoView({ block: "end" }); }, [active.turns, pending, revision]);

  function switchThread(next: Thread) {
    onSwitchThread();
    request.current?.abort();
    request.current = null;
    setThreads((saved) => active.turns.length
      ? [active, ...saved.filter((item) => item.id !== active.id)].slice(0, 30)
      : saved);
    setActive(next);
    setPending(null);
    setError("");
    setDraft("");
    composer.current?.focus();
  }

  async function send(event: FormEvent) {
    event.preventDefault();
    const question = draft.trim();
    if (!question || request.current) return;
    const useWeb = web || /\b(?:web search|search (?:the web|online)|look up|browse|research online|(?:find|add|include).{0,35}(?:stats|statistics?|current data))\b/i.test(question);
    const direct = useWeb ? undefined : getDirectReply(question);
    const usesWorkspace = direct || /\b(?:score|reading time|readability|meta description|faqs?|word count|headings|visuals|export|download)\b/i.test(question);
    const ctrl = new AbortController();
    request.current = ctrl;
    const threadId = active.id;
    const turns = [...active.turns, { question }].slice(-50);
    setActive({ ...active, turns });
    setDraft("");
    setError("");
    setPending(useWeb ? "web" : usesWorkspace ? "workspace" : "reply");
    try {
      let answer = direct;
      if (answer) {
        await new Promise((resolve) => setTimeout(resolve, 220));
      } else {
        const res = await fetch("/api/writer-workspace/assistant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: AbortSignal.any([ctrl.signal, AbortSignal.timeout(55000)]),
          body: JSON.stringify({
            ...getContext(), question, web: useWeb, passage: active.passage?.text.slice(0, 12000) || "",
            history: active.turns.filter((t) => t.answer).slice(-6).map((t) => ({
              question: t.question, reply: t.answer!.reply.slice(0, 4000),
            })),
          }),
        });
        const data = await res.json();
        if (!res.ok || typeof data.reply !== "string" || !Array.isArray(data.cards)) throw new Error(data.error || "The assistant could not reply.");
        answer = data as AssistantReply;
      }
      if (!ctrl.signal.aborted && answer) {
        const result = answer;
        setActive((thread) => thread.id === threadId
          ? { ...thread, turns: [...turns.slice(0, -1), { question, answer: result }] }
          : thread);
      }
    } catch (e) {
      if (!ctrl.signal.aborted) setError(e instanceof Error ? e.message : "The assistant could not reply.");
    } finally {
      if (request.current === ctrl) request.current = null;
      if (!ctrl.signal.aborted) setPending(null);
    }
  }

  const history = active.turns.length
    ? [active, ...threads.filter((item) => item.id !== active.id)]
    : threads;
  return createPortal(
    <dialog ref={dialog} className={s.drawer} data-dark={dark} aria-labelledby="writer-assistant-title"
      onCancel={(event) => { event.preventDefault(); onClose(); }}>
      <header className={s.header}>
        <div><h2 id="writer-assistant-title"><Sparkles size={17} /> Article AI</h2><p>{title}</p></div>
        <button type="button" onClick={onClose} aria-label="Close Article AI"><X size={18} /></button>
      </header>
      <div className={s.history}>
        <button type="button" onClick={() => switchThread(newThread())}><Plus size={15} /> New chat</button>
        {active.passage && <button type="button" onClick={() => switchThread(newThread(active.passage))}>New with passage</button>}
        <select aria-label="Chat history" value={active.turns.length ? active.id : ""}
          onChange={(event) => { const next = history.find((item) => item.id === event.target.value); if (next) switchThread(next); }}>
          {!active.turns.length && <option value="">Chat history</option>}
          {history.map((item) => <option key={item.id} value={item.id}>{item.turns[0]?.question.slice(0, 65)}</option>)}
        </select>
      </div>
      <div className={s.transcript} role="log" aria-label="Conversation">
        {active.passage && <div className={s.user}><strong>Selected passage</strong><p>{active.passage.text}</p></div>}
        {!active.passage && !active.turns.length && <div className={s.empty}>
          <Sparkles size={22} /><h3>What would you like to work on?</h3>
          <p>Ask about your draft, check its SEO details, or research a claim.</p>
          <div>{["How can I improve this article?", "Show my meta & SERP details", "How do I download this article?"].map((item) =>
            <button key={item} type="button" onClick={() => { setDraft(item); composer.current?.focus(); }}>{item}</button>)}</div>
        </div>}
        {active.turns.map((turn, i) => <div className={s.turn} key={i}>
          <div className={s.user}>{turn.question}</div>
          {turn.answer && <div className={s.reply}>
            <RichPreview md={turn.answer.reply} />
            {renderActions(turn.answer, active.passage)}
            {!!turn.answer.sources?.length && <details className={s.sources}><summary>Web sources</summary>
              {turn.answer.sources.map((source, j) => safeUrl(source.url) && <a href={safeUrl(source.url)} key={j} target="_blank" rel="noreferrer">{source.title || source.url}</a>)}
            </details>}
          </div>}
        </div>)}
        {pending && <div className={s.progress} data-stage={pending} role="status">
          {pending === "web" ? <Globe2 size={16} /> : pending === "workspace" ? <Database size={16} /> : <Loader2 size={16} />}
          {pending === "web" ? "Searching the web…" : pending === "workspace" ? "Checking article data…" : "Thinking through your draft…"}
        </div>}
        {error && <p className={s.error} role="alert">{error}</p>}
        {revision}
        <div ref={end} />
      </div>
      <form className={s.composer} onSubmit={send}>
        {active.passage && <details className={s.context}><summary>Selected passage attached</summary><p>{active.passage.text}</p></details>}
        <textarea ref={composer} aria-label="Message Article AI" placeholder="Ask Article AI…" rows={2} maxLength={2000}
          value={draft} onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
            event.preventDefault(); event.currentTarget.form?.requestSubmit();
          } }} />
        <div>
          <button type="button" aria-pressed={web} onClick={() => setWeb(!web)}><Globe2 size={15} /> Web search</button>
          {pending ? <button type="button" onClick={() => { request.current?.abort(); request.current = null; setPending(null); }}>Stop</button>
            : <button type="submit" className={s.send} disabled={!ready || !draft.trim()} aria-label="Send message"><ArrowUp size={18} /></button>}
        </div>
      </form>
    </dialog>, document.body,
  );
}
