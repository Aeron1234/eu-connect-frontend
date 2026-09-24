import { Skeleton } from "@/components/ui/skeleton";
import InternshipPostsListSkeleton from "./InternshipPostsListSkeleton";

function InternshipPostsSkeleton({ rows = 3 }) {
  return (
    <>
      <div className="flex gap-2 flex-col sm:flex-row">
        <Skeleton className="h-10 w-full sm:w-64 rounded-md" />
        <div className="flex gap-2 flex-wrap">
          <Skeleton className="h-10 w-32 rounded-md" />
          <Skeleton className="h-10 w-28 rounded-md" />
        </div>
      </div>

      <Skeleton className="h-3 w-20" />

      <div className="space-y-4 sm:space-y-6">
        {Array.from({ length: rows }).map((_, i) => (
          <InternshipPostsListSkeleton key={i} />
        ))}
      </div>
    </>
  );
}

export default InternshipPostsSkeleton;
