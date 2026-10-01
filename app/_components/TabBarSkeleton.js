import { Skeleton } from "@/components/ui/skeleton";

function TabBarSkeleton({ tabs = 5, showBadges = false }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {Array.from({ length: tabs }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-1.5 h-9 px-3 rounded-lg border border-border bg-card"
        >
          <Skeleton className="h-3 w-16" />
          {showBadges && <Skeleton className="h-4 w-5 rounded-full" />}
        </div>
      ))}
    </div>
  );
}

export default TabBarSkeleton;
