import { Skeleton } from "@/components/ui/skeleton";

// Match the shared rotation panel without implying that assignments or edit access exist.
export default function CompanyRotationsSkeleton({ compact = false, readOnly = false, className = "" }) {
  return (
    <section role="status" aria-label="Loading company rotations" className={`min-w-0 rounded-xl border border-border bg-card p-4 sm:p-5 ${className}`}>
      <div aria-hidden="true" className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-5 w-44 max-w-full" />
            <Skeleton className="h-3 w-full max-w-lg" />
          </div>
          {!readOnly && <Skeleton className="h-8 w-28 rounded-md" />}
        </div>
        <div className="space-y-2 rounded-lg bg-muted/50 p-3">
          <Skeleton className="h-3 w-28 max-w-full" />
          <Skeleton className="h-4 w-44 max-w-full" />
          <Skeleton className="h-3 w-60 max-w-full" />
        </div>
        {compact ? <Skeleton className="h-4 w-28" /> : (
          <div className="space-y-3">
            {!readOnly && <Skeleton className="h-8 w-full rounded-md sm:w-32" />}
            {[0, 1].map(item => <div key={item} className="space-y-2 rounded-lg border border-border p-3 sm:p-4">
              <Skeleton className="h-4 w-40 max-w-full" />
              <Skeleton className="h-3 w-60 max-w-full" />
              <Skeleton className="h-3 w-36 max-w-full" />
            </div>)}
          </div>
        )}
      </div>
    </section>
  );
}
