"use client";

import { useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, ChevronLeft, ChevronRight, RefreshCw, Search } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { errorGroupsOptions, errorTrackingKeys } from "@/lib/cache/error-tracking-queries";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PageTitle from "@/components/ui/PageTitle";
import PageManual from "@/components/ui/PageManual";
import ErrorUI from "@/components/ui/ErrorUI";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { toastAndAction } from "@/lib/helpers";
import { deleteErrorGroup } from "@/lib/server-actions/error-tracking-actions";
import { removeErrorGroupFromResult } from "@/lib/error-tracking-results.mjs";
import ErrorGroupCard from "./ErrorGroupCard";

function LoadingRows() {
  return <div className="space-y-3" role="status" aria-label="Loading errors">
    {Array.from({ length: 4 }, (_, i) => <div key={i} className="rounded-xl border border-border bg-card p-4 sm:p-5">
      <Skeleton className="h-4 w-2/3 max-w-72" />
      <Skeleton className="mt-3 h-3 w-full max-w-md" />
      <Skeleton className="mt-3 h-3 w-1/2 max-w-48" />
    </div>)}
  </div>;
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
  const [confirmation, setConfirmation] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const deletingRef = useRef(false);
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

  async function confirmDelete() {
    if (!confirmation || deletingRef.current) return;
    const fingerprint = confirmation.fingerprint;
    deletingRef.current = true;
    setIsDeleting(true);
    const queryKey = errorTrackingKeys.all(user?.id);
    try {
      await queryClient.cancelQueries({ queryKey });
      const result = await toastAndAction({
        loadingLabel: "Deleting error group...",
        successLabel: "Error group deleted.",
        errorLabel: "Could not delete the error group.",
        action: deleteErrorGroup,
        args: [fingerprint],
      });
      if (!result?.success) return;
      queryClient.setQueriesData({ queryKey: [...queryKey, "list"] }, old =>
        removeErrorGroupFromResult(old, fingerprint));
      const updated = queryClient.getQueryData(errorTrackingKeys.list(user?.id, filters));
      const lastPage = Math.max(1, updated?.pagination.totalPages ?? page);
      if (page > lastPage) setPage(lastPage);
      setSelected(current => current === fingerprint ? null : current);
      setConfirmation(null);
      queryClient.removeQueries({ queryKey: errorTrackingKeys.detail(user?.id, fingerprint), exact: true });
      await queryClient.invalidateQueries({ queryKey });
    } catch (error) {
      // toastAndAction already replaces its loading toast with the failure.
      console.error("Delete error group failed:", error);
    } finally {
      deletingRef.current = false;
      setIsDeleting(false);
    }
  }

  return <div className="min-w-0 space-y-6 p-4 sm:p-6 lg:p-8">
    <ConfirmDialog
      open={Boolean(confirmation)}
      onOpenChange={(open) => { if (!open && !isDeleting) setConfirmation(null); }}
      title="Delete error group?"
      description={confirmation
        ? 'Delete all recorded occurrences for "' + (confirmation.route_pattern || confirmation.source) + '", including occurrences outside the current filters? This cannot be undone. New errors can still be recorded.'
        : ""}
      confirmLabel="Delete group"
      intent="warning"
      pending={isDeleting}
      onConfirm={confirmDelete}
    />
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <PageTitle Icon={AlertTriangle} title="Error Tracking" description="Investigate unexpected server failures and background job errors." titleAction={<PageManual page="admin-error-tracking" />} />
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
    {query.isError && query.data && <ErrorUI error={query.error} reset={refresh} compact logError={false} />}
    {query.isPending ? <LoadingRows />
      : query.isError && !query.data ? <ErrorUI error={query.error} reset={refresh} logError={false} />
        : query.data.data.length === 0 ? <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">No errors match these filters.</div>
          : <div className="space-y-3">{query.data.data.map(item => (
            <ErrorGroupCard
              key={item.fingerprint}
              item={item}
              userId={user?.id}
              expanded={selected === item.fingerprint}
              onToggle={() => setSelected(current => current === item.fingerprint ? null : item.fingerprint)}
              onDelete={setConfirmation}
              deleting={isDeleting}
            />
          ))}</div>}

    {query.data?.pagination?.totalPages > 1 && <div className="flex items-center justify-end gap-3 text-sm">
      <button type="button" onClick={() => { setPage((value) => Math.max(1, value - 1)); setSelected(null); }} disabled={page <= 1} aria-label="Previous page" className="rounded-md border border-border p-2 disabled:opacity-40"><ChevronLeft className="size-4" /></button>
      <span>Page {page} of {query.data.pagination.totalPages}</span>
      <button type="button" onClick={() => { setPage((value) => value + 1); setSelected(null); }} disabled={page >= query.data.pagination.totalPages} aria-label="Next page" className="rounded-md border border-border p-2 disabled:opacity-40"><ChevronRight className="size-4" /></button>
    </div>}
  </div>;
}
