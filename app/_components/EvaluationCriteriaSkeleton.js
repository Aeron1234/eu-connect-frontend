import { Skeleton } from "@/components/ui/skeleton";

function EvaluationCriteriaSkeleton() {
  return (
    <div className="flex-1 flex flex-col gap-4">
      <div className="flex gap-2 items-center justify-between mb-4">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-6 w-14 rounded-md" />
      </div>

      {/* Grade scale */}
      <div className="p-4 w-full bg-muted rounded-lg border border-border mb-2">
        <Skeleton className="h-4 w-40 mb-4" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col items-center justify-center gap-1 p-2 bg-card border border-border rounded-lg"
            >
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-2.5 w-14" />
              <Skeleton className="h-2.5 w-12" />
            </div>
          ))}
        </div>
      </div>

      <Skeleton className="h-4 w-44" />

      {/* Evaluation form categories */}
      <div className="flex flex-col gap-6">
        {Array.from({ length: 2 }).map((_, catIdx) => (
          <div
            key={catIdx}
            className="flex-1 flex flex-col rounded-sm border border-border"
          >
            <div className="py-2 px-4 bg-muted rounded-t-sm">
              <Skeleton className="h-3.5 w-32" />
            </div>
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-2 px-4 py-3 border-t border-border"
              >
                <Skeleton className="h-3 w-48" />
                <div className="flex gap-1">
                  {Array.from({ length: 6 }).map((_, g) => (
                    <Skeleton key={g} className="h-6 w-6 rounded-sm" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}

        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-20 w-full rounded-sm" />
        </div>

        <Skeleton className="h-9 w-32 rounded-sm self-end" />
      </div>
    </div>
  );
}

export default EvaluationCriteriaSkeleton;
