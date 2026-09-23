import { Skeleton } from "@/components/ui/skeleton";

function RecentActivityCardSkeleton({ rows = 5 }) {
  return (
    <div className="h-full rounded-xl bg-white border border-stone-300 shadow-sm p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <Skeleton className="w-4 h-4 rounded" />
        <Skeleton className="h-3.5 w-32" />
      </div>
      <ul className="divide-y divide-stone-300">
        {Array.from({ length: rows }).map((_, i) => (
          <li
            key={i}
            className="flex items-start gap-3 py-3 first:pt-0 last:pb-0"
          >
            <Skeleton className="w-4 h-4 rounded-full mt-0.5 flex-shrink-0" />
            <div className="min-w-0 flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-full max-w-sm" />
              <Skeleton className="h-2.5 w-20" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default RecentActivityCardSkeleton;
