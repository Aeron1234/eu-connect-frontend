"use client";

import GradeButton from "./EvaluationGradeButton";

export default function EvaluationCriterion({
  description,
  name,
  grades,
  setEvaluationGrades,
  evaluationGrades,
}) {
  return (
    <div
      className="flex-1 gap-2 flex items-center px-4 py-3 rounded-b-sm border-t border-border xs:justify-between flex-col xs:flex-row"
    >
      <p>{description}</p>
      <ul className="flex gap-1">
        {grades.map((grade) => (
          <GradeButton
            key={grade}
            grade={grade}
            name={name}
            evaluationGrades={evaluationGrades}
            setEvaluationGrades={setEvaluationGrades}
          />
        ))}
      </ul>
    </div>
  );
}
