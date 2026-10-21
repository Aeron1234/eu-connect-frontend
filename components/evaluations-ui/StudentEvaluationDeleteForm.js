"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useTransition } from "react";
import { toastAndAction } from "../../lib/helpers";
import DeleteForm from "../ui/DeleteForm";
import { deleteEvaluation } from "@/lib/server-actions/evaluations-actions";

function StudentEvaluationDeleteForm({ evaluationId, evaluationType, permanent = false, onSuccess }) {
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();

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
      if (result?.success) {
        void queryClient.invalidateQueries({ queryKey: ["evaluation-posting"] });
        onSuccess?.();
      }
    });
  }



  return (
    <DeleteForm
      description={permanent ? "Permanently remove this deleted evaluation and its scores? This cannot be undone." : "Remove this evaluation from your history? Staff will retain a copy labeled Deleted. You can post a replacement afterward."}
      submitLabel={permanent ? "Permanently delete" : "Delete"}
      handleAction={handleAction}
      id={evaluationId}
      isPending={isPending}
      name={"evaluationId"}
    />
  );
}

export default StudentEvaluationDeleteForm;
