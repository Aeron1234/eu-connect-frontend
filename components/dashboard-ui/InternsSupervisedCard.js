"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Calendar, Clock, Mail, Eye, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import ErrorUI from "@/components/ui/ErrorUI";
import Link from "next/link";
import { useUser } from "@/contexts/UserContext";
import {
  dashboardListsKeys,
  employerInternsPageOptions,
} from "@/lib/cache/dashboard-lists-queries";

const statusBadgeStyles = {
  ongoing: "text-blue-700 bg-blue-50",
  completed: "text-emerald-700 bg-emerald-50",
  pending: "text-amber-700 bg-amber-50",
  rejected: "text-red-700 bg-red-50",
};

// Completed is the display label for the backend's finished status. These filters
// browse employer assignments; request acceptance remains in Notifications.
const filters = [
  { label: "All", status: "all" },
  { label: "Ongoing", status: "ongoing" },
  { label: "Completed", status: "finished" },
];

function formatDate(dateString) {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function mapIntern(row) {
  return {
    id: row.student_id,
    name: [row.first_name, row.last_name].filter(Boolean).join(" ").trim() || "Unknown",
    program: row.course_name || "-",
    programShort: row.short_name || "",
    email: row.email,
    placements: row.placements || [row],
  };
}

function InternsSupervisedCard({ initialPage }) {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const [query, setQuery] = useState({ page: 1, status: "all" });
  const pageQuery = useQuery({
    ...employerInternsPageOptions(user?.id, query),
    enabled: Boolean(user?.id),
    // The overview seeds only the unfiltered first page. Other statuses/pages must
    // load under their own keys rather than reusing that initial result.
    initialData: query.page === 1 && query.status === "all"
      ? initialPage
      : undefined,
  });

  useEffect(() => {
    if (!user?.id || !initialPage) return;
    queryClient.setQueryData(
      dashboardListsKeys.employerInterns(user.id, { page: 1, status: "all" }),
      initialPage,
    );
  }, [initialPage, queryClient, user?.id]);

  const isLoading = pageQuery.isPending;
  const hasError = pageQuery.isError && !pageQuery.data;
  const pageData = pageQuery.data;
  const interns = (pageData?.interns || []).map(mapIntern);

  return (
    <div className="flex h-full min-w-0 flex-col rounded-xl bg-card border border-border shadow-sm p-5 sm:p-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Users className="w-4 h-4 text-primary-emphasis" />
          Interns You Supervised
        </h3>
        <div className="flex items-center gap-1.5">
          {filters.map((filter) => (
            <button
              key={filter.status}
              type="button"
              onClick={() => setQuery({ page: 1, status: filter.status })}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                query.status === filter.status
                  ? "bg-primary text-white"
                  : "bg-muted text-foreground-soft hover:bg-secondary"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {pageQuery.isError && (
        <ErrorUI error={pageQuery.error} reset={() => void pageQuery.refetch()} compact logError={false} />
      )}
      <div className="flex-1 space-y-3" aria-live="polite" aria-busy={isLoading}>
        {isLoading ? (
          Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="flex items-center gap-3 rounded-lg border border-border p-4" role="status" aria-label="Loading interns">
              <Skeleton className="size-10 shrink-0 rounded-full" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-3.5 w-36" />
                <Skeleton className="h-3 w-48 max-w-full" />
                <Skeleton className="h-2.5 w-28" />
              </div>
              <Skeleton className="h-3 w-16" />
            </div>
          ))
        ) : hasError ? null : interns.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No interns in this category.
          </p>
        ) : (
          interns.map((intern) => (
            <div
              key={intern.id}
              className="flex w-full min-w-0 flex-col items-start justify-between gap-3 rounded-lg border border-border p-4 sm:flex-row sm:items-center"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-10 h-10 flex-shrink-0 rounded-full bg-primary-50 text-primary-700 flex items-center justify-center text-xs font-semibold">
                  {intern.name
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-foreground">
                      {intern.name}
                    </p>

                  </div>
                  <p
                    className="mt-0.5 break-words text-xs text-muted-foreground"
                    title={intern.programShort || undefined}
                  >
                    {intern.program}
                  </p>
                  {intern.email && <p className="mt-2 flex min-w-0 items-start gap-1 text-xs text-foreground-soft"><Mail className="mt-0.5 size-3.5 shrink-0" /><span className="break-all">{intern.email}</span></p>}
                  <ul aria-label={`Internship positions of ${intern.name}`} className="mt-3 space-y-3">
                    {intern.placements.map((placement) => {
                      const status = placement.status === "finished" ? "completed" : placement.status;
                      return <li key={placement.internship_id} className="border-l-2 border-border pl-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="break-words text-xs font-medium text-foreground">{placement.internship_position || "Intern"}</p>
                          <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${statusBadgeStyles[status] || "bg-muted text-foreground-soft"}`}>{status}</span>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-foreground-soft">
                          <span className="flex items-center gap-1"><Calendar className="size-3.5" />{formatDate(placement.date_started)}</span>
                          <span className="flex items-center gap-1"><Clock className="size-3.5" />{(Number(placement.accumulated_hours) || 0).toFixed(1)}/{Number(placement.total_hours) || 0} hrs</span>
                        </div>
                      </li>;
                    })}
                  </ul>
                </div>
              </div>
              <Link
                href={`/users/${encodeURIComponent(intern.id)}`}
                className="flex-shrink-0 flex items-center gap-1.5 text-xs font-medium text-primary-emphasis hover:text-primary-600 transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                View profile
              </Link>
            </div>
          ))
        )}
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3 text-xs text-muted-foreground">
        <span>
          {isLoading ? "Loading..." : hasError ? "Unavailable" : `${pageData?.total ?? 0} intern${pageData?.total === 1 ? "" : "s"}`}
        </span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setQuery((current) => ({ ...current, page: current.page - 1 }))}
            disabled={isLoading || hasError || query.page <= 1}
            aria-label="Previous supervised interns page"
            className="grid size-9 place-items-center rounded-md text-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
          </button>
          <span>Page {pageData?.page ?? 1} / {pageData?.totalPages ?? 1}</span>
          <button
            type="button"
            onClick={() => setQuery((current) => ({ ...current, page: current.page + 1 }))}
            disabled={isLoading || hasError || query.page >= (pageData?.totalPages ?? 1)}
            aria-label="Next supervised interns page"
            className="grid size-9 place-items-center rounded-md text-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default InternsSupervisedCard;
