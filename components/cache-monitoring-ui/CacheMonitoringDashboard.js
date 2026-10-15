"use client";

import ErrorUI from "@/components/ui/ErrorUI";
import { TriangleAlert } from "lucide-react";
import useCacheMonitoring from "./useCacheMonitoring";
import CacheMonitoringHeader from "./CacheMonitoringHeader";
import CacheProcessStatus from "./CacheProcessStatus";
import CacheMonitoringSummary from "./CacheMonitoringSummary";
import CacheRoutesSection from "./CacheRoutesSection";
import CacheDiagnostics from "./CacheDiagnostics";

export default function CacheMonitoringDashboard({ initialSnapshot }) {
  const {
    snapshot,
    error,
    loading,
    autoRefresh,
    setAutoRefresh,
    search,
    setSearch,
    sortBy,
    setSortBy,
    refresh,
    view,
    routes,
    totals,
    storage,
    period,
  } = useCacheMonitoring(initialSnapshot);

  return (
    <main className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8">
      <CacheMonitoringHeader
        refresh={refresh}
        loading={loading}
        autoRefresh={autoRefresh}
        setAutoRefresh={setAutoRefresh}
      />

      {error && snapshot && (
        <div role="alert" className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-foreground">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden="true" />
          <span>{error}{snapshot ? " Showing the last successful snapshot." : ""}</span>
        </div>
      )}

      {!snapshot ? (
        <ErrorUI error={new Error(error || "Cache metrics are unavailable.")} reset={refresh} logError={false} />
      ) : (
        <>
          <CacheProcessStatus
            snapshot={snapshot}
            processChanged={view.processChanged}
            period={period}
          />

          <CacheMonitoringSummary totals={totals} storage={storage} />

          <CacheRoutesSection
            routes={routes}
            search={search}
            setSearch={setSearch}
            sortBy={sortBy}
            setSortBy={setSortBy}
          />

          <CacheDiagnostics
            totals={totals}
            storage={storage}
            processMemoryBytes={snapshot.processMemoryBytes}
          />

          <p className="text-xs text-foreground-subtle">
            Counters reset when the backend process restarts. This page does not measure database query time, and requests rejected before cache middleware are excluded.
          </p>
        </>
      )}
    </main>
  );
}
