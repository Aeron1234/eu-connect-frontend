import { Skeleton } from "@/components/ui/skeleton";
import PageTitleSkeleton from "./PageTitleSkeleton";
import WeeklyNarrativesStatsSkeleton from "./WeeklyNarrativesStatsSkeleton";
import WeeklyNarrativeListSkeleton from "./WeeklyNarrativeListSkeleton";

function StudentNarrativesPageSkeleton() {
  return (
    <div className="min-w-0 space-y-6 p-4 sm:p-6 lg:p-8" aria-busy="true">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <PageTitleSkeleton />
        <Skeleton className="h-10 w-40 rounded-md" />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
        <WeeklyNarrativesStatsSkeleton />
      </div>

      <WeeklyNarrativeListSkeleton />
    </div>
  );
}

export default StudentNarrativesPageSkeleton;
