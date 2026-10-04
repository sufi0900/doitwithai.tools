"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import {
  GitBranch,
  Copy,
  Download,
  Sparkles,
  Undo2,
  Plus,
  ChevronDown,
} from "lucide-react";
import {
  inputSchema,
  validateOutput,
  validateTree,
  intentOptions,
  formats,
  decisions,
  type MapInput,
} from "./schema";
import {
  toTopics,
  depth,
  descendants,
  moveTopic,
  addTopic,
  removeTopic,
  safeUrl,
  keywords,
  brief,
  markdown,
  csv,
  parseProject,
  serializeProject,
  storageKey,
  type Topic,
  type Project,
} from "./workspace";
const field =
  "mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm leading-7 text-slate-900 outline-none focus:border-[#5271ff] focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-blue-900";
const button =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 focus-visible:ring-4 focus-visible:ring-blue-200 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 disabled:opacity-50";
const card =
  "rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:p-7";
const decisionLabels = {
  research: "Research first",
  section: "Section of a parent page",
  page: "Potential separate page",
  existing: "Update an existing page",
};
export default function TopicalMapClient() {
  const [seed, setSeed] = useState(""),
    [context, setContext] = useState(""),
    [audience, setAudience] = useState(""),
    [country, setCountry] = useState("");
  const [projectType, setProjectType] =
      useState<MapInput["projectType"]>("website"),
    [size, setSize] = useState<MapInput["size"]>("compact");
  const [source, setSource] = useState<MapInput | null>(null),
    [nodes, setNodes] = useState<Topic[]>([]),
    [review, setReview] = useState<string[]>([]),
    [active, setActive] = useState(""),
    [history, setHistory] = useState<Topic[][]>([]);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [status, setStatus] = useState(""),
    [name, setName] = useState("My topical map"),
    [collapsed, setCollapsed] = useState<string[]>([]),
    [armed, setArmed] = useState("");
  const resultsRef = useRef<HTMLElement>(null),
    fileRef = useRef<HTMLInputElement>(null);
  const selected = nodes.find((n) => n.id === active),
    root = nodes.find((n) => n.parentId === null);
  const pillars = nodes.filter((n) => n.parentId === root?.id);
  const invalidUrl = (() => {
    try {
      if (selected) safeUrl(selected.url);
      return false;
    } catch {
      return true;
    }
  })();
  function mutate(next: Topic[], preferred = active) {
    validateTree(next);
    setHistory((h) => [...h.slice(-19), nodes]);
    setNodes(next);
    setActive(next.some((n) => n.id === preferred) ? preferred : next[0].id);
    setArmed("");
    setStatus(
      "Map updated. Review checks reset when topics or their meaning change.",
    );
  }
  function edit(patch: Partial<Topic>, semantic = true) {
    if (!selected) return;
    mutate(
      nodes.map((n) =>
        n.id === active
          ? {
              ...n,
              ...patch,
              edited: semantic || n.edited,
              reviewed: semantic ? false : (patch.reviewed ?? n.reviewed),
            }
          : n,
      ),
    );
  }
  function action(fn: () => void) {
    try {
      fn();
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not update this map.");
    }
  }
  function project(): Project {
    if (!source || !nodes.length) throw Error("Generate a map first.");
    return {
      version: 1,
      name: name.trim() || "My topical map",
      source,
      nodes,
      review,
    };
  }
  function restore(p: Project) {
    setSource(p.source);
    setNodes(p.nodes);
    setReview(p.review);
    setName(p.name);
    setSeed(p.source.seed);
    setContext(p.source.brief);
    setAudience(p.source.audience);
    setCountry(p.source.country);
    setProjectType(p.source.projectType);
    setSize(p.source.size);
    setHistory([]);
    setActive(p.nodes[0].id);
    setCollapsed([]);
    setArmed("");
    setError("");
    setStatus(
      "Project restored. Saved review flags are your recorded decisions, not verified research.",
    );
  }
  async function importProject(file?: File) {
    if (!file || busy) return;
    setBusy(true);
    try {
      if (file.size > 250_000) throw Error();
      restore(parseProject(await file.text()));
    } catch {
      setError(
        "Could not import this project. Check its version, fields, size and hierarchy. Your current map is unchanged.",
      );
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }
  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setStatus("Copied to clipboard.");
    } catch {
      setStatus("Clipboard unavailable. Download your map instead.");
    }
  }
  function download(text: string, extension: string) {
    const url = URL.createObjectURL(
      new Blob([text], {
        type:
          extension === "csv"
            ? "text/csv;charset=utf-8"
            : extension === "json"
              ? "application/json"
              : "text/markdown;charset=utf-8",
      }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `topical-map.${extension}`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setStatus("Download prepared.");
  }
  async function generate(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError("");
    const input = inputSchema.safeParse({
      seed,
      brief: context,
      audience,
      country,
      projectType,
      size,
    });
    if (!input.success) {
      setError(
        "Enter a seed topic with at least 3 characters or a brief with at least 20 characters.",
      );
      return;
    }
    setBusy(true);
    setStatus(
      "Creating topic suggestions. Your current map remains available.",
    );
    const controller = new AbortController(),
      timer = setTimeout(() => controller.abort(), 65_000);
    try {
      const response = await fetch("/api/ai-tools/topical-map", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input.data),
        signal: controller.signal,
      });
      const payload = await response.json();
      if (!response.ok)
        throw Error(payload.error?.message || "Could not generate the map.");
      const result = validateOutput(payload.result, input.data);
      setNodes(toTopics(result));
      setSource(input.data);
      setReview(result.review);
      setActive(result.nodes.find((n) => n.parentId === null)!.id);
      setHistory([]);
      setCollapsed([]);
      setArmed("");
      setStatus(
        "Map ready. Review the suggested topics before planning pages.",
      );
      setTimeout(() => {
        if (
          !resultsRef.current ||
          resultsRef.current.contains(document.activeElement)
        )
          return;
        resultsRef.current.focus();
        resultsRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    } catch (e) {
      setError(
        e instanceof Error && e.name !== "AbortError"
          ? e.message
          : "The request timed out. Your previous map is unchanged.",
      );
    } finally {
      clearTimeout(timer);
      setBusy(false);
    }
  }
  function topicButton(topic: Topic) {
    return (
      <button
        type="button"
        data-topic-id={topic.id}
        aria-pressed={active === topic.id}
        className={`min-h-16 w-full rounded-2xl border p-4 text-left transition focus-visible:ring-4 focus-visible:ring-blue-300 ${active === topic.id ? "border-[#5271ff] bg-blue-50 dark:bg-blue-950" : "border-slate-200 bg-white hover:border-blue-300 dark:border-slate-700 dark:bg-slate-900"}`}
        onClick={() => {
          setActive(topic.id);
          setArmed("");
        }}
      >
        <span className="block break-words text-sm font-bold">
          {topic.title}
        </span>
        <span className="mt-2 block text-xs text-slate-500 dark:text-slate-400">
          {topic.intent} · {decisionLabels[topic.decision]}
        </span>
      </button>
    );
  }
  return (
    <div className="space-y-6 text-slate-900 dark:text-white">
      <div className={card}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold">A map you can keep and refine</h2>
            <p className="mt-2 text-xs leading-6 text-slate-500 dark:text-slate-400">
              Save manually in this browser or import a portable project. Export
              before replacing an open map.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={button}
              disabled={busy}
              onClick={() =>
                action(() => {
                  const saved = localStorage.getItem(storageKey);
                  if (!saved)
                    throw Error("No saved map exists in this browser.");
                  restore(parseProject(saved));
                })
              }
            >
              Load browser save
            </button>
            <button
              type="button"
              className={button}
              disabled={busy}
              onClick={() => fileRef.current?.click()}
            >
              Import project JSON
            </button>
          </div>
        </div>
        <input
          ref={fileRef}
          id="topical-project-file"
          type="file"
          accept=".json,application/json"
          className="sr-only"
          aria-label="Import topical map project"
          disabled={busy}
          onChange={(e) => void importProject(e.target.files?.[0])}
        />
      </div>
      <form onSubmit={generate} className={card}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#4662df] dark:text-blue-300">
              01 / Define the project
            </p>
            <h2 className="mt-2 text-2xl font-extrabold">
              Start with a topic or a brief
            </h2>
            <p className="mt-2 text-sm leading-7 text-slate-500 dark:text-slate-400">
              Give the map a clear purpose. A seed topic, introduction, or
              summary can be your starting point.
            </p>
          </div>
          <button
            type="button"
            className={button}
            onClick={() => {
              setSeed("SEO with AI");
              setContext(
                "A website helping writers and small website owners use AI for practical SEO and content creation. Cover useful workflows without promising rankings.",
              );
              setAudience("Writers and website owners");
              setProjectType("website");
            }}
          >
            Try an example
          </button>
        </div>
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <div>
            <label htmlFor="topical-seed" className="text-sm font-bold">
              Seed topic{" "}
              <span className="font-normal text-slate-500">
                (optional with a brief)
              </span>
            </label>
            <input
              id="topical-seed"
              className={field}
              maxLength={160}
              value={seed}
              onChange={(e) => setSeed(e.target.value)}
              placeholder="SEO, AI SEO, or your subject"
            />
            <label
              htmlFor="topical-brief"
              className="mt-5 block text-sm font-bold"
            >
              Introduction, summary, or project brief
            </label>
            <textarea
              id="topical-brief"
              rows={5}
              maxLength={3000}
              className={field}
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Explain what you want to help users learn, compare, or accomplish."
            />
            <p className="mt-2 text-xs leading-6 text-slate-500 dark:text-slate-400">
              Use a seed of at least 3 characters or a brief of at least 20
              characters. Keep private information out of the brief.
            </p>
          </div>
          <div className="space-y-4">
            <div>
              <label htmlFor="topical-audience" className="text-sm font-bold">
                Audience{" "}
                <span className="font-normal text-slate-500">(optional)</span>
              </label>
              <input
                id="topical-audience"
                maxLength={250}
                className={field}
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="topical-country" className="text-sm font-bold">
                Target country{" "}
                <span className="font-normal text-slate-500">(optional)</span>
              </label>
              <input
                id="topical-country"
                maxLength={100}
                className={field}
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="Country context, not a live search location"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="topical-type" className="text-sm font-bold">
                  Project type
                </label>
                <select
                  id="topical-type"
                  className={field}
                  value={projectType}
                  onChange={(e) =>
                    setProjectType(e.target.value as MapInput["projectType"])
                  }
                >
                  <option value="website">Website or content hub</option>
                  <option value="blog">Blog article</option>
                  <option value="landing-page">Landing page</option>
                </select>
              </div>
              <div>
                <label htmlFor="topical-size" className="text-sm font-bold">
                  Initial map size
                </label>
                <select
                  id="topical-size"
                  className={field}
                  value={size}
                  onChange={(e) => setSize(e.target.value as MapInput["size"])}
                >
                  <option value="compact">Compact: up to 13 topics</option>
                  <option value="expanded">Expanded: up to 25 topics</option>
                </select>
              </div>
            </div>
            <p className="text-xs leading-6 text-slate-500 dark:text-slate-400">
              Website maps suggest themes. Article and landing-page maps can
              organize sections. Every node does not need a separate URL. Output
              is English.
            </p>
          </div>
        </div>
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-7 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
          <strong>Topic hierarchy is not a difficulty ranking.</strong>
          <p>
            Difficulty, search volume, and competition are not verified. Broad
            topics and specific phrases can both be difficult to rank for.
          </p>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <button
            disabled={busy}
            className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#4662df] px-6 py-3 text-sm font-bold text-white hover:bg-blue-700 focus-visible:ring-4 focus-visible:ring-blue-300 disabled:opacity-50"
          >
            <Sparkles aria-hidden size={17} />
            {busy
              ? "Preparing your map…"
              : nodes.length
                ? "Generate a new map"
                : "Create my topical map"}
          </button>
          <p className="max-w-xl text-xs leading-6 text-slate-500 dark:text-slate-400">
            Generation sends this brief to Gemini. No live search results or
            keyword metrics are retrieved. A successful request replaces the
            current map.
          </p>
        </div>
      </form>
      <p
        aria-live="polite"
        className="text-sm leading-7 text-slate-600 dark:text-slate-300"
      >
        {status}
      </p>
      {error && (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
        >
          {error}
        </p>
      )}
      {root && source && (
        <section
          id="topical-results"
          ref={resultsRef}
          tabIndex={-1}
          aria-label="Topical map workspace"
          className={`${card} scroll-mt-28 outline-none`}
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#4662df] dark:text-blue-300">
                02 / Shape the hierarchy
              </p>
              <h2 className="mt-2 text-2xl font-extrabold">
                Your editable topical map
              </h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                {nodes.length} topics · {nodes.filter((n) => n.reviewed).length}{" "}
                human reviews recorded · 3 levels maximum
              </p>
            </div>
            <button
              className={button}
              disabled={!history.length}
              onClick={() => {
                const previous = history[history.length - 1];
                if (previous) {
                  setNodes(previous);
                  setHistory(history.slice(0, -1));
                  setActive(
                    previous.some((n) => n.id === active)
                      ? active
                      : previous[0].id,
                  );
                  setArmed("");
                  setStatus("Last map edit undone.");
                }
              }}
            >
              <Undo2 size={15} aria-hidden />
              Undo last edit
            </button>
          </div>
          <div className="mt-5 rounded-xl bg-slate-50 p-4 text-xs leading-6 dark:bg-slate-950">
            <strong>Difficulty: Not verified · Volume: Not verified</strong>
            <p>
              Intent labels are AI suggestions. Review flags record your
              decisions and do not certify research or content quality.
            </p>
          </div>
          <div
            aria-label="Topic hierarchy"
            className="mt-7 rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950 sm:p-6"
          >
            <div className="mx-auto max-w-lg">{topicButton(root)}</div>
            <div
              aria-hidden
              className="mx-auto h-7 w-px bg-blue-300 dark:bg-blue-800"
            />
            <ul className="grid gap-5 lg:grid-cols-3">
              {pillars.map((pillar) => (
                <li key={pillar.id} className="min-w-0">
                  <div className="relative">
                    {topicButton(pillar)}
                    <button
                      type="button"
                      className={`${button} mt-2 w-full`}
                      aria-expanded={!collapsed.includes(pillar.id)}
                      aria-controls={`branch-${pillar.id}`}
                      onClick={() =>
                        setCollapsed(
                          collapsed.includes(pillar.id)
                            ? collapsed.filter((id) => id !== pillar.id)
                            : [...collapsed, pillar.id],
                        )
                      }
                    >
                      <ChevronDown size={14} aria-hidden />
                      {collapsed.includes(pillar.id)
                        ? "Show supporting topics"
                        : "Hide supporting topics"}
                    </button>
                  </div>
                  <ul
                    id={`branch-${pillar.id}`}
                    hidden={collapsed.includes(pillar.id)}
                    className="ml-4 mt-3 space-y-3 border-l-2 border-blue-200 pl-4 dark:border-blue-900"
                  >
                    {nodes
                      .filter((n) => n.parentId === pillar.id)
                      .map((n) => (
                        <li key={n.id}>{topicButton(n)}</li>
                      ))}
                  </ul>
                </li>
              ))}
            </ul>
            {!pillars.length && (
              <p className="text-center text-sm">
                Add a child topic to expand this map.
              </p>
            )}
          </div>
          {selected && (
            <div className="mt-7 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
              <div className="rounded-2xl border border-slate-200 p-5 dark:border-slate-700">
                <h3 className="text-xl font-bold">Refine this topic</h3>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label htmlFor="topic-title" className="text-xs font-bold">
                      Topic title
                    </label>
                    <input
                      id="topic-title"
                      className={field}
                      maxLength={100}
                      value={selected.title}
                      onChange={(e) => edit({ title: e.target.value })}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="topic-keyword"
                      className="text-xs font-bold"
                    >
                      Representative keyword idea
                    </label>
                    <input
                      id="topic-keyword"
                      className={field}
                      maxLength={120}
                      value={selected.keyword}
                      onChange={(e) => edit({ keyword: e.target.value })}
                    />
                  </div>
                  <div>
                    <label htmlFor="topic-intent" className="text-xs font-bold">
                      Tentative intent
                    </label>
                    <select
                      id="topic-intent"
                      className={field}
                      value={selected.intent}
                      onChange={(e) =>
                        edit({ intent: e.target.value as Topic["intent"] })
                      }
                    >
                      {intentOptions.map((v) => (
                        <option key={v}>{v}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="topic-format" className="text-xs font-bold">
                      Suggested format
                    </label>
                    <select
                      id="topic-format"
                      className={field}
                      value={selected.format}
                      onChange={(e) =>
                        edit({ format: e.target.value as Topic["format"] })
                      }
                    >
                      {formats.map((v) => (
                        <option key={v}>{v}</option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="topic-focus" className="text-xs font-bold">
                      Reader task
                    </label>
                    <textarea
                      id="topic-focus"
                      rows={3}
                      className={field}
                      maxLength={500}
                      value={selected.focus}
                      onChange={(e) => edit({ focus: e.target.value })}
                    />
                  </div>
                </div>
                <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm leading-7 dark:bg-slate-950">
                  <strong>
                    {selected.edited
                      ? "Original relationship note, before your edits"
                      : "Why this topic belongs here"}
                  </strong>
                  <p>{selected.why}</p>
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    Related keyword ideas:{" "}
                    {selected.relatedKeywords.join(" · ") || "None supplied"}
                  </p>
                </div>
                <button
                  className={`${button} mt-4`}
                  onClick={() => void copy(brief(selected))}
                >
                  <Copy size={15} aria-hidden />
                  Copy topic brief
                </button>
              </div>
              <div className="space-y-5">
                <div className="rounded-2xl border border-slate-200 p-5 dark:border-slate-700">
                  <h3 className="font-bold">Make a page or section decision</h3>
                  <label
                    htmlFor="topic-decision"
                    className="mt-4 block text-xs font-bold"
                  >
                    Content destination
                  </label>
                  <select
                    id="topic-decision"
                    className={field}
                    value={selected.decision}
                    onChange={(e) =>
                      edit({ decision: e.target.value as Topic["decision"] })
                    }
                  >
                    {decisions.map((v) => (
                      <option value={v} key={v}>
                        {decisionLabels[v]}
                      </option>
                    ))}
                  </select>
                  <label
                    htmlFor="topic-url"
                    className="mt-4 block text-xs font-bold"
                  >
                    Existing page URL{" "}
                    <span className="font-normal">(optional)</span>
                  </label>
                  <input
                    id="topic-url"
                    type="url"
                    className={field}
                    maxLength={2000}
                    value={selected.url}
                    onChange={(e) => edit({ url: e.target.value })}
                  />
                  {invalidUrl && (
                    <p className="mt-2 text-xs text-red-700 dark:text-red-300">
                      Use a full HTTP or HTTPS URL without credentials.
                    </p>
                  )}
                  <label
                    htmlFor="topic-notes"
                    className="mt-4 block text-xs font-bold"
                  >
                    Research notes
                  </label>
                  <textarea
                    id="topic-notes"
                    rows={3}
                    className={field}
                    maxLength={2000}
                    value={selected.notes}
                    onChange={(e) => edit({ notes: e.target.value })}
                    placeholder="Record sources, search location, research date, or reasons to combine topics."
                  />
                  <label className="mt-4 flex min-h-11 items-start gap-3 text-sm leading-7">
                    <input
                      id="topic-reviewed"
                      type="checkbox"
                      className="mt-2"
                      checked={selected.reviewed}
                      disabled={
                        invalidUrl ||
                        (selected.decision === "existing" &&
                          !selected.url.trim()) ||
                        selected.decision === "research" ||
                        !selected.title.trim() ||
                        !selected.keyword.trim() ||
                        !selected.focus.trim()
                      }
                      onChange={(e) =>
                        edit({ reviewed: e.target.checked }, false)
                      }
                    />
                    <span>
                      I reviewed audience fit, actual results, and existing
                      coverage before choosing this destination.
                    </span>
                  </label>
                  <p className="mt-2 text-xs leading-6 text-slate-500 dark:text-slate-400">
                    Choose a destination before recording review. URL references
                    are not fetched. Editing this topic clears its review flag.
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 p-5 dark:border-slate-700">
                  <h3 className="font-bold">Adjust the structure</h3>
                  {selected.parentId && (
                    <>
                      <label
                        htmlFor="topic-parent"
                        className="mt-4 block text-xs font-bold"
                      >
                        Parent topic
                      </label>
                      <select
                        id="topic-parent"
                        className={field}
                        value={selected.parentId}
                        onChange={(e) =>
                          action(() =>
                            mutate(moveTopic(nodes, active, e.target.value)),
                          )
                        }
                      >
                        {nodes
                          .filter(
                            (n) =>
                              !descendants(active, nodes).has(n.id) &&
                              depth(n, nodes) < 2,
                          )
                          .map((n) => (
                            <option key={n.id} value={n.id}>
                              {n.title}
                            </option>
                          ))}
                      </select>
                    </>
                  )}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      className={button}
                      disabled={
                        nodes.length >= 25 || depth(selected, nodes) >= 2
                      }
                      onClick={() =>
                        action(() => {
                          const next = addTopic(nodes, active);
                          mutate(next, next[next.length - 1].id);
                        })
                      }
                    >
                      <Plus size={15} aria-hidden />
                      Add child topic
                    </button>
                    {selected.parentId && (
                      <button
                        className={button}
                        onClick={() =>
                          action(() => {
                            if (armed !== active) {
                              setArmed(active);
                              return;
                            }
                            mutate(
                              removeTopic(nodes, active),
                              selected.parentId!,
                            );
                          })
                        }
                      >
                        {armed === active
                          ? `Confirm removal of ${descendants(active, nodes).size} topic(s)`
                          : "Remove this branch"}
                      </button>
                    )}
                  </div>
                  <p className="mt-3 text-xs leading-6 text-slate-500 dark:text-slate-400">
                    Moving, adding, or removing branches clears recorded map
                    reviews. Undo can restore the previous structure.
                  </p>
                </div>
              </div>
            </div>
          )}
          <div className="mt-6 rounded-2xl bg-blue-50 p-5 text-sm leading-7 dark:bg-blue-950">
            <h3 className="font-bold">Before turning this map into content</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {review.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </div>
          <div className="mt-6 rounded-2xl border border-slate-200 p-5 dark:border-slate-700">
            <label htmlFor="topical-project-name" className="text-xs font-bold">
              Project name
            </label>
            <input
              id="topical-project-name"
              maxLength={100}
              className={field}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                className={button}
                onClick={() =>
                  action(() => {
                    localStorage.setItem(
                      storageKey,
                      serializeProject(project()),
                    );
                    setStatus(
                      "Map saved in this browser. Later edits need another save.",
                    );
                  })
                }
              >
                Save in browser
              </button>
              <button
                className={button}
                onClick={() =>
                  action(() => download(serializeProject(project()), "json"))
                }
              >
                <Download size={15} aria-hidden />
                Download project JSON
              </button>
              <button
                className={button}
                onClick={() =>
                  action(() => {
                    localStorage.removeItem(storageKey);
                    setStatus(
                      "Browser save removed. The open map is unchanged.",
                    );
                  })
                }
              >
                Remove browser save
              </button>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              className={button}
              onClick={() => void copy(markdown(nodes))}
            >
              <Copy size={15} aria-hidden />
              Copy full map
            </button>
            <button
              className={button}
              onClick={() => void copy(keywords(nodes))}
            >
              Copy keyword ideas
            </button>
            <button
              className={button}
              onClick={() => download(csv(nodes), "csv")}
            >
              Download CSV
            </button>
            <button
              className={button}
              onClick={() => download(markdown(nodes), "md")}
            >
              Download Markdown
            </button>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link className={button} href="/tools/keyword-clustering-tool">
              Open Keyword Clustering Tool
            </Link>
            <Link className={button} href="/tools/article-outline-generator">
              Open Article Outline Generator
            </Link>
          </div>
          <p className="mt-3 text-xs leading-6 text-slate-500 dark:text-slate-400">
            Copy keyword ideas into the clustering tool or paste a topic brief
            into the outline tool. Nothing transfers automatically. Large idea
            lists need smaller batches.
          </p>
          <p className="mt-2 text-xs leading-6 text-slate-500 dark:text-slate-400">
            Unsaved edits disappear on refresh. CSV formula-like cells receive
            an apostrophe for spreadsheet safety. Metrics stay unverified in
            every export.
          </p>
        </section>
      )}
    </div>
  );
}
