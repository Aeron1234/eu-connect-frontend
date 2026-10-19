"use client";

import { Check, Download } from "lucide-react";
import { useState } from "react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import StorageDeleteFile from "./StorageDeleteFile";
import { canActuallyApprove, canActuallyDelete, isStudentDocumentOwner } from "./documentPermissions";

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
  const showApprove = canActuallyApprove({ item, canApprove, userRole, currentUserId });
  const pendingReview = isStudentDocumentOwner({ item, userRole, currentUserId }) &&
    item.uploaded_by_role === "employer" && item.verification_status === "pending";
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
        title="Accept document?"
        description={`Accept “${item.file_name}” as an internship document? The employer who uploaded it will be notified. You can delete this file later.`}
        confirmLabel="Accept document"
        intent="approve"
        pending={isPending}
        onConfirm={() => {
          if (!showApprove || isPending) return;
          handleApprove(item.id, () => setConfirmingApproval(false));
        }}
      />
      {showApprove && (
        <button
          type="button"
          className="p-1.5 rounded-md text-muted-foreground hover:text-green-700 hover:bg-green-50 dark:hover:text-green-300 dark:hover:bg-green-500/15 transition-colors disabled:opacity-50"
          aria-label="Accept document"
          title="Accept document"
          onClick={() => setConfirmingApproval(true)}
          disabled={isPending}
        >
          <Check className="w-4 h-4" />
        </button>
      )}
      <button
        type="button"
        className="p-1.5 rounded-md text-muted-foreground hover:text-primary-emphasis hover:bg-primary/10 transition-colors"
        aria-label="Download"
        onClick={() => handleDownload(item.id, item)}
        disabled={isPending}
      >
        <Download className="w-4 h-4" />
      </button>
      {showDelete && (
        <StorageDeleteFile
          fileId={item.id}
          fileName={item.file_name}
          pendingReview={pendingReview}
          disabled={isPending}
          onDeleted={() => onChanged?.({ type: "deleted", fileId: item.id })}
        />
      )}
    </div>
  );
}
