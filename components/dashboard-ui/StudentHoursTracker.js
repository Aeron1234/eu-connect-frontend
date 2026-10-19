"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Clock, AlertTriangle } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import {
  dashboardListsKeys,
  studentHoursPageOptions,
} from "@/lib/cache/dashboard-lists-queries";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ProgressBar from "../ui/ProgressBar";
import { Skeleton } from "@/components/ui/skeleton";
import ErrorUI from "@/components/ui/ErrorUI";

function StudentHoursTracker({ initialPage, courses = [] }) {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const listRef = useRef(null);
  const [courseFilter, setCourseFilter] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState({ page: 1, courseId: "all", search: "" });
  const pageQuery = useQuery({
    ...studentHoursPageOptions(user?.id, query),
    enabled: Boolean(user?.id),
    initialData: query.page === 1 && query.courseId === "all" && !query.search
      ? initialPage
      : undefined,
  });
  const isLoading = pageQuery.isPending;
  const isSearchPending = searchInput.trim() !== query.search;
  const isPending = isSearchPending || isLoading;
  const loadingMessage = isSearchPending
    ? "Searching students..."
    : "Loading student hours...";
  const pageData = pageQuery.data;
  const hasError = pageQuery.isError && !pageData;

  useEffect(() => {
    if (!user?.id || !initialPage) return;
    queryClient.setQueryData(
      dashboardListsKeys.studentHours(user.id, {
        page: 1,
        courseId: "all",
        search: "",
      }),
      initialPage,
    );
  }, [initialPage, queryClient, user?.id]);

  useEffect(() => {
    const search = searchInput.trim();
    if (search === query.search) return;
    const timer = setTimeout(() => {
      setQuery((current) => ({ ...current, page: 1, search }));
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput, query.search]);

  function changeCourse(value) {
    setCourseFilter(value);
    setQuery({ page: 1, courseId: value, search: searchInput.trim() });
    listRef.current?.scrollTo({ top: 0 });
  }

  function changePage(offset) {
    setQuery((current) => ({ ...current, page: current.page + offset }));
    listRef.current?.scrollTo({ top: 0 });
  }

  return (
    <div className="min-w-0 rounded-xl bg-card border border-border shadow-sm p-5 sm:p-6 h-full">
      <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Clock className="w-4 h-4 text-primary-emphasis" />
            Student Hours Tracker
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Individual hours progress of all active interns
          </p>
        </div>

        <Select value={courseFilter} onValueChange={changeCourse}>
          <SelectTrigger className="h-8 w-[150px] text-xs px-2">
            <SelectValue placeholder="All Courses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-xs">
              All Courses
            </SelectItem>
            {courses.map((c) => (
              <SelectItem key={c.id} value={String(c.id)} className="text-xs">
                {c.short_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mb-4">
        <input
          type="search"
          value={searchInput}
          onChange={(event) => {
            const value = event.target.value;
            const search = value.trim();
            setSearchInput(value);
            if (user?.id && queryClient.getQueryData(dashboardListsKeys.studentHours(user.id, {
              page: 1,
              courseId: courseFilter,
              search,
            })) !== undefined) {
              setQuery({ page: 1, courseId: courseFilter, search });
            }
            listRef.current?.scrollTo({ top: 0 });
          }}
          placeholder="Search student name"
          aria-label="Search student name"
          aria-busy={isPending}
          maxLength={100}
          className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        />
      </div>

      {!isPending && pageQuery.isError && (
        <ErrorUI error={pageQuery.error} reset={() => void pageQuery.refetch()} compact logError={false} />
      )}
      <div
        ref={listRef}
        className="min-w-0 space-y-3 max-h-[420px] overflow-x-hidden overflow-y-auto pr-1"
        aria-live="polite"
        aria-busy={isPending}
      >
        {isPending ? (
          Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="rounded-lg border border-border p-3 sm:p-4" role="status" aria-label={loadingMessage}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-2">
                  <Skeleton className="h-3.5 w-36" />
                  <Skeleton className="h-2.5 w-24" />
                </div>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-2 w-28 rounded-full sm:w-36" />
                  <Skeleton className="h-2.5 w-8" />
                </div>
              </div>
            </div>
          ))
        ) : hasError ? null : !pageData?.students?.length ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            {query.courseId === "all" && !query.search
              ? "No active interns yet."
              : "No matching students."}
          </p>
        ) : (
          pageData.students.map((s) => {
            const pct =
              s.total_hours > 0
                ? Math.round((s.accumulated_hours / s.total_hours) * 100)
                : 0;

            return (
              <div
                key={s.id}
                className="min-w-0 rounded-lg border border-border p-3 sm:p-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/users/${encodeURIComponent(s.student_id)}`}
                        className="text-sm font-semibold text-foreground truncate hover:text-primary-emphasis hover:underline focus-visible:underline"
                      >
                        {s.name}
                      </Link>
                      <span className="rounded-full bg-muted border border-border px-2 py-0.5 text-[11px] font-medium text-foreground-soft">
                        {s.course}
                      </span>
                      {s.atRisk && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-50 text-red-600 px-2 py-0.5 text-[11px] font-medium">
                          <AlertTriangle className="w-3 h-3" />
                          At risk
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 break-words text-xs text-muted-foreground">
                      {s.company}
                    </p>
                  </div>

                  <div className="flex min-w-0 w-full flex-col-reverse gap-2 xl:w-auto xl:flex-row xl:items-center xl:gap-3">
                    <div className="flex min-w-0 w-full items-center gap-3 xl:w-auto">
                      <ProgressBar
                        value={pct}
                        label={`${s.name} internship hours completed`}
                        className="min-w-0 flex-1 xl:w-36 xl:flex-none"
                      />
                      <span className="w-9 shrink-0 text-right text-xs font-semibold text-foreground">
                        {pct}%
                      </span>
                    </div>
                    <span className="flex min-w-0 items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
                      <Clock className="w-3 h-3 shrink-0" />
                      {Number(s.accumulated_hours).toFixed(1)}/{s.total_hours}h
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3 text-xs text-muted-foreground">
        <span>
          {isPending
            ? "Loading..."
            : hasError
              ? "Unavailable"
              : `${pageData?.total ?? 0} active intern${pageData?.total === 1 ? "" : "s"}`}
        </span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => changePage(-1)}
            disabled={isPending || hasError || query.page <= 1}
            className="rounded-md px-2 py-1 font-medium text-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>
          <span>
            Page {pageData?.page ?? 1} / {pageData?.totalPages ?? 1}
          </span>
          <button
            type="button"
            onClick={() => changePage(1)}
            disabled={
              isPending ||
              hasError ||
              query.page >= (pageData?.totalPages ?? 1)
            }
            className="rounded-md px-2 py-1 font-medium text-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default StudentHoursTracker;
