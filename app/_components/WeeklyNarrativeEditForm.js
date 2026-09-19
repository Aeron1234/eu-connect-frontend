"use client";
import { useTransition } from "react";
import { editWeeklyNarrative } from "../_services/student-actions";
import { toastAndAction } from "../_services/helpers";
import WeeklyNarrativeForm from "./WeeklyNarrativeForm";

function WeeklyNarrativeEditForm({ narrative, onSuccess }) {
  const [isPending, startTransition] = useTransition();

  function handleAction(formData) {
    const handlers = {
      loadingLabel: "Updating narrative...",
      successLabel: "Narrative was updated.",
      errorLabel: "Updating narrative failed.",
      action: editWeeklyNarrative,
      formData,
    };

    startTransition(async () => {
      const result = await toastAndAction(handlers);
      if (result?.success) {
        onSuccess?.(
          result.narrative ?? {
            ...narrative,
            ...Object.fromEntries(formData),
          },
        );
      }
    });
  }

  return (
    <WeeklyNarrativeForm
      handleAction={handleAction}
      isPending={isPending}
      type="edit"
      data={narrative}
    />
  );
}

export default WeeklyNarrativeEditForm;
