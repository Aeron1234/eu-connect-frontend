import { Skeleton } from "@/components/ui/skeleton";

function InternshipsPerCourseChartSkeleton() {
  return (
    <div className="rounded-xl bg-white border border-stone-300 shadow-sm p-5 sm:p-6">
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <Skeleton className="w-4 h-4 rounded" />
          <Skeleton className="h-3.5 w-56" />
        </div>
        <Skeleton className="h-3 w-72 mt-2" />
      </div>

      <Skeleton className="h-64 w-full rounded-lg" />
    </div>
  );
}

export default InternshipsPerCourseChartSkeleton;
