import { Activity, Database, Gauge, TriangleAlert } from "lucide-react";
import ProgressBar from "@/components/ui/ProgressBar";
import { count, percent } from "./cacheMetricsFormatting";

function MetricCard({ icon: Icon, label, value, detail, progress, progressLabel }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground-soft">
        <Icon className="h-4 w-4 text-primary-emphasis" aria-hidden="true" />
        {label}
      </div>
      <p className="mt-3 text-2xl font-bold tabular-nums text-foreground sm:text-3xl">{value}</p>
      <p className="mt-1 text-xs text-foreground-subtle">{detail}</p>
      {progress != null && (
        <ProgressBar
          value={progress}
          label={progressLabel || label}
          size="sm"
          className="mt-3"
        />
      )}
    </div>
  );
}

export default function CacheMonitoringSummary({ totals, storage }) {
  return (
    <section aria-label="Cache summary" className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4 lg:gap-4">
      <MetricCard
        icon={Gauge}
        label="Hit rate"
        value={percent(totals.hitRate)}
        detail={`${count(totals.lookups)} cache lookups`}
        progress={totals.hitRate == null ? null : totals.hitRate * 100}
        progressLabel="Cache hit rate"
      />
      <MetricCard
        icon={Activity}
        label="Hits and misses"
        value={`${count(totals.hit)} / ${count(totals.miss)}`}
        detail="Responses reused / fetched again"
      />
      <MetricCard
        icon={Database}
        label="Stored entries"
        value={`${count(storage.keys)} / ${count(storage.maxKeys)}`}
        detail="Current entries / maximum capacity"
        progress={storage.keyUtilization * 100}
        progressLabel="Cache capacity used"
      />
      <MetricCard
        icon={TriangleAlert}
        label="Cache errors"
        value={count(totals.read_error + totals.write_error)}
        detail={`${count(totals.read_error)} read · ${count(totals.write_error)} write`}
      />
    </section>
  );
}
