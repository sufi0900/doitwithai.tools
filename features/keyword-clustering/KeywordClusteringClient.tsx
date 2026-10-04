"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { Copy, Download, Network, Sparkles, Undo2, Upload } from "lucide-react";
import {
  clusterInputSchema,
  validateClusterOutput,
  intents,
  pageTypes,
  type ClusterInput,
  type ClusterOutput,
} from "./schema";
import {
  parseKeywordList,
  parseDelimited,
  keywordColumn,
  importColumn,
} from "./import";
import {
  assertCoverage,
  createWorkspace,
  moveKeywords,
  splitGroup,
  mergeGroups,
  exportCsv,
  exportPlan,
  groupBrief,
  type Workspace,
  type Group,
} from "./workspace";
import {
  actions,
  checks,
  emptyPlanning,
  readProject,
  writeProject,
  reviewIssues,
  storageKey,
  type Planning,
  type Project,
} from "./project";
const field =
  "mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm leading-7 text-slate-900 outline-none focus:border-[#5271ff] focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-blue-900";
const button =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 focus-visible:ring-4 focus-visible:ring-blue-200 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 disabled:opacity-50";
const card =
  "rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:p-7";
const example =
  "how to write meta titles\nmeta title examples\nmeta title generator\nAI title generator\narticle outline generator\nhow to outline an article\nimage alt text generator\nhow to write alt text\nalt text examples\nmeta title examples\napple";
export default function KeywordClusteringClient() {
  const [text, setText] = useState("");
  const [context, setContext] = useState("");
  const [audience, setAudience] = useState("");
  const [mode, setMode] = useState<ClusterInput["mode"]>("page-intent");
  const [imported, setImported] = useState<string[][] | null>(null);
  const [column, setColumn] = useState(0);
  const [header, setHeader] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [source, setSource] = useState<ClusterInput | null>(null);
  const [result, setResult] = useState<ClusterOutput | null>(null);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [history, setHistory] = useState<Workspace[]>([]);
  const [active, setActive] = useState("review");
  const [selected, setSelected] = useState<string[]>([]);
  const [target, setTarget] = useState("review");
  const [newLabel, setNewLabel] = useState("");
  const [projectName, setProjectName] = useState("My keyword plan");
  const [groupSearch, setGroupSearch] = useState("");
  const [groupFilter, setGroupFilter] = useState("all");
  const projectFileRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLElement>(null);
  const uploadVersion = useRef(0);
  const parsed = parseKeywordList(text);
  const group = workspace?.groups.find((g) => g.id === active);
  const members =
    group?.keywordIds || workspace?.unassigned.map((k) => k.keywordId) || [];
  const visibleGroups =
    workspace?.groups.filter((g) => {
      const match =
        `${g.label} ${g.keywordIds.map((id) => source?.keywords.find((k) => k.id === id)?.text).join(" ")}`
          .toLowerCase()
          .includes(groupSearch.toLowerCase().trim());
      return (
        match &&
        (groupFilter === "all" ||
          (groupFilter === "review"
            ? reviewIssues(g, workspace).length > 0
            : reviewIssues(g, workspace).length === 0))
      );
    }) || [];
  function project(): Project {
    if (!source || !result || !workspace)
      throw Error("Generate a draft first.");
    return {
      version: 1,
      name: projectName.trim() || "My keyword plan",
      source,
      result,
      workspace,
    };
  }
  function restore(p: Project) {
    setSource(p.source);
    setResult(p.result);
    setWorkspace(p.workspace);
    setProjectName(p.name);
    setText(p.source.keywords.map((k) => k.text).join("\n"));
    setContext(p.source.context);
    setAudience(p.source.audience);
    setMode(p.source.mode);
    setHistory([]);
    setSelected([]);
    setTarget("review");
    setActive(p.workspace.groups[0]?.id || "review");
    setGroupSearch("");
    setGroupFilter("all");
    setError("");
    setStatus(
      "Project restored. Previous review checks are retained as your saved decisions.",
    );
  }
  async function restoreFile(file?: File) {
    if (!file || busy) return;
    setBusy(true);
    try {
      if (file.size > 250_000)
        throw Error("Choose a project file under 250 KB.");
      const p = readProject(await file.text());
      restore(p);
    } catch {
      setError(
        "Could not restore this project. Check its format, version, size, and keyword coverage. Your current draft is unchanged.",
      );
    } finally {
      if (projectFileRef.current) projectFileRef.current.value = "";
      setBusy(false);
    }
  }
  const keyword = (id: string) =>
    source?.keywords.find((k) => k.id === id)?.text || id;
  function change(next: Workspace, preferred = active) {
    if (!source || !workspace) return;
    assertCoverage(next, source.keywords);
    setHistory((h) => [...h.slice(-19), workspace]);
    setWorkspace(next);
    setActive(
      next.groups.some((g) => g.id === preferred) ? preferred : "review",
    );
    setSelected([]);
    setTarget("review");
    setStatus("Draft updated. All supplied keywords are retained.");
  }
  function editGroup(patch: Partial<Group>) {
    if (!group || !workspace) return;
    change({
      ...workspace,
      groups: workspace.groups.map((g) =>
        g.id === group.id
          ? {
              ...g,
              ...patch,
              edited: true,
              planning: g.planning ? { ...g.planning, checked: [] } : undefined,
            }
          : g,
      ),
    });
  }
  function editPlanning(patch: Partial<Planning>) {
    if (!group || !workspace) return;
    change({
      ...workspace,
      groups: workspace.groups.map((g) =>
        g.id === group.id
          ? { ...g, planning: { ...(g.planning || emptyPlanning()), ...patch } }
          : g,
      ),
    });
  }
  function action(fn: () => void) {
    try {
      fn();
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not update the draft.");
    }
  }
  async function copy(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setStatus("Copied to clipboard.");
    } catch {
      setStatus("Clipboard unavailable. Download the draft instead.");
    }
  }
  function download(value: string, extension: string) {
    const url = URL.createObjectURL(
      new Blob([value], {
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
    a.download = `keyword-plan.${extension}`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setStatus("Draft downloaded.");
  }
  async function upload(file?: File) {
    const version = ++uploadVersion.current;
    setImported(null);
    setError("");
    if (!file) return;
    try {
      if (file.size > 100_000)
        throw Error("Choose a CSV or TSV file under 100 KB.");
      if (!/\.(csv|tsv)$/i.test(file.name))
        throw Error("Choose a CSV or TSV file.");
      const rows = parseDelimited(
        await file.text(),
        /\.tsv$/i.test(file.name) ? "\t" : ",",
      );
      if (version !== uploadVersion.current) return;
      const detected = keywordColumn(rows);
      setImported(rows);
      setColumn(detected >= 0 ? detected : 0);
      setHeader(detected >= 0);
      setStatus(
        "File read locally. Choose a column before using its keywords.",
      );
    } catch (e) {
      if (version === uploadVersion.current)
        setError(e instanceof Error ? e.message : "Could not read the file.");
    }
  }
  async function generate(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError("");
    if (parsed.errors.length) {
      setError(parsed.errors.join(" "));
      return;
    }
    const input = clusterInputSchema.safeParse({
      keywords: parsed.keywords,
      context,
      audience,
      mode,
    });
    if (!input.success) {
      setError("Provide 2–80 unique keywords and check the optional fields.");
      return;
    }
    setBusy(true);
    setStatus(
      "Grouping your supplied keywords. Your current draft remains available.",
    );
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 65_000);
    try {
      const response = await fetch("/api/ai-tools/keyword-clustering", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input.data),
        signal: controller.signal,
      });
      const data = await response.json();
      if (!response.ok)
        throw Error(data.error?.message || "Could not generate groups.");
      const valid = validateClusterOutput(data.result, input.data.keywords);
      const next = createWorkspace(valid);
      assertCoverage(next, input.data.keywords);
      setSource(input.data);
      setResult(valid);
      setWorkspace(next);
      setHistory([]);
      setSelected([]);
      setTarget("review");
      setActive(next.groups[0]?.id || "review");
      setStatus(
        "Draft groups ready. Review their intent and membership before planning pages.",
      );
      setTimeout(() => {
        // Do not take focus from someone already editing the newly rendered results.
        if (
          !resultRef.current ||
          resultRef.current.contains(document.activeElement)
        )
          return;
        resultRef.current.focus();
        resultRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    } catch (e) {
      setError(
        e instanceof Error && e.name !== "AbortError"
          ? e.message
          : "The request timed out. Your previous draft is still available.",
      );
    } finally {
      clearTimeout(timer);
      setBusy(false);
    }
  }
  return (
    <div className="space-y-6 text-slate-900 dark:text-white">
      <div className={card}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold">Your planning project</h2>
            <p className="mt-2 text-xs leading-6 text-slate-500 dark:text-slate-400">
              Save locally or use a portable project file. Saving is manual.
              Export before replacing the current workspace.
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
                    throw Error("No saved project exists in this browser.");
                  restore(readProject(saved));
                })
              }
            >
              Load browser save
            </button>
            <button
              type="button"
              className={button}
              disabled={busy}
              onClick={() => projectFileRef.current?.click()}
            >
              Import project JSON
            </button>
          </div>
        </div>
        <input
          ref={projectFileRef}
          id="cluster-project-file"
          type="file"
          accept=".json,application/json"
          className="sr-only"
          aria-label="Import saved keyword project"
          disabled={busy}
          onChange={(e) => void restoreFile(e.target.files?.[0])}
        />
        {workspace && (
          <div className="mt-4 flex flex-wrap items-end gap-3">
            <div className="min-w-0 flex-1">
              <label
                htmlFor="cluster-project-name"
                className="text-xs font-bold"
              >
                Project name
              </label>
              <input
                id="cluster-project-name"
                maxLength={100}
                className={field}
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />
            </div>
            <button
              type="button"
              className={button}
              onClick={() =>
                action(() => {
                  localStorage.setItem(storageKey, writeProject(project()));
                  setStatus(
                    "Project saved in this browser. Later edits need another save.",
                  );
                })
              }
            >
              Save in browser
            </button>
            <button
              type="button"
              className={button}
              onClick={() =>
                action(() => download(writeProject(project()), "json"))
              }
            >
              Download project JSON
            </button>
            <button
              type="button"
              className={button}
              onClick={() =>
                action(() => {
                  localStorage.removeItem(storageKey);
                  setStatus(
                    "Browser save removed. Your open workspace is unchanged.",
                  );
                })
              }
            >
              Remove browser save
            </button>
          </div>
        )}
      </div>
      <form onSubmit={generate} className={card}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#4662df] dark:text-blue-300">
              01 / Build your brief
            </p>
            <h2 className="mt-2 text-2xl font-extrabold text-slate-950 dark:text-white">
              Start with your keyword list
            </h2>
            <p className="mt-2 text-sm leading-7 text-slate-500 dark:text-slate-400">
              Paste 2–80 unique keywords, one per line. Exact duplicates are
              removed before generation.
            </p>
          </div>
          <button
            type="button"
            className={button}
            onClick={() => {
              setText(example);
              setContext(
                "A website with SEO and content-writing utilities and educational articles.",
              );
              setAudience("Writers and website owners");
            }}
          >
            Try an example
          </button>
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.25fr_1fr]">
          <div>
            <label className="text-sm font-bold" htmlFor="keywords">
              Keywords
            </label>
            <textarea
              id="keywords"
              rows={12}
              className={field}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={
                "meta title examples\nhow to write meta titles\nmeta title generator"
              }
              aria-describedby="keyword-limits"
            />
            <p
              id="keyword-limits"
              className="mt-2 text-xs leading-6 text-slate-500 dark:text-slate-400"
            >
              Maximum 120 characters per keyword and 16,000 characters total.
              Oversized lists are blocked, never silently truncated.
            </p>
            <div className="mt-4 grid grid-cols-3 gap-2 rounded-2xl bg-slate-50 p-4 text-center dark:bg-slate-950">
              <div>
                <strong className="text-xl">{parsed.lines}</strong>
                <p className="text-xs text-slate-500">Nonempty rows</p>
              </div>
              <div>
                <strong className="text-xl text-[#4662df] dark:text-blue-300">
                  {parsed.keywords.length}
                </strong>
                <p className="text-xs text-slate-500">Unique keywords</p>
              </div>
              <div>
                <strong className="text-xl">{parsed.duplicates.length}</strong>
                <p className="text-xs text-slate-500">Duplicates removed</p>
              </div>
            </div>
            {parsed.errors.length > 0 && (
              <ul className="mt-3 space-y-1 text-sm text-red-700 dark:text-red-300">
                {parsed.errors.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            )}
            {parsed.duplicates.length > 0 && (
              <details className="mt-3 text-xs leading-6">
                <summary className="cursor-pointer">
                  Review removed duplicates
                </summary>
                <ul>
                  {parsed.duplicates.map((d) => (
                    <li key={d.line}>
                      Row {d.line}: {d.text}
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </div>
          <div className="space-y-5">
            <div>
              <label htmlFor="cluster-context" className="text-sm font-bold">
                Website or project context{" "}
                <span className="font-normal text-slate-500">(optional)</span>
              </label>
              <textarea
                id="cluster-context"
                rows={3}
                maxLength={1200}
                className={field}
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="What do you offer, and which topics belong on your site?"
              />
            </div>
            <div>
              <label htmlFor="cluster-audience" className="text-sm font-bold">
                Audience{" "}
                <span className="font-normal text-slate-500">(optional)</span>
              </label>
              <input
                id="cluster-audience"
                maxLength={300}
                className={field}
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="cluster-mode" className="text-sm font-bold">
                Grouping approach
              </label>
              <select
                id="cluster-mode"
                className={field}
                value={mode}
                onChange={(e) =>
                  setMode(e.target.value as ClusterInput["mode"])
                }
              >
                <option value="page-intent">Shared reader task</option>
                <option value="topic">Broader topic groups</option>
              </select>
              <p className="mt-2 text-xs leading-6 text-slate-500 dark:text-slate-400">
                {mode === "page-intent"
                  ? "Keep different tasks and formats separate, even when keywords share a topic."
                  : "Organize themes for a content inventory. Each group may still need several pages."}
              </p>
            </div>
            <div className="rounded-2xl border border-dashed border-slate-300 p-4 dark:border-slate-700">
              <label
                className="flex items-center gap-2 text-sm font-bold"
                htmlFor="keyword-file"
              >
                <Upload size={16} aria-hidden /> Import CSV or TSV
              </label>
              <input
                id="keyword-file"
                type="file"
                accept=".csv,.tsv"
                className="mt-3 block w-full text-xs file:mr-3 file:min-h-11 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:text-[#4662df] dark:file:bg-slate-800 dark:file:text-blue-300"
                onChange={(e) => void upload(e.target.files?.[0])}
              />
              <p className="mt-2 text-xs leading-6 text-slate-500 dark:text-slate-400">
                Under 100 KB. Files are read locally. Only the selected keyword
                column is sent when you generate.
              </p>
            </div>
          </div>
        </div>
        {imported && (
          <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50/50 p-5 dark:border-blue-900 dark:bg-slate-950">
            <h3 className="font-bold">Choose the keyword column</h3>
            <label htmlFor="keyword-column" className="mt-3 block text-sm">
              Column
            </label>
            <select
              id="keyword-column"
              className={field}
              value={column}
              onChange={(e) => setColumn(Number(e.target.value))}
            >
              {Array.from(
                { length: Math.max(...imported.map((r) => r.length)) },
                (_, i) => (
                  <option key={i} value={i}>
                    Column {i + 1}:{" "}
                    {imported[0]?.[i]?.slice(0, 80) || "Untitled"}
                  </option>
                ),
              )}
            </select>
            <label className="mt-3 flex min-h-11 items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={header}
                onChange={(e) => setHeader(e.target.checked)}
              />
              First row contains headers
            </label>
            <pre className="mt-3 max-h-36 overflow-auto whitespace-pre-wrap break-words text-xs leading-6">
              {importColumn(imported, column, header)
                .split("\n")
                .slice(0, 5)
                .join("\n")}
            </pre>
            <button
              type="button"
              className={`${button} mt-3`}
              onClick={() => {
                setText(importColumn(imported, column, header));
                setImported(null);
                setStatus(
                  "Selected column loaded. Review the list and limits before generation.",
                );
              }}
            >
              Use selected column
            </button>
          </div>
        )}
        <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-slate-200 pt-6 dark:border-slate-800">
          <button
            disabled={
              busy || parsed.errors.length > 0 || parsed.keywords.length < 2
            }
            className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#4662df] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/15 hover:bg-blue-700 focus-visible:ring-4 focus-visible:ring-blue-300 disabled:opacity-50"
          >
            <Sparkles size={18} aria-hidden />
            {busy
              ? "Grouping keywords…"
              : workspace
                ? "Generate a new draft"
                : "Group my keywords"}
          </button>
          <p className="max-w-xl text-xs leading-6 text-slate-500 dark:text-slate-400">
            {workspace
              ? "A successful generation replaces this draft. Export your edits first. Input edits do not change the current results."
              : "Generation sends your cleaned list and brief to our AI provider. No live search results or demand metrics are retrieved."}
          </p>
        </div>
      </form>
      <div
        aria-live="polite"
        className="text-sm leading-7 text-slate-600 dark:text-slate-300"
      >
        {status}
      </div>
      {error && (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
        >
          {error}
        </p>
      )}
      {workspace && source && result && (
        <section
          id="keyword-results"
          ref={resultRef}
          tabIndex={-1}
          aria-label="Keyword grouping workspace"
          className={`${card} scroll-mt-28 outline-none`}
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#4662df] dark:text-blue-300">
                02 / Review and organize
              </p>
              <h2 className="mt-2 text-2xl font-extrabold">
                Your keyword workspace
              </h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                {source.keywords.length} keywords retained ·{" "}
                {workspace.groups.length} groups · {workspace.unassigned.length}{" "}
                need review
              </p>
            </div>
            <button
              className={button}
              disabled={!history.length}
              onClick={() => {
                const previous = history[history.length - 1];
                if (previous) {
                  setWorkspace(previous);
                  setHistory(history.slice(0, -1));
                  setActive(
                    previous.groups.some((g) => g.id === active)
                      ? active
                      : "review",
                  );
                  setSelected([]);
                  setStatus("Last edit undone.");
                }
              }}
            >
              <Undo2 size={15} aria-hidden />
              Undo last edit
            </button>
          </div>
          <div className="mt-5 grid gap-3 rounded-2xl bg-slate-50 p-4 dark:bg-slate-950 sm:grid-cols-3">
            <div>
              <strong>
                {
                  workspace.groups.filter(
                    (g) => reviewIssues(g, workspace).length === 0,
                  ).length
                }
                /{workspace.groups.length}
              </strong>
              <p className="mt-1 text-xs">
                Groups with all review steps recorded
              </p>
            </div>
            <div>
              <strong>
                {
                  workspace.groups.filter(
                    (g) =>
                      g.planning?.action && g.planning.action !== "undecided",
                  ).length
                }
              </strong>
              <p className="mt-1 text-xs">Page decisions recorded</p>
            </div>
            <div>
              <strong>{workspace.unassigned.length}</strong>
              <p className="mt-1 text-xs">Unassigned keywords</p>
            </div>
          </div>
          <p className="mt-2 text-xs leading-6 text-slate-500 dark:text-slate-400">
            Progress reflects your recorded checks. It does not verify research,
            certify quality, or predict rankings.
          </p>
          <div className="mt-6 grid gap-6 lg:grid-cols-[250px_1fr]">
            <nav aria-label="Keyword groups" className="space-y-2">
              <label
                className="block text-xs font-bold"
                htmlFor="cluster-group-search"
              >
                Find a group or keyword
              </label>
              <input
                id="cluster-group-search"
                className={field}
                value={groupSearch}
                onChange={(e) => setGroupSearch(e.target.value)}
              />
              <label
                className="block pt-2 text-xs font-bold"
                htmlFor="cluster-group-filter"
              >
                Review progress
              </label>
              <select
                id="cluster-group-filter"
                className={field}
                value={groupFilter}
                onChange={(e) => setGroupFilter(e.target.value)}
              >
                <option value="all">All groups</option>
                <option value="review">Needs review</option>
                <option value="recorded">Review steps recorded</option>
              </select>
              {!visibleGroups.length && (
                <p className="py-3 text-xs leading-6 text-slate-500">
                  No groups match. Change your search or filter.
                </p>
              )}
              {visibleGroups.map((g) => (
                <button
                  key={g.id}
                  className={`flex min-h-14 w-full items-start gap-3 rounded-xl border p-3 text-left ${active === g.id ? "border-[#5271ff] bg-blue-50 dark:bg-blue-950" : "border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"}`}
                  aria-pressed={active === g.id}
                  onClick={() => {
                    setActive(g.id);
                    setTarget("review");
                    setSelected([]);
                  }}
                >
                  <Network
                    size={18}
                    className="mt-1 shrink-0 text-[#5271ff] dark:text-blue-300"
                    aria-hidden
                  />
                  <span className="min-w-0">
                    <span className="block break-words text-sm font-bold">
                      {g.label || "Unnamed group"}
                    </span>
                    <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">
                      {g.keywordIds.length} keywords · {g.intent}
                    </span>
                  </span>
                </button>
              ))}
              <button
                className={`${button} w-full`}
                aria-pressed={active === "review"}
                onClick={() => {
                  setActive("review");
                  setTarget("review");
                  setSelected([]);
                }}
              >
                Review queue ({workspace.unassigned.length})
              </button>
            </nav>
            <div className="min-w-0 space-y-5">
              {group ? (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label
                        htmlFor="group-label"
                        className="text-sm font-bold"
                      >
                        Group name
                      </label>
                      <input
                        id="group-label"
                        maxLength={100}
                        className={field}
                        value={group.label}
                        onChange={(e) => editGroup({ label: e.target.value })}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="group-primary"
                        className="text-sm font-bold"
                      >
                        Primary keyword
                      </label>
                      <select
                        id="group-primary"
                        className={field}
                        value={group.primaryId}
                        onChange={(e) =>
                          editGroup({ primaryId: e.target.value })
                        }
                      >
                        {group.keywordIds.map((id) => (
                          <option key={id} value={id}>
                            {keyword(id)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label
                        htmlFor="group-intent"
                        className="text-sm font-bold"
                      >
                        Tentative intent
                      </label>
                      <select
                        id="group-intent"
                        className={field}
                        value={group.intent}
                        onChange={(e) =>
                          editGroup({
                            intent: e.target.value as Group["intent"],
                          })
                        }
                      >
                        {intents.map((i) => (
                          <option key={i}>{i}</option>
                        ))}
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label
                        htmlFor="group-format"
                        className="text-sm font-bold"
                      >
                        Suggested page format
                      </label>
                      <select
                        id="group-format"
                        className={field}
                        value={group.pageType}
                        onChange={(e) =>
                          editGroup({
                            pageType: e.target.value as Group["pageType"],
                          })
                        }
                      >
                        {pageTypes.map((i) => (
                          <option key={i}>{i}</option>
                        ))}
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label
                        htmlFor="group-focus"
                        className="text-sm font-bold"
                      >
                        Content focus
                      </label>
                      <textarea
                        id="group-focus"
                        rows={3}
                        maxLength={1000}
                        className={field}
                        value={group.focus}
                        onChange={(e) => editGroup({ focus: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 p-5 dark:border-slate-700">
                    <h3 className="font-bold">
                      Turn this group into a page decision
                    </h3>
                    <p className="mt-2 text-xs leading-6 text-slate-500 dark:text-slate-400">
                      Record your research and existing-page review. URLs are
                      planning references and are never fetched.
                    </p>
                    <label
                      htmlFor="cluster-page-action"
                      className="mt-4 block text-xs font-bold"
                    >
                      Page decision
                    </label>
                    <select
                      id="cluster-page-action"
                      className={field}
                      value={group.planning?.action || "undecided"}
                      onChange={(e) =>
                        editPlanning({
                          action: e.target.value as Planning["action"],
                          checked: [],
                        })
                      }
                    >
                      {actions.map((a) => (
                        <option key={a} value={a}>
                          {
                            {
                              undecided: "Not decided",
                              create: "Create a page",
                              update: "Update an existing page",
                              hold: "Hold for research",
                            }[a]
                          }
                        </option>
                      ))}
                    </select>
                    <label
                      htmlFor="cluster-page-url"
                      className="mt-4 block text-xs font-bold"
                    >
                      Existing or proposed page URL
                    </label>
                    <input
                      id="cluster-page-url"
                      type="url"
                      maxLength={2000}
                      className={field}
                      value={group.planning?.url || ""}
                      onChange={(e) =>
                        editPlanning({ url: e.target.value, checked: [] })
                      }
                      placeholder="https://example.com/useful-page"
                    />
                    <label
                      htmlFor="cluster-research-notes"
                      className="mt-4 block text-xs font-bold"
                    >
                      Research notes and evidence
                    </label>
                    <textarea
                      id="cluster-research-notes"
                      rows={3}
                      maxLength={2000}
                      className={field}
                      value={group.planning?.notes || ""}
                      onChange={(e) =>
                        editPlanning({ notes: e.target.value, checked: [] })
                      }
                      placeholder="Record location, research date, observed intent, sources, or reasons to update an existing page."
                    />
                    <fieldset className="mt-4">
                      <legend className="text-xs font-bold">
                        Human review checklist
                      </legend>
                      {checks.map((check) => (
                        <label
                          key={check}
                          className="mt-2 flex min-h-11 items-start gap-3 text-sm leading-6"
                        >
                          <input
                            id={`cluster-check-${check}`}
                            type="checkbox"
                            className="mt-1"
                            checked={
                              group.planning?.checked.includes(check) || false
                            }
                            onChange={(e) =>
                              editPlanning({
                                checked: e.target.checked
                                  ? [...(group.planning?.checked || []), check]
                                  : (group.planning?.checked || []).filter(
                                      (c) => c !== check,
                                    ),
                              })
                            }
                          />
                          <span>
                            {
                              {
                                task: "I reviewed the reader task and keyword membership.",
                                results:
                                  "I reviewed actual search results for my audience.",
                                coverage:
                                  "I checked existing pages before choosing a page decision.",
                              }[check]
                            }
                          </span>
                        </label>
                      ))}
                    </fieldset>
                    <ul className="mt-4 list-disc space-y-1 pl-5 text-xs leading-6 text-amber-800 dark:text-amber-300">
                      {reviewIssues(group, workspace).map((issue) => (
                        <li key={issue}>{issue}</li>
                      ))}
                    </ul>
                    {!reviewIssues(group, workspace).length && (
                      <p className="mt-4 text-xs font-bold text-green-800 dark:text-green-300">
                        Review steps recorded. Recheck them whenever your brief
                        or membership changes.
                      </p>
                    )}
                  </div>
                  <div className="rounded-xl bg-slate-50 p-4 text-sm leading-7 dark:bg-slate-950">
                    <strong>
                      {group.edited
                        ? "Original AI notes, before your edits"
                        : "Why these keywords were grouped"}
                    </strong>
                    <p>{group.rationale}</p>
                    <p className="mt-2">
                      <strong>Review question: </strong>
                      {group.review}
                    </p>
                    {group.edited && (
                      <p className="mt-2 font-medium text-amber-800 dark:text-amber-300">
                        Membership or brief changed. Review intent, primary
                        keyword, and page focus again.
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <div>
                  <h3 className="text-xl font-bold">
                    Resolve uncertain keywords
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-slate-500 dark:text-slate-400">
                    Ambiguous terms stay here instead of being forced into
                    unrelated groups. Assign them after researching the intended
                    meaning.
                  </p>
                </div>
              )}
              <fieldset aria-label="Select keywords">
                <legend className="text-sm font-bold">
                  {group ? "Group keywords" : "Keywords awaiting review"}
                </legend>
                <div className="mt-3 space-y-2">
                  {members.map((id) => (
                    <label
                      key={id}
                      className="flex min-h-12 items-start gap-3 rounded-xl border border-slate-200 px-4 py-3 dark:border-slate-700"
                    >
                      <input
                        className="mt-1 shrink-0"
                        type="checkbox"
                        checked={selected.includes(id)}
                        onChange={(e) =>
                          setSelected(
                            e.target.checked
                              ? [...selected, id]
                              : selected.filter((x) => x !== id),
                          )
                        }
                      />
                      <span className="min-w-0 break-words text-sm">
                        <span className="font-medium">{keyword(id)}</span>
                        {group?.primaryId === id && (
                          <span className="ml-2 text-xs text-[#4662df] dark:text-blue-300">
                            Primary
                          </span>
                        )}
                        {!group && (
                          <span className="mt-1 block text-xs leading-6 text-slate-500 dark:text-slate-400">
                            {
                              workspace.unassigned.find(
                                (k) => k.keywordId === id,
                              )?.reason
                            }
                          </span>
                        )}
                      </span>
                    </label>
                  ))}
                </div>
                {!members.length && (
                  <p className="mt-3 text-sm text-slate-500">
                    No keywords awaiting review.
                  </p>
                )}
              </fieldset>
              <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
                <h3 className="text-sm font-bold">
                  Organize selected keywords ({selected.length})
                </h3>
                <label htmlFor="move-target" className="mt-3 block text-xs">
                  Destination
                </label>
                <select
                  id="move-target"
                  className={field}
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                >
                  <option value="review">Review queue</option>
                  {workspace.groups
                    .filter((g) => g.id !== active)
                    .map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.label || "Unnamed group"}
                      </option>
                    ))}
                </select>
                <button
                  className={`${button} mt-3`}
                  disabled={!selected.length || target === active}
                  onClick={() =>
                    action(() =>
                      change(moveKeywords(workspace, selected, target), target),
                    )
                  }
                >
                  Move selected keywords
                </button>
                <label htmlFor="new-group" className="mt-4 block text-xs">
                  New group name
                </label>
                <input
                  id="new-group"
                  maxLength={100}
                  className={field}
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="Separate reader task or topic"
                />
                <button
                  className={`${button} mt-3`}
                  disabled={!selected.length || !newLabel.trim()}
                  onClick={() =>
                    action(() => {
                      const next = splitGroup(workspace, selected, newLabel);
                      change(next, next.groups[next.groups.length - 1].id);
                      setNewLabel("");
                    })
                  }
                >
                  Create group from selected
                </button>
                {group && (
                  <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-200 pt-4 dark:border-slate-700">
                    <button
                      className={button}
                      disabled={
                        target === "review" ||
                        target === active ||
                        !workspace.groups.some((g) => g.id === target)
                      }
                      onClick={() =>
                        action(() =>
                          change(
                            mergeGroups(workspace, active, target),
                            target,
                          ),
                        )
                      }
                    >
                      Merge whole group into destination
                    </button>
                    <button
                      className={button}
                      onClick={() =>
                        action(() =>
                          change(
                            moveKeywords(workspace, group.keywordIds, "review"),
                            "review",
                          ),
                        )
                      }
                    >
                      Send whole group to review
                    </button>
                  </div>
                )}
              </div>
              {group && (
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    className={button}
                    onClick={() =>
                      void copy(groupBrief(group, source.keywords))
                    }
                  >
                    <Copy size={15} aria-hidden />
                    Copy group brief
                  </button>
                  <Link
                    href="/tools/article-outline-generator"
                    className={`${button} text-[#4662df] dark:text-blue-300`}
                  >
                    Open Article Outline Generator
                  </Link>
                  <p className="w-full text-xs leading-6 text-slate-500 dark:text-slate-400">
                    Copy the reviewed brief, then paste its focus and keywords
                    into the outline tool. No information transfers
                    automatically.
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className="mt-6 rounded-2xl bg-blue-50 p-5 text-sm leading-7 dark:bg-blue-950">
            <h3 className="font-bold">Before turning groups into pages</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {result.review.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              className={button}
              onClick={() => void copy(exportPlan(workspace, source.keywords))}
            >
              <Copy size={15} aria-hidden />
              Copy full plan
            </button>
            <button
              className={button}
              onClick={() =>
                download(exportCsv(workspace, source.keywords), "csv")
              }
            >
              <Download size={15} aria-hidden />
              Download CSV
            </button>
            <button
              className={button}
              onClick={() =>
                download(exportPlan(workspace, source.keywords), "md")
              }
            >
              <Download size={15} aria-hidden />
              Download Markdown
            </button>
          </div>
          <p className="mt-3 text-xs leading-6 text-slate-500 dark:text-slate-400">
            Unsaved drafts are lost on refresh. Save in this browser or download
            a project to continue later. CSV cells starting with formula-like
            characters receive an apostrophe for spreadsheet safety.
          </p>
        </section>
      )}
    </div>
  );
}
