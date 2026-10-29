"use client";

import { queryOptions } from "@tanstack/react-query";
import {
  getDepartmentStudentHoursPageResult,
  getEmployerInternsPageResult,
  getPostedJobsResult,
} from "@/lib/server-actions/dashboard-actions";

// Scope lists to the viewer and every page/filter that changes the returned rows.
export const dashboardListsKeys = {
  employerJobsAll: (userId) => ["dashboard", String(userId), "employer-jobs"],
  employerJobs: (userId, page) => [...dashboardListsKeys.employerJobsAll(userId), page],
  employerInternsAll: (userId) => ["dashboard", String(userId), "employer-interns"],
  employerInterns: (userId, { page, status }) => [
    ...dashboardListsKeys.employerInternsAll(userId),
    "by-student",
    status,
    page,
  ],
  studentHours: (userId, { page, courseId, search }) => [
    "dashboard",
    String(userId),
    "student-hours",
    String(courseId),
    search,
    page,
  ],
};

function requirePage(result, collection, message) {
  if (
    !Array.isArray(result?.[collection]) ||
    !Number.isInteger(result?.page) ||
    !Number.isInteger(result?.totalPages) ||
    typeof result?.total !== "number"
  ) {
    throw new Error(result?.error || message);
  }
  return result;
}

// Freshness controls reuse, not a polling interval. Focus/reconnect refreshes are disabled.
const freshness = {
  staleTime: 30_000,
  gcTime: 5 * 60_000,
  retry: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
};

export function employerInternsPageOptions(userId, filters) {
  return queryOptions({
    queryKey: dashboardListsKeys.employerInterns(userId, filters),
    queryFn: async () => requirePage(
      await getEmployerInternsPageResult(filters),
      "interns",
      "Could not load interns. Please try again.",
    ),
    ...freshness,
  });
}

export function employerJobsPageOptions(userId, page) {
  return queryOptions({
    queryKey: dashboardListsKeys.employerJobs(userId, page),
    queryFn: async () => {
      const result = await getPostedJobsResult({ page });
      if (
        !Array.isArray(result?.jobs) ||
        !Number.isInteger(result?.currentPage) ||
        result.currentPage !== page ||
        !Number.isInteger(result?.totalPages) ||
        result.totalPages < 0
      ) {
        throw new Error(result?.error || "Could not load posted jobs. Please try again.");
      }
      return result;
    },
    ...freshness,
  });
}

export function studentHoursPageOptions(userId, filters) {
  return queryOptions({
    queryKey: dashboardListsKeys.studentHours(userId, filters),
    queryFn: async () => requirePage(
      await getDepartmentStudentHoursPageResult({
        page: filters.page,
        courseId: filters.courseId === "all" ? undefined : filters.courseId,
        search: filters.search,
      }),
      "students",
      "Could not load student hours. Please try again.",
    ),
    ...freshness,
  });
}
