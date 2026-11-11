"use client";
import EvaluationScoreForm from './EvaluationScoreForm';
import useStudentEvaluationForm from './useStudentEvaluationForm';
export default function StudentEvaluationForm({ studentEvaluationCriterias, searchedUserId, onSubmitted }) {
  const props = useStudentEvaluationForm({ studentEvaluationCriterias, searchedUserId, onSubmitted });
  return <EvaluationScoreForm criteria={studentEvaluationCriterias} emptyMessage="This student's department has no active performance evaluation questions yet. Ask their department head to add them." {...props} />;
}
