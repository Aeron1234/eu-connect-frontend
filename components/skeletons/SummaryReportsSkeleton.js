import { Skeleton } from "@/components/ui/skeleton";

function ReportFieldSkeleton({ height = "h-[162px]" }) {
  return (
    <div className="min-w-0">
      <Skeleton className="h-5 w-56 max-w-full" />
      <div className="mt-1 space-y-1">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
      </div>
      <Skeleton className={`mt-2 w-full rounded-lg ${height}`} />
    </div>
  );
}

export default function SummaryReportsSkeleton() {
  return (
    <main className="space-y-6 p-4 sm:p-6 lg:p-8" role="status" aria-label="Loading summary reports" aria-busy="true">
      <div aria-hidden="true" className="min-w-0">
        <div className="flex max-w-full items-start gap-1 sm:gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <Skeleton className="size-5 shrink-0 md:size-7" />
            <Skeleton className="h-7 w-48 max-w-full lg:h-9" />
          </div>
          <Skeleton className="size-9 shrink-0 rounded-full" />
        </div>
        <Skeleton className="mt-1 h-4 w-full max-w-xl sm:h-5" />
      </div>

      <section aria-hidden="true" className="flex flex-col gap-5 rounded-xl border border-border bg-card p-4 sm:p-5 xl:flex-row xl:items-center xl:justify-between xl:gap-8">
        <div className="flex min-w-0 flex-1 flex-col gap-2 lg:flex-row lg:items-center lg:gap-7">
          <Skeleton className="h-5 w-32 shrink-0" />
          <Skeleton className="h-10 w-full min-w-0 rounded-md sm:max-w-xl" />
        </div>
      </section>

      <section aria-hidden="true" className="space-y-6 rounded-xl border border-border bg-card p-4 sm:p-6">
        <div>
          <Skeleton className="h-7 w-60 max-w-full" />
          <Skeleton className="mt-1 h-4 w-full max-w-2xl" />
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          {Array.from({ length: 4 }, (_, index) => <ReportFieldSkeleton key={index} />)}
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          <ReportFieldSkeleton height="h-[122px]" />
          <ReportFieldSkeleton height="h-12" />
        </div>
        <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1 space-y-1">
            <Skeleton className="h-3 w-full max-w-2xl" />
            <Skeleton className="h-3 w-3/4 max-w-xl" />
          </div>
          <Skeleton className="h-10 w-36 shrink-0 rounded-lg" />
        </div>
      </section>
    </main>
  );
}
