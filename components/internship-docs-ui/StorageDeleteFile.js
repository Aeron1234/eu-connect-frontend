"use client";

import { useTransition } from "react";
import { toastAndAction } from "../../lib/helpers";
import DeleteForm from "../ui/DeleteForm";
import { deleteFile } from "@/lib/server-actions/internship-docs-actions";

function StorageDeleteFile({ fileId = "", fileUrl = "", onDeleted, pendingReview = false }) {
  const [isPending, startTransition] = useTransition();

  function handleAction(formData) {
    formData.append("fileUrl", fileUrl);

    const handlers = {
      loadingLabel: pendingReview ? "Declining document..." : "Deleting file...",
      successLabel: pendingReview ? "Document declined." : "File deleted.",
      errorLabel: pendingReview ? "Failed to decline document." : "Failed to delete.",
      action: deleteFile,
      args: [formData],
    };

    startTransition(async () => {
      const result = await toastAndAction(handlers);
      if (result?.success) onDeleted?.();
    });
  }

  return (
    <DeleteForm
      handleAction={handleAction}
      id={fileId}
      isPending={isPending}
      name={"fileId"}
      description={pendingReview ? "This pending document will be deleted. The employer who uploaded it will be notified that you declined it." : undefined}
      submitLabel={pendingReview ? "Decline document" : undefined}
    />
  );
}

export default StorageDeleteFile;
