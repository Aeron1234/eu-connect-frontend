import { Skeleton } from "@/components/ui/skeleton";
import PageTitleSkeleton from "@/app/_components/PageTitleSkeleton";
import RecordsDocumentsSkeleton from "@/app/_components/RecordsDocumentsSkeleton";
import PastInternshipDocumentsSkeleton from "@/app/_components/PastInternshipDocumentsSkeleton";

function StorageLoading() {
  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <PageTitleSkeleton />
        <Skeleton className="h-11 w-full sm:w-36 rounded-md" />
      </div>

      <RecordsDocumentsSkeleton />
      <PastInternshipDocumentsSkeleton />
    </main>
  );
}

export default StorageLoading;
