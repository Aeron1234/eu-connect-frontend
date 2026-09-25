import RecordsPageHeaderSkeleton from "@/app/_components/RecordsPageHeaderSkeleton";
import RecordsPageFilterSkeleton from "@/app/_components/RecordsPageFilterSkeleton";
import RecordCardSkeleton from "@/app/_components/RecordCardSkeleton";

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
