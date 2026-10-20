import { Skeleton } from "@/components/ui/skeleton";

export default function RecordsSummaryReportSkeleton() {
  return (
    <div className="space-y-5" role="status" aria-label="Loading summary report" aria-busy="true">
      <div aria-hidden="true" className="min-w-0 rounded-xl border border-border bg-card p-4 sm:p-5">
        <Skeleton className="h-6 w-44 max-w-full sm:h-7" />
        <Skeleton className="mt-1 h-5 w-64 max-w-full" />
      </div>
      <div aria-hidden="true" className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="min-w-0 rounded-xl border border-border bg-card p-4 sm:p-5">
            <div className="mb-3 flex items-center gap-3">
              <Skeleton className="size-8 shrink-0 rounded-lg" />
              <Skeleton className="h-5 w-48 max-w-full sm:h-6" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-5/6" />
            <Skeleton className="mt-2 h-4 w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );
}
