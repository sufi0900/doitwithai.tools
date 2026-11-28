"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { ArrowUp, ChevronDown, Database, Globe2, Loader2, Maximize2, Minimize2, Plus, Sparkles, X } from "lucide-react";
import { RichPreview } from "./ArticleEditor";
import { safeUrl } from "./model";
import { assistantContinuity, assistantLinkIntent, relevantAssistantActions, requestsResearch, type AssistantThread as Thread, type AssistantTurn as Turn, type AssistantReply, type Passage, type ResearchMode, type SavedProposal } from "./article-assistant";
import s from "./article-assistant.module.css";
import { mergeAssistantHistory, openAssistantHistory } from "./assistant-history";

type Stage = "reply" | "web" | "workspace" | "reading" | "edit";
export type AssistantLaunch = { id: string; passage?: Passage; prompt?: string };

type Props = {
  projectId: string;
  title: string;
  launch: AssistantLaunch;
  dark: boolean;
  expanded: boolean;
  onExpand: () => void;
  onClose: () => void;
  getContext: () => { article: string; diagnostics: string; title: string; site: string; revision: string };
  getDirectReply: (question: string) => AssistantReply | undefined;
  renderActions: (answer: AssistantReply) => ReactNode;
  applyProposal: (proposal: SavedProposal) => string | Passage | undefined;
};

const createThread = (passage?: Passage): Thread => ({ id: crypto.randomUUID(), passage, turns: [] });

function normalizeThreads(stored: unknown): Thread[] {
  if (!Array.isArray(stored)) return [];
  return (stored as Thread[]).flatMap((item) => {
    if (!item || typeof item.id !== "string" || !Array.isArray(item.turns)) return [];
    const turns = item.turns.filter((turn) => typeof turn?.question === "string" &&
      (!turn.answer || (typeof turn.answer.reply === "string" && Array.isArray(turn.answer.cards))))
      .map((turn, index) => ({
        ...turn, id: turn.id || item.id + ":" + index,
        passage: turn.passage || (index === 0 ? item.passage : undefined),
        error: turn.error || (!turn.answer ? "This reply was interrupted. You can retry it." : undefined),
      }));
    return [{ ...item, turns }];
  });
}

function readLocalThreads(key: string) {
  try { return normalizeThreads(JSON.parse(localStorage.getItem(key) || "[]")); } catch { return []; }
}

async function readReply(res: Response, onStage: (stage: Stage) => void): Promise<AssistantReply> {
  if (!res.ok || !res.body || !res.headers.get("content-type")?.includes("application/x-ndjson")) {
    const data = await res.json().catch(() => ({}));
    if (!res.ok || typeof data.reply !== "string" || !Array.isArray(data.cards))
      throw new Error(data.error || "Article AI couldn’t reply. Try again.");
    return data;
  }
  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += value;
      let end = buffer.indexOf("\n");
      while (end >= 0) {
        const event = JSON.parse(buffer.slice(0, end));
        buffer = buffer.slice(end + 1);
        if (event.stage) onStage(event.stage);
        if (event.error) throw new Error(event.error);
        if (event.result) return event.result;
        end = buffer.indexOf("\n");
      }
    }
  } finally {
    await reader.cancel().catch(() => {});
  }
  throw new Error("The response ended early. Try sending the message again.");
}

const stageLabel: Record<Stage, string> = {
  reply: "Thinking through your draft…",
  web: "Searching the web…",
  reading: "Reading supplied pages and searching the web…",
  workspace: "Checking article data…",
  edit: "Preparing the requested revision…",
};

export function ArticleAssistant(props: Props) {
  return <Conversation key={props.launch.id} {...props} />;
}

function Conversation({ projectId, title, launch, dark, expanded, onExpand, onClose, getContext, getDirectReply, renderActions, applyProposal }: Props) {
  const legacyKey = `writer-assistant:v1:${projectId}`;
  const storageKey = useRef(legacyKey);
  const cloud = useRef<Awaited<ReturnType<typeof openAssistantHistory>>>(null);
  const [canImport, setCanImport] = useState(false);
  const [active, setActive] = useState(() => createThread(launch.passage));
  const [threads, setThreads] = useState<Thread[]>([]);
  const records = useRef<Thread[]>([]);
  const [ready, setReady] = useState(false);
  const [draft, setDraft] = useState(launch.prompt || "");
  const [mode, setMode] = useState<ResearchMode>("auto");
  const [pending, setPending] = useState<Record<string, Stage>>({});
  const [saveError, setSaveError] = useState("");
  const [applyError, setApplyError] = useState<Record<string, string>>({});
  const applying = useRef(new Set<string>());
  const requests = useRef(new Map<string, AbortController>());
  const dialog = useRef<HTMLDialogElement>(null);
  const transcript = useRef<HTMLDivElement>(null);
  const scrollPinned = useRef(true);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const composer = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    let disposed = false;
    let unwatch: (() => void) | undefined;
    const running = requests.current;
    async function hydrate() {
      const account = await openAssistantHistory(projectId).catch(() => null);
      if (disposed) return;
      if (account) {
        cloud.current = account;
        storageKey.current = legacyKey + ":account:" + account.userId;
        unwatch = account.watchAccount(onClose);
      }
      const key = storageKey.current;
      const local = readLocalThreads(key);
      if (account && readLocalThreads(legacyKey).length) {
        try { setCanImport(localStorage.getItem(key + ":legacy-imported") !== "true"); } catch {}
      }
      const remote = account ? await account.read().catch(() => null) : [];
      if (disposed) return;
      if (account && remote === null) setSaveError("Account chat history is unavailable. This browser can still save your conversation.");
      const recordsToShow = mergeAssistantHistory(local, normalizeThreads(remote));
      records.current = recordsToShow;
      setThreads(recordsToShow);
      let last: string | null = null;
      try { last = localStorage.getItem(key + ":active"); } catch {}
      const recent = recordsToShow.find((item) => item.id === last) || recordsToShow[0];
      if (!launch.passage && !launch.prompt && recent) setActive(recent);
      setReady(true);
    }
    void hydrate();
    return () => {
      disposed = true;
      unwatch?.();
      for (const request of running.values()) request.abort();
      running.clear();
    };
    // The dialog is keyed by its launch, so a new launch gets a new history session.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [legacyKey, projectId, launch]);

  useEffect(() => {
    const node = dialog.current;
    if (!node) return;
    node.close();
    if (expanded) node.show();
    else node.showModal();
    titleRef.current?.focus({ preventScroll: true });
    const frame = expanded ? requestAnimationFrame(() =>
      node.scrollIntoView({ block: "start", inline: "nearest" }),
    ) : undefined;
    return () => {
      if (frame !== undefined) cancelAnimationFrame(frame);
      node.close();
    };
  }, [expanded]);

  const thread = threads.find((item) => item.id === active.id) || active;
  const stage = pending[thread.id];
  useEffect(() => {
    if (transcript.current && scrollPinned.current) transcript.current.scrollTop = transcript.current.scrollHeight;
  }, [thread.id, thread.turns, stage, expanded]);

  function saveThread(thread: Thread) {
    const next = { ...thread, savedAt: Date.now() };
    const saved = [next, ...records.current.filter((item) => item.id !== next.id)].slice(0, 30);
    records.current = saved;
    setThreads(saved);
    try {
      localStorage.setItem(storageKey.current, JSON.stringify(saved));
      setSaveError("");
    } catch {
      setSaveError("This browser couldn’t save the latest conversation changes.");
    }
    if (next.turns.every((turn) => turn.answer || turn.error)) {
      void cloud.current?.write(next).catch(() => setSaveError("Account sync is unavailable. Your conversation is saved in this browser when storage is available."));
    }
  }

  function importLegacy() {
    for (const thread of readLocalThreads(legacyKey).reverse()) {
      if (!records.current.some((saved) => saved.id === thread.id)) saveThread(thread);
    }
    try { localStorage.setItem(storageKey.current + ":legacy-imported", "true"); } catch {}
    setCanImport(false);
  }

  function updateThread(id: string, transform: (current: Thread) => Thread) {
    const latest = records.current.find((item) => item.id === id);
    if (latest) saveThread(transform(latest));
  }

  function switchThread(next: Thread) {
    scrollPinned.current = true;
    setActive(next);
    setDraft("");
    try { localStorage.setItem(storageKey.current + ":active", next.id); } catch {}
    composer.current?.focus();
  }

  async function ask(question: string, target: Thread, retry?: Turn) {
    if (!ready || !question || requests.current.has(target.id)) return;
    scrollPinned.current = true;
    const turn: Turn = { id: retry?.id || crypto.randomUUID(), question, passage: retry ? retry.passage : target.passage };
    const ctrl = new AbortController();
    requests.current.set(target.id, ctrl);
    const explicitWeb = mode === "web" || (mode === "auto" && (requestsResearch(question) || assistantLinkIntent(question).authority));
    const isFollowUp = target.turns.length > 0;
    const direct = explicitWeb || turn.passage || isFollowUp || launch.prompt ? undefined : getDirectReply(question);
    saveThread({ ...target, turns: retry
      ? target.turns.map((item) => item.id === turn.id ? turn : item)
      : [...target.turns, turn].slice(-50) });
    try { localStorage.setItem(storageKey.current + ":active", target.id); } catch {}
    const localStage = /\b(?:rewrite|revise|improve|shorten|simplify|expand|edit)\b/i.test(question) ? "edit" : "reply";
    setPending((state) => ({ ...state, [target.id]: explicitWeb ? "web" : direct ? "workspace" : localStage }));
    try {
      const { revision, ...context } = getContext();
      let answer = direct;
      if (!answer) {
        const previous = retry ? target.turns.slice(0, target.turns.findIndex((item) => item.id === retry.id)) : target.turns;
        const res = await fetch("/api/writer-workspace/assistant", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/x-ndjson" },
          signal: AbortSignal.any([ctrl.signal, AbortSignal.timeout(57000)]),
          body: JSON.stringify({
            ...context, question, mode, passage: turn.passage?.text.slice(0, 12000) || "",
            ...assistantContinuity(previous),
          }),
        });
        answer = await readReply(res, (next) => {
          if (!ctrl.signal.aborted) setPending((state) => ({ ...state, [target.id]: next }));
        });
      }
      if (ctrl.signal.aborted) return;
      const change = answer.change;
      // Save the draft revision and the selection that the model actually saw.
      const proposal: SavedProposal | undefined = change &&
        (change.kind !== "passage" || (turn.passage && turn.passage.text.length <= 12000))
        ? { ...change, revision: change.kind === "passage" && turn.passage ? turn.passage.revision : revision,
            passage: change.kind === "passage" ? turn.passage : undefined, status: "pending" } : undefined;
      const { change: _change, ...savedAnswer } = answer;
      updateThread(target.id, (item) => ({
        ...item, turns: item.turns.map((entry) => entry.id === turn.id ? { ...entry, answer: savedAnswer, proposal } : entry),
      }));
    } catch (error) {
      if (!ctrl.signal.aborted) updateThread(target.id, (item) => ({
        ...item, turns: item.turns.map((entry) => entry.id === turn.id ? {
          ...entry, error: error instanceof Error ? error.message : "Article AI couldn’t reply.",
        } : entry),
      }));
    } finally {
      if (requests.current.get(target.id) === ctrl) {
        requests.current.delete(target.id);
        setPending(({ [target.id]: _old, ...rest }) => rest);
      }
    }
  }

  function send(event: FormEvent) {
    event.preventDefault();
    if (!draft.trim() || !ready || stage || requests.current.has(thread.id)) return;
    void ask(draft.trim(), thread);
    setDraft("");
  }

  function stop() {
    requests.current.get(thread.id)?.abort();
    requests.current.delete(thread.id);
    setPending(({ [thread.id]: _old, ...rest }) => rest);
    updateThread(thread.id, (item) => ({
      ...item, turns: item.turns.map((turn) => !turn.answer && !turn.error ? { ...turn, error: "Reply stopped." } : turn),
    }));
  }

  function resolveProposal(turn: Turn, next: "applied" | "discarded") {
    if (!turn.proposal || turn.proposal.status !== "pending" || applying.current.has(turn.id)) return;
    applying.current.add(turn.id);
    let revised: Passage | undefined;
    if (next === "applied") {
      const outcome = applyProposal(turn.proposal);
      if (typeof outcome === "string") {
        applying.current.delete(turn.id);
        setApplyError((state) => ({ ...state, [turn.id]: outcome }));
        return;
      }
      revised = outcome;
    }
    setApplyError(({ [turn.id]: _error, ...rest }) => rest);
    updateThread(thread.id, (item) => ({
      ...item, passage: revised || item.passage, turns: item.turns.map((entry) => entry.id === turn.id && entry.proposal
        ? { ...entry, proposal: { ...entry.proposal, status: next } } : entry),
    }));
  }

  function removePassage() {
    if (thread.turns.length) updateThread(thread.id, (item) => ({ ...item, passage: undefined }));
    else setActive({ ...thread, passage: undefined });
  }

  return (
    <dialog ref={dialog} className={s.drawer} data-dark={dark} data-expanded={expanded}
      aria-labelledby="writer-assistant-title" onCancel={(event) => { event.preventDefault(); onClose(); }}
      onKeyDown={(event) => { if (expanded && event.key === "Escape") onClose(); }}>
      <header className={s.header}>
        <div><h2 id="writer-assistant-title" ref={titleRef} tabIndex={-1}><Sparkles size={17} /> Article AI</h2><p>{title}</p></div>
        <div className={s.headerActions}>
          <button type="button" onClick={onExpand} aria-label={expanded ? "Return to side panel" : "Expand into article workspace"} title={expanded ? "Return to side panel" : "Expand into article workspace"}>
            {expanded ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
          </button>
          <button type="button" onClick={onClose} aria-label="Close Article AI"><X size={18} /></button>
        </div>
      </header>
      <div className={s.history}>
        <button type="button" onClick={() => switchThread(createThread())}><Plus size={15} /> New chat</button>
        {thread.passage && <button type="button" onClick={() => switchThread(createThread(thread.passage))}>New with passage</button>}
        {canImport && <button type="button" onClick={importLegacy} title="Add the existing local chats for this article to your account">Import browser chats</button>}
        <select aria-label="Chat history" value={thread.turns.length ? thread.id : ""}
          onChange={(event) => { const next = threads.find((item) => item.id === event.target.value); if (next) switchThread(next); }}>
          {!thread.turns.length && <option value="">Chat history</option>}
          {threads.map((item) => <option key={item.id} value={item.id}>{item.turns[0]?.question.slice(0, 65)}</option>)}
        </select>
      </div>
      <div ref={transcript} className={s.transcript} role="log" aria-label="Conversation"
        onScroll={(event) => {
          const log = event.currentTarget;
          scrollPinned.current = log.scrollHeight - log.scrollTop - log.clientHeight < 56;
        }}>
        {!thread.turns.length && <div className={s.empty}>
          <Sparkles size={22} />
          <h3>{thread.passage ? "What would you like to do with this passage?" : "What would you like to work on?"}</h3>
          <p>{thread.passage ? "Your selection is attached below." : "Ask about your draft, check its SEO details, or research a claim."}</p>
          <div>{(thread.passage ? ["Improve the readability", "Give me a practical example"] :
            ["How can I improve this article?", "Show my meta & SERP details", "How do I download this article?"]).map((item) =>
            <button key={item} type="button" onClick={() => { setDraft(item); composer.current?.focus(); }}>{item}</button>)}</div>
        </div>}
        {thread.turns.map((turn, index) => {
          const actions = turn.answer && relevantAssistantActions(turn.question, turn.answer);
          return <div className={s.turn} key={turn.id}>
            <div className={s.user} role="group" aria-label="Your message">
              {turn.passage && (index === 0 || thread.turns[index - 1]?.passage?.text !== turn.passage.text) &&
                <details className={s.context}><summary>Selected passage</summary><p>{turn.passage.text}</p></details>}
              {turn.question}
            </div>
            {turn.answer && <div className={s.reply} role="group" aria-label="Article AI reply">
              {turn.answer.researchNote && <p className={s.researchNote}>{turn.answer.researchNote}</p>}
              <RichPreview md={turn.answer.reply} />
              {turn.proposal && <div className={s.card}>
                <strong>{turn.proposal.kind === "insert-section" ? "Proposed new section" : turn.proposal.kind === "passage" ? "Proposed passage revision" : "Proposed revision"}</strong>
                <div className={s.proposal}><RichPreview md={turn.proposal.markdown} /></div>
                {turn.proposal.status === "pending" ? <nav>
                  <button type="button" onClick={() => resolveProposal(turn, "applied")}>{turn.proposal.kind === "insert-section" ? "Insert section" : "Apply to draft"}</button>
                  <button type="button" onClick={() => resolveProposal(turn, "discarded")}>Discard proposal</button>
                </nav> : <small>{turn.proposal.status === "applied" ? "Applied to draft" : "Proposal discarded"}</small>}
                {applyError[turn.id] && <small role="alert">{applyError[turn.id]}</small>}
              </div>}
              {actions && (actions.cards.length > 0 || actions.headingId || actions.visualId) && renderActions({ ...turn.answer, ...actions })}
              {!!turn.answer.sources?.length && <details className={s.sources}><summary>Web sources</summary>
                {turn.answer.sources.map((source, j) => safeUrl(source.url) && <a href={safeUrl(source.url)} key={j} target="_blank" rel="noreferrer">{source.title || source.url}</a>)}
              </details>}
            </div>}
            {turn.error && <div className={s.error}><span role="alert">{turn.error}</span> <button type="button" disabled={Boolean(stage)} onClick={() => void ask(turn.question, thread, turn)}>Retry</button></div>}
          </div>;
        })}
        {stage && <div className={s.progress} data-stage={stage} role="status">
          {stage === "web" || stage === "reading" ? <Globe2 size={16} /> : stage === "workspace" ? <Database size={16} /> : <Loader2 size={16} />}
          {stageLabel[stage]}
        </div>}
        {saveError && <p className={s.error} role="alert">{saveError}</p>}
      </div>
      <form className={s.composer} onSubmit={send}>
        <div className={s.composerBox}>
          {thread.passage && <div className={s.attachment}>
            <details className={s.context}><summary>Selected passage</summary><p>{thread.passage.text}</p></details>
            <span className={s.excerpt} aria-hidden>{thread.passage.text.slice(0, 180)}</span>
            <button type="button" onClick={removePassage} aria-label="Remove selected passage"><X size={14} /></button>
          </div>}
          <textarea ref={composer} aria-label="Message Article AI" placeholder={thread.passage ? "Ask about this passage…" : "Ask Article AI…"}
            rows={2} maxLength={3000} value={draft} onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
              event.preventDefault(); event.currentTarget.form?.requestSubmit();
            } }} />
          <div className={s.composerActions}>
            <div className={s.researchMode}><Globe2 size={15} aria-hidden="true" />
              <select aria-label="Research mode" value={mode} onChange={(event) => setMode(event.target.value as ResearchMode)}>
                <option value="auto">Search: Auto</option><option value="web">Search: Web</option><option value="off">Search: Off</option>
              </select>
              <ChevronDown size={13} aria-hidden="true" />
            </div>
            {stage ? <button type="button" onClick={stop}>Stop</button>
              : <button type="submit" className={s.send} disabled={!ready || !draft.trim()} aria-label="Send message"><ArrowUp size={18} /></button>}
          </div>
        </div>
      </form>
    </dialog>
  );
}
