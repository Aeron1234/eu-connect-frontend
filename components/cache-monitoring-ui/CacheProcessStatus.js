import { Activity } from "lucide-react";
import { dateTime, duration } from "./cacheMetricsFormatting";

export default function CacheProcessStatus({ snapshot, processChanged, period }) {
  return (
    <>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-border bg-card px-4 py-3 text-xs text-foreground-soft shadow-sm sm:px-5">
        <span className={`rounded-full px-2.5 py-1 font-semibold ${
          snapshot.cacheEnabled
            ? "bg-primary/10 text-primary-emphasis"
            : "bg-muted text-foreground-subtle"
        }`}>{snapshot.cacheEnabled ? "Cache enabled" : "Cache disabled"}</span>
        <span>Single backend process</span>
        <span>Started {dateTime(snapshot.startedAt)}</span>
        <span>Uptime {duration(snapshot.uptimeSeconds)}</span>
        <span>Updated {dateTime(snapshot.sampledAt)}</span>
      </div>
      {processChanged && (
        <div role="status" className="rounded-xl border border-border bg-muted px-4 py-3 text-sm text-foreground-soft">
          The backend process changed or restarted. Interval comparisons have reset.
        </div>
      )}
      <div className="flex items-center gap-2">
        <Activity className="h-4 w-4 text-primary-emphasis" aria-hidden="true" />
        <h2 className="text-sm font-semibold text-foreground">{period}</h2>
      </div>
    </>
  );
}
