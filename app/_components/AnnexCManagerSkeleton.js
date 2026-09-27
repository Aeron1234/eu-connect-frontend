import { Skeleton } from "@/components/ui/skeleton";
import AnnualReportSkeleton from "./AnnualReportSkeleton";

export default function AnnexCManagerSkeleton() {
  return (
    <div>
      {/* Inner tab bar (Form / Reports) */}
      <div className="mb-6 rounded-xl bg-stone-200 p-1.5 sm:w-fit">
        <div className="flex gap-1.5">
          <Skeleton className="h-8 w-20 rounded-lg" />
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
      </div>

      <div className="space-y-5">
        {/* Filter row: search + year pills */}
        <div className="flex gap-2 flex-col sm:flex-row">
          <Skeleton className="h-10 w-full sm:w-72 rounded-md" />
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-7 w-14 rounded-full" />
            <Skeleton className="h-7 w-20 rounded-full" />
            <Skeleton className="h-7 w-20 rounded-full" />
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
