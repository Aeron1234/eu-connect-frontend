"use client";

import InternshipRequirementsType from "./InternshipRequirementsType";
import SearchedStudentFiles from "./SearchedStudentFiles";
import RecordsDocumentsSkeleton from "../skeletons/RecordsDocumentsSkeleton";
import DocumentsToolbar from "./DocumentsToolbar";
import useRecordsDocuments from "./useRecordsDocuments";
import { getFileTypeLabel, typeTone } from "@/lib/utils";

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
  const {
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
  } = useRecordsDocuments({ fileData, internshipId, userRole, currentUserId });

  if (isCurrentStorage && filesQuery.isPending) {
    return <RecordsDocumentsSkeleton />;
  }

  if (isCurrentStorage && filesQuery.isError && !filesQuery.data) {
    return (
      <div role="alert" className="rounded-xl border border-destructive/30 bg-card p-6 text-sm">
        <p>{filesQuery.error?.message || "Could not load internship documents."}</p>
        <button
          type="button"
          className="mt-3 font-semibold text-primary-emphasis"
          onClick={() => void filesQuery.refetch()}
        >
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

      <DocumentsToolbar
        query={query}
        setQuery={setQuery}
        filter={filter}
        setFilter={setFilter}
        view={view}
        setView={setView}
      />

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
