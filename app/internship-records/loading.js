import RecordsPageHeaderSkeleton from "@/components/skeletons/RecordsPageHeaderSkeleton";
import RecordsPageFilterSkeleton from "@/components/skeletons/RecordsPageFilterSkeleton";
import RecordCardSkeleton from "@/components/skeletons/RecordCardSkeleton";

function InternshipRecordsLoading() {
  return (
    <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <RecordsPageHeaderSkeleton />
      <RecordsPageFilterSkeleton />

      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <RecordCardSkeleton key={i} />
        ))}
      </div>
    </main>
  );
}

export default InternshipRecordsLoading;
