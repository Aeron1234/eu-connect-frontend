import { Skeleton } from "@/components/ui/skeleton";
import PageTitleSkeleton from "@/components/skeletons/PageTitleSkeleton";
import CompanyRotationsSkeleton from "@/components/skeletons/CompanyRotationsSkeleton";
import InternshipRecordFormSkeleton from "@/components/skeletons/InternshipRecordFormSkeleton";

function InternshipRecordLoading() {
  return (
    <div className="flex min-w-0 flex-col gap-6 p-4 sm:p-6 lg:p-8">
      <PageTitleSkeleton />

      <div className="flex gap-1 rounded-lg p-1 bg-secondary w-full sm:w-fit">
        <Skeleton className="h-9 w-16 rounded-md" />
        <Skeleton className="h-9 w-24 rounded-md" />
      </div>

      <div className="min-w-0">
        <CompanyRotationsSkeleton compact className="mb-4" />
        <InternshipRecordFormSkeleton />
      </div>
    </div>
  );
}

export default InternshipRecordLoading;
