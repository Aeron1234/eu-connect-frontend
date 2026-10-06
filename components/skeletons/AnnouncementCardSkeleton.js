import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, CalendarDays, Pin } from "lucide-react";

function AnnouncementCardSkeleton({ showEventDate = true }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5">
      <div className="flex items-start gap-2.5 sm:gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Pin className="size-4 text-primary-emphasis/30" />
        </div>
        <Skeleton className="mt-1 h-4 w-40 max-w-[55%] sm:h-5 sm:w-56" />
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1.5">
        <Skeleton className="h-5 w-16 rounded-full" />
        <div className="flex items-center gap-1">
          <Calendar className="size-3.5 text-muted-foreground/40" aria-hidden="true" />
          <Skeleton className="h-3 w-28" />
        </div>
      </div>

      <div className="mt-3 space-y-2.5">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-11/12" />
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="h-3 w-1/2 sm:hidden" />
      </div>

      {showEventDate && (
        <div className="mt-3 flex w-fit items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/5 px-2.5 py-1.5">
          <CalendarDays className="size-3.5 text-primary-emphasis/40" aria-hidden="true" />
          <Skeleton className="h-3 w-40 max-w-[55vw]" />
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-4 w-12 rounded-full" />
      </div>
    </div>
  );
}

export default AnnouncementCardSkeleton;
