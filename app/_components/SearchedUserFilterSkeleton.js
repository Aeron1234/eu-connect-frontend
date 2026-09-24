import { Skeleton } from "@/components/ui/skeleton";

function SearchedUserFilterSkeleton({ tabs = 4 }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {Array.from({ length: tabs }).map((_, i) => (
        <Skeleton key={i} className="h-9 w-20 rounded-lg" />
      ))}
    </div>
  );
}

export default SearchedUserFilterSkeleton;
