"use client";

import { useTransition } from "react";
import { toastAndAction } from "@/lib/helpers";
import { usePdfPreview } from "@/components/ui/PdfPreviewProvider";
import {
  downloadInternshipRecordDocuments,
  approveInternshipDocument,
} from "@/lib/server-actions/internship-docs-actions";

export default function useDocumentActions({ internshipId, downloadAction, onChanged }) {
  const [isPending, startTransition] = useTransition();
  const { previewPdf } = usePdfPreview();

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

    if (directPdf) {
      startTransition(async () => {
        const name = file?.file_name || "document.pdf";
        await previewPdf({ filename: /\.pdf$/i.test(name) ? name : name + ".pdf", load: async (signal) => {
          const result = await getDownload(formData);
          signal.throwIfAborted();
          if (!result?.success || !result.url) throw Object.assign(new Error(result?.error || "Could not load the PDF."), { status: result?.status, code: result?.code });
          const response = await fetch(result.url, { cache: "no-store", credentials: "omit", signal });
          const fileName = result.fileName || name;
          const headers = new Headers(response.headers);
          headers.set("Content-Disposition", `attachment; filename*=UTF-8''${encodeURIComponent(/\.pdf$/i.test(fileName) ? fileName : fileName + ".pdf")}`);
          return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
        } });
      });
      return;
    }
    startTransition(async () => {
      const result = await toastAndAction({ loadingLabel: "Opening / downloading file...", successLabel: "File was opened / downloaded.", errorLabel: "Failed to open / download file.", action: getDownload, args: [formData] });
      if (result?.success) window.open(result.url, "_blank", "noopener,noreferrer");
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
