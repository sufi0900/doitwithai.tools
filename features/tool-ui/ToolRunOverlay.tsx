"use client";

import { useEffect, useId, useRef } from "react";
import { Loader2 } from "lucide-react";
import styles from "./tool-run-overlay.module.css";

/** Yield painted frames and a brief perceptible loading modal window before browser-only work. */
export const paintToolFeedback = (minMs = 620) =>
  new Promise<void>((resolve) => {
    const isTest =
      typeof process !== "undefined" && process.env?.NODE_ENV === "test";
    const delay = isTest ? 0 : minMs;
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        if (delay > 0) {
          window.setTimeout(resolve, delay);
        } else {
          resolve();
        }
      }),
    );
  });

export function focusToolSection(node: HTMLElement | null) {
  if (!node) return;
  node.focus({ preventScroll: true });
  node.scrollIntoView({
    block: "start",
    behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth",
  });
}

export function ToolRunOverlay({
  active,
  title,
  description,
  progress,
  onCancel,
  cancelLabel = "Stop checking",
  hint = "Your results will open below when the check finishes.",
}: {
  active: boolean;
  title: string;
  description: string;
  progress?: { completed: number; total: number };
  onCancel?: () => void;
  cancelLabel?: string;
  hint?: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  useEffect(() => {
    const node = dialog.current;
    if (!node) return;
    if (active && !node.open) node.showModal();
    else if (!active && node.open) node.close();
  }, [active]);
  return (
    <dialog
      ref={dialog}
      className={styles.dialog}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onCancel={(event) => {
        event.preventDefault();
        onCancel?.();
      }}
    >
      <div className={styles.content}>
        <span className={styles.spinner} aria-hidden="true">
          <span className={styles.wheel}>
            <Loader2 size={34} />
          </span>
        </span>
        <h2 id={titleId}>{title}</h2>
        <p id={descriptionId}>{description}</p>
        {active && progress && (
          <p role="status" aria-live="polite" className={styles.count}>
            {progress.completed} of {progress.total} source pages checked
          </p>
        )}
        <p className={styles.hint}>{hint}</p>
        {onCancel && (
          <button type="button" onClick={onCancel}>
            {cancelLabel}
          </button>
        )}
      </div>
    </dialog>
  );
}

export default ToolRunOverlay;
