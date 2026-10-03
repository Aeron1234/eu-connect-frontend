import { Skeleton } from "@/components/ui/skeleton";

function HTEListSkeleton({ row = 3 }) {
  return (
    <div className="mt-6 space-y-4 sm:space-y-5">
      {Array.from({ length: 2 }).map((_, i) => (
        <section
          key={i}
          className="overflow-hidden rounded-xl border border-border bg-card shadow-sm"
        >
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 sm:px-5 py-4">
            <div className="flex items-center gap-3 min-w-0">
              <Skeleton className="size-9 flex-shrink-0 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-56" />
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-8 w-28 rounded-md" />
            </div>
          </header>

          <div className="px-4 sm:px-5 py-3 space-y-2">
            {Array.from({ length: row }).map((_, j) => (
              <div key={j} className="grid grid-cols-5 gap-3">
                <Skeleton className="h-4 w-6" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export default HTEListSkeleton;
