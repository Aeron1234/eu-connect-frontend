import { Skeleton } from "@/components/ui/skeleton";

function PostedEvaluationItemSkeleton() {
  return (
    <div className="border border-border rounded-xl bg-card overflow-hidden">
      <div className="w-full flex items-center gap-4 p-4">
        <Skeleton className="w-16 h-16 rounded-full flex-shrink-0" />
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-4 w-32 rounded-full" />
            <Skeleton className="h-4 w-20 rounded-full" />
          </div>
          <Skeleton className="h-3.5 w-40" />
          <div className="flex flex-wrap items-center gap-3 mt-1">
            <Skeleton className="h-2.5 w-24" />
            <Skeleton className="h-2.5 w-28" />
          </div>
        </div>
        <Skeleton className="w-4 h-4 rounded flex-shrink-0" />
      </div>
    </div>
  );
}

export default PostedEvaluationItemSkeleton;
