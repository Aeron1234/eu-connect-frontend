import { Skeleton } from "@/components/ui/skeleton";
import HTEListSkeleton from "./HTEListSkeleton";

export default function AnnexDHteListSkeleton() {
  return (
    <div>
      {/* Filter row: search + year pills */}
      <div className="flex gap-2 flex-col sm:flex-row">
        <Skeleton className="h-10 w-full sm:w-72 rounded-md" />
        <div className="flex flex-wrap items-center gap-2">
          <Skeleton className="h-7 w-14 rounded-full" />
          <Skeleton className="h-7 w-20 rounded-full" />
          <Skeleton className="h-7 w-20 rounded-full" />
        </div>
      </div>

      {/* Stat cards */}
      <div className="mt-6 grid gap-3 sm:gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 sm:gap-4 rounded-xl border border-border bg-card px-4 sm:px-5 py-4 sm:py-5 shadow-sm"
          >
            <Skeleton className="size-5 rounded" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-14" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>

      {/* Company sections */}
      <HTEListSkeleton />

      {/* "See more" */}
      <div className="mt-5 text-center">
        <Skeleton className="mx-auto h-4 w-20" />
      </div>
    </div>
  );
}
