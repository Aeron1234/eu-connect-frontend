"use client";

import { useState, useTransition } from "react";
import { toastAndAction } from "../../lib/helpers";
import { postEmployerEvaluation } from "@/lib/server-actions/evaluations-actions";

function EmployerEvaluationForm({ employerEvaluationCriterias }) {
  const [evaluationGrades, setEvaluationGrades] = useState(() => {
    const initialState = {};
    employerEvaluationCriterias.forEach((cat) => {
      cat.items.forEach((item) => {
        initialState[item.id] = null;
      });
    });

    return initialState;
  });
  const [remarks, setRemarks] = useState("");
  const [isPending, startTransition] = useTransition();

  const grades = [0, 1, 2, 3, 4, 5];

  async function handleEvaluation(e) {
    e.preventDefault();

    const formData = {
      scores: [],
      other_remarks: remarks,
    };

    for (const [key, value] of Object.entries(evaluationGrades)) {
      formData.scores.push({ criterion_name: key, score: value });
    }

    startTransition(async () => {
      const result = await toastAndAction({
        loadingLabel: "Posting supervisor/employer evaluation...",
        successLabel: "Supervisor/employer evaluation posted!",
        errorLabel: "Posting supervisor/employer evaluation failed.",
        action: postEmployerEvaluation,
        formData,
      });

      if (!result || result.error) {
        return;
      }

      setEvaluationGrades(() => {
        const initialState = {};
        employerEvaluationCriterias.forEach((cat) => {
          cat.items.forEach((item) => {
            initialState[item.id] = null;
          });
        });
        return initialState;
      });

      setRemarks("");
    });
  }

  return (
    <form className="flex-1 flex flex-col gap-6" onSubmit={handleEvaluation}>
      {/* 1. Loop through each Category */}
      {employerEvaluationCriterias.map((group) => (
        <div
          key={group.category}
          className="flex-1 flex flex-col rounded-sm border border-border"
        >
          <Category>{group.category}</Category>

          {/* 2. Loop through each Criteria inside that category */}
          {group.items.map((item) => (
            <Criteria
              key={item.id}
              description={item.name}
              name={item.id}
              evaluationGrades={evaluationGrades}
              setEvaluationGrades={setEvaluationGrades}
              grades={grades}
            />
          ))}
        </div>
      ))}

      <label className="flex-1 ">
        <h4 className="font-semibold mb-2">Other Remarks</h4>
        <textarea
          name="other_remarks"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder="Additional comments, observations, or remarks..."
          className="rounded-sm border border-border w-full px-4 py-2 bg-muted min-h-20 overflow-y-auto resize-none outline-primary-500"
          disabled={isPending}
        />
      </label>

      <button
        className="p-2 rounded-sm bg-primary w-fit self-end text-white font-semibold cursor-pointer hover:bg-primary-600 transition-colors"
        disabled={isPending}
      >
        Submit Evaluation
      </button>
    </form>
  );
}

// Keep your Criteria, GradeButton, and Category components exactly as they were!
function Criteria({
  description,
  name,
  grades,
  setEvaluationGrades,
  evaluationGrades,
}) {
  return (
    <div className="flex-1 gap-2 flex items-center px-4 py-3 rounded-b-sm border-t border-border xs:justify-between flex-col xs:flex-row">
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

function GradeButton({ grade, setEvaluationGrades, evaluationGrades, name }) {
  function handleClick() {
    setEvaluationGrades((prev) => ({
      ...prev,
      [name]: grade,
    }));
  }

  const isSelected =
    grade === evaluationGrades[name]
      ? "bg-primary text-white"
      : "bg-muted";

  return (
    <li
      className={`px-2 py-1 ${isSelected} font-semibold cursor-pointer transition-colors rounded-sm`}
      onClick={handleClick}
    >
      {grade}
    </li>
  );
}

function Category({ children, className }) {
  return (
    <h4
      className={`flex-1 py-2 px-4 bg-muted font-semibold ${className} rounded-t-sm`}
    >
      {children}
    </h4>
  );
}

export default EmployerEvaluationForm;
