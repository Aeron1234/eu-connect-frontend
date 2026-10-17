"use client";

import ErrorUI from "@/components/ui/ErrorUI";
import { Activity, ScrollText, TriangleAlert } from "lucide-react";
import PageTitle from "../ui/PageTitle";
import PageManual from "../ui/PageManual";
import ActivityLogsTableSkeleton from "../skeletons/ActivityLogsTableSkeleton";
import useActivityLogsManager from "./useActivityLogsManager";
import ActivityLogsSummary from "./ActivityLogsSummary";
import ActivityLogsFilters from "./ActivityLogsFilters";
import ActivityLogsTable from "./ActivityLogsTable";
import ActivityLogsBatchDelete from "./ActivityLogsBatchDelete";

export default function ActivityLogsManager({ initialPage }) {
  const {
    logsQuery,
    logs,
    stats,
    total,
    isFiltering,
    isChangingFilters,
    isDeleting,
    isBatchDeleting,
    handleBatchDelete,
    query,
    setQuery,
    actorRole,
    setActorRole,
    targetType,
    setTargetType,
    actorRoleOptions,
    targetTypeOptions,
    showCachedFilters,
    handleSeeMore,
    handleDelete,
  } = useActivityLogsManager(initialPage);

  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <PageTitle
        Icon={Activity}
        title={"Activity Logs"}
        description={
          "Audit every action taken across EU-Connect — logins, approvals, uploads, and administrative changes."
        }
        titleAction={<PageManual page="admin-activity-logs" />}
        />
        <div className="shrink-0">
          <ActivityLogsBatchDelete disabled={isDeleting} pending={isBatchDeleting} onDelete={handleBatchDelete} />
        </div>
      </div>

      <ActivityLogsSummary total={total} stats={stats} />

      {/* Filters */}
      <ActivityLogsFilters
        query={query}
        setQuery={setQuery}
        actorRole={actorRole}
        setActorRole={setActorRole}
        targetType={targetType}
        setTargetType={setTargetType}
        actorRoleOptions={actorRoleOptions}
        targetTypeOptions={targetTypeOptions}
        showCachedFilters={showCachedFilters}
      />

      {/* Table */}
      {!isChangingFilters && logsQuery.error && logsQuery.data && (
        <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm">
          <span className="flex items-center gap-2 text-foreground-soft">
            <TriangleAlert className="size-4 text-destructive" aria-hidden="true" />
            {logsQuery.error.message || "Activity logs could not be updated."}
          </span>
          <button
            type="button"
            onClick={() => logsQuery.isFetchNextPageError ? logsQuery.fetchNextPage() : logsQuery.refetch()}
            className="font-semibold text-primary-emphasis hover:underline"
          >
            Try again
          </button>
        </div>
      )}

      {isFiltering ? (
        <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
          <ActivityLogsTableSkeleton />
        </div>
      ) : logsQuery.error && !logsQuery.data ? (
        <ErrorUI error={logsQuery.error} reset={() => void logsQuery.refetch()} logError={false} />
      ) : logsQuery.error && logs.length === 0 ? null : logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card px-6 py-16 sm:py-24 text-center shadow-sm">
          <ScrollText className="size-8 text-foreground-faint" />
          <p className="text-sm font-medium text-muted-foreground">
            No activity found
          </p>
          <p className="max-w-sm text-xs text-foreground-subtle">
            Try a different filter or clear the search.
          </p>
        </div>
      ) : (
        <ActivityLogsTable
          logs={logs}
          handleDelete={handleDelete}
          isDeleting={isDeleting}
        />
      )}

      {!isFiltering && logsQuery.hasNextPage && (
        <div className="text-center">
          <button
            type="button"
            onClick={handleSeeMore}
            disabled={isDeleting || logsQuery.isFetching}
            className="text-sm font-semibold text-foreground-soft hover:text-primary-emphasis transition disabled:opacity-50"
          >
            {logsQuery.isFetchingNextPage ? "Loading..." : "See more"}
          </button>
        </div>
      )}
    </main>
  );
}
