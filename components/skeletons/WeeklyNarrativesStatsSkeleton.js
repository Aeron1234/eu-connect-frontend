import { Skeleton } from "@/components/ui/skeleton";

function WeeklyNarrativesStatsSkeleton() {
  return (
    <>
      <div className="rounded-xl bg-primary p-3 sm:p-4">
        <Skeleton className="h-2.5 w-20 bg-white/25" />
        <Skeleton className="h-7 w-10 mt-1.5 bg-white/25" />
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl bg-card border border-border shadow-sm p-3 sm:p-4"
        >
          <Skeleton className="h-2.5 w-16" />
          <Skeleton className="h-7 w-12 mt-1.5" />
        </div>
      ))}
    </>
  );
}

export default WeeklyNarrativesStatsSkeleton;
