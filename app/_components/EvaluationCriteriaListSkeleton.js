import SectionCardSkeleton from "./SectionCardSkeleton";

function EvaluationCriteriaListSkeleton({ sections = 3 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: sections }).map((_, i) => (
        <SectionCardSkeleton key={i} />
      ))}
    </div>
  );
}

export default EvaluationCriteriaListSkeleton;
