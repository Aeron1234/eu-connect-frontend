"use client";

import { format } from "date-fns";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  GraduationCap,
  Loader2,
  RotateCcw,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import RecordsPageHeader from "./RecordsPageHeader";
import RecordsPageFilter from "./RecordsPageFilter";
import { toastAndAction } from "../_services/helpers";
import {
  updateInternshipRecordStatus,
  getDepartmentInternshipRecords,
} from "../_services/dept-head-actions";
import RecordCardSkeleton from "./RecordCardSkeleton";

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
  initialData = [],
  filter: initialFilter = "all",
  pagination: {
    page: initialPage = 1,
    limit = 10,
    total: initialTotal = 0,
    totalPages: initialTotalPages = 0,
  },
  stats: initialStats = {},
}) {
  const [records, setRecords] = useState(initialData);
  const [query, setQuery] = useState("");
  // Filter is now client state instead of a URL-driven prop, so switching
  // tabs no longer triggers a navigation/route change — it goes through
  // the same debounced fetch + spinner as the search box below.
  const [filter, setFilter] = useState(initialFilter);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [total, setTotal] = useState(initialTotal);
  const [stats, setStats] = useState(initialStats);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isPending, startTransition] = useTransition();

  const requestIdRef = useRef(0);
  const isFirstRun = useRef(true);

  const statusParam = filter === "all" ? "" : filter;

  // Fires on either query or filter changing — a tab click and a search
  // keystroke are treated identically: same debounce, same spinner, same
  // request-race protection via requestIdRef.
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }

    const thisRequestId = ++requestIdRef.current;

    const timeout = setTimeout(async () => {
      setIsSearching(true);
      try {
        const newData = await getDepartmentInternshipRecords({
          status: statusParam,
          search: query,
          page: 1,
          limit,
        });

        if (thisRequestId !== requestIdRef.current) return;

        if (newData?.error) {
          console.error("Error loading filtered records:", newData.error);
          setRecords([]);
          setTotalPages(1);
          setTotal(0);
          setCurrentPage(1);
          return;
        }

        setRecords(newData?.data || []);
        setCurrentPage(1);
        setTotalPages(newData?.pagination?.totalPages || 1);
        setTotal(newData?.pagination?.total || 0);
        if (newData?.stats) setStats(newData.stats);
      } catch (error) {
        if (thisRequestId === requestIdRef.current) {
          console.error("Error loading filtered records:", error);
        }
      } finally {
        if (thisRequestId === requestIdRef.current) setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [query, statusParam, limit]);

  async function handleSeeMore() {
    if (isSearching || isLoadingMore || currentPage >= totalPages) return;
    setIsLoadingMore(true);
    const nextPage = currentPage + 1;
    const thisRequestId = ++requestIdRef.current;

    try {
      const newData = await getDepartmentInternshipRecords({
        status: statusParam,
        search: query,
        page: nextPage,
        limit,
      });

      if (thisRequestId !== requestIdRef.current) return;

      if (newData?.error) {
        console.error("Error loading more records:", newData.error);
        return;
      }

      const incoming = newData?.data || [];

      setRecords((prev) => {
        const existingIds = new Set(prev.map((r) => r.id));
        const filteredNew = incoming.filter((r) => !existingIds.has(r.id));
        return [...prev, ...filteredNew];
      });

      setCurrentPage(nextPage);
      if (newData?.pagination?.totalPages) {
        setTotalPages(newData.pagination.totalPages);
      }
    } catch (error) {
      if (thisRequestId === requestIdRef.current) {
        console.error("Error loading more records:", error);
      }
    } finally {
      if (thisRequestId === requestIdRef.current) setIsLoadingMore(false);
    }
  }

  function handleStatus(internshipId, status) {
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
        setRecords((prev) =>
          prev.map((r) => (r.id === internshipId ? { ...r, status } : r)),
        );
      }
    });
  }

  return (
    <div className="space-y-6">
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

      {isSearching ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <RecordCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {records.map((r) => (
            <article
              key={r.id}
              className="rounded-xl border border-stone-300 bg-white p-4 sm:p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <Link
                  href={`/internship-records/${r.id}`}
                  className="min-w-0 flex-1 text-left"
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-base sm:text-lg font-bold text-primary-500">
                      {r.student_name}
                    </h2>
                    {r?.student_number && (
                      <span className="text-xs text-muted-foreground">
                        {r.student_number}
                      </span>
                    )}
                    <StatusPill status={r.status} />
                  </div>
                  <p className="mt-1 text-sm text-stone-600">
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
                        ? `- ${format(new Date(r.date_started), "MMMM-dd-yyyy")}`
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
                        disabled={isPending}
                        onClick={() => handleStatus(r.id, "ongoing")}
                        className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-600 transition disabled:opacity-50"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleStatus(r.id, "rejected")}
                        className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-600 hover:bg-stone-100 transition disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {r.status === "rejected" && (
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleStatus(r.id, "pending")}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-primary-500 px-4 py-2 text-sm font-semibold text-primary-500 hover:bg-primary-500 hover:text-white transition disabled:opacity-50"
                    >
                      <RotateCcw className="h-4 w-4" /> Restore
                    </button>
                  )}
                  {r.status === "ongoing" && (
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleStatus(r.id, "finished")}
                      className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-600 hover:bg-stone-100 transition disabled:opacity-50"
                    >
                      Mark Finished
                    </button>
                  )}
                  <Link
                    href={`/internship-records/${r.id}`}
                    className="rounded-lg bg-primary-50 px-4 py-2 text-sm font-semibold text-primary-500 hover:bg-primary-100 transition"
                  >
                    View Record
                  </Link>
                </div>
              </div>

              {r.status !== "pending" && r.status !== "rejected" && (
                <div className="mt-4">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-stone-200">
                    <div
                      className="h-full rounded-full bg-primary-500"
                      style={{
                        width: `${Math.min(100, Math.round((r.accumulated_hours / r.total_hours) * 100))}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </article>
          ))}

          {records.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-stone-300 bg-white px-6 py-16 sm:py-20 text-center">
              <p className="text-sm text-stone-500">
                No internship records match your filters.
              </p>
            </div>
          )}
        </div>
      )}

      {!isSearching && currentPage < totalPages && (
        <div className="w-full text-center">
          <button
            type="button"
            onClick={handleSeeMore}
            disabled={isLoadingMore}
            className="text-sm sm:text-base font-semibold text-stone-600 hover:text-primary-500 transition disabled:opacity-50"
          >
            {isLoadingMore ? "Loading..." : "See more"}
          </button>
        </div>
      )}
    </div>
  );
}

export default RecordsPageContent;
