"use client";

import { queryOptions } from "@tanstack/react-query";
import { getMyPastInternshipRecordsResult } from "@/lib/server-actions/internship-records-actions";
import { getInternshipFilesResult } from "@/lib/server-actions/internship-docs-actions";

export const pastInternshipDocumentsKeys = {
  all: (userId) => ["past-internship-documents", String(userId)],
  records: (userId) => [...pastInternshipDocumentsKeys.all(userId), "records"],
  files: (userId, internshipId) => [
    ...pastInternshipDocumentsKeys.all(userId),
    "files",
    String(internshipId),
  ],
};

export function pastInternshipRecordsOptions(userId) {
  return queryOptions({
    queryKey: pastInternshipDocumentsKeys.records(userId),
    queryFn: async () => {
      const result = await getMyPastInternshipRecordsResult();
      if (!Array.isArray(result)) {
        throw new Error(result?.error || "Could not load past internship records.");
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

export function pastInternshipFilesOptions(userId, internshipId) {
  return queryOptions({
    queryKey: pastInternshipDocumentsKeys.files(userId, internshipId),
    queryFn: async () => {
      const result = await getInternshipFilesResult({ internshipId });
      if (!Array.isArray(result)) {
        throw new Error(result?.error || "Could not load files.");
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
