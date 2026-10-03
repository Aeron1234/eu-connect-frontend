import { Skeleton } from "@/components/ui/skeleton";
import PageTitleSkeleton from "@/components/skeletons/PageTitleSkeleton";

export default function CacheMonitoringLoading() {
  return (
    <main className="space-y-6 p-4 sm:p-6 lg:p-8">
      <PageTitleSkeleton />
      <Skeleton className="h-12 w-full rounded-xl" />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-32 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-72 w-full rounded-xl" />
    </main>
  );
}
