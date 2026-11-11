"use client";

import Category from "./EvaluationCategory";
import Criteria from "./EvaluationCriterion";

export default function EvaluationScoreForm({
  criteria,
  evaluationGrades,
  setEvaluationGrades,
  grades,
  remarks,
  setRemarks,
  isPending,
  handleEvaluation,
  emptyMessage = "No active evaluation questions are available yet.",
}) {
  const hasQuestions = criteria.some((group) => group.items.length > 0);
  return (
    <form className="flex-1 flex flex-col gap-6" onSubmit={handleEvaluation}>
      {!hasQuestions && <p className="text-sm text-muted-foreground">{emptyMessage}</p>}
      {/* 1. Loop through each Category */}
      {criteria.map((group) => (
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
        disabled={isPending || !hasQuestions}
      >
        Submit Evaluation
      </button>
    </form>
  );
}
