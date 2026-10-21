import { Skeleton } from "@/components/ui/skeleton";

export default function MapLocationsLoading() {
  return (
    <div className="space-y-4 lg:space-y-6" role="status" aria-label="Loading locations">
      <div className="flex flex-col gap-2 sm:flex-row" aria-hidden="true">
        <Skeleton className="h-11 w-full rounded-lg sm:w-80" />
        <Skeleton className="h-10 w-full rounded-lg sm:w-36" />
      </div>

      <div className="space-y-2 lg:hidden" aria-hidden="true">
        <div className="grid grid-cols-2 gap-2">
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
        <Skeleton className="h-3 w-52 max-w-full" />
      </div>

      <div className="hidden space-y-6 lg:block" aria-hidden="true">
        <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-4">
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-64 max-w-full" />
            <Skeleton className="h-3 w-52 max-w-full" />
            <Skeleton className="h-3 w-72 max-w-full" />
          </div>
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <Skeleton className="h-5 w-52 max-w-full" />
          <Skeleton className="mt-2 h-3 w-full" />
          <div className="mt-4 grid grid-cols-3 gap-3">
            {[0, 1, 2].map((item) => (
              <div key={item} className="min-w-0 space-y-2 rounded-lg border border-border p-3">
                <Skeleton className="h-3 w-28 max-w-full" />
                <Skeleton className="h-4 w-32 max-w-full" />
                <Skeleton className="h-3 w-20 max-w-full" />
                <Skeleton className="!mt-3 h-4 w-40 max-w-full" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="!mt-4 h-10 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid items-start gap-4 sm:gap-5 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_380px]" aria-hidden="true">
        <div className="overflow-hidden rounded-xl border border-border bg-card p-2 shadow-sm">
          <Skeleton className="h-[min(58dvh,420px)] min-h-[280px] w-full rounded-xl sm:h-[480px] lg:h-[540px]" />
          <div className="space-y-2 px-2 py-2">
            <Skeleton className="h-3 w-96 max-w-full" />
            <Skeleton className="h-3 w-48 max-w-full sm:hidden" />
          </div>
        </div>
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm lg:h-[600px]">
          <div className="space-y-3 border-b border-border p-4">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-48 max-w-full" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
          {[0, 1, 2, 3].map((item) => <div key={item} className="space-y-2 border-b border-border p-4 last:border-0">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-40" />
          </div>)}
        </div>
      </div>
    </div>
  );
}
