"use client";

import { useState } from "react";

export default function useSummaryAttachment(internshipId, getAttachmentUrl, clearBeforeOpen = false) {
  const [attachmentError, setAttachmentError] = useState("");

  async function openAttachment() {
    const tab = window.open("", "_blank");
    if (clearBeforeOpen) setAttachmentError("");
    const result = await getAttachmentUrl(internshipId);
    if (result?.success && result.url) {
      if (tab) tab.location.href = result.url;
      else window.location.href = result.url;
    } else {
      tab?.close();
      setAttachmentError(result?.error || "Could not open the attachment.");
    }
  }

  return { attachmentError, openAttachment };
}
