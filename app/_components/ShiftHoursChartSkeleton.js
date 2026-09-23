import { Skeleton } from "@/components/ui/skeleton";

function ShiftHoursChartSkeleton() {
  return (
    <div className="rounded-xl bg-white border border-stone-300 shadow-sm p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Skeleton className="w-4 h-4 rounded" />
            <Skeleton className="h-3.5 w-52" />
          </div>
          <Skeleton className="h-3 w-64 mt-2" />
        </div>
        <Skeleton className="h-8 w-[150px] rounded-md" />
      </div>

      <Skeleton className="h-64 w-full rounded-lg" />
    </div>
  );
}

export default ShiftHoursChartSkeleton;
