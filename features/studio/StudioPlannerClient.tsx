"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  CalendarCheck2,
  CheckSquare,
  FilePenLine,
  Plus,
  Square,
  Trash2,
} from "lucide-react";
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
  { id: "review", label: "Pre-Publish QA" },
  { id: "published", label: "Published" },
];

const CHECKLIST_LABELS: Array<{
  key: keyof EditorialPlannerItem["checklist"];
  label: string;
}> = [
  { key: "keywordLocked", label: "Keyword & search intent verified" },
  { key: "outlineReviewed", label: "H1–H3 structure & 50w answer reviewed" },
  { key: "eeatAdded", label: "First-hand E-E-A-T proof & sources added" },
  { key: "infographicReady", label: "Infographic V5 visual attached" },
  { key: "internalLinksChecked", label: "Sitemap internal links woven" },
  { key: "publishedManually", label: "Published to live CMS" },
];

export default function StudioPlannerClient() {
  const router = useRouter();
  const [studio, setStudio] = useState<StudioWorkspaceState>(
    createDefaultStudioState,
  );

  const [titleInput, setTitleInput] = useState("");
  const [keywordInput, setKeywordInput] = useState("");
  const [dueDateInput, setDueDateInput] = useState(() =>
    new Date(Date.now() + 3 * 86_400_000).toISOString().slice(0, 10),
  );

  useEffect(() => {
    setStudio(loadStudioState());
    return subscribeStudioState(() => setStudio(loadStudioState()));
  }, []);

  const activeSite =
    studio.sites.find((s) => s.id === studio.activeSiteId) ||
    studio.sites[0] ||
    null;

  const siteItems = activeSite
    ? studio.plannerItems.filter(
        (i) => i.siteId === activeSite.id || i.siteId === "general",
      )
    : studio.plannerItems;

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

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-[#0D1526]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Editorial Planner &amp; Pre-Publish QA
            </h1>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Schedule articles, verify E-E-A-T and internal linking checklists,
              and launch any planned piece directly in the Content Writer.
            </p>
          </div>
          <Link
            href="/studio/vault"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:border-[#5271FF] hover:text-[#5271FF] dark:border-slate-700 dark:text-slate-200"
          >
            <BookOpen size={14} className="text-[#5271FF]" />
            <span>Open Prompts &amp; Playbooks Vault</span>
          </Link>
        </div>

        <form
          onSubmit={handleAddPlannerCard}
          className="mt-5 grid gap-3 border-t border-slate-200/80 pt-5 sm:grid-cols-12 dark:border-slate-800/80"
        >
          <input
            type="text"
            value={titleInput}
            onChange={(e) => setTitleInput(e.target.value)}
            placeholder="Working article title..."
            className="rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-[#5271FF] focus:outline-none sm:col-span-5 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
          <input
            type="text"
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            placeholder="Target focus keyword..."
            className="rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-[#5271FF] focus:outline-none sm:col-span-4 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
          <input
            type="date"
            value={dueDateInput}
            onChange={(e) => setDueDateInput(e.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs text-slate-900 focus:border-[#5271FF] focus:outline-none sm:col-span-2 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-1 rounded-xl bg-[#5271FF] px-3 py-2.5 text-xs font-bold text-white transition hover:bg-[#4361EE] sm:col-span-1"
          >
            <Plus size={15} />
            <span className="sm:hidden">Add</span>
          </button>
        </form>
      </div>

      {siteItems.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-[#0D1526]">
          <CalendarCheck2 size={26} className="mx-auto text-[#5271FF]" />
          <p className="mt-2 text-sm font-bold text-slate-900 dark:text-white">
            Your Editorial Calendar is Ready
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Add an article above or schedule topics directly from Keyword
            Research.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {siteItems.map((item) => (
            <div
              key={item.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-[#0D1526]"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                      {item.title}
                    </h2>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      Keyword: <strong>{item.targetKeyword}</strong> · Target:{" "}
                      {item.dueDate}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <select
                      aria-label="Editorial status"
                      value={item.status}
                      onChange={(e) =>
                        handleUpdateStatus(
                          item.id,
                          e.target.value as EditorialTaskStatus,
                        )
                      }
                      className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    >
                      {STATUS_COLUMNS.map((col) => (
                        <option key={col.id} value={col.id}>
                          {col.label}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => handleDeleteCard(item.id)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid gap-1.5 sm:grid-cols-2">
                  {CHECKLIST_LABELS.map((c) => {
                    const checked = item.checklist[c.key];
                    return (
                      <button
                        key={c.key}
                        type="button"
                        onClick={() => handleToggleChecklist(item.id, c.key)}
                        className="flex items-center gap-2 rounded-lg px-2 py-1 text-left text-xs text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/60"
                      >
                        {checked ? (
                          <CheckSquare
                            size={14}
                            className="shrink-0 text-emerald-500"
                          />
                        ) : (
                          <Square
                            size={14}
                            className="shrink-0 text-slate-400"
                          />
                        )}
                        <span className={checked ? "line-through opacity-65" : ""}>
                          {c.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 border-t border-slate-100 pt-3 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => void handleOpenCardInWriter(item)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#5271FF] px-3.5 py-2 text-xs font-bold text-white transition hover:bg-[#4361EE]"
                >
                  <FilePenLine size={13} />
                  <span>Open in Content Writer</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
