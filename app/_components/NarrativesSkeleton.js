import { Skeleton } from "@/components/ui/skeleton";

function NarrativesSkeleton({ rows = 3 }) {
  return (
    <ul className="space-y-3 sm:space-y-4">
      {Array.from({ length: rows }).map((_, i) => (
        <li
          key={i}
          className="border border-border rounded-xl p-4 sm:p-5 bg-card shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-4 w-48 mb-2" />
          <div className="space-y-1.5 mt-3">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-11/12" />
            <Skeleton className="h-3 w-2/3" />
          </div>
          <Skeleton className="h-3 w-20 mt-3" />
        </li>
      ))}
    </ul>
  );
}

export default NarrativesSkeleton;
