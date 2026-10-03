import WeeklyNarrativeItemSkeleton from "./WeeklyNarrativeItemSkeleton";

function WeeklyNarrativeListSkeleton({ rows = 4 }) {
  return (
    <div className="relative">
      <div className="absolute left-4 sm:left-6 top-2 bottom-2 w-px bg-secondary" />
      <ul className="space-y-3 sm:space-y-4">
        {Array.from({ length: rows }).map((_, i) => (
          <WeeklyNarrativeItemSkeleton key={i} />
        ))}
      </ul>
    </div>
  );
}

export default WeeklyNarrativeListSkeleton;
