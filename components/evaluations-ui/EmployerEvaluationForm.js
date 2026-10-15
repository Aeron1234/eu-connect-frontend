"use client";

import EvaluationScoreForm from "./EvaluationScoreForm";
import useEmployerEvaluationForm from "./useEmployerEvaluationForm";

function EmployerEvaluationForm({ employerEvaluationCriterias, onSubmitted }) {
  const formProps = useEmployerEvaluationForm({ employerEvaluationCriterias, onSubmitted });
  return (
    <EvaluationScoreForm criteria={employerEvaluationCriterias} {...formProps} />
  );
}

export default EmployerEvaluationForm;
