import { Skeleton } from "@/components/ui/skeleton";
import PageTitleSkeleton from "@/components/skeletons/PageTitleSkeleton";
import EvaluationCriteriaListSkeleton from "@/components/skeletons/EvaluationCriteriaListSkeleton";

function EvaluationCriteriaLoading() {
  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto space-y-6">
      <PageTitleSkeleton />

      <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex rounded-lg bg-secondary p-1 gap-1">
          <Skeleton className="h-9 w-20 rounded-md" />
          <Skeleton className="h-9 w-20 rounded-md" />
        </div>

        <div className="flex gap-6">
          <div className="space-y-1">
            <Skeleton className="h-2.5 w-14" />
            <Skeleton className="h-5 w-8" />
          </div>
          <div className="space-y-1">
            <Skeleton className="h-2.5 w-20" />
            <Skeleton className="h-5 w-8" />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Skeleton className="h-7 w-12 rounded-full" />
        <Skeleton className="h-7 w-16 rounded-full" />
        <Skeleton className="h-7 w-20 rounded-full" />
      </div>

      <EvaluationCriteriaListSkeleton />

      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-sm sm:flex-row">
        <Skeleton className="h-11 flex-1 rounded-lg" />
        <Skeleton className="h-11 w-full sm:w-40 rounded-lg" />
      </div>
    </main>
  );
}

export default EvaluationCriteriaLoading;
