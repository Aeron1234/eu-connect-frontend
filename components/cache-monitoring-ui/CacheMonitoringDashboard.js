"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  Database,
  Gauge,
  HardDrive,
  RefreshCw,
  Search,
  Server,
  TriangleAlert,
} from "lucide-react";
import PageTitle from "@/components/ui/PageTitle";
import ProgressBar from "@/components/ui/ProgressBar";
import { getCacheMetrics } from "@/lib/server-actions/cache-metrics-actions";
import { CACHE_EVENTS, deriveCacheView } from "@/lib/cache-metrics.mjs";

const number = new Intl.NumberFormat();
const count = (value) => number.format(Number(value) || 0);
const percent = (value) => value == null ? "No data yet" : `${Math.round(value * 100)}%`;
const bytes = (value) => {
  const size = Number(value) || 0;
  if (size < 1024) return `${count(size)} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};
const dateTime = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Unknown" : date.toLocaleString();
};
const duration = (seconds) => {
  const total = Math.max(0, Math.floor(Number(seconds) || 0));
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  return [days && `${days}d`, hours && `${hours}h`, `${minutes}m`].filter(Boolean).join(" ");
};

const skipFields = [
  ["Non-success response", "skip_status"],
  ["Controller opted out", "skip_opt_out"],
  ["Set-Cookie response", "skip_cookie"],
  ["Invalidated during read", "skip_generation"],
  ["Response too large", "skip_oversized"],
  ["Could not serialize", "skip_serialization"],
];
const bypasses = (row) => row.bypass_method + row.bypass_identity + row.bypass_disabled;

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

function CounterRow({ label, value, format = count }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/70 py-2.5 last:border-0">
      <span className="text-sm text-foreground-soft">{label}</span>
      <span className="font-semibold tabular-nums text-foreground">{format(value)}</span>
    </div>
  );
}

function RateCell({ row }) {
  if (!row.lookups) return <span className="text-foreground-subtle">—</span>;
  return (
    <div className="min-w-24">
      <span className="font-semibold tabular-nums text-foreground">{percent(row.hitRate)}</span>
      <ProgressBar value={row.hitRate * 100} label={`${row.route} hit rate`} size="sm" className="mt-1.5" />
    </div>
  );
}

export default function CacheMonitoringDashboard({ initialSnapshot }) {
  const initialData = initialSnapshot?.error ? null : initialSnapshot;
  const [snapshot, setSnapshot] = useState(initialData);
  const [previous, setPrevious] = useState(null);
  const [error, setError] = useState(initialSnapshot?.error || "");
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("miss");
  const snapshotRef = useRef(initialData);
  const inFlight = useRef(false);

  const refresh = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setLoading(true);
    try {
      const next = await getCacheMetrics();
      if (next?.error) {
        setError(next.error);
      } else if (next?.startedAt && next?.totals && Array.isArray(next?.routes)) {
        setPrevious(snapshotRef.current);
        snapshotRef.current = next;
        setSnapshot(next);
        setError("");
      } else {
        setError("The server returned incomplete cache metrics.");
      }
    } catch {
      setError("Could not refresh cache monitoring. Please try again.");
    } finally {
      inFlight.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    const timer = setInterval(refresh, 30_000);
    return () => clearInterval(timer);
  }, [autoRefresh, refresh]);

  const view = useMemo(() => deriveCacheView(snapshot, previous), [snapshot, previous]);
  const routes = useMemo(() => {
    if (!view) return [];
    const rows = view.routes.filter((row) => {
      const active = CACHE_EVENTS.some((event) => row[event] > 0);
      return active && row.route.toLowerCase().includes(search.trim().toLowerCase());
    });
    rows.sort((a, b) => {
      if (sortBy === "route") return a.route.localeCompare(b.route);
      if (sortBy === "lookups") return b.lookups - a.lookups || b.miss - a.miss;
      if (sortBy === "bypass") return bypasses(b) - bypasses(a) || b.miss - a.miss;
      return b.miss - a.miss || b.lookups - a.lookups;
    });
    return rows;
  }, [view, search, sortBy]);

  const totals = view?.totals;
  const storage = snapshot?.storage;
  const intervalSeconds = view?.interval
    ? Math.max(0, Math.round((Date.parse(snapshot.sampledAt) - Date.parse(previous.sampledAt)) / 1000))
    : 0;
  const period = view?.interval
    ? `Since last refresh${Number.isFinite(intervalSeconds) && intervalSeconds > 0 ? ` · ${duration(intervalSeconds)}` : ""}`
    : "Since process start";

  return (
    <main className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <PageTitle
          Icon={Gauge}
          title="Cache Monitoring"
          description="See how the backend cache is behaving during real traffic."
        />
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={refresh}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />
            {loading ? "Refreshing..." : "Refresh"}
          </button>
          <button
            type="button"
            aria-pressed={autoRefresh}
            onClick={() => setAutoRefresh((enabled) => !enabled)}
            className={`rounded-md border px-4 py-2.5 text-sm font-semibold transition-colors ${
              autoRefresh
                ? "border-primary bg-primary/10 text-primary-emphasis"
                : "border-border bg-card text-foreground hover:bg-muted"
            }`}
          >
            Auto-refresh {autoRefresh ? "on · 30s" : "off"}
          </button>
        </div>
      </div>

      {error && (
        <div role="alert" className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-foreground">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden="true" />
          <span>{error}{snapshot ? " Showing the last successful snapshot." : ""}</span>
        </div>
      )}

      {!snapshot ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center shadow-sm">
          <Server className="mx-auto h-9 w-9 text-primary-emphasis" aria-hidden="true" />
          <p className="mt-3 font-semibold text-foreground">Cache metrics are unavailable</p>
          <p className="mt-1 text-sm text-foreground-soft">Try refreshing after the backend is reachable.</p>
        </div>
      ) : (
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

          {view.processChanged && (
            <div role="status" className="rounded-xl border border-border bg-muted px-4 py-3 text-sm text-foreground-soft">
              The backend process changed or restarted. Interval comparisons have reset.
            </div>
          )}

          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary-emphasis" aria-hidden="true" />
            <h2 className="text-sm font-semibold text-foreground">{period}</h2>
          </div>

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

          <section className="rounded-xl border border-border bg-card shadow-sm">
            <div className="flex flex-col gap-4 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <div>
                <h2 className="font-semibold text-foreground">Routes using the cache</h2>
                <p className="mt-1 text-xs text-foreground-soft">Only route templates are shown; user IDs and query strings are excluded.</p>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-subtle" aria-hidden="true" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search routes"
                  aria-label="Search cache routes"
                  className="w-full rounded-md border border-input bg-card py-2 pl-9 pr-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2 border-b border-border px-4 py-3 sm:px-5">
              {[["miss", "Most misses"], ["lookups", "Most lookups"], ["bypass", "Most bypasses"], ["route", "Route A–Z"]].map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  aria-pressed={sortBy === key}
                  onClick={() => setSortBy(key)}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                    sortBy === key ? "bg-primary text-primary-foreground" : "bg-muted text-foreground-soft hover:text-foreground"
                  }`}
                >{label}</button>
              ))}
            </div>

            {routes.length === 0 ? (
              <p className="p-8 text-center text-sm text-foreground-soft">
                {search ? "No routes match your search." : "No cache activity in this period yet."}
              </p>
            ) : (
              <>
                <div className="space-y-2 p-4 md:hidden">
                  {routes.map((row) => (
                    <div key={row.route} className="rounded-lg border border-border bg-muted/40 p-3">
                      <p className="break-all text-sm font-semibold text-foreground">{row.route}</p>
                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-foreground-soft">
                        <span>Hit rate <strong className="block text-sm text-foreground">{percent(row.hitRate)}</strong></span>
                        <span>Misses <strong className="block text-sm text-foreground">{count(row.miss)}</strong></span>
                        <span>Hits <strong className="block text-sm text-foreground">{count(row.hit)}</strong></span>
                        <span>Stores <strong className="block text-sm text-foreground">{count(row.store)}</strong></span>
                        <span>Bypasses <strong className="block text-sm text-foreground">{count(bypasses(row))}</strong></span>
                      </div>
                      {row.lookups > 0 && <ProgressBar value={row.hitRate * 100} label={`${row.route} hit rate`} size="sm" className="mt-3" />}
                    </div>
                  ))}
                </div>
                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full min-w-[740px] text-left text-sm">
                    <thead className="bg-muted/60 text-xs text-foreground-soft">
                      <tr>
                        <th scope="col" className="px-5 py-3 font-semibold">Route</th>
                        <th scope="col" className="px-4 py-3 font-semibold">Hit rate</th>
                        <th scope="col" className="px-4 py-3 text-right font-semibold">Hits</th>
                        <th scope="col" className="px-4 py-3 text-right font-semibold">Misses</th>
                        <th scope="col" className="px-4 py-3 text-right font-semibold">Bypasses</th>
                        <th scope="col" className="px-5 py-3 text-right font-semibold">Stores</th>
                      </tr>
                    </thead>
                    <tbody>
                      {routes.map((row) => (
                        <tr key={row.route} className="border-t border-border">
                          <td className="break-all px-5 py-3 font-medium text-foreground">{row.route}</td>
                          <td className="px-4 py-3"><RateCell row={row} /></td>
                          <td className="px-4 py-3 text-right tabular-nums text-foreground">{count(row.hit)}</td>
                          <td className="px-4 py-3 text-right tabular-nums text-foreground">{count(row.miss)}</td>
                          <td className="px-4 py-3 text-right tabular-nums text-foreground">{count(bypasses(row))}</td>
                          <td className="px-5 py-3 text-right tabular-nums text-foreground">{count(row.store)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </section>

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
                    <span className="font-semibold text-foreground">{bytes(snapshot.processMemoryBytes?.heapUsed)}</span>
                  </div>
                </div>
                <p className="mt-2 text-xs text-foreground-subtle">
                  Cache size figures are estimates. Process heap includes the whole backend, not just cached responses.
                </p>
              </section>
            </div>
          </div>

          <p className="text-xs text-foreground-subtle">
            Counters reset when the backend process restarts. This page does not measure database query time, and requests rejected before cache middleware are excluded.
          </p>
        </>
      )}
    </main>
  );
}
