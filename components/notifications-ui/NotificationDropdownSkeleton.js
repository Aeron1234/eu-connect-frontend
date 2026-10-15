"use client";

import { Skeleton } from "@/components/ui/skeleton";

export default function NotificationDropdownSkeleton() {
  return (
    <div role="status" aria-label="Loading notifications">
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className="flex gap-2.5 border-b border-border/60 px-4 py-3 last:border-0"
        >
          <Skeleton className="size-8 shrink-0 rounded-lg" />
          <div className="flex-1 space-y-2 py-0.5">
            <Skeleton className="h-2.5 w-1/3" />
            <Skeleton className="h-3.5 w-2/3" />
            <Skeleton className="h-3 w-full" />
          </div>
        </div>
      ))}
      <span className="sr-only">Loading notifications...</span>
    </div>
  );
}
