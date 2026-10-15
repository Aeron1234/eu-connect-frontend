"use client";
import { useTransition } from "react";
import ModalForm from "@/components/ui/ModalForm";
import { deleteWeeklyNarrative } from "@/lib/server-actions/weekly-narratives-actions";
import { toastAndAction } from "../../lib/helpers";

function WeeklyNarrativeDelete({ narrativeId, onSuccess }) {
  const [isPending, startTransition] = useTransition();

  function handleAction(formData) {
    startTransition(async () => {
      const result = await toastAndAction({
        loadingLabel: "Deleting narrative...",
        successLabel: "Narrative deleted.",
        errorLabel: "Failed to delete narrative.",
        action: deleteWeeklyNarrative,
        args: [formData],
      });

      if (result?.success) onSuccess?.();
    });
  }

  return (
    <ModalForm.Root action={handleAction}>
      <input type="hidden" name="narrativeId" defaultValue={narrativeId} />
      <ModalForm.Confirmation title="Confirm Deletion">
        This weekly narrative will be deleted.
      </ModalForm.Confirmation>
      <ModalForm.Actions
        isPending={isPending}
        submitLabel="Delete"
        closeOnSubmit={false}
        disableCancelWhilePending
      />
    </ModalForm.Root>
  );
}

export default WeeklyNarrativeDelete;
