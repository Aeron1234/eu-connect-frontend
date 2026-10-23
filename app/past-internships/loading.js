import { Skeleton } from "@/components/ui/skeleton";
import PageTitleSkeleton from "@/components/skeletons/PageTitleSkeleton";
import AlumniCompaniesSkeleton from "@/components/skeletons/AlumniCompaniesSkeleton";

function PastInternshipsLoading() {
  return (
    <div className="min-w-0 p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <PageTitleSkeleton />
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Skeleton className="h-10 w-full sm:w-64 rounded-md" />
        <div className="grid min-w-0 grid-cols-2 gap-2 sm:grid-cols-[10rem_10rem]">
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      </div>

      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <AlumniCompaniesSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export default PastInternshipsLoading;
