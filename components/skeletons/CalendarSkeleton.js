import { Skeleton } from "@/components/ui/skeleton";
import PageTitleSkeleton from "./PageTitleSkeleton";

export function CalendarMonthGridSkeleton({ days = 35 }) {
  return <div role="status" aria-label="Loading calendar days">
    <div aria-hidden="true">
      <div className="grid grid-cols-7 border-b border-border bg-muted/35 py-2">{Array.from({ length: 7 }, (_, i) => <Skeleton key={i} className="mx-auto h-3 w-5" />)}</div>
      <div className="grid grid-cols-7 gap-px bg-border">{Array.from({ length: days }, (_, i) => <div key={i} className="min-h-12 min-w-0 space-y-2 bg-card p-1 sm:min-h-20 sm:p-2 md:min-h-28"><Skeleton className="size-5 rounded-full" /><Skeleton className="h-1.5 w-3/4 sm:h-3" />{i % 3 === 0 && <Skeleton className="hidden h-3 w-full md:block" />}</div>)}</div>
    </div>
  </div>;
}
export function CalendarOverviewSkeleton() {
  return <aside role="status" aria-label="Loading calendar overview" className="hidden min-w-0 space-y-4 xl:block">
    <div aria-hidden="true" className="space-y-4">
      <div className="space-y-3 rounded-2xl border border-border bg-card p-4"><Skeleton className="h-4 w-32" />{Array.from({ length: 6 }, (_, i) => <div key={i} className="grid grid-cols-7 gap-2">{Array.from({ length: 7 }, (_, j) => <Skeleton key={j} className="h-5 w-full" />)}</div>)}</div>
      <div className="space-y-3 rounded-2xl border border-border bg-card p-4"><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-full" /><Skeleton className="h-3 w-2/3" /></div>
    </div>
  </aside>;
}
export default function CalendarSkeleton() {
  return <div role="status" aria-label="Loading calendar page" className="mx-auto w-full max-w-[1680px] p-3 pb-12 sm:p-6 lg:p-8">
    <div className="mb-5"><PageTitleSkeleton /></div>
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_270px]">
      <div className="min-w-0 space-y-4">
        <div className="overflow-hidden rounded-2xl border border-border bg-card"><div aria-hidden="true" className="space-y-3 p-4"><Skeleton className="h-5 w-40" /><Skeleton className="h-7 w-2/3" /></div><CalendarMonthGridSkeleton /></div>
        <div aria-hidden="true" className="space-y-3 rounded-2xl border border-border bg-card p-4"><Skeleton className="h-5 w-40" /><Skeleton className="h-16 w-full rounded-xl" /><Skeleton className="h-16 w-full rounded-xl" /></div>
      </div>
      <CalendarOverviewSkeleton />
    </div>
  </div>;
}
