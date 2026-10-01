import { Skeleton } from "@/components/ui/skeleton";
import { MapPin } from "lucide-react";
import PageTitleSkeleton from "@/app/_components/PageTitleSkeleton";

function MapLoading() {
  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageTitleSkeleton />

        <div className="flex rounded-lg bg-secondary p-1 w-fit gap-1">
          <div className="rounded-md px-3 sm:px-4 py-2">
            <Skeleton className="h-3 w-16" />
          </div>
          <div className="rounded-md px-3 sm:px-4 py-2">
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex gap-2 flex-col sm:flex-row">
          <Skeleton className="h-11 w-full sm:max-w-md rounded-lg" />
          <Skeleton className="h-11 w-full sm:w-44 rounded-lg" />
        </div>

        <div className="grid gap-4 sm:gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="overflow-hidden rounded-xl border border-border bg-card p-2 shadow-sm">
            <Skeleton className="h-[540px] w-full rounded-xl" />
            <Skeleton className="h-3 w-64 mt-2 mx-2" />
          </div>

          {/* This is the real empty state, not a placeholder — selectedId
              starts null regardless of loading status, so the sidebar
              genuinely looks like this until a pin is clicked. */}
          <aside className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm">
            <div className="flex h-full flex-col items-center justify-center gap-2 py-10 text-center">
              <MapPin className="h-8 w-8 text-foreground-faint" />
              <p className="text-sm font-semibold text-foreground">
                No company selected
              </p>
              <p className="text-xs text-muted-foreground">
                Click a pin on the map to see the students deployed there.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default MapLoading;
