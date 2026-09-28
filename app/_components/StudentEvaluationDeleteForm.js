"use client";

import { useTransition } from "react";
import { toastAndAction } from "../../lib/helpers";
import DeleteForm from "./DeleteForm";
import { deletePendingStudentEvaluation } from "@/lib/server-actions/evaluations-actions";

function StudentEvaluationDeleteForm({ evaluationId, status }) {
  const [isPending, startTransition] = useTransition();

  function handleAction(formData) {
    startTransition(
      async () =>
        await toastAndAction({
          loadingLabel: "Deleting pending evaluation...",
          successLabel: "Evaluation deleted.",
          errorLabel: "Failed to delete.",
          action: deletePendingStudentEvaluation,
          formData,
        }),
    );
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
