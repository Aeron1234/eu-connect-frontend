import { Skeleton } from "@/components/ui/skeleton";
import PageTitleSkeleton from "@/app/_components/PageTitleSkeleton";
import ActivityLogsTableSkeleton from "@/app/_components/ActivityLogsTableSkeleton";

function ActivityLogsLoading() {
  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto flex flex-col gap-6">
      <PageTitleSkeleton />

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
    </main>
  );
}

export default ActivityLogsLoading;
