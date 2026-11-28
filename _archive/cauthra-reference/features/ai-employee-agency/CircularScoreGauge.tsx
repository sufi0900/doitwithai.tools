'use client';

export function CircularScoreGauge({
  score,
  label,
  sublabel,
  size = 104,
}: {
  score: number;
  label: string;
  sublabel?: string;
  size?: number;
}) {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (clamped / 100) * circumference;

  const strokeColor =
    clamped >= 80
      ? '#34D399'
      : clamped >= 60
        ? '#3B82F6'
        : clamped >= 40
          ? '#FBBF24'
          : '#F43F5E';

  const textColor =
    clamped >= 80
      ? 'text-emerald-300'
      : clamped >= 60
        ? 'text-blue-300'
        : clamped >= 40
          ? 'text-amber-300'
          : 'text-rose-300';

  return (
    <div className="flex items-center gap-3.5">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90"
          role="img"
          aria-label={`${label}: ${clamped} out of 100`}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#1E293B"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className="transition-[stroke-dashoffset] duration-500 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-mono text-xl font-bold leading-none ${textColor}`}>
            {clamped}
          </span>
          <span className="mt-0.5 font-mono text-[10px] text-slate-500">/100</span>
        </div>
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-white">{label}</p>
        {sublabel && <p className="mt-0.5 text-[11px] text-slate-400">{sublabel}</p>}
      </div>
    </div>
  );
}
