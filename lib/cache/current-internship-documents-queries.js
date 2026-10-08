"use client";

import { queryOptions } from "@tanstack/react-query";
import { getInternshipFilesResult } from "@/lib/server-actions/internship-docs-actions";
import { internshipRecordDetailsKeys } from "./internship-record-details-queries";

export const currentInternshipDocumentsKeys = {
  files: (userId, internshipId) => [
    "current-internship-documents",
    String(userId),
    String(internshipId),
  ],
};

export function currentInternshipDocumentsOptions(userId, internshipId) {
  return queryOptions({
    queryKey: currentInternshipDocumentsKeys.files(userId, internshipId),
    queryFn: async () => {
      const result = await getInternshipFilesResult({ internshipId });
      if (!Array.isArray(result)) {
        throw new Error(result?.error || "Could not load internship documents.");
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

export function invalidateCurrentInternshipDocuments(queryClient, userId, internshipId) {
  return Promise.all([
    queryClient.invalidateQueries({
      queryKey: currentInternshipDocumentsKeys.files(userId, internshipId),
    }),
    queryClient.invalidateQueries({
      queryKey: internshipRecordDetailsKeys.tab(userId, internshipId, "documents"),
    }),
  ]);
}
