"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  currentInternshipDocumentsKeys,
  currentInternshipDocumentsOptions,
  invalidateCurrentInternshipDocuments,
} from "@/lib/cache/current-internship-documents-queries";

const EMPTY_DOCS = [];
// Combine document search/category/view controls with current-student storage reads.
// Other viewers use the supplied fileData; current storage mutations refresh its cache.
export default function useRecordsDocuments({ fileData, internshipId, userRole, currentUserId }) {
  const queryClient = useQueryClient();
  const isCurrentStorage = userRole === "student" && Boolean(currentUserId && internshipId);
  const filesQuery = useQuery({
    ...currentInternshipDocumentsOptions(currentUserId, internshipId),
    enabled: isCurrentStorage,
  });
  const docs = isCurrentStorage
    ? filesQuery.data ?? EMPTY_DOCS
    : fileData ?? EMPTY_DOCS;

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [view, setView] = useState("grid");

  function handleFilesChanged({ type, fileId }) {
    const filesKey = currentInternshipDocumentsKeys.files(currentUserId, internshipId);
    if (type === "deleted") {
      queryClient.setQueryData(filesKey, (files) =>
        files?.filter((file) => String(file.id) !== String(fileId)),
      );
    } else if (type === "approved") {
      queryClient.setQueryData(filesKey, (files) => files?.map((file) =>
        String(file.id) === String(fileId)
          ? { ...file, verification_status: "accepted" }
          : file,
      ));
    }
    void invalidateCurrentInternshipDocuments(queryClient, currentUserId, internshipId);
  }

  const filtered = useMemo(() => {
    let result = docs ? [...docs] : [];

    if (query.trim()) {
      result = result.filter((d) =>
        d.file_name.toLowerCase().includes(query.trim().toLowerCase()),
      );
    }

    if (filter !== "all") {
      result = result.filter((d) => d.category === filter);
    }

    return result;
  }, [docs, filter, query]);
  return {
    isCurrentStorage,
    filesQuery,
    docs,
    query,
    setQuery,
    filter,
    setFilter,
    view,
    setView,
    filtered,
    handleFilesChanged,
  };
}
