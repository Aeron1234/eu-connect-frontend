"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, ChevronLeft, ChevronRight, RefreshCw, Search, X } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { errorGroupsOptions, errorGroupOptions, errorTrackingKeys } from "@/lib/cache/error-tracking-queries";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PageTitle from "@/components/ui/PageTitle";

function when(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString();
}

function LoadingRows() {
  return <div className="space-y-3" role="status" aria-label="Loading errors">
    {Array.from({ length: 4 }, (_, i) => <div key={i} className="rounded-xl border border-border bg-card p-4 sm:p-5">
      <Skeleton className="h-4 w-2/3 max-w-72" />
      <Skeleton className="mt-3 h-3 w-full max-w-md" />
      <Skeleton className="mt-3 h-3 w-1/2 max-w-48" />
    </div>)}
  </div>;
}

function ErrorDetails({ fingerprint, userId, onClose }) {
  const query = useQuery({ ...errorGroupOptions(userId, fingerprint), enabled: Boolean(userId && fingerprint) });
  return <section className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-6" aria-label="Error group details">
    <div className="flex items-start justify-between gap-3">
      <div>
        <h2 className="text-base font-semibold text-foreground">Recent occurrences</h2>
        <p className="mt-1 text-xs text-muted-foreground">Group {fingerprint.slice(0, 12)} · up to 25 latest occurrences</p>
      </div>
      <button type="button" onClick={onClose} aria-label="Close details" className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"><X className="size-4" /></button>
    </div>
    {query.isPending ? <div className="mt-5"><LoadingRows /></div>
      : query.isError ? <div role="alert" className="mt-5 text-sm text-muted-foreground">{query.error.message} <button type="button" onClick={() => void query.refetch()} className="font-semibold text-primary-emphasis">Try again</button></div>
        : <div className="mt-5 space-y-3">
          <p className="text-xs text-muted-foreground">{query.data.count} occurrence{query.data.count === 1 ? "" : "s"} · first seen {when(query.data.first_seen)} · last seen {when(query.data.last_seen)}</p>
          {query.data.occurrences.map((item) => <div key={item.id} className="min-w-0 rounded-lg border border-border p-3 text-xs sm:p-4">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-medium text-foreground">
              <span>{when(item.created_at)}</span>
              <span>{item.status_code || item.source}</span>
              {item.method && <span>{item.method} {item.route_pattern}</span>}
            </div>
            <p className="mt-2 break-words text-foreground-soft">{item.message}</p>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground">
              {item.error_code && <span>Code: {item.error_code}</span>}
              {item.code_location && <span className="break-all">Location: {item.code_location}</span>}
              {item.request_id && <span className="break-all">Request ID: {item.request_id}</span>}
              {item.actor_role && <span>Role: {item.actor_role}</span>}
              {item.actor_id && <span className="break-all">User ID: {item.actor_id}</span>}
            </div>
          </div>)}
        </div>}
  </section>;
}

export default function ErrorTrackingDashboard() {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const [days, setDays] = useState("7");
  const [method, setMethod] = useState("");
  const [source, setSource] = useState("");
  const [status, setStatus] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const filters = { days, method, source, status, search, page };
  const query = useQuery({ ...errorGroupsOptions(user?.id, filters), enabled: Boolean(user?.id) });

  function changeFilter(setter, value) {
    setter(value);
    setPage(1);
    setSelected(null);
  }

  function refresh() {
    void queryClient.invalidateQueries({ queryKey: errorTrackingKeys.all(user?.id) });
  }

  return <main className="flex-1 space-y-6 overflow-auto p-4 sm:p-6 lg:p-8">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <PageTitle Icon={AlertTriangle} title="Error Tracking" description="Investigate unexpected server failures and background job errors." />
      <button type="button" onClick={refresh} disabled={query.isFetching} className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted disabled:opacity-50">
        <RefreshCw className={`size-4 ${query.isFetching ? "animate-spin" : ""}`} /> Refresh
      </button>
    </div>
    <p className="text-xs text-muted-foreground">Fatal process crashes may appear only in the hosting logs because database recording cannot be guaranteed during shutdown.</p>

    <form onSubmit={(event) => { event.preventDefault(); changeFilter(setSearch, searchInput.trim()); }} className="grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-2 xl:grid-cols-[1fr_repeat(4,minmax(0,10rem))]">
      <div className="flex min-w-0 items-center gap-2 rounded-md border border-border bg-background px-3">
        <Search className="size-4 shrink-0 text-muted-foreground" />
        <input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search route, code, or message" aria-label="Search errors" className="min-w-0 flex-1 bg-transparent py-2 text-sm outline-none" />
        <button type="submit" className="text-xs font-semibold text-primary-emphasis">Search</button>
      </div>
      <Select value={days} onValueChange={(value) => changeFilter(setDays, value)}>
        <SelectTrigger aria-label="Date range" className="h-10 w-full bg-background px-3"><SelectValue /></SelectTrigger>
        <SelectContent><SelectItem value="1">Last 24 hours</SelectItem><SelectItem value="7">Last 7 days</SelectItem><SelectItem value="30">Last 30 days</SelectItem></SelectContent>
      </Select>
      <Select value={method || "all"} onValueChange={(value) => changeFilter(setMethod, value === "all" ? "" : value)}>
        <SelectTrigger aria-label="HTTP method" className="h-10 w-full bg-background px-3"><SelectValue /></SelectTrigger>
        <SelectContent><SelectItem value="all">All methods</SelectItem>{["GET", "POST", "PUT", "PATCH", "DELETE"].map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
      </Select>
      <Select value={source || "all"} onValueChange={(value) => changeFilter(setSource, value === "all" ? "" : value)}>
        <SelectTrigger aria-label="Source" className="h-10 w-full bg-background px-3"><SelectValue /></SelectTrigger>
        <SelectContent><SelectItem value="all">All sources</SelectItem><SelectItem value="http">HTTP requests</SelectItem><SelectItem value="refreshTokensCleanUp">Token cleanup</SelectItem><SelectItem value="autoCloseStaleShifts">Shift cleanup</SelectItem><SelectItem value="autoCloseStaleShiftsBatch">Shift batch</SelectItem></SelectContent>
      </Select>
      <Select value={status || "all"} onValueChange={(value) => changeFilter(setStatus, value === "all" ? "" : value)}>
        <SelectTrigger aria-label="Status" className="h-10 w-full bg-background px-3"><SelectValue /></SelectTrigger>
        <SelectContent><SelectItem value="all">All statuses</SelectItem><SelectItem value="500">500</SelectItem><SelectItem value="502">502</SelectItem><SelectItem value="503">503</SelectItem><SelectItem value="504">504</SelectItem></SelectContent>
      </Select>
    </form>

    {query.data && <p className="text-xs text-muted-foreground">{query.data.stats.totalOccurrences} occurrences across {query.data.stats.totalGroups} groups in this view.</p>}
    {query.isError && query.data && <p role="alert" className="text-xs text-destructive">Refresh failed. Showing the last loaded results. <button type="button" onClick={refresh} className="font-semibold underline">Try again</button></p>}
    {query.isPending ? <LoadingRows />
      : query.isError && !query.data ? <div role="alert" className="rounded-xl border border-destructive/30 bg-card p-5 text-sm"><p>{query.error.message}</p><button type="button" onClick={refresh} className="mt-2 font-semibold text-primary-emphasis">Try again</button></div>
        : query.data.data.length === 0 ? <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">No errors match these filters.</div>
          : <div className="space-y-3">{query.data.data.map((item) => <div key={item.fingerprint} className="space-y-3"><button type="button" onClick={() => setSelected(selected === item.fingerprint ? null : item.fingerprint)} aria-expanded={selected === item.fingerprint} className={`w-full rounded-xl border bg-card p-4 text-left shadow-sm transition-colors hover:border-primary/50 sm:p-5 ${selected === item.fingerprint ? "border-primary" : "border-border"}`}>
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
              <span className="rounded-full bg-primary/10 px-2 py-1 text-primary-emphasis">{item.status_code || item.source}</span>
              {item.method && <span className="rounded-full bg-muted px-2 py-1 text-foreground-soft">{item.method}</span>}
              <span className="text-muted-foreground">{item.occurrences} time{item.occurrences === 1 ? "" : "s"}</span>
            </div>
            <p className="mt-2 break-all text-sm font-semibold text-foreground">{item.route_pattern || item.source}</p>
            <p className="mt-1 line-clamp-2 break-words text-xs text-foreground-soft sm:text-sm">{item.context ? `${item.context} — ` : ""}{item.message}</p>
            <p className="mt-2 text-xs text-muted-foreground">Last seen {when(item.last_seen)}{item.error_code ? ` · ${item.error_code}` : ""}</p>
          </button>{selected === item.fingerprint && <ErrorDetails fingerprint={selected} userId={user?.id} onClose={() => setSelected(null)} />}</div>)}</div>}

    {query.data?.pagination?.totalPages > 1 && <div className="flex items-center justify-end gap-3 text-sm">
      <button type="button" onClick={() => { setPage((value) => Math.max(1, value - 1)); setSelected(null); }} disabled={page <= 1} aria-label="Previous page" className="rounded-md border border-border p-2 disabled:opacity-40"><ChevronLeft className="size-4" /></button>
      <span>Page {page} of {query.data.pagination.totalPages}</span>
      <button type="button" onClick={() => { setPage((value) => value + 1); setSelected(null); }} disabled={page >= query.data.pagination.totalPages} aria-label="Next page" className="rounded-md border border-border p-2 disabled:opacity-40"><ChevronRight className="size-4" /></button>
    </div>}
  </main>;
}
