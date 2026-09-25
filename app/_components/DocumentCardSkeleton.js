import { Skeleton } from "@/components/ui/skeleton";

function DocumentCardSkeleton() {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-4">
      <div className="flex items-start justify-between gap-2">
        <Skeleton className="w-10 h-10 rounded-lg" />
        <Skeleton className="h-4 w-16 rounded-full" />
      </div>
      <Skeleton className="h-3.5 w-full mt-3" />
      <Skeleton className="h-3.5 w-2/3 mt-1" />
      <Skeleton className="h-2.5 w-20 mt-1.5" />
      <div className="mt-3 pt-3 border-t border-border/60 flex items-center justify-between">
        <Skeleton className="h-2.5 w-20" />
        <div className="flex items-center gap-1">
          <Skeleton className="h-6 w-6 rounded-md" />
          <Skeleton className="h-6 w-6 rounded-md" />
        </div>
      </div>
    </div>
  );
}

export default DocumentCardSkeleton;
