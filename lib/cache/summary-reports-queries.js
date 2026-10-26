"use client";

import { queryOptions } from "@tanstack/react-query";
import { getSummaryReportsResult } from "@/lib/server-actions/summary-reports-actions";

// Provide the signed-in student's summary-report record choices under one viewer key.
// Propagate action errors before falling back to an empty records array.
export const summaryReportKeys = {
  list: (userId) => ["summary-reports", String(userId)],
};

export function summaryReportsOptions(userId) {
  return queryOptions({
    queryKey: summaryReportKeys.list(userId),
    queryFn: async () => {
      const result = await getSummaryReportsResult();
      if (result?.error) throw new Error(result.error);
      return result?.records || [];
    },
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    retry: false,
    refetchOnWindowFocus: false,
  });
}
