"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Calendar, Clock, Mail, Eye, Users, Loader2 } from "lucide-react";
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
    internshipId: row.internship_id,
    id: row.student_id,
    name: `${row.first_name || ""} ${row.last_name || ""}`.trim() || "Unknown",
    status: row.status === "finished" ? "completed" : row.status,
    role: row.internship_position,
    program: row.course_name || "—",
    programShort: row.short_name || "",
    startDate: row.date_started,
    hoursCompleted: Number(row.accumulated_hours) || 0,
    hoursRequired: Number(row.total_hours) || 0,
    email: row.email,
  };
}

function InternsSupervisedCard({ initialPage }) {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const [query, setQuery] = useState({ page: 1, status: "all" });
  const pageQuery = useQuery({
    ...employerInternsPageOptions(user?.id, query),
    enabled: Boolean(user?.id),
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
  const hasError = pageQuery.isError;
  const pageData = pageQuery.data;
  const interns = (pageData?.interns || []).map(mapIntern);

  return (
    <div className="h-full min-w-0 rounded-xl bg-card border border-border shadow-sm p-5 sm:p-6">
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

      <div className="space-y-3" aria-live="polite" aria-busy={isLoading}>
        {isLoading ? (
          <p className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground" role="status">
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Loading interns...
          </p>
        ) : hasError ? (
          <div className="py-6 text-center text-sm">
            <p className="text-red-600">
              {pageQuery.error?.message || "Could not load interns. Please try again."}
            </p>
            <button
              type="button"
              onClick={() => void pageQuery.refetch()}
              className="mt-2 font-medium text-primary-emphasis hover:underline"
            >
              Try again
            </button>
          </div>
        ) : interns.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No interns in this category.
          </p>
        ) : (
          interns.map((intern) => (
            <div
              key={intern.internshipId}
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
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${statusBadgeStyles[intern.status] || "bg-muted text-foreground-soft"}`}
                    >
                      {intern.status}
                    </span>
                  </div>
                  <p
                    className="mt-0.5 break-words text-xs text-muted-foreground"
                    title={intern.programShort || undefined}
                  >
                    {intern.role} · {intern.program}
                  </p>
                  <div className="flex items-center flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-foreground-soft">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(intern.startDate)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {intern.hoursCompleted?.toFixed(1)}/{intern.hoursRequired}{" "}
                      hrs
                    </span>
                    <span className="flex min-w-0 items-start gap-1">
                      <Mail className="mt-0.5 w-3.5 h-3.5 shrink-0" />
                      <span className="break-all">{intern.email}</span>
                    </span>
                  </div>
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
            className="rounded-md px-2 py-1 font-medium text-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>
          <span>Page {pageData?.page ?? 1} / {pageData?.totalPages ?? 1}</span>
          <button
            type="button"
            onClick={() => setQuery((current) => ({ ...current, page: current.page + 1 }))}
            disabled={isLoading || hasError || query.page >= (pageData?.totalPages ?? 1)}
            className="rounded-md px-2 py-1 font-medium text-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default InternsSupervisedCard;
