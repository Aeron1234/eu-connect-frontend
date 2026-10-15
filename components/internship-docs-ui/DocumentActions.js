"use client";

import { Check, Download, Trash2, X } from "lucide-react";
import { useState } from "react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Modal from "../ui/Modal";
import StorageDeleteFile from "./StorageDeleteFile";
import { canActuallyDelete } from "./documentPermissions";

export default function DocumentActions({
  item,
  canDelete,
  canApprove,
  handleDownload,
  handleApprove,
  isPending,
  userRole,
  currentUserId,
  onChanged,
  className = "flex items-center gap-1",
}) {
  const [confirmingApproval, setConfirmingApproval] = useState(false);
  const showApprove = canApprove && item.verification_status === "pending";
  // Student uploads have no verification status; pending documents are employer uploads.
  const pendingReview = userRole === "student" && item.verification_status === "pending";
  const showDelete = canActuallyDelete({
    item,
    canDelete,
    userRole,
    currentUserId,
  });
  return (
    <div className={className}>
      <ConfirmDialog
        open={Boolean(showApprove && confirmingApproval)}
        onOpenChange={setConfirmingApproval}
        title="Approve document?"
        description={`Accept “${item.file_name}” as an internship document? The employer who uploaded it will be notified.`}
        confirmLabel="Approve document"
        intent="approve"
        pending={isPending}
        onConfirm={() => {
          if (!showApprove || isPending) return;
          setConfirmingApproval(false);
          handleApprove(item.id);
        }}
      />
      {showApprove && (
        <button
          type="button"
          className="p-1.5 rounded-md text-muted-foreground hover:text-green-600 hover:bg-green-50 transition-colors"
          aria-label="Approve"
          onClick={() => setConfirmingApproval(true)}
          disabled={isPending}
        >
          <Check className="w-4 h-4" />
        </button>
      )}
      <button
        className="p-1.5 rounded-md text-muted-foreground hover:text-primary-emphasis hover:bg-primary/10 transition-colors"
        aria-label="Download"
        onClick={() => handleDownload(item.id)}
        disabled={isPending}
      >
        <Download className="w-4 h-4" />
      </button>
      {showDelete && (
        <Modal variant="confirmation" intent={pendingReview ? "decline" : "warning"}
          trigger={
            <span
              aria-label={pendingReview ? "Decline document" : "Delete file"}
              title={pendingReview ? "Decline document" : "Delete file"}
              className={`p-1.5 block cursor-pointer rounded-md text-muted-foreground transition-colors ${pendingReview ? "hover:text-amber-700 hover:bg-amber-50 dark:hover:text-amber-300 dark:hover:bg-amber-500/15" : "hover:text-red-600 hover:bg-red-50"}`}
            >
              {pendingReview ? <X className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
            </span>
          }
          title={pendingReview ? "Decline document?" : <span className="text-red-600">Delete File</span>}
        >
          <StorageDeleteFile
            fileId={item.id}
            pendingReview={pendingReview}
            onDeleted={() => onChanged?.({ type: "deleted", fileId: item.id })}
          />
        </Modal>
      )}
    </div>
  );
}
