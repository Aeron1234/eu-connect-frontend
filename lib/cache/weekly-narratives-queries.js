"use client";

import { infiniteQueryOptions } from "@tanstack/react-query";
import {
  fetchMoreWeeklyNarrativesResult,
  getWeeklyNarrativesResult,
} from "@/lib/server-actions/weekly-narratives-actions";
import { hasValidPage } from "@/lib/see-more-pagination.mjs";

export const weeklyNarrativesKeys = {
  all: (userId) => ["weekly-narratives", String(userId)],
  list: (userId, internshipId) => [
    ...weeklyNarrativesKeys.all(userId),
    String(internshipId),
  ],
};

export function weeklyNarrativesInfiniteOptions(userId, internshipId) {
  return infiniteQueryOptions({
    queryKey: weeklyNarrativesKeys.list(userId, internshipId),
    queryFn: async ({ pageParam }) => {
      const result = pageParam === 1
        ? await getWeeklyNarrativesResult()
        : await fetchMoreWeeklyNarrativesResult({ page: pageParam });
      if (!hasValidPage(result, "narratives", null, pageParam)) {
        throw new Error(result?.error || "Invalid weekly narratives response.");
      }
      return result;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.currentPage < lastPage.totalPages
        ? lastPage.currentPage + 1
        : undefined,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}
