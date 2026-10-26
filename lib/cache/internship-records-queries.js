"use client";

import { infiniteQueryOptions } from "@tanstack/react-query";
import { getDepartmentInternshipRecordsResult } from "@/lib/server-actions/internship-records-actions";
import { hasValidPage } from "@/lib/see-more-pagination.mjs";

// Cache staff record pages by viewer, status, search and page size.
// Validate pagination before append; callers reconcile old offset pages after writes.
export const internshipRecordsKeys = {
  all: (userId) => ["internship-records", String(userId)],
  list: (userId, criteria) => [
    ...internshipRecordsKeys.all(userId),
    criteria.status,
    criteria.search,
    criteria.limit,
  ],
};

export function internshipRecordsInfiniteOptions(userId, criteria) {
  return infiniteQueryOptions({
    queryKey: internshipRecordsKeys.list(userId, criteria),
    queryFn: async ({ pageParam }) => {
      const result = await getDepartmentInternshipRecordsResult({
        ...criteria,
        page: pageParam,
      });
      if (!hasValidPage(result, "data", "pagination", pageParam)) {
        throw new Error(result?.error || "Invalid internship records response");
      }
      return result;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    placeholderData: (previousData) => previousData,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}
