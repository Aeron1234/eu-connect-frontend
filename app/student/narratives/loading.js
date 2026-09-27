import { Skeleton } from "@/components/ui/skeleton";
import PageTitleSkeleton from "@/app/_components/PageTitleSkeleton";
import WeeklyNarrativesStatsSkeleton from "@/app/_components/WeeklyNarrativesStatsSkeleton";
import WeeklyNarrativeListSkeleton from "@/app/_components/WeeklyNarrativeListSkeleton";

function NarrativesLoading() {
  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <PageTitleSkeleton />
        <Skeleton className="h-10 w-40 rounded-md" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <WeeklyNarrativesStatsSkeleton />
      </div>

      <WeeklyNarrativeListSkeleton />
    </main>
  );
}

export default NarrativesLoading;
