"use client";
import type { RichDocument } from "../engine/document";
import { useEffect, useRef, useState } from "react";

const KEY = "dwai:readability-editor:v2";

export type StoredDraft = {
  text: string;
  document?: RichDocument;
  mode?: "write" | "edit" | "improve";
  target?: string;
};

function read(): StoredDraft | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw || raw.length > 1_000_000) return null;
    const parsed = JSON.parse(raw);
    return typeof parsed?.text === "string" ? parsed : null;
  } catch {
    return null;
  }
}

export function clearStoredDraft() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* Storage can be blocked. The editor still works without it. */
  }
}

/**
 * Autosaves the draft in this browser only. Storage can be unavailable,
 * so every access is guarded and the page works without it.
 */
export function useDraft(
  value: StoredDraft,
  onRestore: (draft: StoredDraft) => void,
) {
  const [ready, setReady] = useState(false);
  const [saved, setSaved] = useState<"idle" | "saved" | "unavailable">("idle");
  const restore = useRef(onRestore);
  restore.current = onRestore;
  const latest = useRef(value);
  latest.current = value;

  useEffect(() => {
    const draft = read();
    if (draft) restore.current(draft);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const timer = window.setTimeout(() => {
      const current = latest.current;
      try {
        if (!current.text) window.localStorage.removeItem(KEY);
        else window.localStorage.setItem(KEY, JSON.stringify(current));
        setSaved(current.text ? "saved" : "idle");
      } catch {
        setSaved("unavailable");
      }
    }, 600);
    return () => window.clearTimeout(timer);
  }, [ready, value.text, value.mode, value.target, value.document]);

  return { ready, saved };
}
