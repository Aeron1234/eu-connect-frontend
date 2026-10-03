import { Skeleton } from "@/components/ui/skeleton";

function EvaluationScoresChartSkeleton() {
  return (
    <div className="rounded-xl bg-card border border-border shadow-sm p-5 sm:p-6">
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <Skeleton className="w-4 h-4 rounded" />
          <Skeleton className="h-3.5 w-40" />
        </div>
        <Skeleton className="h-3 w-64 mt-2" />
      </div>

      <Skeleton className="h-72 w-full rounded-lg" />
    </div>
  );
}

export default EvaluationScoresChartSkeleton;
