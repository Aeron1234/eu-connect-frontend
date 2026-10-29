"use client";
import EvaluationPostingGuard from "./EvaluationPostingGuard";


import { useState } from "react";
import StudentEvaluationForm from "./StudentEvaluationForm";
import { ChevronDown, ChevronUp } from "lucide-react";
import EvaluationsCriteria from "./EvaluationsCriteria";
import useInternshipStartAccess from "@/components/ui/useInternshipStartAccess";
import InternshipStartNotice from "@/components/ui/InternshipStartNotice";

function StudentEvaluationCriteria({
  studentEvaluationCriterias,
  searchedUserId,
  dateStarted,
  userRole,
  onSubmitted,
}) {
  const [isOpen, setIsOpen] = useState(true);
  const startAccess = useInternshipStartAccess(dateStarted, "Student evaluations");

  if (userRole !== "employer") return null;

  return (
    <div className="flex-1 flex flex-col gap-4">
      <div
        className={`flex gap-2 items-center justify-between ${isOpen ? "mb-4" : ""}`}
      >
        <h3 className="text-base font-semibold">Student Evaluation Form</h3>

        {startAccess.allowed && <button
          className="flex gap-1 items-center transition-all hover:bg-muted/50 p-1 rounded-lg"
          onClick={() => setIsOpen((prev) => !prev)}
        >
          {isOpen ? "Hide" : "Show"}
          {isOpen ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </button>}
      </div>

      {!startAccess.allowed && <InternshipStartNotice message={startAccess.message} />}

      {startAccess.allowed && isOpen && (
        <>
          <EvaluationsCriteria />

          <div className="space-y-1">
            <h3 className="text-base font-semibold">Submit New Evaluation</h3>
            <p className="text-sm text-muted-foreground">
              You can submit multiple progress evaluations for this internship. Previous evaluations stay in the history.
            </p>
          </div>

          <EvaluationPostingGuard direction="performance" studentId={searchedUserId}>
          <StudentEvaluationForm
            studentEvaluationCriterias={studentEvaluationCriterias}
            searchedUserId={searchedUserId}
            onSubmitted={onSubmitted}
          />
          </EvaluationPostingGuard>
        </>
      )}
    </div>
  );
}

export default StudentEvaluationCriteria;
