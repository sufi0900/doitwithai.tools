"use client";
import { useEffect, useState } from "react";
import styles from "./analyzer.module.css";
export default function ScoreGauge({
  score,
  label = "Page audit score",
  critical = false,
}: {
  score: number | null;
  label?: string;
  critical?: boolean;
}) {
  const [progress, setProgress] = useState(0);
  const safe = score === null ? null : Math.max(0, Math.min(100, score));
  useEffect(() => {
    const id = requestAnimationFrame(() => setProgress(safe || 0));
    return () => cancelAnimationFrame(id);
  }, [safe]);
  const color =
    safe === null
      ? "#94a3b8"
      : critical || safe < 50
        ? "#dc4d64"
        : safe < 80
          ? "#d39c24"
          : "#22a46d";
  return (
    <div
      className={styles.gauge}
      role="img"
      aria-label={`${label}: ${safe === null ? "not available" : safe + " out of 100"}`}
    >
      <svg viewBox="0 0 140 140" aria-hidden="true">
        <circle
          cx="70"
          cy="70"
          r="59"
          fill="none"
          stroke="currentColor"
          strokeWidth="9"
          className={styles.gaugeTrack}
        />
        <circle
          className={styles.gaugeProgress}
          cx="70"
          cy="70"
          r="59"
          fill="none"
          stroke={color}
          strokeWidth="9"
          pathLength="100"
          strokeDasharray="100"
          strokeDashoffset={100 - progress}
          strokeLinecap="round"
          transform="rotate(-90 70 70)"
        />
      </svg>
      <div>
        <strong>{safe ?? "—"}</strong>
        <span>out of 100</span>
      </div>
    </div>
  );
}
