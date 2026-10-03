import { Skeleton } from "@/components/ui/skeleton";
import { MapPin } from "lucide-react";

function SetDtrLocationSkeleton() {
  return (
    <div className="bg-card rounded-xl border border-border shadow-sm p-4 sm:p-6 mt-4 space-y-4">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-primary/10 text-primary-emphasis">
          <MapPin className="w-5 h-5 opacity-30" />
        </div>
        <div className="flex-1 min-w-0 space-y-1.5">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-full max-w-md" />
          <Skeleton className="h-3 w-3/4 max-w-sm" />
        </div>
      </div>

      <Skeleton className="h-[400px] w-full rounded-xl" />

      <div className="bg-muted rounded-xl p-3 space-y-1.5">
        <Skeleton className="h-2.5 w-14" />
        <Skeleton className="h-3.5 w-48" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-muted rounded-xl p-3 space-y-1.5">
            <Skeleton className="h-2.5 w-16" />
            <Skeleton className="h-3.5 w-20" />
          </div>
        ))}
      </div>

      <div className="space-y-1.5">
        <Skeleton className="h-2.5 w-24" />
        <Skeleton className="h-10 w-full rounded-md" />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <Skeleton className="h-3 w-40" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-24 rounded-md" />
          <Skeleton className="h-9 w-36 rounded-md" />
        </div>
      </div>
    </div>
  );
}

export default SetDtrLocationSkeleton;
