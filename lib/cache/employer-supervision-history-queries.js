"use client";

import { queryOptions } from "@tanstack/react-query";
import { getEmployerSupervisionHistory } from "../server-actions/employer-supervision-history-actions";
import { hasValidPage } from "../see-more-pagination.mjs";

export const employerSupervisionHistoryKeys = {
  page: (viewerId, employerId, page) => ["employer-supervision-history", "by-student-with-current", String(viewerId), String(employerId), page],
};

export function employerSupervisionHistoryOptions(viewerId, employerId, page) {
  return queryOptions({
    queryKey: employerSupervisionHistoryKeys.page(viewerId, employerId, page),
    queryFn: async () => {
      const result = await getEmployerSupervisionHistory(employerId, page);
      if (result?.error || result?.success === false || !hasValidPage(result, "interns") || !Number.isInteger(result.pagination?.page) || typeof result.pagination?.total !== "number" || result.interns.some(student => !Array.isArray(student?.placements) || student.placements.some(placement => !["ongoing", "finished"].includes(placement?.status)))) {
        throw Object.assign(new Error(result?.error || "Could not load supervised interns."), { status: result?.status || 0 });
      }
      return result;
    },
    staleTime: 30000, gcTime: 5 * 60000, retry: false,
    // Refresh current/completed placements when revisiting Info after another page has
    // finished/restored/deleted a record, without changing dashboard queries.
    refetchOnMount: "always", refetchOnWindowFocus: true,
  });
}
