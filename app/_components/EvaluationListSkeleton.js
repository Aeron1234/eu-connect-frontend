import PostedEvaluationItemSkeleton from "./PostedEvaluationItemSkeleton";

function EvaluationListSkeleton({ rows = 2 }) {
  return (
    <div className="bg-white rounded-xl border border-stone-300 shadow-sm p-4 sm:p-6 mb-8">
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <PostedEvaluationItemSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export default EvaluationListSkeleton;
