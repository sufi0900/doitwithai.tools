"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  listSavedBlogProjects,
  loadBlogProjectById,
  saveBlogProject,
  importBlogProjectJsonFile,
  serializeBlogProjectToJson,
  getBlogStorageBackend,
} from "@/lib/blog-writer/project-storage-db";
import type { BlogProjectMetaSummary } from "@/lib/blog-writer/project-storage-db";
import type { Project } from "./types";
import { blankProject, workspace } from "./model";
const ACTIVE = "prism-writer-active-v1";
export function useWorkspace() {
  const [project, setState] = useState<Project>(blankProject),
    [projects, setProjects] = useState<BlogProjectMetaSummary[]>([]),
    [ready, setReady] = useState(false),
    [saving, setSaving] = useState(false),
    [saveError, setSaveError] = useState(""),
    [saved, setSaved] = useState(false),
    [persistent, setPersistent] = useState(true);
  const current = useRef(project),
    mounted = useRef(true),
    request = useRef(0),
    persisted = useRef<Project | null>(null),
    queue = useRef(Promise.resolve());
  const refresh = useCallback(async () => {
    const list = await listSavedBlogProjects();
    if (mounted.current) setProjects(list);
  }, []);
  const save = useCallback(
    (p: Project = current.current) => {
      const task = async () => {
        if (mounted.current) setSaving(true);
        try {
          await saveBlogProject(p);
          const durable = (await getBlogStorageBackend()) === "indexeddb";
          if (mounted.current) {
            setPersistent(durable);
            if (current.current === p) {
              persisted.current = p;
              setSaved(durable);
              setSaveError(
                durable
                  ? ""
                  : "Browser storage is unavailable. This session is temporary; download a project backup.",
              );
            }
          }
          await refresh();
        } catch {
          if (mounted.current) {
            setSaved(false);
            setSaveError(
              "Browser storage could not save this project. Download a project backup before leaving.",
            );
          }
        } finally {
          if (mounted.current) setSaving(false);
        }
      };
      queue.current = queue.current.catch(() => {}).then(task);
      return queue.current;
    },
    [refresh],
  );
  useEffect(() => {
    mounted.current = true;
    const ticket = ++request.current;
    (async () => {
      try {
        const list = await listSavedBlogProjects();
        let active = "";
        try {
          active = localStorage.getItem(ACTIVE) || "";
        } catch {}
        const selected = list.find((p) => p.projectId === active) || list[0];
        const p = selected
          ? await loadBlogProjectById(selected.projectId)
          : blankProject();
        if (ticket !== request.current || !mounted.current) return;
        const w = workspace(p);
        if (["planning", "drafting"].includes(w.run.status))
          p.writerWorkspace = {
            ...w,
            run: {
              ...w.run,
              status: "paused",
              error:
                "Generation paused when this tab was closed. Resume when ready.",
            },
          };
        current.current = p;
        setState(p);
        setProjects(list);
        const durable = (await getBlogStorageBackend()) === "indexeddb";
        setPersistent(durable);
        setSaved(Boolean(selected) && durable);
        if (!durable)
          setSaveError(
            "Browser storage is unavailable. This session is temporary; download a project backup.",
          );
      } catch {
        setSaveError(
          "Storage is unavailable. Keep a downloaded backup of your work.",
        );
      } finally {
        if (mounted.current) setReady(true);
      }
    })();
    return () => {
      mounted.current = false;
      request.current++;
    };
  }, []);
  useEffect(() => {
    if (!ready || persisted.current === project) return;
    setSaved(false);
    const timer = setTimeout(() => void save(project), 1000);
    return () => clearTimeout(timer);
  }, [project, ready, save]);
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (!saved && ready) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [saved, ready]);
  // Update synchronously so asynchronous jobs read the exact checkpoint just committed.
  const update = useCallback((patch: Project | ((p: Project) => Project)) => {
    const next = typeof patch === "function" ? patch(current.current) : patch;
    const result = { ...next, updatedAtIso: new Date().toISOString() };
    current.current = result;
    setState(result);
    return result;
  }, []);
  const activate = (p: Project) => {
    try {
      localStorage.setItem(ACTIVE, p.projectId);
    } catch {}
    current.current = p;
    setState(p);
    persisted.current = null;
  };
  const switchProject = async (pid: string) => {
    await save();
    const ticket = ++request.current;
    const p = await loadBlogProjectById(pid);
    if (ticket !== request.current) return;
    activate(p);
  };
  const create = async () => {
    await save();
    const p = blankProject();
    activate(p);
    await save(p);
  };
  const importProject = async (text: string) => {
    const p = importBlogProjectJsonFile(text);
    p.writerWorkspace = workspace(p);
    await save();
    activate(p);
    await save(p);
  };
  return {
    project,
    current,
    update,
    projects,
    ready,
    saving,
    saved,
    persistent,
    saveError,
    save,
    switchProject,
    create,
    importProject,
    backup: () => serializeBlogProjectToJson(current.current),
  };
}
