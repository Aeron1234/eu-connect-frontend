"use client";

import EvaluationScoreForm from "./EvaluationScoreForm";
import useStudentEvaluationForm from "./useStudentEvaluationForm";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

function StudentEvaluationForm({ studentEvaluationCriterias, searchedUserId, onSubmitted }) {
  const { confirming, setConfirming, submitEvaluation, ...formProps } = useStudentEvaluationForm({
    studentEvaluationCriterias,
    searchedUserId,
    onSubmitted,
  });
  const { isPending } = formProps;
  return (
    <>
      <EvaluationScoreForm criteria={studentEvaluationCriterias} {...formProps} />
      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title="Submit supervisor evaluation?"
        description="Review your scores and remarks before submitting this evaluation."
        confirmLabel="Submit evaluation"
        pending={isPending}
        onConfirm={submitEvaluation}
      />
    </>
  );
}

export default StudentEvaluationForm;
