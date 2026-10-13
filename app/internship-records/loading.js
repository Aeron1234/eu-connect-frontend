import InternshipRecordsPageSkeleton from "@/components/skeletons/InternshipRecordsPageSkeleton";

function InternshipRecordsLoading() {
  return (
    <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <InternshipRecordsPageSkeleton />
    </main>
  );
}

export default InternshipRecordsLoading;
