"use client";

import StudentEvaluationList from "../evaluations-ui/StudentEvaluationList";
import StudentEvaluationCriteria from "../evaluations-ui/StudentEvaluationCriteria";

export default function ProfileEvaluationsTab({ userRole, searchedUserId, dateStarted, data, refreshEvaluations }) {
  return (
    <>
      {userRole === "employer" && (
        <div className="bg-card rounded-xl border border-border shadow-sm p-4 sm:p-6 mb-6">
          <StudentEvaluationCriteria
            studentEvaluationCriterias={
              data?.studentEvaluationCriterias
            }
            searchedUserId={searchedUserId}
            dateStarted={dateStarted}
            userRole={userRole}
            onSubmitted={refreshEvaluations}
          />
        </div>
      )}
      <StudentEvaluationList
        studentId={searchedUserId}
        pastEvaluations={data?.pastEvaluationsData?.data || []}
        onChanged={refreshEvaluations}
      />
    </>
  );
}
