"use client";

import { queryOptions } from "@tanstack/react-query";
import { getErrorGroupResult, getErrorGroupsResult } from "@/lib/server-actions/error-tracking-actions";

export const errorTrackingKeys = {
  all: (userId) => ["error-tracking", String(userId)],
  list: (userId, filters) => [...errorTrackingKeys.all(userId), "list", filters],
  detail: (userId, fingerprint) => [...errorTrackingKeys.all(userId), "detail", fingerprint],
};

export function errorGroupsOptions(userId, filters) {
  return queryOptions({
    queryKey: errorTrackingKeys.list(userId, filters),
    queryFn: async () => {
      const result = await getErrorGroupsResult(filters);
      if (!Array.isArray(result?.data) || !result?.pagination) {
        throw new Error(result?.error || "Could not load errors.");
      }
      return result;
    },
    staleTime: 15_000,
    gcTime: 5 * 60_000,
    retry: false,
    refetchOnWindowFocus: false,
  });
}

export function errorGroupOptions(userId, fingerprint) {
  return queryOptions({
    queryKey: errorTrackingKeys.detail(userId, fingerprint),
    queryFn: async () => {
      const result = await getErrorGroupResult(fingerprint);
      if (!Array.isArray(result?.occurrences)) {
        throw new Error(result?.error || "Could not load error details.");
      }
      return result;
    },
    staleTime: 15_000,
    gcTime: 5 * 60_000,
    retry: false,
    refetchOnWindowFocus: false,
  });
}
