import { Skeleton } from "@/components/ui/skeleton";

function RecordsHeaderSkeleton() {
  return (
    <div className="rounded-xl bg-primary-500 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-48 bg-white/25" />
          <Skeleton className="h-3.5 w-56 bg-white/25" />
          <Skeleton className="h-3.5 w-64 bg-white/25" />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Skeleton className="h-6 w-32 rounded-full bg-white/25" />
        </div>
      </div>
    </div>
  );
}

export default RecordsHeaderSkeleton;
