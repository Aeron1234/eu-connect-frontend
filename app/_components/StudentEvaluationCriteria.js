"use client";

import { useState } from "react";
import StudentEvaluationForm from "./StudentEvaluationForm";
import { ChevronDown, ChevronUp } from "lucide-react";
import EvaluationsCriteria from "./EvaluationsCriteria";

function StudentEvaluationCriteria({
  studentEvaluationCriterias,
  searchedUserId,
  userRole,
}) {
  const [isOpen, setIsOpen] = useState(true);

  if (userRole !== "employer") return null;

  return (
    <div className="flex-1 flex flex-col gap-4">
      <div
        className={`flex gap-2 items-center justify-between ${isOpen ? "mb-4" : ""}`}
      >
        <h3 className="text-base font-semibold">Student Evaluation Form</h3>

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

          <StudentEvaluationForm
            studentEvaluationCriterias={studentEvaluationCriterias}
            searchedUserId={searchedUserId}
          />
        </>
      )}
    </div>
  );
}

export default StudentEvaluationCriteria;
