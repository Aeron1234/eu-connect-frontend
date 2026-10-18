import PageTitleSkeleton from "@/components/skeletons/PageTitleSkeleton";
import AnnouncementCardSkeleton from "@/components/skeletons/AnnouncementCardSkeleton";
import AnnouncementBoardFiltersSkeleton from "@/components/skeletons/AnnouncementBoardFiltersSkeleton";

function AnnouncementsLoading() {
  return (
    <main className="flex-1 space-y-6 overflow-auto p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <PageTitleSkeleton />
      </div>

      <AnnouncementBoardFiltersSkeleton />

      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <AnnouncementCardSkeleton key={i} showEventDate={i % 2 === 0} />
        ))}
      </div>
    </main>
  );
}

export default AnnouncementsLoading;
