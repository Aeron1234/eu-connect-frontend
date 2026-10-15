"use client";


export default function EvaluationGradeButton({ grade, setEvaluationGrades, evaluationGrades, name }) {
  function handleClick() {
    setEvaluationGrades((prev) => ({
      ...prev,
      [name]: grade,
    }));
  }

  const isSelected =
    grade === evaluationGrades[name] ? "bg-primary text-white" : "bg-muted";

  return (
    <li
      className={`px-2 py-1 ${isSelected} font-semibold cursor-pointer transition-colors rounded-sm`}
      onClick={handleClick}
    >
      {grade}
    </li>
  );
}
