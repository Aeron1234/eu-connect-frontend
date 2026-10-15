"use client";

import { Skeleton } from "@/components/ui/skeleton";

export default function PastInternshipFilesSkeleton() { return (
    <div className="space-y-3 p-2" role="status" aria-label="Loading files">
      {Array.from({ length: 3 }, (_, index) => (
        <div key={index} className="flex items-center gap-3 rounded-lg border border-border/60 p-3">
          <Skeleton className="size-9 shrink-0 rounded-lg" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-3 w-2/3 max-w-56" />
            <Skeleton className="h-2.5 w-1/3 max-w-32" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  ); }
