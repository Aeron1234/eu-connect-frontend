import { Skeleton } from "@/components/ui/skeleton";

function HTEListSkeleton({ row = 3 }) {
  return (
    <div className="mt-6 space-y-4 sm:space-y-5">
      {Array.from({ length: 2 }).map((_, i) => (
        <section
          key={i}
          className="@container overflow-hidden rounded-xl border border-border bg-card shadow-sm"
        >
          <header className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 gap-y-2 border-b border-border px-4 py-4 sm:px-5 @2xl:grid-cols-[auto_minmax(0,1fr)_auto]">
            <Skeleton className="col-start-1 row-start-1 size-9 rounded-lg" />
            <div className="col-span-2 row-start-2 min-w-0 space-y-2 @2xl:col-span-1 @2xl:col-start-2 @2xl:row-start-1">
              <Skeleton className="h-4 w-40 max-w-full" />
              <Skeleton className="h-3 w-56 max-w-full" />
            </div>
            <div className="col-start-2 row-start-1 flex items-center justify-self-end gap-2 @2xl:col-start-3">
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
