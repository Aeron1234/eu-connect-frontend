"use client";

import { queryOptions } from "@tanstack/react-query";
import { getAverageShiftHoursResult } from "@/lib/server-actions/dashboard-actions";

export const shiftHoursKeys = {
  month: (userId, month, year) => [
    "department-head-shift-hours",
    String(userId),
    Number(year),
    Number(month),
  ],
};

export function shiftHoursMonthOptions(userId, month, year) {
  return queryOptions({
    queryKey: shiftHoursKeys.month(userId, month, year),
    queryFn: async () => {
      const result = await getAverageShiftHoursResult({ month, year });
      if (!Array.isArray(result?.weeks)) {
        throw new Error(result?.error || "Could not load shift hours.");
      }
      return result;
    },
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}
