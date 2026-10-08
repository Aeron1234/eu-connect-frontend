"use client";

import { queryOptions } from "@tanstack/react-query";
import {
  getDepartmentStudentHoursPageResult,
  getEmployerInternsPageResult,
} from "@/lib/server-actions/dashboard-actions";

export const dashboardListsKeys = {
  employerInterns: (userId, { page, status }) => [
    "dashboard",
    String(userId),
    "employer-interns",
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
