import { Skeleton } from "@/components/ui/skeleton";

export default function RecordsSummaryReportSkeleton() {
  return (
    <div className="space-y-5" aria-label="Loading summary report" aria-busy="true">
      <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
        <Skeleton className="h-5 w-44" />
        <Skeleton className="mt-3 h-4 w-64 max-w-full" />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="rounded-xl border border-border bg-card p-4 sm:p-5">
            <Skeleton className="h-5 w-48 max-w-full" />
            <Skeleton className="mt-4 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-5/6" />
            <Skeleton className="mt-2 h-4 w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );
}
