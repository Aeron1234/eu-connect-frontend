"use client";

import { queryOptions } from "@tanstack/react-query";
import {
  getInternshipRecordsResult,
  getOngoingInternshipRecordResult,
} from "@/lib/server-actions/internship-records-actions";
import { getRegionsResult } from "@/lib/server-actions/map-actions";

// Combine personal record history and the current active record in one viewer-scoped read.
// Regions use a separate shared reference key because they are not student-specific.
export const studentRecordsKeys = {
  all: (userId) => ["student-records", String(userId)],
  records: (userId) => [...studentRecordsKeys.all(userId), "records"],
  regions: () => ["reference-regions"],
};

export function studentRecordsOptions(userId) {
  return queryOptions({
    queryKey: studentRecordsKeys.records(userId),
    queryFn: async () => {
      const [records, active] = await Promise.all([
        getInternshipRecordsResult(),
        getOngoingInternshipRecordResult(),
      ]);
      if (!Array.isArray(records)) {
        throw new Error(records?.error || "Could not load internship records.");
      }
      if (active?.error) {
        throw new Error(active.error);
      }
      return { records, active };
    },
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

export function regionsOptions() {
  return queryOptions({
    queryKey: studentRecordsKeys.regions(),
    queryFn: async () => {
      const result = await getRegionsResult();
      if (!Array.isArray(result)) {
        throw new Error(result?.error || "Could not load regions.");
      }
      return result;
    },
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}
