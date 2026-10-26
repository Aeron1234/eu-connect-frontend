"use client";

import { useState } from "react";
import { usePdfPreview } from "@/components/ui/PdfPreviewProvider";
import { authorizedDocumentResponse, downloadAuthorizedOriginal, documentFilename, documentKind } from "@/lib/document-preview.mjs";

// Open a legacy summary attachment through the shared authorized document preview flow.
// Expose a local opening error; acquire the file link only when the user opens it.
export default function useSummaryAttachment(internshipId, getAttachmentUrl, clearBeforeOpen = false, metadata = {}) {
  const [attachmentError, setAttachmentError] = useState("");
  const { previewPdf, previewDocument } = usePdfPreview();
  async function openAttachment() {
    if (clearBeforeOpen) setAttachmentError("");
    const filename = documentFilename(metadata.filename || "summary-attachment", metadata.mimeType);
    // Legacy attachments remain separate from report images. Choose the shared viewer
    // by metadata, and acquire an authorized link only when the user opens it.
    const preview = documentKind({ ...metadata, filename }) === "pdf" ? previewPdf : previewDocument;
    try {
      await preview({
        filename, mimeType: metadata.mimeType,
        load: signal => authorizedDocumentResponse(getAttachmentUrl, internshipId, { ...metadata, filename }, signal),
        downloadOriginal: signal => downloadAuthorizedOriginal(getAttachmentUrl, internshipId, { ...metadata, filename }, signal),
      });
    } catch { setAttachmentError("Could not open the attachment. Please try again."); }
  }
  return { attachmentError, openAttachment };
}
