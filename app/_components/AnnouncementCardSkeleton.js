import { Skeleton } from "@/components/ui/skeleton";
import { Pin } from "lucide-react";

function AnnouncementCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-white shadow-sm p-5">
      <div className="flex items-start gap-3">
        <div className="flex size-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary-500/10">
          <Pin className="size-4 text-primary-500/30" />
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-16 rounded-full" />
          </div>

          <Skeleton className="h-3 w-full max-w-md" />
          <Skeleton className="h-3 w-3/4 max-w-sm" />

          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnnouncementCardSkeleton;
