import { Skeleton } from "@/components/ui/skeleton";

function QuickActionsCardSkeleton() {
  return (
    <div className="rounded-xl bg-primary-500 p-5">
      <Skeleton className="h-3.5 w-28 bg-white/25" />
      <div className="space-y-2 mt-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between gap-2 px-4 py-3 rounded-lg bg-white/10"
          >
            <span className="flex items-center gap-2">
              <Skeleton className="w-4 h-4 rounded bg-white/30" />
              <Skeleton className="h-3 w-32 bg-white/30" />
            </span>
            <Skeleton className="w-4 h-4 rounded bg-white/20" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default QuickActionsCardSkeleton;
