"use client";

import { useTransition } from "react";
import { toastAndAction } from "@/lib/helpers";
import { downloadPdf } from "@/components/ui/downloadPdf";
import {
  downloadInternshipRecordDocuments,
  approveInternshipDocument,
} from "@/lib/server-actions/internship-docs-actions";

export default function useDocumentActions({ internshipId, downloadAction, onChanged }) {
  const [isPending, startTransition] = useTransition();

  function handleDownload(id, file) {
    // dept-head download action needs internshipId alongside fileId;
    // the student's own download action only needs fileId. Build the
    // payload based on what's actually available rather than assuming.
    const formData = internshipId
      ? { fileId: id, internshipId }
      : { fileId: id };
    const directPdf = (
      String(file?.file_type || "").split(";")[0].trim().toLowerCase() === "application/pdf" ||
      /\.pdf$/i.test(file?.file_name || "")
    );
    const getDownload = downloadAction ?? downloadInternshipRecordDocuments;

    const handlers = {
      loadingLabel: directPdf ? "Downloading PDF..." : "Opening / downloading file...",
      successLabel: directPdf ? "PDF downloaded." : "File was opened / downloaded.",
      errorLabel: directPdf ? "Could not download the PDF. Please try again." : "Failed to open / download file.",
      action: async (payload) => {
        const result = await getDownload(payload);
        if (!result?.success || !directPdf) return result;

        try {
          if (!result.url) throw new Error("Missing download URL");
          const response = await fetch(result.url, { cache: "no-store", credentials: "omit" });
          if (!response.ok) throw new Error("PDF download failed");
          const name = result.fileName || file?.file_name || "document";
          await downloadPdf(response, /\.pdf$/i.test(name) ? name : `${name}.pdf`);
          return { ...result, message: "PDF downloaded." };
        } catch {
          return { success: false, error: "Could not download the PDF. Please try again." };
        }
      },
      args: [formData],
    };

    startTransition(async () => {
      const result = await toastAndAction(handlers);
      if (!result?.success) return;
      if (!directPdf) window.open(result.url, "_blank", "noopener,noreferrer");
    });
  }

  function handleApprove(id, onAccepted) {
    const formData = new FormData();
    formData.set("fileId", id);

    const handlers = {
      loadingLabel: "Accepting document...",
      successLabel: "Document accepted.",
      errorLabel: "Failed to accept document.",
      action: approveInternshipDocument,
      args: [formData],
    };

    startTransition(async () => {
      const result = await toastAndAction(handlers);
      if (result?.success) {
        onAccepted?.();
        onChanged?.({ type: "approved", fileId: id });
      }
    });
  }
  return { isPending, handleDownload, handleApprove };
}
