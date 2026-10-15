"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getCacheMetrics } from "@/lib/server-actions/cache-metrics-actions";
import { CACHE_EVENTS, deriveCacheView } from "@/lib/cache-metrics.mjs";
import { bypasses, duration } from "./cacheMetricsFormatting";

export default function useCacheMonitoring(initialSnapshot) {
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

  return {
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
  };
}
