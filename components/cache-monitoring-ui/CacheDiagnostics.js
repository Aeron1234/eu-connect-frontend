import { HardDrive } from "lucide-react";
import { count, bytes, skipFields } from "./cacheMetricsFormatting";

function CounterRow({ label, value, format = count }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/70 py-2.5 last:border-0">
      <span className="text-sm text-foreground-soft">{label}</span>
      <span className="font-semibold tabular-nums text-foreground">{format(value)}</span>
    </div>
  );
}

export default function CacheDiagnostics({ totals, storage, processMemoryBytes }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5">
        <h2 className="font-semibold text-foreground">Bypasses and skipped stores</h2>
        <p className="mt-1 text-xs text-foreground-soft">Reasons a request or response did not use the cache.</p>
        <div className="mt-3">
          <CounterRow label="Caching disabled" value={totals.bypass_disabled} />
          <CounterRow label="Missing verified identity" value={totals.bypass_identity} />
          <CounterRow label="Other request method" value={totals.bypass_method} />
          {skipFields.map(([label, event]) => <CounterRow key={event} label={label} value={totals[event]} />)}
        </div>
      </section>
      <div className="space-y-4">
        <section className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5">
          <h2 className="font-semibold text-foreground">Cache turnover</h2>
          <div className="mt-3">
            <CounterRow label="Successful stores" value={totals.store} />
            <CounterRow label="Invalidation calls" value={totals.invalidation_calls} />
            <CounterRow label="Entries invalidated" value={totals.invalidated_entries} />
            <CounterRow label="Entries expired" value={totals.expired_entries} />
            <CounterRow label="Whole-cache flushes" value={totals.flushes} />
          </div>
        </section>
        <section className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5">
          <div className="flex items-center gap-2">
            <HardDrive className="h-4 w-4 text-primary-emphasis" aria-hidden="true" />
            <h2 className="font-semibold text-foreground">Storage and process memory</h2>
          </div>
          <div className="mt-3">
            <CounterRow label="Estimated cache keys" value={storage.estimatedKeyBytes} format={bytes} />
            <CounterRow label="Estimated cache values" value={storage.estimatedValueBytes} format={bytes} />
            <div className="flex justify-between gap-3 py-2.5 text-sm">
              <span className="text-foreground-soft">Process heap used</span>
              <span className="font-semibold text-foreground">{bytes(processMemoryBytes?.heapUsed)}</span>
            </div>
          </div>
          <p className="mt-2 text-xs text-foreground-subtle">
            Cache size figures are estimates. Process heap includes the whole backend, not just cached responses.
          </p>
        </section>
      </div>
    </div>
  );
}
