"use client";
import { useTransition } from "react";
import { deleteNarrative } from "../_services/student-actions";
import DeleteForm from "./DeleteForm";
import { toastAndAction } from "../_services/helpers";

function DailyNarrativeDelete({ narrativeId }) {
  const [isPending, startTransition] = useTransition();

  function handleAction(formData) {
    startTransition(() =>
      toastAndAction({
        loadingLabel: "Deleting narrative...",
        successLabel: "Narrative deleted.",
        errorLabel: "Failed to delete.",
        action: deleteNarrative,
        formData,
      }),
    );
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
