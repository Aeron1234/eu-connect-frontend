import { Skeleton } from "@/components/ui/skeleton";
import { PieChart as PieChartIcon } from "lucide-react";

function UsersByRoleChartSkeleton() {
  return (
    <div className="rounded-xl bg-white border border-stone-300 shadow-sm p-5 sm:p-6">
      <div className="mb-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-stone-800">
          <PieChartIcon className="w-4 h-4 text-primary-500" />
          Users by Role
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          Role distribution across the whole system
        </p>
      </div>

      <div className="h-64 w-full bg-stone-100 rounded-lg p-3 flex flex-col items-center justify-center gap-4">
        <Skeleton className="w-28 h-28 rounded-full" />
        <div className="flex flex-wrap items-center justify-center gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <Skeleton className="w-2.5 h-2.5 rounded-full" />
              <Skeleton className="h-2.5 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default UsersByRoleChartSkeleton;
