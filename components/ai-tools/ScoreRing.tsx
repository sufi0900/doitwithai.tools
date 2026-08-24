type ScoreRingProps = {
  score: number;
  size?: "sm" | "md";
  label?: string;
};

export default function ScoreRing({
  score,
  size = "md",
  label = "Quality score",
}: ScoreRingProps) {
  const color =
    score >= 80
      ? "#16a34a"
      : score >= 65
        ? "#5271ff"
        : score >= 50
          ? "#f59e0b"
          : "#ef4444";
  const dimensions = size === "sm" ? "h-11 w-11 text-xs" : "h-14 w-14 text-sm";

  return (
    <div
      className={`grid shrink-0 place-items-center rounded-full p-[3px] ${dimensions}`}
      style={{
        background: `conic-gradient(${color} ${score * 3.6}deg, #e2e8f0 0deg)`,
      }}
      title={`${label}: ${score} out of 100`}
      aria-label={`${label} ${score} out of 100`}
    >
      <span className="grid h-full w-full place-items-center rounded-full bg-white font-extrabold text-slate-900 dark:bg-slate-900 dark:text-white">
        {score}
      </span>
    </div>
  );
}
