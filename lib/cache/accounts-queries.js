"use client";

import { infiniteQueryOptions } from "@tanstack/react-query";
import { getAllAccountsResult } from "@/lib/server-actions/account-actions";
import { hasValidPage } from "@/lib/see-more-pagination.mjs";

export const accountsKeys = {
  all: (userId) => ["accounts", String(userId)],
  list: (userId, filters) => [
    ...accountsKeys.all(userId),
    filters.filter,
    filters.search,
  ],
};

export function accountsInfiniteOptions(userId, filters) {
  return infiniteQueryOptions({
    queryKey: accountsKeys.list(userId, filters),
    queryFn: async ({ pageParam }) => {
      const result = await getAllAccountsResult({ ...filters, page: pageParam });
      if (!hasValidPage(result, "accounts", null, pageParam)) {
        const error = new Error(result?.error || "Invalid accounts response from the server.");
        error.status = result?.status;
        throw error;
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
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}
