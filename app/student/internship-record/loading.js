import { Skeleton } from "@/components/ui/skeleton";
import PageTitleSkeleton from "@/components/skeletons/PageTitleSkeleton";
import InternshipRecordFormSkeleton from "@/components/skeletons/InternshipRecordFormSkeleton";

function InternshipRecordLoading() {
  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto flex flex-col gap-6">
      <PageTitleSkeleton />

      <div className="flex gap-1 rounded-lg p-1 bg-secondary w-fit">
        <Skeleton className="h-9 w-16 rounded-md" />
        <Skeleton className="h-9 w-24 rounded-md" />
      </div>

      <div className="min-w-0">
        <InternshipRecordFormSkeleton />
      </div>
    </main>
  );
}

export default InternshipRecordLoading;
