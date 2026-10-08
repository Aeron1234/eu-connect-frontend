"use client";

import { queryOptions } from "@tanstack/react-query";
import { getSearchHistoryResult } from "@/lib/server-actions/history-actions";

export const searchUsersKeys = {
  all: (userId) => ["search-users", String(userId)],
  results: (userId, term) => [...searchUsersKeys.all(userId), "results", term],
  history: (userId) => [...searchUsersKeys.all(userId), "history"],
};

const queryDefaults = {
  gcTime: 5 * 60_000,
  retry: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
};

export function searchUsersOptions(userId, term) {
  return queryOptions({
    queryKey: searchUsersKeys.results(userId, term),
    queryFn: async ({ signal }) => {
      const response = await fetch(`/api/users?q=${encodeURIComponent(term)}`, { signal });
      if (!response.ok) {
        throw new Error(response.status === 401
          ? "Your session has expired. Please log in again."
          : "Could not search users. Please try again.");
      }
      const result = await response.json();
      if (result?.success !== true || !Array.isArray(result.users)) {
        throw new Error("Invalid user search response.");
      }
      return result.users;
    },
    staleTime: 60_000,
    ...queryDefaults,
  });
}

export function searchHistoryOptions(userId) {
  return queryOptions({
    queryKey: searchUsersKeys.history(userId),
    queryFn: async () => {
      const result = await getSearchHistoryResult({ type: "user" });
      if (!Array.isArray(result?.history)) {
        throw new Error(result?.error || "Could not load recently viewed users.");
      }
      return result.history;
    },
    staleTime: 30_000,
    ...queryDefaults,
  });
}
