"use client";

import { useTransition } from "react";
import { toastAndAction } from "@/lib/helpers";
import {
  downloadInternshipRecordDocuments,
  approveInternshipDocument,
} from "@/lib/server-actions/internship-docs-actions";

export default function useDocumentActions({ internshipId, downloadAction, onChanged }) {
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
      args: [formData],
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
      args: [formData],
    };

    startTransition(async () => {
      const result = await toastAndAction(handlers);
      if (result?.success) onChanged?.({ type: "approved", fileId: id });
    });
  }
  return { isPending, handleDownload, handleApprove };
}
