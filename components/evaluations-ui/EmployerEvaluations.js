"use client";
import EvaluationPostingGuard from "./EvaluationPostingGuard";


import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import EvaluationsCriteria from "./EvaluationsCriteria";
import EmployerEvaluationForm from "./EmployerEvaluationForm";

function EmployerEvaluations({ employerEvaluationCriterias, onSubmitted }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="flex-1 flex flex-col gap-4">
      <div
        className={`flex gap-2 items-center justify-between ${isOpen ? "mb-4" : ""}`}
      >
        <h3 className="text-base font-semibold">Supervisor Evaluation Form</h3>

        <button
          className="flex gap-1 items-center transition-all hover:bg-muted/50 p-1 rounded-lg"
          onClick={() => setIsOpen((prev) => !prev)}
        >
          {isOpen ? "Hide" : "Show"}
          {isOpen ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </button>
      </div>

      {isOpen && (
        <>
          <EvaluationsCriteria />

          <h3 className="text-base font-semibold">Submit New Evaluation</h3>

          <EvaluationPostingGuard direction="supervisor">
          <EmployerEvaluationForm
            employerEvaluationCriterias={employerEvaluationCriterias}
            onSubmitted={onSubmitted}
          />
          </EvaluationPostingGuard>
        </>
      )}
    </div>
  );
}

export default EmployerEvaluations;
