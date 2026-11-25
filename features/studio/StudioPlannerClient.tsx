"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bookmark,
  CalendarCheck2,
  CheckSquare,
  Copy,
  FilePenLine,
  Plus,
  Search,
  Square,
  Trash2,
  Wrench,
} from "lucide-react";
import {
  publishedPrompts,
  promptDetails,
  promptPath,
} from "@/features/prompts/details";
import { tools, toolPath } from "@/features/tool-catalog/catalog";
import { useWorkspace } from "@/features/tools-workspace/WorkspaceProvider";
import {
  addPlannerItemOptimistic,
  createDefaultStudioState,
  loadStudioState,
  saveStudioStateOptimistic,
  subscribeStudioState,
} from "@/lib/studio/store";
import { seedKeywordIntoWriterStudio } from "@/lib/studio/writer-bridge";
import type {
  EditorialPlannerItem,
  EditorialTaskStatus,
  StudioWorkspaceState,
} from "@/lib/studio/types";

const STATUS_COLUMNS: Array<{ id: EditorialTaskStatus; label: string }> = [
  { id: "idea", label: "Idea" },
  { id: "outlined", label: "Outlined" },
  { id: "drafting", label: "Drafting" },
  { id: "review", label: "Manual QA" },
  { id: "published", label: "Published" },
];

const CHECKLIST_LABELS: Array<{
  key: keyof EditorialPlannerItem["checklist"];
  label: string;
}> = [
  { key: "keywordLocked", label: "Keyword & intent verified" },
  { key: "outlineReviewed", label: "H1–H3 outline reviewed" },
  { key: "eeatAdded", label: "First-hand E-E-A-T proof added" },
  { key: "infographicReady", label: "Infographic V5 visual attached" },
  { key: "internalLinksChecked", label: "Internal & external links checked" },
  { key: "publishedManually", label: "Published manually to CMS" },
];

export default function StudioPlannerClient() {
  const router = useRouter();
  const workspace = useWorkspace();
  const [studio, setStudio] = useState<StudioWorkspaceState>(
    createDefaultStudioState,
  );
  const [subTab, setSubTab] = useState<"planner" | "prompts" | "tools">(
    "planner",
  );

  // Manual planner form
  const [titleInput, setTitleInput] = useState("");
  const [keywordInput, setKeywordInput] = useState("");
  const [dueDateInput, setDueDateInput] = useState(() =>
    new Date(Date.now() + 3 * 86_400_000).toISOString().slice(0, 10),
  );

  // Prompt Vault search
  const [promptQuery, setPromptQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    setStudio(loadStudioState());
    return subscribeStudioState(() => setStudio(loadStudioState()));
  }, []);

  const activeSite =
    studio.sites.find((s) => s.id === studio.activeSiteId) ||
    studio.sites[0] ||
    null;

  const handleAddPlannerCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleInput.trim()) return;
    addPlannerItemOptimistic({
      id: `plan-${Date.now()}`,
      siteId: activeSite?.id || "general",
      title: titleInput.trim(),
      targetKeyword: keywordInput.trim() || titleInput.trim().toLowerCase(),
      dueDate: dueDateInput,
      status: "idea",
      checklist: {
        keywordLocked: Boolean(keywordInput.trim()),
        outlineReviewed: false,
        eeatAdded: false,
        infographicReady: false,
        internalLinksChecked: false,
        publishedManually: false,
      },
      notes: "",
      updatedAtIso: new Date().toISOString(),
    });
    setTitleInput("");
    setKeywordInput("");
  };

  const handleUpdateStatus = (id: string, status: EditorialTaskStatus) => {
    saveStudioStateOptimistic((prev) => ({
      ...prev,
      plannerItems: prev.plannerItems.map((item) =>
        item.id === id
          ? { ...item, status, updatedAtIso: new Date().toISOString() }
          : item,
      ),
    }));
  };

  const handleToggleChecklist = (
    id: string,
    key: keyof EditorialPlannerItem["checklist"],
  ) => {
    saveStudioStateOptimistic((prev) => ({
      ...prev,
      plannerItems: prev.plannerItems.map((item) =>
        item.id === id
          ? {
              ...item,
              checklist: {
                ...item.checklist,
                [key]: !item.checklist[key],
              },
              updatedAtIso: new Date().toISOString(),
            }
          : item,
      ),
    }));
  };

  const handleDeleteCard = (id: string) => {
    saveStudioStateOptimistic((prev) => ({
      ...prev,
      plannerItems: prev.plannerItems.filter((i) => i.id !== id),
    }));
  };

  const handleOpenCardInWriter = async (item: EditorialPlannerItem) => {
    await seedKeywordIntoWriterStudio({
      keyword: item.targetKeyword,
      suggestedTitle: item.title,
      customBrief: item.notes,
      site: activeSite,
    });
    handleUpdateStatus(item.id, "drafting");
    router.push("/studio/writer");
  };

  const handleTogglePromptBookmark = (promptId: string) => {
    saveStudioStateOptimistic((prev) => ({
      ...prev,
      savedPromptIds: prev.savedPromptIds.includes(promptId)
        ? prev.savedPromptIds.filter((x) => x !== promptId)
        : [promptId, ...prev.savedPromptIds],
    }));
  };

  const filteredPrompts = useMemo(() => {
    const q = promptQuery.trim().toLowerCase();
    return publishedPrompts.filter((p) => {
      const detail = promptDetails[p.id];
      if (!detail) return false;
      if (!q) return true;
      return (
        detail.title.toLowerCase().includes(q) ||
        detail.overview.toLowerCase().includes(q)
      );
    });
  }, [promptQuery]);

  const savedToolRecords = useMemo(() => {
    const ids = new Set([
      ...(workspace?.saved || []),
      ...(workspace?.recent || []),
    ]);
    const matched = tools.filter((t) => ids.has(t.id));
    return matched.length > 0 ? matched.slice(0, 12) : tools.slice(0, 8);
  }, [workspace?.saved, workspace?.recent]);

  return (
    <div className="space-y-6">
      {/* Sub-Navigation Pills */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-slate-800 bg-[#0F172A] p-5">
        <div>
          <h1 className="text-xl font-extrabold text-white sm:text-2xl">
            Manual Editorial Planner &amp; Pro Prompt Vault
          </h1>
          <p className="mt-1 text-xs text-slate-300">
            100% manual schedule &amp; pre-publish checklist (zero background
            auto-posting), plus 650+ structured SEO prompts and saved tools.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            {
              id: "planner" as const,
              label: `Editorial Planner (${studio.plannerItems.length})`,
              icon: CalendarCheck2,
            },
            {
              id: "prompts" as const,
              label: `Pro Prompt Vault (${publishedPrompts.length} Packs)`,
              icon: Bookmark,
            },
            {
              id: "tools" as const,
              label: "Saved & Recent Tools",
              icon: Wrench,
            },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSubTab(tab.id)}
                className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition ${
                  subTab === tab.id
                    ? "bg-[#5271FF] text-white shadow"
                    : "border border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-600"
                }`}
              >
                <Icon size={13} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {subTab === "planner" && (
        <div className="space-y-5">
          {/* Quick-Add Manual Editorial Item */}
          <form
            onSubmit={handleAddPlannerCard}
            className="grid gap-3 rounded-2xl border border-slate-800 bg-[#0F172A] p-4 sm:grid-cols-12"
          >
            <input
              type="text"
              required
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              placeholder="Article working title (e.g. Complete JSON-LD Schema Audit Guide)..."
              className="rounded-xl border border-slate-700 bg-[#091020] px-3.5 py-2.5 text-xs text-white placeholder-slate-500 sm:col-span-5"
            />
            <input
              type="text"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              placeholder="Target keyword..."
              className="rounded-xl border border-slate-700 bg-[#091020] px-3.5 py-2.5 text-xs text-white placeholder-slate-500 sm:col-span-3"
            />
            <input
              type="date"
              value={dueDateInput}
              onChange={(e) => setDueDateInput(e.target.value)}
              className="rounded-xl border border-slate-700 bg-[#091020] px-3 py-2.5 text-xs text-white sm:col-span-2"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#5271FF] px-4 py-2.5 text-xs font-extrabold text-white hover:bg-[#4361EE] sm:col-span-2"
            >
              <Plus size={14} />
              <span>Add Task</span>
            </button>
          </form>

          {/* 5-Column Manual Editorial Board */}
          <div className="grid gap-4 lg:grid-cols-5">
            {STATUS_COLUMNS.map((col) => {
              const items = studio.plannerItems.filter(
                (i) => i.status === col.id,
              );
              return (
                <div
                  key={col.id}
                  className="rounded-2xl border border-slate-800 bg-[#0F172A] p-4"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                    <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                      {col.label}
                    </h2>
                    <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-300">
                      {items.length}
                    </span>
                  </div>

                  <div className="mt-3 space-y-3">
                    {items.length === 0 ? (
                      <p className="py-4 text-center text-[11px] text-slate-500">
                        No items in {col.label}
                      </p>
                    ) : (
                      items.map((item) => (
                        <div
                          key={item.id}
                          className="space-y-2.5 rounded-xl border border-slate-800 bg-[#091020] p-3.5 text-xs"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-bold leading-snug text-white">
                              {item.title}
                            </p>
                            <button
                              type="button"
                              aria-label="Delete planner item"
                              onClick={() => handleDeleteCard(item.id)}
                              className="text-slate-500 hover:text-rose-400"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                          <p className="text-[11px] text-[#9aabff]">
                            KW: {item.targetKeyword}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            Target date: {item.dueDate}
                          </p>

                          {/* Manual Checklist */}
                          <div className="space-y-1 border-t border-slate-800/80 pt-2">
                            {CHECKLIST_LABELS.map((chk) => {
                              const done = item.checklist[chk.key];
                              return (
                                <button
                                  key={chk.key}
                                  type="button"
                                  onClick={() =>
                                    handleToggleChecklist(item.id, chk.key)
                                  }
                                  className="flex w-full items-center gap-1.5 text-left text-[11px] text-slate-300 hover:text-white"
                                >
                                  {done ? (
                                    <CheckSquare
                                      size={12}
                                      className="shrink-0 text-emerald-400"
                                    />
                                  ) : (
                                    <Square
                                      size={12}
                                      className="shrink-0 text-slate-500"
                                    />
                                  )}
                                  <span
                                    className={
                                      done ? "line-through text-slate-500" : ""
                                    }
                                  >
                                    {chk.label}
                                  </span>
                                </button>
                              );
                            })}
                          </div>

                          <div className="flex items-center justify-between gap-2 pt-2">
                            <select
                              aria-label="Move status"
                              value={item.status}
                              onChange={(e) =>
                                handleUpdateStatus(
                                  item.id,
                                  e.target.value as EditorialTaskStatus,
                                )
                              }
                              className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-[10px] font-semibold text-slate-200"
                            >
                              {STATUS_COLUMNS.map((s) => (
                                <option key={s.id} value={s.id}>
                                  {s.label}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={() => void handleOpenCardInWriter(item)}
                              className="inline-flex items-center gap-1 rounded-lg bg-[#5271FF]/20 px-2.5 py-1 text-[10px] font-bold text-[#b4c2ff] hover:bg-[#5271FF]/30"
                            >
                              <FilePenLine size={11} />
                              <span>Writer</span>
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {subTab === "prompts" && (
        <div className="space-y-4 rounded-3xl border border-slate-800 bg-[#0F172A] p-6">
          <div className="relative">
            <Search
              size={15}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={promptQuery}
              onChange={(e) => setPromptQuery(e.target.value)}
              placeholder="Search 650+ Pro SEO, AEO, Keyword, Schema & Infographic prompt packs..."
              className="w-full rounded-xl border border-slate-700 bg-[#091020] py-3 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:border-[#5271FF] focus:outline-none"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {filteredPrompts.map((p) => {
              const detail = promptDetails[p.id];
              if (!detail) return null;
              const isSaved = studio.savedPromptIds.includes(p.id);
              const workflowSummary = detail.steps.join("\n- ");

              return (
                <div
                  key={p.id}
                  className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-[#091020] p-5"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 text-[11px]">
                      <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 font-bold text-amber-300">
                        {detail.promptCount || 50}+ Structured Prompts
                      </span>
                      <button
                        type="button"
                        onClick={() => handleTogglePromptBookmark(p.id)}
                        className={`inline-flex items-center gap-1 font-bold ${
                          isSaved ? "text-emerald-300" : "text-slate-400 hover:text-white"
                        }`}
                      >
                        <Bookmark size={13} />
                        <span>{isSaved ? "Saved" : "Save"}</span>
                      </button>
                    </div>
                    <h3 className="mt-2.5 text-sm font-extrabold text-white">
                      {detail.title}
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
                      {detail.overview}
                    </p>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-800 pt-3 text-xs">
                    <Link
                      href={promptPath(p.id)}
                      className="rounded-xl bg-[#5271FF] px-3.5 py-1.5 font-bold text-white hover:bg-[#4361EE]"
                    >
                      Open Pack →
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        if (typeof navigator !== "undefined" && navigator.clipboard) {
                          void navigator.clipboard.writeText(
                            `${detail.title}\n\nSteps:\n- ${workflowSummary}`,
                          );
                          setCopiedId(p.id);
                          setTimeout(() => setCopiedId(null), 1800);
                        }
                      }}
                      className="inline-flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 font-semibold text-slate-300 hover:text-white"
                    >
                      <Copy size={12} />
                      <span>
                        {copiedId === p.id ? "Copied Steps!" : "Copy Playbook"}
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {subTab === "tools" && (
        <div className="rounded-3xl border border-slate-800 bg-[#0F172A] p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-extrabold text-white">
                Your Saved &amp; Recently Used DIY SEO Tools
              </h2>
              <p className="text-xs text-slate-400">
                Synced directly with your 90+ browser tool bookmarks and history.
              </p>
            </div>
            <Link
              href="/tools"
              className="text-xs font-bold text-[#9aabff] hover:underline"
            >
              Browse All {tools.length} Tools →
            </Link>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {savedToolRecords.map((tool) => (
              <Link
                key={tool.id}
                href={toolPath(tool.slug)}
                className="rounded-2xl border border-slate-800 bg-[#091020] p-4 transition hover:border-[#5271FF]"
              >
                <p className="text-xs font-extrabold text-white">{tool.name}</p>
                <p className="mt-1 line-clamp-2 text-[11px] text-slate-400">
                  {tool.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
