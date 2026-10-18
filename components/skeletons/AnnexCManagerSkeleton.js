import { Skeleton } from "@/components/ui/skeleton";
import AnnualReportSkeleton from "./AnnualReportSkeleton";

export default function AnnexCManagerSkeleton() {
  return (
    <div>
      {/* Inner tab bar (Form / Reports) */}
      <div className="mb-6 rounded-xl bg-secondary p-1.5 sm:w-fit">
        <div className="flex gap-1.5">
          <Skeleton className="h-8 min-w-0 flex-1 rounded-lg sm:h-9 sm:w-20 sm:flex-none" />
          <Skeleton className="h-8 min-w-0 flex-1 rounded-lg sm:h-9 sm:w-24 sm:flex-none" />
        </div>
      </div>

      <div className="space-y-5">
        {/* Search, academic year and status match AnnexCReportFilters. */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="w-full sm:w-64 sm:shrink-0">
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          <div className="flex min-w-0 items-center gap-2">
            <Skeleton className="h-10 min-w-0 flex-1 rounded-md sm:w-44 sm:flex-none" />
            <Skeleton className="h-10 min-w-0 flex-1 rounded-md sm:w-36 sm:flex-none" />
          </div>
        </div>

        {/* Report cards */}
        <AnnualReportSkeleton />

        {/* "See more" */}
        <div className="text-center">
          <Skeleton className="mx-auto h-4 w-20" />
        </div>
      </div>
    </div>
  );
}
