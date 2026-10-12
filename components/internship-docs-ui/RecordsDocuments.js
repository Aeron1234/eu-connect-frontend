"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import InternshipRequirementsType from "./InternshipRequirementsType";
import { LayoutGrid, ListIcon, Search } from "lucide-react";
import SearchedStudentFiles from "./SearchedStudentFiles";
import RecordsDocumentsSkeleton from "../skeletons/RecordsDocumentsSkeleton";
import {
  currentInternshipDocumentsKeys,
  currentInternshipDocumentsOptions,
  invalidateCurrentInternshipDocuments,
} from "@/lib/cache/current-internship-documents-queries";

import {
  getFileTypeLabel,
  typeTone,
} from "@/lib/utils";

const EMPTY_DOCS = [];

function RecordsDocuments({
  fileData,
  requirementTypes = [],
  internshipId,
  userRole = "",
  currentUserId = "",
  canDelete = undefined,
  canApprove = undefined,
  downloadAction = null,
}) {
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

  if (isCurrentStorage && filesQuery.isPending) {
    return <RecordsDocumentsSkeleton />;
  }

  if (isCurrentStorage && filesQuery.isError && !filesQuery.data) {
    return (
      <div role="alert" className="rounded-xl border border-destructive/30 bg-card p-6 text-sm">
        <p>{filesQuery.error?.message || "Could not load internship documents."}</p>
        <button type="button" className="mt-3 font-semibold text-primary-emphasis" onClick={() => void filesQuery.refetch()}>
          Try again
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-xl bg-card border border-border p-5 sm:p-6">
        <InternshipRequirementsType
          requirementTypes={requirementTypes || []}
          docs={docs}
        />
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center gap-3 mt-5">
        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { key: "all", label: "All Documents" },
            { key: "before", label: "Before Deployment" },
            { key: "after", label: "After Deployment" },
          ].map(({ key, label }) => (
            <button
              onClick={() => setFilter(key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                key === filter
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border/60 hover:bg-muted"
              }`}
              key={key}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 lg:ml-auto">
          <div className="relative flex-1 lg:flex-none">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search documents..."
              className="h-9 w-full lg:w-56 pl-9 pr-3 rounded-lg bg-card border border-border focus:border-primary/40 focus:outline-none text-sm placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex rounded-lg border border-border overflow-hidden shrink-0 bg-card">
            <button
              onClick={() => setView("grid")}
              aria-label="Grid view"
              className={`p-2 transition-colors ${view === "grid" ? "bg-primary text-white" : "text-muted-foreground hover:bg-muted"}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView("list")}
              aria-label="List view"
              className={`p-2 transition-colors ${view === "list" ? "bg-primary text-white" : "text-muted-foreground hover:bg-muted"}`}
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <SearchedStudentFiles
        filtered={filtered || []}
        emptyMessage={docs.length === 0 ? "No documents uploaded yet." : "No documents match your search or filter."}
        view={view}
        typeTone={typeTone}
        getFileTypeLabel={getFileTypeLabel}
        internshipId={internshipId}
        userRole={userRole}
        currentUserId={currentUserId}
        canDelete={canDelete}
        canApprove={canApprove}
        downloadAction={downloadAction}
        onChanged={isCurrentStorage ? handleFilesChanged : undefined}
      />
    </>
  );
}

export default RecordsDocuments;
