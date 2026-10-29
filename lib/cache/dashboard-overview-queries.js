"use client";

import { queryOptions } from "@tanstack/react-query";
import {
  getAdminDashboardDataResult,
  getDepartmentHeadDashboardDataResult,
  getEmployerDashboardDataResult,
  getStudentDashboardDataResult,
  getStudentDashboardStatsResult,
} from "@/lib/server-actions/dashboard-actions";
import { getMyActivityLogsResult } from "@/lib/server-actions/activity-logs-actions";
import { getUserProfileResult } from "@/lib/server-actions/account-actions";

export const dashboardOverviewKeys = {
  all: (userId) => ["dashboard-overview", String(userId)],
  role: (userId, role) => [...dashboardOverviewKeys.all(userId), role, ...(role === "employer" ? ["interns-by-student"] : [])],
};

const dashboardReads = {
  admin: getAdminDashboardDataResult,
  department_head: getDepartmentHeadDashboardDataResult,
  employer: getEmployerDashboardDataResult,
  student: getStudentDashboardDataResult,
};

function dashboardReadError(result, fallback) {
  const error = new Error(result?.error || fallback);
  error.status = result?.status || 0;
  return error;
}

export function dashboardOverviewOptions(userId, role) {
  return queryOptions({
    queryKey: dashboardOverviewKeys.role(userId, role),
    queryFn: async () => {
      // Read role overview alongside personal activity and role-specific extras. Any
      // failed required read rejects this combined client query; backend optional section
      // fallbacks are already part of a successfully returned overview.
      const [overview, activity, extra] = await Promise.all([
        dashboardReads[role](),
        role === "admin" ? Promise.resolve(null) : getMyActivityLogsResult({ page: 1 }),
        role === "student"
          ? getStudentDashboardStatsResult()
          : role === "employer"
            ? getUserProfileResult()
            : Promise.resolve(null),
      ]);
      if (!overview || overview.error || overview.success === false || typeof overview !== "object") {
        throw dashboardReadError(overview, "Could not load dashboard.");
      }
      if (activity && !Array.isArray(activity?.data)) {
        throw dashboardReadError(activity, "Could not load recent activity.");
      }
      if (extra?.error || extra?.success === false) {
        throw dashboardReadError(extra, "Could not load dashboard details.");
      }
      return { overview, activity, extra };
    },
    staleTime: 15_000,
    gcTime: 5 * 60_000,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}
