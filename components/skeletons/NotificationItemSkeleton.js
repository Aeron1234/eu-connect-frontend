import { Skeleton } from "@/components/ui/skeleton";
import { X } from "lucide-react";

function NotificationItemSkeleton() {
  return (
    <div className="relative flex items-start gap-3 rounded-lg border border-border bg-background px-4 py-3">
      <Skeleton className="size-9 shrink-0 rounded-full" />

      <div className="min-w-0 flex-1 pr-5 space-y-1.5">
        <Skeleton className="h-3.5 w-40" />
        <Skeleton className="h-3 w-full max-w-xs" />
        <Skeleton className="h-2.5 w-28" />
      </div>

      <X className="absolute right-3 top-3 size-3.5 text-muted-foreground/30" />
    </div>
  );
}

export default NotificationItemSkeleton;
