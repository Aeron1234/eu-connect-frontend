"use client";


export default function EvaluationCircularScore({ score, max }) {
  const pct = Math.max(0, Math.min(1, score / max));
  const r = 28;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative w-16 h-16 shrink-0">
      <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
        <circle
          cx="32"
          cy="32"
          r={r}
          strokeWidth="5"
          className="stroke-stone-200 fill-none dark:stroke-stone-700"
        />
        <circle
          cx="32"
          cy="32"
          r={r}
          strokeWidth="5"
          strokeLinecap="round"
          className="stroke-primary-emphasis fill-none transition-all"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
        <span className="text-base font-bold text-foreground">{score}</span>
        <span className="text-[10px] text-foreground-subtle">/{max}</span>
      </div>
    </div>
  );
}
