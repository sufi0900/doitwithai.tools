"use client";

import { useEffect, useRef, type ReactNode } from "react";
import styles from "./workspace.module.css";

export default function WriterMenu({ label, children, align = "end", className = "" }: {
  label: ReactNode;
  children: ReactNode;
  className?: string;
  align?: "start" | "end";
}) {
  const ref = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const dismiss = (event: PointerEvent) => {
      if (ref.current?.open && event.target instanceof Node && !ref.current.contains(event.target)) {
        ref.current.open = false;
      }
    };
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, []);

  return (
    <details ref={ref} className={`${styles.writerMenu} ${className}`} data-align={align} onKeyDown={(event) => {
      if (event.key !== "Escape" || !ref.current?.open) return;
      event.stopPropagation();
      ref.current.open = false;
      ref.current.querySelector("summary")?.focus();
    }}>
      <summary>{label}</summary>
      <div className={styles.writerMenuItems} onClick={(event) => {
        if (event.target instanceof Element && event.target.closest("button, a") && ref.current) {
          ref.current.open = false;
        }
      }}>{children}</div>
    </details>
  );
}
