"use client";

import { ToolRunOverlay, paintToolFeedback } from "@/features/tool-ui/ToolRunOverlay";
import ToolUrlInput from "@/features/tool-ui/ToolUrlInput";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  Download,
  Edit3,
  Globe,
  Info,
  Loader2,
  Plus,
  ShieldCheck,
  ShieldX,
  Sparkles,
  Trash2,
  XCircle,
} from "lucide-react";
import {
  inputClass as sharedInputClass,
  panelClass,
  primaryButton,
  secondaryButton,
} from "@/features/writing-tools/config";
const inputClass = `${sharedInputClass} min-w-0`;
import {
  buildCrawlerMatrix,
  buildRobotsTxt,
  defaultState,
  emptyGroup,
  emptyRule,
  makeId,
  validateRobotsTxt,
} from "./generator";
import { fetchExistingRobots } from "./client";
import type { RobotsGroup, RobotsState } from "./types";

type Mode = "build" | "check";

export default function RobotsClient() {
  const [mode, setMode] = useState<Mode>("build");
  const [state, setState] = useState<RobotsState>(() => defaultState());
  const [siteUrl, setSiteUrl] = useState("");
  const [fetching, setFetching] = useState(false);
  const [fetchMessage, setFetchMessage] = useState<{
    tone: "error" | "success";
    text: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [isEditingRaw, setIsEditingRaw] = useState(false);
  const [rawOverride, setRawOverride] = useState<string | null>(null);

  const compiledOutput = useMemo(() => buildRobotsTxt(state), [state]);
  const output = rawOverride !== null ? rawOverride : compiledOutput;
  const issues = useMemo(() => validateRobotsTxt(state), [state]);
  const matrix = useMemo(() => buildCrawlerMatrix(state), [state]);
  const errorCount = issues.filter((issue) => issue.level === "error").length;

  function applyPreset(
    preset: "standard-seo" | "block-ai-training" | "full-allow",
  ) {
    setRawOverride(null);
    if (preset === "standard-seo") {
      setState({
        groups: [
          {
            id: makeId("group"),
            userAgents: ["*"],
            rules: [
              { id: makeId("rule"), type: "disallow", path: "/admin/" },
              { id: makeId("rule"), type: "disallow", path: "/api/" },
              { id: makeId("rule"), type: "allow", path: "/" },
            ],
          },
        ],
        sitemapUrls: ["https://doitwithai.tools/sitemap.xml"],
      });
      setFetchMessage({
        tone: "success",
        text: "Applied preset: Standard SEO + AI Crawlers Allowed.",
      });
    } else if (preset === "block-ai-training") {
      setState({
        groups: [
          {
            id: makeId("group"),
            userAgents: ["*"],
            rules: [
              { id: makeId("rule"), type: "disallow", path: "/admin/" },
              { id: makeId("rule"), type: "allow", path: "/" },
            ],
          },
          {
            id: makeId("group"),
            userAgents: ["GPTBot", "Google-Extended", "CCBot", "ClaudeBot"],
            rules: [{ id: makeId("rule"), type: "disallow", path: "/" }],
          },
          {
            id: makeId("group"),
            userAgents: ["OAI-SearchBot", "PerplexityBot"],
            rules: [{ id: makeId("rule"), type: "allow", path: "/" }],
          },
        ],
        sitemapUrls: ["https://doitwithai.tools/sitemap.xml"],
      });
      setFetchMessage({
        tone: "success",
        text: "Applied preset: Allow AI Search Citations + Block AI Model Training.",
      });
    } else {
      setState({
        groups: [
          {
            id: makeId("group"),
            userAgents: ["*"],
            rules: [{ id: makeId("rule"), type: "allow", path: "/" }],
          },
        ],
        sitemapUrls: ["https://doitwithai.tools/sitemap.xml"],
      });
      setFetchMessage({
        tone: "success",
        text: "Applied preset: Full Allow for all search and AI crawlers.",
      });
    }
  }

  function updateGroup(groupId: string, patch: Partial<RobotsGroup>) {
    setRawOverride(null);
    setState((previous) => ({
      ...previous,
      groups: previous.groups.map((group) =>
        group.id === groupId ? { ...group, ...patch } : group,
      ),
    }));
  }

  function addGroup() {
    setRawOverride(null);
    setState((previous) => ({
      ...previous,
      groups: [...previous.groups, emptyGroup([""])],
    }));
  }

  function removeGroup(groupId: string) {
    setRawOverride(null);
    setState((previous) => ({
      ...previous,
      groups: previous.groups.filter((group) => group.id !== groupId),
    }));
  }

  function addRule(groupId: string) {
    const group = state.groups.find((item) => item.id === groupId);
    if (!group) return;
    updateGroup(groupId, { rules: [...group.rules, emptyRule("disallow")] });
  }

  function removeRule(groupId: string, ruleId: string) {
    const group = state.groups.find((item) => item.id === groupId);
    if (!group) return;
    updateGroup(groupId, {
      rules: group.rules.filter((rule) => rule.id !== ruleId),
    });
  }

  function updateRule(
    groupId: string,
    ruleId: string,
    patch: Partial<{
      type: "allow" | "disallow" | "crawl-delay";
      path: string;
    }>,
  ) {
    const group = state.groups.find((item) => item.id === groupId);
    if (!group) return;
    updateGroup(groupId, {
      rules: group.rules.map((rule) =>
        rule.id === ruleId ? { ...rule, ...patch } : rule,
      ),
    });
  }

  function setSitemap(index: number, value: string) {
    setRawOverride(null);
    setState((previous) => {
      const sitemapUrls = [...previous.sitemapUrls];
      sitemapUrls[index] = value;
      return { ...previous, sitemapUrls };
    });
  }

  function addSitemap() {
    setRawOverride(null);
    setState((previous) => ({
      ...previous,
      sitemapUrls: [...previous.sitemapUrls, ""],
    }));
  }

  function removeSitemap(index: number) {
    setRawOverride(null);
    setState((previous) => ({
      ...previous,
      sitemapUrls: previous.sitemapUrls.filter((_, i) => i !== index),
    }));
  }

  function setCrawlerAccess(
    token: string,
    action: "block" | "allow" | "default",
  ) {
    setRawOverride(null);
    setState((previous) => {
      const lower = token.toLowerCase();
      const others = previous.groups.filter(
        (group) =>
          !(
            group.userAgents.length === 1 &&
            group.userAgents[0].trim().toLowerCase() === lower
          ),
      );
      if (action === "default") return { ...previous, groups: others };
      const rule =
        action === "block"
          ? emptyRule("disallow")
          : { ...emptyRule("allow"), type: "allow" as const };
      return {
        ...previous,
        groups: [
          ...others,
          { id: makeId("group"), userAgents: [token], rules: [rule] },
        ],
      };
    });
  }

  async function handleFetch() {
    if (!siteUrl.trim()) return;
    setFetching(true);
    setFetchMessage(null);
    const outcome = await fetchExistingRobots(siteUrl.trim());
    setFetching(false);
    if (outcome.ok === false) {
      setFetchMessage({ tone: "error", text: outcome.message });
      return;
    }
    setRawOverride(null);
    setState(outcome.state);
    setMode("build");
    setFetchMessage({
      tone: "success",
      text: `Loaded robots.txt from ${outcome.finalUrl}. Review the checklist and matrix below, edit anything, then copy or download.`,
    });
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setFetchMessage({
        tone: "error",
        text: "Could not copy automatically; select the text and copy manually.",
      });
    }
  }

  function handleDownload() {
    const blob = new Blob([output], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "robots.txt";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div id="robots-txt-generator" className={`${panelClass} p-5 sm:p-8`}>
      <ToolRunOverlay
        active={fetching}
        title="Fetching live robots.txt & sitemap directives"
        description="Reading crawler rules, AI bot directives, and sitemap declarations from the domain."
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setMode("build")}
            className={mode === "build" ? primaryButton : secondaryButton}
          >
            Build rules
          </button>
          <button
            type="button"
            onClick={() => setMode("check")}
            className={mode === "check" ? primaryButton : secondaryButton}
          >
            <Globe className="h-3.5 w-3.5" /> Check a live site
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 inline-flex items-center gap-1 text-xs font-extrabold text-slate-500 dark:text-slate-400">
            <Sparkles className="h-3.5 w-3.5 text-[#5271ff]" /> Quick Presets:
          </span>
          <button
            type="button"
            onClick={() => applyPreset("standard-seo")}
            className="rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:border-[#3452d1] hover:text-[#3452d1] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            Standard SEO + AI Allowed
          </button>
          <button
            type="button"
            onClick={() => applyPreset("block-ai-training")}
            className="rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:border-[#3452d1] hover:text-[#3452d1] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            Allow Search + Block AI Training
          </button>
          <button
            type="button"
            onClick={() => applyPreset("full-allow")}
            className="rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:border-[#3452d1] hover:text-[#3452d1] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            Full Allow
          </button>
        </div>
      </div>

      {mode === "check" && (
        <div className="mt-5 rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
          <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
            Site URL
          </label>
          <div className="mt-1.5 flex flex-col gap-2 sm:flex-row">
            <ToolUrlInput
              className={inputClass}
              value={siteUrl}
              onChange={(event) => setSiteUrl(event.target.value)}
              placeholder="https://example.com"
              inputMode="url"
            />
            <button
              type="button"
              onClick={handleFetch}
              disabled={fetching || !siteUrl.trim()}
              className={`${secondaryButton} shrink-0`}
            >
              {fetching ? (
                <Loader2 className="animate-spin h-3.5 w-3.5" />
              ) : (
                <Globe className="h-3.5 w-3.5" />
              )}
              {fetching ? "Fetching…" : "Fetch robots.txt"}
            </button>
          </div>
          <p className="mt-2 text-xs leading-6 text-slate-500 dark:text-slate-400">
            Fetches the site&apos;s public /robots.txt and loads it into the builder
            below for review. Review before publishing
          </p>
        </div>
      )}

      {fetchMessage && (
        <p
          className={`mt-3 text-xs font-semibold ${
            fetchMessage.tone === "error"
              ? "text-rose-600 dark:text-rose-400"
              : "text-emerald-600 dark:text-emerald-400"
          }`}
        >
          {fetchMessage.text}
        </p>
      )}

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <section>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-sm font-black uppercase tracking-wider text-[#4662df] dark:text-blue-300">
                User-agent groups
              </h2>
              <button
                type="button"
                onClick={addGroup}
                className={secondaryButton}
              >
                <Plus className="h-3.5 w-3.5" /> Add group
              </button>
            </div>
            <div className="mt-3 space-y-4">
              {state.groups.map((group) => (
                <div
                  key={group.id}
                  className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700"
                >
                  <div className="flex items-center gap-2">
                    <input
                      className={`${inputClass} font-mono`}
                      value={group.userAgents.join(", ")}
                      onChange={(event) =>
                        updateGroup(group.id, {
                          userAgents: event.target.value
                            .split(",")
                            .map((agent) => agent.trim()),
                        })
                      }
                      placeholder="* (comma-separate multiple agents)"
                    />
                    <button
                      type="button"
                      onClick={() => removeGroup(group.id)}
                      className="shrink-0 rounded-lg border border-slate-200 p-2.5 text-slate-500 transition hover:border-rose-300 hover:text-rose-600 dark:border-slate-700 dark:text-slate-400"
                      aria-label="Remove group"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-3 space-y-2">
                    {group.rules.map((rule) => (
                      <div key={rule.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2 sm:grid-cols-[8rem_minmax(0,1fr)_auto]">
                        <select
                          className={`${inputClass} col-span-2 sm:col-span-1`}
                          value={rule.type}
                          onChange={(event) =>
                            updateRule(group.id, rule.id, {
                              type: event.target.value as
                                | "allow"
                                | "disallow"
                                | "crawl-delay",
                            })
                          }
                        >
                          <option value="disallow">Disallow</option>
                          <option value="allow">Allow</option>
                          <option value="crawl-delay">Crawl-delay</option>
                        </select>
                        <input
                          className={`${inputClass} font-mono`}
                          value={rule.path}
                          onChange={(event) =>
                            updateRule(group.id, rule.id, {
                              path: event.target.value,
                            })
                          }
                          placeholder={
                            rule.type === "crawl-delay" ? "10" : "/path/"
                          }
                        />
                        <button
                          type="button"
                          onClick={() => removeRule(group.id, rule.id)}
                          className="shrink-0 rounded-lg border border-slate-200 p-2.5 text-slate-500 transition hover:border-rose-300 hover:text-rose-600 dark:border-slate-700 dark:text-slate-400"
                          aria-label="Remove rule"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addRule(group.id)}
                      className={secondaryButton}
                    >
                      <Plus className="h-3.5 w-3.5" /> Add rule
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-sm font-black uppercase tracking-wider text-[#4662df] dark:text-blue-300">
                Sitemaps
              </h2>
              <button
                type="button"
                onClick={addSitemap}
                className={secondaryButton}
              >
                <Plus className="h-3.5 w-3.5" /> Add sitemap
              </button>
            </div>
            <div className="mt-3 space-y-2">
              {state.sitemapUrls.map((url, index) => (
                <div key={index} className="flex gap-2">
                  <ToolUrlInput
                    className={inputClass}
                    value={url}
                    onChange={(event) => setSitemap(index, event.target.value)}
                    placeholder="https://example.com/sitemap.xml"
                  />
                  <button
                    type="button"
                    onClick={() => removeSitemap(index)}
                    className="shrink-0 rounded-lg border border-slate-200 p-2.5 text-slate-500 transition hover:border-rose-300 hover:text-rose-600 dark:border-slate-700 dark:text-slate-400"
                    aria-label="Remove sitemap"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {!state.sitemapUrls.length && (
                <p className="text-xs text-slate-400">No sitemap added yet.</p>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
            <h2 className="text-sm font-black uppercase tracking-wider text-[#4662df] dark:text-blue-300">
              AI crawler access matrix
            </h2>
            <p className="mt-2 text-xs leading-6 text-slate-500 dark:text-slate-400">
              Computed from the rules above. Quick actions add or remove an
              exact User-agent group for that bot.
            </p>
            <div className="mt-3 space-y-2">
              {matrix.map((row) => (
                <div
                  key={row.token}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-50 px-3 py-2.5 text-xs dark:bg-slate-950/60"
                >
                  <div>
                    <p className="font-mono font-bold text-slate-800 dark:text-slate-100">
                      {row.token}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {row.operator} ·{" "}
                      {row.purpose === "user-fetch"
                        ? "user-triggered fetch"
                        : row.purpose}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                        row.access === "blocked"
                          ? "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300"
                          : row.access === "restricted"
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"
                            : "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                      }`}
                    >
                      {row.access === "blocked" ? (
                        <XCircle className="h-3 w-3" />
                      ) : row.access === "restricted" ? (
                        <AlertTriangle className="h-3 w-3" />
                      ) : (
                        <CheckCircle2 className="h-3 w-3" />
                      )}
                      {row.access}
                    </span>
                    <button
                      type="button"
                      onClick={() => setCrawlerAccess(row.token, "block")}
                      className="rounded-lg border border-slate-200 p-1.5 text-rose-600 transition hover:bg-rose-50 dark:border-slate-700 dark:hover:bg-rose-500/10"
                      aria-label={`Block ${row.token}`}
                      title="Block"
                    >
                      <ShieldX className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setCrawlerAccess(row.token, "allow")}
                      className="rounded-lg border border-slate-200 p-1.5 text-emerald-600 transition hover:bg-emerald-50 dark:border-slate-700 dark:hover:bg-emerald-500/10"
                      aria-label={`Allow ${row.token}`}
                      title="Allow"
                    >
                      <ShieldCheck className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setCrawlerAccess(row.token, "default")}
                      className="rounded-lg border border-slate-200 px-2 py-1.5 text-[10px] font-bold text-slate-500 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
                      title="Remove exact rule, inherit default"
                    >
                      Default
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="min-w-0 space-y-5 lg:sticky lg:top-24 lg:self-start">
          <section>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-sm font-black uppercase tracking-wider text-[#4662df] dark:text-blue-300">
                Live preview {rawOverride !== null ? "(Custom Edited)" : ""}
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-400">
                  {output.length.toLocaleString()} chars
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (!isEditingRaw && rawOverride === null) {
                      setRawOverride(compiledOutput);
                    }
                    setIsEditingRaw((prev) => !prev);
                  }}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-bold text-slate-700 hover:border-[#3452d1] dark:border-slate-700 dark:text-slate-200"
                >
                  <Edit3 className="h-3 w-3" />
                  {isEditingRaw ? "Compiled View" : "Edit Text"}
                </button>
              </div>
            </div>
            {isEditingRaw ? (
              <textarea
                rows={14}
                value={output}
                onChange={(e) => setRawOverride(e.target.value)}
                spellCheck={false}
                aria-label="Direct robots.txt editor"
                className="mt-3 w-full rounded-2xl border border-[#5271ff] bg-slate-950 p-4 font-mono text-xs leading-6 text-slate-100 focus:outline-none"
              />
            ) : (
              <pre className="mt-3 max-h-[420px] overflow-auto whitespace-pre-wrap break-words rounded-2xl border border-slate-200 bg-slate-950 p-4 font-mono text-xs leading-6 text-slate-100 dark:border-slate-700">
                {output}
              </pre>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className={primaryButton}
              >
                {copied ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                {copied ? "Copied" : "Copy robots.txt"}
              </button>
              <button
                type="button"
                onClick={handleDownload}
                className={secondaryButton}
              >
                <Download className="h-3.5 w-3.5" /> Download file
              </button>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
            <h2 className="text-sm font-black uppercase tracking-wider text-[#4662df] dark:text-blue-300">
              Checks you can inspect
            </h2>
            {issues.length === 0 ? (
              <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" /> No issues found.
              </p>
            ) : (
              <ul className="mt-3 space-y-2">
                {issues.map((issue, index) => {
                  const Icon =
                    issue.level === "error"
                      ? XCircle
                      : issue.level === "warning"
                        ? AlertTriangle
                        : Info;
                  const className =
                    issue.level === "error"
                      ? "text-rose-600 dark:text-rose-400"
                      : issue.level === "warning"
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-slate-500 dark:text-slate-400";
                  return (
                    <li
                      key={`${issue.level}-${index}`}
                      className={`flex items-start gap-2 text-xs font-semibold leading-5 ${className}`}
                    >
                      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      {issue.message}
                    </li>
                  );
                })}
              </ul>
            )}
            <p className="mt-3 text-[11px] leading-5 text-slate-400">
              {errorCount > 0
                ? "Resolve the errors above before publishing; warnings and notes are judgment calls."
                : "robots.txt only asks well-behaved crawlers to stay out; it is not an access control or security boundary."}
            </p>
          </section>

          <section className="rounded-2xl border border-dashed border-slate-300 p-4 text-xs leading-6 text-slate-500 dark:border-slate-700 dark:text-slate-400">
            Save the downloaded file as{" "}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono dark:bg-slate-800">
              robots.txt
            </code>{" "}
            at your site&apos;s root (e.g.{" "}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono dark:bg-slate-800">
              /robots.txt
            </code>
            ). A subdomain needs its own copy.
          </section>
        </div>
      </div>
    </div>
  );
}
