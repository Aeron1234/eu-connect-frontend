import { Skeleton } from "@/components/ui/skeleton";
import PageTitleSkeleton from "@/app/_components/PageTitleSkeleton";
import AlumniCompaniesSkeleton from "@/app/_components/AlumniCompaniesSkeleton";

function PastInternshipsLoading() {
  return (
    <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <PageTitleSkeleton />
      </div>

      <div className="flex gap-2 flex-col sm:flex-row">
        <Skeleton className="h-10 w-full sm:w-64 rounded-md" />
        <Skeleton className="h-10 w-full sm:w-40 rounded-md" />
      </div>

      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <AlumniCompaniesSkeleton key={i} />
        ))}
      </div>
    </main>
  );
}

export default PastInternshipsLoading;
