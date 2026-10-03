import { Skeleton } from "@/components/ui/skeleton";

function PageTitleSkeleton({ hasIcon = true }) {
  return (
    <div className="flex items-start gap-3">
      {hasIcon && <Skeleton className="w-10 h-10 rounded-lg flex-shrink-0" />}
      <div className="space-y-1.5 min-w-0">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-3 w-72 max-w-full" />
      </div>
    </div>
  );
}

export default PageTitleSkeleton;
