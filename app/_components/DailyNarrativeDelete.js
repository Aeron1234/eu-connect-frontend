"use client";
import { useTransition } from "react";
import { deleteNarrative } from "../_services/student-actions";
import DeleteForm from "./DeleteForm";
import { toastAndAction } from "../../lib/helpers";

function DailyNarrativeDelete({ narrativeId, onSuccess }) {
  const [isPending, startTransition] = useTransition();

  function handleAction(formData) {
    startTransition(async () => {
      const result = await toastAndAction({
        loadingLabel: "Deleting narrative...",
        successLabel: "Narrative deleted.",
        errorLabel: "Failed to delete.",
        action: deleteNarrative,
        formData,
      });
      if (result?.success) {
        onSuccess?.();
      }
    });
  }

  return (
    <DeleteForm
      handleAction={handleAction}
      id={narrativeId}
      isPending={isPending}
      name={"narrativeId"}
    />
  );
}

export default DailyNarrativeDelete;
