import { Skeleton } from "@/components/ui/skeleton";

function RoleContentSkeleton() {
  return (
    <main className="flex-1 space-y-6 overflow-auto p-4 sm:p-6 lg:p-8" role="status" aria-label="Loading page">
      <div className="space-y-2">
        <Skeleton className="h-7 w-52" />
        <Skeleton className="h-3 w-full max-w-sm" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => <Skeleton key={index} className="h-28 rounded-xl" />)}
      </div>
      <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
        <Skeleton className="mb-5 h-4 w-40" />
        <div className="space-y-4">
          {Array.from({ length: 5 }, (_, index) => <Skeleton key={index} className="h-12 w-full rounded-lg" />)}
        </div>
      </div>
    </main>
  );
}

export default RoleContentSkeleton;
