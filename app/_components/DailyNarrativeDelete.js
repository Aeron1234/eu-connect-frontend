"use client";
import { useActionState } from "react";
import { deleteNarrative } from "../_services/actions";
import DeleteForm from "./DeleteForm";
import { toastAndAction } from "../_services/helpers";

function DailyNarrativeDelete({ narrativeId }) {
  const [state, formAction, isPending] = useActionState(deleteNarrative, null);

  async function handleAction(formData) {
    const handlers = {
      loadingLabel: "Deleting narrative...",
      successLabel: "Narrative deleted.",
      errorLabel: "Failed to delete.",
      action: deleteNarrative,
      formData,
    };

    await toastAndAction(handlers);
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
