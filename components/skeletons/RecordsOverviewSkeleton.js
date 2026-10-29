import { Skeleton } from "@/components/ui/skeleton";

function RecordsOverviewSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="rounded-xl border border-border shadow-sm bg-card p-4 sm:p-5">
        <Skeleton className="h-5 w-40" />
        <dl className="mt-3 space-y-2.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex justify-between gap-4">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-28" />
            </div>
          ))}
        </dl>
      </div>

      <div className="rounded-xl border border-border shadow-sm bg-card p-4 sm:p-5">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-8 w-32 mt-3" />
        <Skeleton className="h-2 w-full rounded-full mt-3" />
        <Skeleton className="h-2.5 w-48 mt-2" />

        <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-lg bg-muted py-2 space-y-1">
              <Skeleton className="h-4 w-8 mx-auto" />
              <Skeleton className="h-2.5 w-14 mx-auto" />
            </div>
          ))}
        </div>
      </div>
      <div className="min-w-0 rounded-xl border border-border bg-card p-4 shadow-sm sm:col-span-2 sm:p-5">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="mt-2 h-4 w-full max-w-md" />
        <Skeleton className="mt-4 h-[280px] w-full rounded-xl sm:h-[360px]" />
      </div>
    </div>
  );
}

export default RecordsOverviewSkeleton;
