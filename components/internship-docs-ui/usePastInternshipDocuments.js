"use client";

import { useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  pastInternshipDocumentsKeys,
  pastInternshipRecordsOptions,
} from "@/lib/cache/past-internship-documents-queries";

// Expose this viewer's cached past records, seeded and reconciled from server props.
// Returns the record array; callers do not receive the underlying query state.
export default function usePastInternshipDocuments(records, currentUserId) {
  const queryClient = useQueryClient();
  const serverSnapshotRef = useRef(records);
  const recordsQuery = useQuery({
    ...pastInternshipRecordsOptions(currentUserId),
    enabled: Boolean(currentUserId),
    initialData: records,
  });

  useEffect(() => {
    if (serverSnapshotRef.current === records || !currentUserId) return;
    serverSnapshotRef.current = records;
    queryClient.setQueryData(pastInternshipDocumentsKeys.records(currentUserId), records);
  }, [records, queryClient, currentUserId]);

  const pastRecords = recordsQuery.data || [];
  return pastRecords;
}
