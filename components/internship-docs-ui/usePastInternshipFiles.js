"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  pastInternshipDocumentsKeys,
  pastInternshipFilesOptions,
} from "@/lib/cache/past-internship-documents-queries";

export default function usePastInternshipFiles(record, currentUserId) {
  const [expanded, setExpanded] = useState(false);
  const queryClient = useQueryClient();
  const filesQuery = useQuery({
    ...pastInternshipFilesOptions(currentUserId, record.id),
    enabled: expanded && Boolean(currentUserId),
  });

  function handleFilesChanged({ type, fileId }) {
    const filesKey = pastInternshipDocumentsKeys.files(currentUserId, record.id);
    const recordsKey = pastInternshipDocumentsKeys.records(currentUserId);
    if (type === "deleted") {
      queryClient.setQueryData(filesKey, (files) =>
        files?.filter((file) => String(file.id) !== String(fileId)),
      );
      queryClient.setQueryData(recordsKey, (records) => records?.map((item) =>
        String(item.id) === String(record.id)
          ? { ...item, file_count: Math.max(0, Number(item.file_count || 0) - 1) }
          : item,
      ));
    } else if (type === "approved") {
      queryClient.setQueryData(filesKey, (files) => files?.map((file) =>
        String(file.id) === String(fileId)
          ? { ...file, verification_status: "accepted" }
          : file,
      ));
    }
    void queryClient.invalidateQueries({ queryKey: filesKey });
    if (type === "deleted") {
      void queryClient.invalidateQueries({ queryKey: recordsKey });
    }
  }
  return { expanded, setExpanded, filesQuery, handleFilesChanged };
}
