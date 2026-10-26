"use client";

import { useState, useTransition } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  invalidateCurrentInternshipDocuments,
} from "@/lib/cache/current-internship-documents-queries";
import { uploadInternshipFile } from "@/lib/server-actions/internship-docs-actions";
import { toastAndAction } from "@/lib/helpers";

// Own the requirement picker and upload transition. The caller supplies the file FormData;
// this hook reports progress and reconciles document caches after success or timeout.
export default function useStorageUploadForm({ fileRequirementTypes, currentUserId, internshipId }) {
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();
  const [selectedRequirementId, setSelectedRequirementId] = useState("");

  function handleAction(formData) {
    startTransition(async () => {
      // Keep loading through the action, with a 120-second outer confirmation deadline.
      // The HTTP upload has its own shorter timeout; neither deadline confirms rollback.
      const result = await toastAndAction({
        loadingLabel: "Uploading file...",
        timeoutMs: 120000,
        timeoutLabel: "Upload confirmation timed out. Refresh this page before trying again.",
        successLabel: "File was added.",
        errorLabel: "Upload failed.",
        action: uploadInternshipFile,
        args: [formData],
      }).catch(() => null);
      // Refresh after success or uncertainty so a committed file is discovered before retry.
      if ((result?.success || result?.timedOut) && currentUserId && internshipId) {
        void invalidateCurrentInternshipDocuments(queryClient, currentUserId, internshipId);
      }
    });
  }

  return {
    handleAction,
    isPending,
    pickerProps: {
      selectedRequirementId,
      requirementTypes: fileRequirementTypes,
      onValueChange: setSelectedRequirementId,
    },
  };
}
