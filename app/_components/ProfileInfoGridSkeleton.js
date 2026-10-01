import { Skeleton } from "@/components/ui/skeleton";

function InfoItemSkeleton() {
  return (
    <div className="flex items-start gap-3 bg-muted/50 rounded-lg p-4">
      <Skeleton className="w-9 h-9 rounded-lg flex-shrink-0" />
      <div className="min-w-0 flex-1 space-y-1.5">
        <Skeleton className="h-2.5 w-24" />
        <Skeleton className="h-3.5 w-32" />
      </div>
    </div>
  );
}

function ProfileInfoGridSkeleton({ items = 4 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {Array.from({ length: items }).map((_, i) => (
        <InfoItemSkeleton key={i} />
      ))}
    </div>
  );
}

export default ProfileInfoGridSkeleton;
