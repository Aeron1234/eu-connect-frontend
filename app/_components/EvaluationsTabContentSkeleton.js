import EvaluationCriteriaSkeleton from "./EvaluationCriteriaSkeleton";
import EvaluationListSkeleton from "./EvaluationListSkeleton";

function EvaluationsTabContentSkeleton({ tab }) {
  if (tab === "evaluate-supervisor") {
    return (
      <div className="bg-card rounded-xl border border-border shadow-sm p-4 sm:p-6 mb-8">
        <EvaluationCriteriaSkeleton />
      </div>
    );
  }

  // pending-confirmation, past-evaluations, disputed — all the same
  // EvaluationCard shape, just different data underneath.
  return <EvaluationListSkeleton />;
}

export default EvaluationsTabContentSkeleton;
