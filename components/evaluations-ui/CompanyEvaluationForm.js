"use client";

import EvaluationScoreForm from "./EvaluationScoreForm";
import useCompanyEvaluationForm from "./useCompanyEvaluationForm";

function CompanyEvaluationForm({ companyEvaluationCriterias, onSubmitted }) {
  const formProps = useCompanyEvaluationForm({ companyEvaluationCriterias, onSubmitted });
  return (
    <EvaluationScoreForm criteria={companyEvaluationCriterias} emptyMessage="Your department has no active company evaluation questions yet. Ask your department head to add them." {...formProps} />
  );
}

export default CompanyEvaluationForm;
