import { Skeleton } from "@/components/ui/skeleton";

function AnnualReportSkeleton({ departmentRow = 3, feedbackRow = 3 }) {
  return (
    <>
      {Array.from({ length: departmentRow }).map((_, i) => (
        <section
          key={i}
          className="overflow-hidden rounded-xl border border-stone-300 bg-white shadow-sm"
        >
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 px-4 sm:px-5 py-4">
            <div className="flex items-center gap-3 min-w-0">
              <Skeleton className="size-9 flex-shrink-0 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-64" />
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Skeleton className="h-8 w-28 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
          </header>

          <div className="flex flex-wrap items-center justify-between gap-2 px-4 sm:px-5 py-3">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-32" />
          </div>

          <div className="px-4 sm:px-5 pb-4 space-y-2">
            {Array.from({ length: feedbackRow }).map((_, j) => (
              <div key={j} className="grid grid-cols-3 gap-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        </section>
      ))}
    </>
  );
}

export default AnnualReportSkeleton;
