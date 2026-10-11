import { Skeleton } from "@/components/ui/skeleton";

function AnnualReportSkeleton({ departmentRow = 3, feedbackRow = 3 }) {
  return (
    <>
      {Array.from({ length: departmentRow }).map((_, i) => (
        <section
          key={i}
          className="@container overflow-hidden rounded-xl border border-border bg-card shadow-sm"
        >
          <header className="relative border-b border-border px-4 py-4 sm:px-5">
            <div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 gap-y-2 @2xl:pr-48">
              <Skeleton className="col-start-1 row-start-1 size-9 rounded-lg" />
              <div className="col-span-2 row-start-2 min-w-0 space-y-2 @2xl:col-span-1 @2xl:col-start-2 @2xl:row-start-1">
                <Skeleton className="h-4 w-48 max-w-full" />
                <Skeleton className="h-3 w-64 max-w-full" />
              </div>
            </div>
            <div className="absolute right-4 top-4 flex items-center gap-2 sm:right-5">
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
