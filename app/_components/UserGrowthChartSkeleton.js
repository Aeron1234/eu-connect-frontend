import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp } from "lucide-react";

function UserGrowthChartSkeleton() {
  return (
    <div className="rounded-xl bg-card border border-border shadow-sm p-5 sm:p-6">
      <div className="mb-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <TrendingUp className="w-4 h-4 text-primary-emphasis" />
          User Growth Over Time
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          New signups per month, split by role
        </p>
      </div>

      <Skeleton className="h-72 w-full rounded-lg" />

      <div className="flex items-center justify-center gap-5 mt-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <Skeleton className="w-2.5 h-2.5 rounded-full" />
            <Skeleton className="h-2.5 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default UserGrowthChartSkeleton;
