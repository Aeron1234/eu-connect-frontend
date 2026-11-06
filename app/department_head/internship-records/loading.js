import InternshipRecordsPageSkeleton from "@/components/skeletons/InternshipRecordsPageSkeleton";

function InternshipRecordsLoading() {
  return (
    <div className="min-w-0 p-4 sm:p-6 lg:p-8 space-y-6">
      <InternshipRecordsPageSkeleton />
    </div>
  );
}

export default InternshipRecordsLoading;
