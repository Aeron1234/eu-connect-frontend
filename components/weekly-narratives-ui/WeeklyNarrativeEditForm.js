"use client";
import { useTransition } from "react";
import { editWeeklyNarrative } from "@/lib/server-actions/weekly-narratives-actions";
import { toastAndAction } from "../../lib/helpers";
import WeeklyNarrativeForm from "./WeeklyNarrativeForm";

function WeeklyNarrativeEditForm({ narrative, onSuccess }) {
  const [isPending, startTransition] = useTransition();

  function handleAction(formData) {
    const handlers = {
      loadingLabel: "Updating narrative...",
      successLabel: "Narrative was updated.",
      errorLabel: "Updating narrative failed.",
      action: editWeeklyNarrative,
      args: [formData],
    };

    startTransition(async () => {
      const result = await toastAndAction(handlers);
      if (result?.success) {
        // Prefer the server's saved row; otherwise merge submitted fields into the existing
        // row so the card updates immediately without discarding unrelated metadata.
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
