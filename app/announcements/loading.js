import { Skeleton } from "@/components/ui/skeleton";
import PageTitleSkeleton from "@/components/skeletons/PageTitleSkeleton";
import AnnouncementCardSkeleton from "@/components/skeletons/AnnouncementCardSkeleton";

function AnnouncementsLoading() {
  return (
    <main className="flex-1 space-y-6 overflow-auto p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <PageTitleSkeleton />
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Skeleton className="h-10 w-full sm:w-64 rounded-md" />
        <Skeleton className="h-10 w-full sm:w-40 rounded-md" />
      </div>

      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <AnnouncementCardSkeleton key={i} showEventDate={i % 2 === 0} />
        ))}
      </div>
    </main>
  );
}

export default AnnouncementsLoading;
