"use client";

import { notifyReadError } from "@/lib/client-read-error";

import { format } from "date-fns";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  GraduationCap,
  RotateCcw,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@/contexts/UserContext";
import { canKeepLoadedPages } from "@/lib/see-more-pagination.mjs";
import {
  internshipRecordsInfiniteOptions,
  internshipRecordsKeys,
} from "@/lib/cache/internship-records-queries";
import { mapLocationsKeys } from "@/lib/cache/map-locations-queries";
import { dashboardOverviewKeys } from "@/lib/cache/dashboard-overview-queries";
import RecordsPageHeader from "./RecordsPageHeader";
import RecordsPageFilter from "./RecordsPageFilter";
import { toastAndAction } from "../../lib/helpers";
import { updateInternshipRecordStatus } from "@/lib/server-actions/internship-records-actions";
import ProgressBar from "../ui/ProgressBar";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

const statusMeta = {
  pending: {
    label: "Pending Approval",
    cls: "bg-amber-50 text-amber-700",
    icon: Clock,
  },
  ongoing: { label: "Ongoing", cls: "bg-blue-50 text-blue-700", icon: Clock },
  finished: {
    label: "Finished",
    cls: "bg-emerald-50 text-emerald-700",
    icon: CheckCircle2,
  },
  rejected: {
    label: "Rejected",
    cls: "bg-red-50 text-red-700",
    icon: XCircle,
  },
};

function StatusPill({ status }) {
  const meta = statusMeta[status];
  const Icon = meta.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${meta.cls}`}
    >
      <Icon className="h-3.5 w-3.5" /> {meta.label}
    </span>
  );
}

function RecordsPageContent({
  initialData,
  filter: initialFilter = "all",
  pagination: {
    page: initialPage = 1,
    limit = 10,
    total: initialTotal = 0,
    totalPages: initialTotalPages = 0,
  } = {},
  stats: initialStats = {},
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState(initialFilter);
  const [criteria, setCriteria] = useState({
    status: initialFilter === "all" ? "" : initialFilter,
    search: "",
    limit,
  });
  const [isPending, startTransition] = useTransition();
  const [confirmation, setConfirmation] = useState(null);
  const { user } = useUser();
  const queryClient = useQueryClient();
  const serverSnapshotRef = useRef(initialData);
  const seedCriteria = useMemo(
    () => ({ status: "", search: "", limit }),
    [limit],
  );
  const statusParam = filter === "all" ? "" : filter;

  useEffect(() => {
    const timeout = setTimeout(
      () => setCriteria({ status: statusParam, search: query, limit }),
      500,
    );
    return () => clearTimeout(timeout);
  }, [query, statusParam, limit]);

  const isChangingCriteria =
    criteria.status !== statusParam ||
    criteria.search !== query ||
    criteria.limit !== limit;
  const recordsQuery = useInfiniteQuery({
    ...internshipRecordsInfiniteOptions(user.id, criteria),
    initialData:
      Array.isArray(initialData) &&
      initialFilter === "all" &&
      criteria.status === "" &&
      criteria.search === "" &&
      criteria.limit === limit
        ? {
            pages: [
              {
                data: initialData,
                stats: initialStats,
                pagination: {
                  page: initialPage,
                  limit,
                  total: initialTotal,
                  totalPages: initialTotalPages,
                },
              },
            ],
            pageParams: [1],
          }
        : undefined,
  });

  const records = useMemo(() => {
    const seen = new Set();
    return (recordsQuery.data?.pages ?? []).flatMap((page) =>
      page.data.filter((record) => {
        if (seen.has(record.id)) return false;
        seen.add(record.id);
        return true;
      }),
    );
  }, [recordsQuery.data]);
  const total = recordsQuery.data?.pages[0]?.pagination?.total ?? initialTotal;
  const stats = recordsQuery.data?.pages[0]?.stats ?? initialStats;
  const isLoadingMore = recordsQuery.isFetchingNextPage;
  const isSearching =
    isChangingCriteria ||
    recordsQuery.isPending ||
    recordsQuery.isPlaceholderData;

  useEffect(() => {
    if (recordsQuery.error) {
      notifyReadError("Error loading internship records:", recordsQuery.error);
    }
  }, [recordsQuery.error]);

  useEffect(() => {
    if (!Array.isArray(initialData) || serverSnapshotRef.current === initialData) return;
    serverSnapshotRef.current = initialData;
    queryClient.setQueryData(
      internshipRecordsKeys.list(user.id, seedCriteria),
      (old) => {
        if (!old?.pages?.length) return old;
        const previous = old.pages[0];
        const keepLoaded = canKeepLoadedPages(
          previous.data.map((record) => record.id),
          previous.pagination.total,
          initialData,
          initialTotal,
        );
        const firstPage = {
          data: initialData,
          stats: initialStats,
          pagination: {
            page: initialPage,
            limit,
            total: initialTotal,
            totalPages: initialTotalPages,
          },
        };
        return {
          pages: keepLoaded ? [firstPage, ...old.pages.slice(1)] : [firstPage],
          pageParams: keepLoaded ? old.pageParams : [1],
        };
      },
    );
  }, [
    initialData,
    initialPage,
    initialStats,
    initialTotal,
    initialTotalPages,
    limit,
    queryClient,
    seedCriteria,
    user.id,
  ]);

  function handleStatus(internshipId, status) {
    setConfirmation(null);
    const formData = new FormData();
    formData.append("id", internshipId);
    formData.append("status", status);

    startTransition(async () => {
      const result = await toastAndAction({
        loadingLabel: "Updating record...",
        successLabel: "Record updated.",
        errorLabel: "Failed to update record.",
        action: updateInternshipRecordStatus,
        formData,
      });

      if (result?.success) {
        queryClient.setQueryData(
          internshipRecordsKeys.list(user.id, criteria),
          (old) =>
            old?.pages?.length
              ? {
                  pages: [
                    {
                      ...old.pages[0],
                      data: old.pages[0].data.map((record) =>
                        record.id === internshipId
                          ? { ...record, status }
                          : record,
                      ),
                    },
                  ],
                  pageParams: [1],
                }
              : old,
        );
        await queryClient.invalidateQueries({
          queryKey: internshipRecordsKeys.all(user.id),
        });
        void queryClient.invalidateQueries({ queryKey: mapLocationsKeys.all(user.id) });
        void queryClient.invalidateQueries({ queryKey: dashboardOverviewKeys.role(user.id, user.role) });
      }
    });
  }

  return (
    <div className="space-y-6">
      <ConfirmDialog open={Boolean(confirmation)} onOpenChange={(open) => { if (!open) setConfirmation(null); }} title={`${confirmation?.label || "Update"} internship record?`} description={confirmation ? `This will change ${confirmation.studentName}'s internship status.` : ""} confirmLabel={confirmation?.label || "Confirm"} destructive={confirmation?.status === "rejected"} pending={isPending} onConfirm={() => confirmation && handleStatus(confirmation.id, confirmation.status)} />
      <RecordsPageHeader
        query={query}
        setQuery={setQuery}
        isPending={isSearching}
      />

      <RecordsPageFilter
        filter={filter}
        onSelect={setFilter}
        stats={stats}
        totalItems={total}
      />

      <div className="space-y-3" aria-busy={isSearching}>
          {records.map((r) => (
            <article
              key={r.id}
              className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <Link
                  href={`/internship-records/${r.id}`}
                  className="min-w-0 flex-1 text-left"
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-base sm:text-lg font-bold text-primary-emphasis">
                      {r.student_name}
                    </h2>
                    {r?.student_number && (
                      <span className="text-xs text-muted-foreground">
                        {r.student_number}
                      </span>
                    )}
                    <StatusPill status={r.status} />
                  </div>
                  <p className="mt-1 text-sm text-foreground-soft">
                    {r.internship_position} · {r.company_name}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <GraduationCap className="h-3.5 w-3.5" /> {r.course_name}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays className="h-3.5 w-3.5" />{" "}
                      {format(new Date(r.date_started), "MMMM-dd-yyyy")}{" "}
                      {r?.date_ended
                        ? `- ${format(new Date(r.date_ended), "MMMM-dd-yyyy")}`
                        : ""}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />{" "}
                      {r.accumulated_hours.toFixed(1)}/{r.total_hours} hrs
                    </span>
                  </div>
                </Link>

                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  {r.status === "pending" && (
                    <>
                      <button
                        type="button"
                        disabled={isPending || isSearching}
                        onClick={() => setConfirmation({ id: r.id, studentName: r.student_name, status: "ongoing", label: "Approve" })}
                        className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-600 transition disabled:opacity-50"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        disabled={isPending || isSearching}
                        onClick={() => setConfirmation({ id: r.id, studentName: r.student_name, status: "rejected", label: "Reject" })}
                        className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground-soft hover:bg-muted transition disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {r.status === "rejected" && (
                    <button
                      type="button"
                      disabled={isPending || isSearching}
                      onClick={() => setConfirmation({ id: r.id, studentName: r.student_name, status: "pending", label: "Restore" })}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary-emphasis hover:bg-primary hover:text-white transition disabled:opacity-50"
                    >
                      <RotateCcw className="h-4 w-4" /> Restore
                    </button>
                  )}
                  {r.status === "ongoing" && (
                    <button
                      type="button"
                      disabled={isPending || isSearching}
                      onClick={() => setConfirmation({ id: r.id, studentName: r.student_name, status: "finished", label: "Mark Finished" })}
                      className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground-soft hover:bg-muted transition disabled:opacity-50"
                    >
                      Mark Finished
                    </button>
                  )}
                  <Link
                    href={`/internship-records/${r.id}`}
                    className="rounded-lg bg-primary-50 px-4 py-2 text-sm font-semibold text-primary-emphasis hover:bg-primary-100 transition"
                  >
                    View Record
                  </Link>
                </div>
              </div>

              {r.status !== "pending" && r.status !== "rejected" && (
                <div className="mt-4">
                  <ProgressBar
                    value={Math.min(
                      100,
                      Math.round((r.accumulated_hours / r.total_hours) * 100),
                    )}
                    label="Internship hours completed"
                  />
                </div>
              )}
            </article>
          ))}

          {recordsQuery.isError && records.length === 0 && !isSearching ? (
            <button
              type="button"
              onClick={() => void recordsQuery.refetch()}
              className="text-sm font-medium text-primary-emphasis hover:underline"
            >
              Could not load internship records. Try again.
            </button>
          ) : records.length === 0 && !isSearching ? (
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card px-6 py-16 sm:py-20 text-center">
              <p className="text-sm text-muted-foreground">
                No internship records match your filters.
              </p>
            </div>
          ) : null}
      </div>

      {!isSearching && recordsQuery.hasNextPage && (
        <div className="w-full text-center">
          <button
            type="button"
            onClick={() => void recordsQuery.fetchNextPage()}
            disabled={isLoadingMore}
            className="text-sm sm:text-base font-semibold text-foreground-soft hover:text-primary-emphasis transition disabled:opacity-50"
          >
            {isLoadingMore ? "Loading..." : "See more"}
          </button>
        </div>
      )}
    </div>
  );
}

export default RecordsPageContent;
