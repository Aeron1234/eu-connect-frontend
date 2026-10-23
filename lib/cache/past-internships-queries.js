"use client";

import { infiniteQueryOptions } from "@tanstack/react-query";
import { getAlumniInternshipsResult } from "@/lib/server-actions/past-internships-actions";
import { hasValidPage } from "@/lib/see-more-pagination.mjs";

export const pastInternshipsKeys = {
  all: (userId) => ["past-internships", String(userId)],
  list: (userId, filters) => [
    ...pastInternshipsKeys.all(userId),
    filters.academicYear,
    filters.search,
    filters.departmentId || "all",
  ],
};

export function pastInternshipsInfiniteOptions(userId, filters) {
  return infiniteQueryOptions({
    queryKey: pastInternshipsKeys.list(userId, filters),
    queryFn: async ({ pageParam }) => {
      const result = await getAlumniInternshipsResult({
        ...filters,
        page: pageParam,
      });
      if (!hasValidPage(result, "data", "pagination", pageParam)) {
        throw new Error(result?.error || "Invalid past internships response");
      }
      return result;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    placeholderData: (previousData) => previousData,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}
