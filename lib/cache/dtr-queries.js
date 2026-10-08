"use client";

import { queryOptions } from "@tanstack/react-query";
import { getDtrsResult } from "@/lib/server-actions/dtr-actions";

export const dtrKeys = {
  student: (userId, internshipId) => ["dtr", "student", String(userId), String(internshipId)],
  studentPage: (userId, internshipId, page) => [
    ...dtrKeys.student(userId, internshipId),
    page,
  ],
};

export function studentDtrPageOptions(userId, internshipId, page) {
  return queryOptions({
    queryKey: dtrKeys.studentPage(userId, internshipId, page),
    queryFn: async () => {
      const result = await getDtrsResult(page);
      if (result === null) {
        return { dtrs: [], currentPage: page, totalPages: 1, totalRecords: 0 };
      }
      if (!Array.isArray(result?.dtrs) || !Number.isInteger(result?.totalPages)) {
        throw new Error(result?.error || "Could not load time records.");
      }
      return result;
    },
    staleTime: 15_000,
    gcTime: 5 * 60_000,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}
