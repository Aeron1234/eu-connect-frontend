import { Skeleton } from "@/components/ui/skeleton";

function RecordCardSkeleton() {
  return (
    <article className="rounded-xl border border-stone-300 bg-white p-4 sm:p-5 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-5 w-28 rounded-full" />
          </div>
          <Skeleton className="h-3 w-56" />
          <div className="flex flex-wrap gap-x-5 gap-y-1 mt-1">
            <Skeleton className="h-2.5 w-24" />
            <Skeleton className="h-2.5 w-40" />
            <Skeleton className="h-2.5 w-20" />
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Skeleton className="h-9 w-24 rounded-lg" />
          <Skeleton className="h-9 w-24 rounded-lg" />
        </div>
      </div>

      {/* Progress bar — shown for ongoing/finished records; included here
          as the common case, though pending/rejected records skip it */}
      <div className="mt-4">
        <Skeleton className="h-2 w-full rounded-full" />
      </div>
    </article>
  );
}

export default RecordCardSkeleton;
