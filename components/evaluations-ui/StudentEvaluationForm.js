"use client";
import EvaluationScoreForm from './EvaluationScoreForm';
import useStudentEvaluationForm from './useStudentEvaluationForm';
export default function StudentEvaluationForm({ studentEvaluationCriterias, searchedUserId, onSubmitted }) {
  const props = useStudentEvaluationForm({ studentEvaluationCriterias, searchedUserId, onSubmitted });
  return <EvaluationScoreForm criteria={studentEvaluationCriterias} {...props} />;
}
