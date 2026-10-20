import { Skeleton } from "@/components/ui/skeleton";
import PageTitleSkeleton from "@/components/skeletons/PageTitleSkeleton";
import ActivityLogsTableSkeleton from "@/components/skeletons/ActivityLogsTableSkeleton";

function ActivityLogsLoading() {
  return (
    <div className="min-w-0 p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
      <PageTitleSkeleton />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-32 rounded-xl" />
        ))}
      </div>

      <div className="flex gap-2 flex-col sm:flex-row">
        <Skeleton className="h-10 w-full sm:w-64 rounded-md" />
        <div className="flex gap-2 flex-wrap">
          <Skeleton className="h-10 w-32 rounded-md" />
          <Skeleton className="h-10 w-32 rounded-md" />
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
        <ActivityLogsTableSkeleton />
      </div>
    </div>
  );
}

export default ActivityLogsLoading;
