"use client";

import { useTransition } from "react";
import { toastAndAction } from "../../lib/helpers";
import DeleteForm from "../ui/DeleteForm";
import { deletePendingStudentEvaluation } from "@/lib/server-actions/evaluations-actions";

function StudentEvaluationDeleteForm({ evaluationId, status, onSuccess }) {
  const [isPending, startTransition] = useTransition();

  function handleAction(formData) {
    startTransition(async () => {
      const result = await toastAndAction({
        loadingLabel: "Deleting pending evaluation...",
        successLabel: "Evaluation deleted.",
        errorLabel: "Failed to delete.",
        action: deletePendingStudentEvaluation,
        args: [formData],
      });
      if (result?.success) onSuccess?.();
    });
  }

  if (!status) return null;

  return (
    <DeleteForm
      handleAction={handleAction}
      id={evaluationId}
      isPending={isPending}
      name={"evaluationId"}
    />
  );
}

export default StudentEvaluationDeleteForm;
