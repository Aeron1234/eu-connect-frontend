import { Skeleton } from "@/components/ui/skeleton";

function StudentHoursTrackerSkeleton({ rows = 4 }) {
  return (
    <div className="rounded-xl bg-card border border-border shadow-sm p-5 sm:p-6 h-full">
      <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Skeleton className="w-4 h-4 rounded" />
            <Skeleton className="h-3.5 w-44" />
          </div>
          <Skeleton className="h-3 w-60 mt-2" />
        </div>
        <Skeleton className="h-8 w-[150px] rounded-md" />
      </div>

      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-border p-3 sm:p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <Skeleton className="h-3.5 w-32" />
                  <Skeleton className="h-4 w-12 rounded-full" />
                </div>
                <Skeleton className="h-2.5 w-24" />
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <Skeleton className="w-28 sm:w-36 h-2 rounded-full" />
                <Skeleton className="h-2.5 w-8" />
                <Skeleton className="h-2.5 w-14" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default StudentHoursTrackerSkeleton;
