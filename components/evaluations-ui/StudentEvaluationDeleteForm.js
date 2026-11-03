"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useTransition } from "react";
import { toastAndAction } from "../../lib/helpers";
import DeleteForm from "../ui/DeleteForm";
import { deleteEvaluation } from "@/lib/server-actions/evaluations-actions";

function StudentEvaluationDeleteForm({ evaluationId, evaluationType, permanent = false, onSuccess }) {
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();

  // The permanent prop changes wording only. The backend derives soft deletion versus purge
  // from the authenticated role and the stored evaluation, not a client-supplied flag.
  function handleAction(formData) {
    formData.set("evaluationType", evaluationType);
    startTransition(async () => {
      const result = await toastAndAction({
        loadingLabel: permanent ? "Permanently deleting evaluation..." : "Deleting evaluation...",
        successLabel: "Evaluation deleted.",
        errorLabel: "Failed to delete.",
        action: deleteEvaluation,
        args: [formData],
      });
      // Refresh eligibility after confirmed deletion in case the ongoing assignment changed.
      if (result?.success) {
        void queryClient.invalidateQueries({ queryKey: ["evaluation-posting"] });
        onSuccess?.();
      }
    });
  }



  return (
    <DeleteForm
      description={permanent ? "Permanently remove this deleted evaluation and its scores? This cannot be undone." : "Remove this evaluation from your history? Staff will retain a copy labeled Deleted. Other evaluations are kept."}
      submitLabel={permanent ? "Permanently delete" : "Delete"}
      handleAction={handleAction}
      id={evaluationId}
      isPending={isPending}
      name={"evaluationId"}
    />
  );
}

export default StudentEvaluationDeleteForm;
