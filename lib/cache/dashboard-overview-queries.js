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
  role: (userId, role) => [...dashboardOverviewKeys.all(userId), role],
};

const dashboardReads = {
  admin: getAdminDashboardDataResult,
  department_head: getDepartmentHeadDashboardDataResult,
  employer: getEmployerDashboardDataResult,
  student: getStudentDashboardDataResult,
};

export function dashboardOverviewOptions(userId, role) {
  return queryOptions({
    queryKey: dashboardOverviewKeys.role(userId, role),
    queryFn: async () => {
      const [overview, activity, extra] = await Promise.all([
        dashboardReads[role](),
        role === "admin" ? Promise.resolve(null) : getMyActivityLogsResult({ page: 1 }),
        role === "student"
          ? getStudentDashboardStatsResult()
          : role === "employer"
            ? getUserProfileResult()
            : Promise.resolve(null),
      ]);
      if (!overview || overview.error || typeof overview !== "object") {
        throw new Error(overview?.error || "Could not load dashboard.");
      }
      if (activity && !Array.isArray(activity?.data)) {
        throw new Error(activity?.error || "Could not load recent activity.");
      }
      if (extra?.error) throw new Error(extra.error);
      return { overview, activity, extra };
    },
    staleTime: 15_000,
    gcTime: 5 * 60_000,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}
