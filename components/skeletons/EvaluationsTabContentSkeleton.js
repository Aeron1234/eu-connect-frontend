import EvaluationCriteriaSkeleton from "./EvaluationCriteriaSkeleton";
import EvaluationListSkeleton from "./EvaluationListSkeleton";

function EvaluationsTabContentSkeleton({ tab }) {
  if (tab === "evaluate-company") {
    return (
      <div className="bg-card rounded-xl border border-border shadow-sm p-4 sm:p-6 mb-8">
        <EvaluationCriteriaSkeleton />
      </div>
    );
  }

  // The supervisor form uses criteria placeholders; other tab values use the
  // history-list placeholder. Confirmation/dispute tabs are no longer offered.
  return <EvaluationListSkeleton />;
}

export default EvaluationsTabContentSkeleton;
