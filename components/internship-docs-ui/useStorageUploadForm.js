"use client";

import { useState, useTransition } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  invalidateCurrentInternshipDocuments,
} from "@/lib/cache/current-internship-documents-queries";
import { uploadInternshipFile } from "@/lib/server-actions/internship-docs-actions";
import { toastAndAction } from "@/lib/helpers";

export default function useStorageUploadForm({ fileRequirementTypes, currentUserId, internshipId }) {
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();
  const [selectedRequirementId, setSelectedRequirementId] = useState("");

  function handleAction(formData) {
    startTransition(async () => {
      const result = await toastAndAction({
        loadingLabel: "Uploading file...",
        timeoutMs: 120000,
        timeoutLabel: "Upload confirmation timed out. Refresh this page before trying again.",
        successLabel: "File was added.",
        errorLabel: "Upload failed.",
        action: uploadInternshipFile,
        args: [formData],
      }).catch(() => null);
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
