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
        title="Submit student evaluation?"
        description="Review your scores and remarks. This evaluation is sent privately to the student's department head."
        confirmLabel="Submit evaluation"
        pending={isPending}
        onConfirm={submitEvaluation}
      />
    </>
  );
}

export default StudentEvaluationForm;
