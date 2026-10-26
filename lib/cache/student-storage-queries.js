"use client";

import { queryOptions } from "@tanstack/react-query";
import {
  getOngoingInternshipRecordResult,
  getMyPastInternshipRecordsResult,
} from "@/lib/server-actions/internship-records-actions";

// Separate current-internship lookup from past-record choices in the Storage screen.
// No active record is a successful null result; action errors still reject the query.
export const studentStorageKeys = {
  active: (userId) => ["student-storage", String(userId), "active"],
  pastRecords: (userId) => ["student-storage", String(userId), "past-records"],
};

const freshness = {
  staleTime: 30_000,
  gcTime: 5 * 60_000,
  retry: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
};

export function activeStorageRecordOptions(userId) {
  return queryOptions({
    queryKey: studentStorageKeys.active(userId),
    queryFn: async () => {
      const result = await getOngoingInternshipRecordResult();
      if (result?.error) throw new Error(result.error);
      return result ?? null;
    },
    ...freshness,
  });
}

export function pastStorageRecordsOptions(userId) {
  return queryOptions({
    queryKey: studentStorageKeys.pastRecords(userId),
    queryFn: async () => {
      const result = await getMyPastInternshipRecordsResult();
      if (!Array.isArray(result)) throw new Error(result?.error || "Could not load past internship records.");
      return result;
    },
    ...freshness,
  });
}
