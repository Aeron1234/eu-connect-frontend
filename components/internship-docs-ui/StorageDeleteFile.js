"use client";

import { useState, useTransition } from "react";
import { Trash2, X } from "lucide-react";
import { toastAndAction } from "../../lib/helpers";
import ConfirmDialog from "../ui/ConfirmDialog";
import { deleteFile } from "@/lib/server-actions/internship-docs-actions";

function StorageDeleteFile({ fileId = "", fileName = "this file", onDeleted, pendingReview = false, disabled = false }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleAction() {
    if (isPending || disabled) return;
    const formData = new FormData();
    formData.set("fileId", fileId);

    const handlers = {
      loadingLabel: pendingReview ? "Declining document..." : "Deleting file...",
      successLabel: pendingReview ? "Document declined." : "File deleted.",
      errorLabel: pendingReview ? "Failed to decline document." : "Failed to delete.",
      action: deleteFile,
      args: [formData],
    };

    startTransition(async () => {
      const result = await toastAndAction(handlers);
      if (result?.success) {
        setOpen(false);
        onDeleted?.();
      }
    });
  }

  return (
    <>
      <button
        type="button"
        aria-label={pendingReview ? "Decline document" : "Delete file"}
        title={pendingReview ? "Decline document" : "Delete file"}
        disabled={disabled || isPending}
        onClick={() => setOpen(true)}
        className={`p-1.5 rounded-md text-muted-foreground transition-colors disabled:opacity-50 ${pendingReview ? "hover:text-amber-700 hover:bg-amber-50 dark:hover:text-amber-300 dark:hover:bg-amber-500/15" : "hover:text-destructive hover:bg-destructive/10"}`}
      >
        {pendingReview ? <X className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
      </button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={pendingReview ? "Decline document?" : "Delete file?"}
        description={pendingReview
          ? `Decline and delete “${fileName}”? The employer who uploaded it will be notified. This cannot be undone.`
          : `Delete “${fileName}” from your internship documents? This cannot be undone.`}
        confirmLabel={pendingReview ? "Decline document" : "Delete file"}
        intent={pendingReview ? "decline" : "warning"}
        pending={isPending}
        onConfirm={handleAction}
      />
    </>
  );
}

export default StorageDeleteFile;
