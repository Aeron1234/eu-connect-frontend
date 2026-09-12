"use client";

import { format } from "date-fns";
import { Check, Download, Trash2, Upload } from "lucide-react";
import { useTransition } from "react";
import { toastAndAction } from "../_services/helpers";
import { downloadInternshipRecordDocuments } from "../_services/dept-head-actions";
import { approveInternshipDocument } from "../_services/student-actions";
import Modal from "./Modal";
import StorageDeleteFile from "./StorageDeleteFile";

const STATUS_STYLES = {
  pending: "bg-amber-50 text-amber-700",
  accepted: "bg-green-50 text-green-700",
};

// No verification_status at all (NULL) means it's a self-uploaded document
// with nothing to confirm — shown as "Submitted", distinct from the
// employer-upload pending/accepted flow.
function StatusPill({ status }) {
  if (!status) {
    return (
      <span className="rounded-full px-2 py-0.5 text-[10px] font-medium bg-blue-50 text-blue-700">
        Submitted
      </span>
    );
  }
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${STATUS_STYLES[status] || "bg-stone-100 text-stone-600"}`}
    >
      {status}
    </span>
  );
}

// canDelete (prop) is a BASELINE permission the caller passes in (e.g.
// "this view is admin-only"), not the final word. This function layers the
// real business rules on top of it:
// - an accepted document can never be deleted by anyone except admin
// - a student can always delete their own document (it's theirs)
// - an employer can only delete a document THEY uploaded, and only while
//   it's still pending
// - anyone else falls back to whatever the caller's baseline canDelete said
function canActuallyDelete({ item, canDelete, userRole, currentUserId }) {
  if (item.verification_status === "accepted" && userRole !== "admin") {
    return false;
  }
  if (userRole === "student") {
    return true; // it's their own document — always deletable unless accepted (handled above)
  }
  if (userRole === "employer") {
    return (
      item.uploaded_by_id === currentUserId &&
      item.verification_status === "pending"
    );
  }
  return canDelete;
}

function SearchedStudentFiles({
  filtered,
  view,
  typeTone,
  getFileTypeLabel,
  userRole = "",
  internshipId = "",
  currentUserId = "",
  // New, additive-only props — both default to behavior that preserves
  // what existing call sites already relied on.
  canDelete = userRole === "admin",
  canApprove = userRole === "student",
  downloadAction = null,
}) {
  const [isPending, startTransition] = useTransition();

  function handleDownload(id) {
    // dept-head download action needs internshipId alongside fileId;
    // the student's own download action only needs fileId. Build the
    // payload based on what's actually available rather than assuming.
    const formData = internshipId
      ? { fileId: id, internshipId }
      : { fileId: id };

    const handlers = {
      loadingLabel: "Opening / downloading file...",
      successLabel: "File was opened / downloaded.",
      errorLabel: "Failed to open / download file.",
      action:
        downloadAction === null
          ? downloadInternshipRecordDocuments
          : downloadAction,
      formData,
    };

    startTransition(async () => {
      const result = await toastAndAction(handlers);
      if (!result?.success) return;
      window.open(result.url, "_blank", "noopener,noreferrer");
    });
  }

  function handleApprove(id) {
    const formData = new FormData();
    formData.set("fileId", id);

    const handlers = {
      loadingLabel: "Approving document...",
      successLabel: "Document approved.",
      errorLabel: "Failed to approve document.",
      action: approveInternshipDocument,
      formData,
    };

    startTransition(async () => {
      await toastAndAction(handlers);
    });
  }

  if (filtered.length === 0)
    return (
      <div className="py-12 text-center text-sm text-muted-foreground">
        No documents match your search.
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

function GridView({
  item,
  typeTone,
  getFileTypeLabel,
  canDelete,
  canApprove,
  handleDownload,
  handleApprove,
  isPending,
  userRole,
  currentUserId,
}) {
  const typeLabel = getFileTypeLabel(item.file_type);
  const showApprove = canApprove && item.verification_status === "pending";
  const showDelete = canActuallyDelete({
    item,
    canDelete,
    userRole,
    currentUserId,
  });

  return (
    <div
      key={item.id}
      className="group rounded-xl border border-border/60 bg-card p-4 hover:border-primary-500/40 hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between gap-2">
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center text-[10px] font-bold ${typeTone(typeLabel)}`}
        >
          {typeLabel}
        </div>
        <StatusPill status={item.verification_status} />
      </div>
      <p className="mt-3 text-sm font-medium text-foreground line-clamp-2 leading-snug">
        {item.file_name}
      </p>
      <p className="mt-1 text-[11px] text-muted-foreground">{item.category}</p>
      <div className="mt-3 pt-3 border-t border-border/60 flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
          <Upload className="w-3 h-3" />{" "}
          {format(new Date(item.created_at), "MMM dd, yyyy")}
        </span>
        <div className="flex items-center gap-1">
          {showApprove && (
            <button
              className="p-1.5 rounded-md text-muted-foreground hover:text-green-600 hover:bg-green-50 transition-colors"
              aria-label="Approve"
              onClick={() => handleApprove(item.id)}
              disabled={isPending}
            >
              <Check className="w-4 h-4" />
            </button>
          )}
          <button
            className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary-500/10 transition-colors"
            aria-label="Download"
            onClick={() => handleDownload(item.id)}
            disabled={isPending}
          >
            <Download className="w-4 h-4" />
          </button>
          {showDelete && (
            <Modal
              trigger={
                <span className="p-1.5 block cursor-pointer rounded-md text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </span>
              }
              title={<span className="text-red-600">Delete File</span>}
              description="Are you sure you want to delete this file?"
            >
              <StorageDeleteFile fileId={item.id} />
            </Modal>
          )}
        </div>
      </div>
    </div>
  );
}

function ListView({
  item,
  typeTone,
  getFileTypeLabel,
  canDelete,
  canApprove,
  handleDownload,
  handleApprove,
  isPending,
  userRole,
  currentUserId,
}) {
  const typeLabel = getFileTypeLabel(item.file_type);
  const showApprove = canApprove && item.verification_status === "pending";
  const showDelete = canActuallyDelete({
    item,
    canDelete,
    userRole,
    currentUserId,
  });

  return (
    <div className="flex items-center gap-3 p-3 bg-white hover:bg-stone-50 transition-colors">
      <div
        className={`w-9 h-9 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0 ${typeTone(typeLabel)}`}
      >
        {typeLabel}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground truncate">
          {item.file_name}
        </p>
        <p className="text-[11px] text-muted-foreground truncate">
          {item.category} · {format(new Date(item.created_at), "MMM dd, yyyy")}
        </p>
      </div>
      <StatusPill status={item.verification_status} />
      <div className="flex items-center gap-1 shrink-0">
        {showApprove && (
          <button
            className="p-1.5 rounded-md text-muted-foreground hover:text-green-600 hover:bg-green-50 transition-colors"
            aria-label="Approve"
            onClick={() => handleApprove(item.id)}
            disabled={isPending}
          >
            <Check className="w-4 h-4" />
          </button>
        )}
        <button
          className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary-500/10 transition-colors"
          aria-label="Download"
          onClick={() => handleDownload(item.id)}
          disabled={isPending}
        >
          <Download className="w-4 h-4" />
        </button>
        {showDelete && (
          <Modal
            trigger={
              <span className="p-1.5 block cursor-pointer rounded-md text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors">
                <Trash2 className="w-4 h-4" />
              </span>
            }
            title={<span className="text-red-600">Delete File</span>}
            description="Are you sure you want to delete this file?"
          >
            <StorageDeleteFile fileId={item.id} />
          </Modal>
        )}
      </div>
    </div>
  );
}

export default SearchedStudentFiles;
