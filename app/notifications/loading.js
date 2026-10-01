import { Skeleton } from "@/components/ui/skeleton";
import PageTitleSkeleton from "@/app/_components/PageTitleSkeleton";
import NotificationItemSkeleton from "@/app/_components/NotificationItemSkeleton";

function NotificationsLoading() {
  return (
    <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <PageTitleSkeleton />
      </div>

      <div className="space-y-6">
        <div className="grid gap-3 sm:gap-4 grid-cols-2">
          <div className="flex items-center gap-3 sm:gap-4 rounded-xl border border-primary bg-primary px-4 sm:px-5 py-4 sm:py-5 shadow-sm">
            <Skeleton className="size-5 rounded bg-white/30" />
            <div className="space-y-1.5">
              <Skeleton className="h-6 w-10 bg-white/30" />
              <Skeleton className="h-2.5 w-24 bg-white/25" />
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 rounded-xl border border-border bg-card px-4 sm:px-5 py-4 sm:py-5 shadow-sm">
            <Skeleton className="size-5 rounded" />
            <div className="space-y-1.5">
              <Skeleton className="h-6 w-10" />
              <Skeleton className="h-2.5 w-14" />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <NotificationItemSkeleton key={i} />
          ))}
        </div>
      </div>
    </main>
  );
}

export default NotificationsLoading;
