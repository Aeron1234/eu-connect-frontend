import { cn } from "@/lib/utils";

function ProgressBar({
  value = 0,
  label = "Progress",
  size = "md",
  onBrand = false,
  className,
}) {
  const numericValue = Number(value);
  const percent = Number.isFinite(numericValue)
    ? Math.min(100, Math.max(0, numericValue))
    : 0;

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      className={cn(
        "w-full overflow-hidden rounded-full bg-secondary",
        size === "sm" ? "h-1.5" : "h-2",
        onBrand &&
          "bg-white/70 ring-1 ring-white/60 dark:bg-white/20 dark:ring-white/20",
        className,
      )}
    >
      <div
        className="h-full rounded-full bg-[var(--progress-fill)] transition-[width]"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

export default ProgressBar;
