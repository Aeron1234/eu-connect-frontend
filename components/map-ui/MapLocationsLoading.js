"use client";

import { Skeleton } from "@/components/ui/skeleton";

export default function MapLocationsLoading() { return (
    <div className="space-y-6" role="status" aria-label="Loading locations">
      <div className="flex flex-col gap-2 sm:flex-row">
        <Skeleton className="h-11 w-full rounded-lg sm:max-w-md" />
        <Skeleton className="h-11 w-full rounded-lg sm:w-44" />
      </div>
      <div className="grid gap-4 sm:gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="rounded-xl border border-border bg-card p-2"><Skeleton className="h-[540px] w-full rounded-xl" /></div>
        <Skeleton className="h-[540px] w-full rounded-xl" />
      </div>
    </div>
  );
}
