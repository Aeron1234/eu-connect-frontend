"use client";

import { infiniteQueryOptions } from "@tanstack/react-query";
import { getAllAnnouncementsResult } from "@/lib/server-actions/announcements-actions";
import { hasValidPage } from "@/lib/see-more-pagination.mjs";

export const announcementsKeys = {
  all: (userId) => ["announcements", String(userId)],
  list: (userId, filters) => [
    ...announcementsKeys.all(userId),
    filters.category,
    filters.search,
  ],
};

export function announcementsInfiniteOptions(userId, filters) {
  return infiniteQueryOptions({
    queryKey: announcementsKeys.list(userId, filters),
    queryFn: async ({ pageParam }) => {
      const result = await getAllAnnouncementsResult({
        ...filters,
        page: pageParam,
      });
      if (
        !hasValidPage(result, "regular", null, pageParam) ||
        !Array.isArray(result?.pinned)
      ) {
        throw new Error(result?.error || "Invalid announcements response");
      }
      return result;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.currentPage < lastPage.totalPages
        ? lastPage.currentPage + 1
        : undefined,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    placeholderData: (previousData) => previousData,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}
