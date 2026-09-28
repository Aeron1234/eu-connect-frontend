"use client";
import { useTransition } from "react";
import { editNarrative } from "../_services/student-actions";
import { toastAndAction } from "../../lib/helpers";
import DailyNarrativeForm from "./DailyNarrativeForm";

function DailyNarrativeEditForm({ narrative, onSuccess }) {
  const [isPending, startTransition] = useTransition();

  function handleAction(formData) {
    const handlers = {
      loadingLabel: "Updating narrative...",
      successLabel: "Narrative was updated.",
      errorLabel: "Updating narrative failed.",
      action: editNarrative,
      formData,
      id: narrative.id,
    };

    startTransition(async () => {
      const result = await toastAndAction(handlers);
      if (result?.success) {
        // merge the id + form fields in as a fallback if the API
        // doesn't echo back the full updated row — adjust to match
        // whatever `editNarrative` actually returns (see note below)
        onSuccess?.(
          result.narrative ?? { ...narrative, ...Object.fromEntries(formData) },
        );
      }
    });
  }

  return (
    <DailyNarrativeForm
      handleAction={handleAction}
      isPending={isPending}
      type={"edit"}
      data={narrative}
    />
  );
}

export default DailyNarrativeEditForm;
