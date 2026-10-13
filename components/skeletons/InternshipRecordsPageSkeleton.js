import RecordsPageHeaderSkeleton from "./RecordsPageHeaderSkeleton";
import RecordsPageFilterSkeleton from "./RecordsPageFilterSkeleton";
import RecordCardSkeleton from "./RecordCardSkeleton";

export default function InternshipRecordsPageSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading internship records">
      <RecordsPageHeaderSkeleton />
      <RecordsPageFilterSkeleton />
      <div className="space-y-3">
        {Array.from({ length: 4 }, (_, index) => <RecordCardSkeleton key={index} />)}
      </div>
    </div>
  );
}
