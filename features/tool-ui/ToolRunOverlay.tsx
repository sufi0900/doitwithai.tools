"use client";

import { useEffect, useId, useRef } from "react";
import { Loader2 } from "lucide-react";
import styles from "./tool-run-overlay.module.css";

/** Yield a painted frame before browser-only work, without simulating progress. */
export const paintToolFeedback = () =>
  new Promise<void>((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
  );

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

export default function ToolRunOverlay({
  active,
  title,
  description,
  progress,
  onCancel,
}: {
  active: boolean;
  title: string;
  description: string;
  progress?: { completed: number; total: number };
  onCancel?: () => void;
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
        <p className={styles.hint}>
          Your results will open below when the check finishes.
        </p>
        {onCancel && (
          <button type="button" onClick={onCancel}>
            Stop checking
          </button>
        )}
      </div>
    </dialog>
  );
}
