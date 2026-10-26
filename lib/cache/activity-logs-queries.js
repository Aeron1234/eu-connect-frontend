"use client";

import { infiniteQueryOptions } from "@tanstack/react-query";
import { getAllActivityLogsResult } from "@/lib/server-actions/activity-logs-actions";
import { hasValidPage } from "@/lib/see-more-pagination.mjs";

// Cache log pages by viewer, actor role, module and search. Previous data can remain
// visible during filter changes; consumers must distinguish placeholder data from new results.
export const activityLogsKeys = {
  all: (userId) => ["activity-logs", String(userId)],
  list: (userId, filters) => [
    ...activityLogsKeys.all(userId),
    filters.actorRole,
    filters.targetType,
    filters.search,
  ],
};

export function activityLogsInfiniteOptions(userId, filters) {
  return infiniteQueryOptions({
    queryKey: activityLogsKeys.list(userId, filters),
    queryFn: async ({ pageParam }) => {
      const result = await getAllActivityLogsResult({ ...filters, page: pageParam });
      if (!hasValidPage(result, "data", "pagination", pageParam)) {
        const error = new Error(result?.error || "Invalid activity logs response");
        error.status = result?.status;
        throw error;
      }
      return result;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
    staleTime: 15_000,
    gcTime: 5 * 60_000,
    placeholderData: (previousData) => previousData,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}
