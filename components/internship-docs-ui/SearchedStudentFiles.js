"use client";

import GridView from "./DocumentGridCard";
import ListView from "./DocumentListRow";
import useDocumentActions from "./useDocumentActions";

function SearchedStudentFiles({
  filtered,
  emptyMessage = "No documents uploaded yet.",
  view,
  typeTone,
  getFileTypeLabel,
  userRole = "",
  internshipId = "",
  currentUserId = "",
  // Defaults expose delete for admin and acceptance for students. Row-level
  // ownership and document state are checked again by documentPermissions.
  canDelete = userRole === "admin",
  canApprove = userRole === "student",
  downloadAction = null,
  onChanged = null,
}) {
  const { isPending, handleDownload, handleApprove } = useDocumentActions({
    internshipId,
    downloadAction,
    onChanged,
  });

  if (filtered.length === 0)
    return (
      <div className="py-12 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );

  const sharedProps = {
    typeTone,
    getFileTypeLabel,
    canDelete,
    canApprove,
    handleDownload,
    handleApprove,
    isPending,
    userRole,
    currentUserId,
    onChanged,
  };

  if (view === "grid")
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 mt-5">
        {filtered.map((item) => (
          <GridView key={item.id} item={item} {...sharedProps} />
        ))}
      </div>
    );

  return (
    <div className="rounded-xl border border-border/60 divide-y divide-border/60 overflow-hidden">
      {filtered.map((item) => (
        <ListView key={item.id} item={item} {...sharedProps} />
      ))}
    </div>
  );
}

export default SearchedStudentFiles;
