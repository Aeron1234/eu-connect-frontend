import { Skeleton } from "@/components/ui/skeleton";

function HoursDistributionDonutSkeleton() {
  return (
    <div className="rounded-xl bg-card border border-border shadow-sm p-5 sm:p-6 h-full flex flex-col">
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <Skeleton className="w-4 h-4 rounded" />
          <Skeleton className="h-3.5 w-52" />
        </div>
        <Skeleton className="h-3 w-56 mt-2" />
      </div>

      <div className="flex-1 min-h-[220px] w-full bg-muted rounded-lg p-3 flex flex-col items-center justify-center gap-4">
        <Skeleton className="w-32 h-32 sm:w-36 sm:h-36 rounded-full" />
        <div className="flex flex-wrap items-center justify-center gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <Skeleton className="w-2.5 h-2.5 rounded-full" />
              <Skeleton className="h-2.5 w-14" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default HoursDistributionDonutSkeleton;
