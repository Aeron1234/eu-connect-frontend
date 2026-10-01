import { Skeleton } from "@/components/ui/skeleton";

function WeeklyNarrativeItemSkeleton() {
  return (
    <li className="relative pl-10 sm:pl-14">
      <div className="absolute left-0 sm:left-1 top-4 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-secondary ring-4 ring-canvas" />

      <article className="rounded-xl bg-card border border-border shadow-sm p-4 sm:p-5">
        <div className="min-w-0 space-y-1.5">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-56" />
        </div>

        <div className="space-y-1.5 mt-3">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-11/12" />
          <Skeleton className="h-3 w-2/3" />
        </div>

        <Skeleton className="h-3 w-20 mt-3" />
      </article>
    </li>
  );
}

export default WeeklyNarrativeItemSkeleton;
