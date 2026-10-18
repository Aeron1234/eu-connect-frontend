import { Skeleton } from "@/components/ui/skeleton";

function FieldSkeleton() {
  return <div className="min-w-0"><Skeleton className="mb-2 h-3 w-20" /><Skeleton className="h-11 w-full rounded-lg" /></div>;
}

function SectionSkeleton({ credentials = false }) {
  return <div className="space-y-5">
    <div className="flex gap-3"><Skeleton className="size-7 shrink-0 rounded-lg" /><div className="min-w-0 flex-1 space-y-2"><Skeleton className="h-3.5 w-28" /><Skeleton className="h-3 w-3/4 max-w-80" /></div></div>
    <div className={credentials ? "grid grid-cols-1 gap-5 sm:grid-cols-2" : "grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_6rem_minmax(0,1fr)]"}>
      <FieldSkeleton /><FieldSkeleton />{!credentials && <FieldSkeleton />}
    </div>
    {!credentials && <><Skeleton className="h-3 w-2/3" /><FieldSkeleton /></>}
  </div>;
}

export default function CreateAccountFormSkeleton() {
  return <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm" role="status" aria-label="Loading account form">
    <div className="border-b border-border p-5 sm:p-6">
      <Skeleton className="h-4 w-44" /><Skeleton className="mt-2 h-3 w-3/4 max-w-80" />
      <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-20 rounded-xl sm:h-32" />)}</div>
    </div>
    <div className="grid min-w-0 xl:grid-cols-[minmax(0,1fr)_17rem]">
      <div className="space-y-7 p-5 sm:space-y-8 sm:p-6 lg:p-7"><SectionSkeleton /><div className="border-t border-border" /><SectionSkeleton credentials /></div>
      <div className="border-t border-border bg-muted/20 p-5 sm:p-6 xl:border-l xl:border-t-0"><Skeleton className="h-3 w-28" /><Skeleton className="mt-5 size-14 rounded-2xl" /><Skeleton className="mt-4 h-4 w-32" /><Skeleton className="mt-2 h-6 w-24 rounded-full" /><div className="mt-6 space-y-4 border-t border-border pt-5">{Array.from({ length: 2 }, (_, index) => <div key={index} className="space-y-2"><Skeleton className="h-3 w-16" /><Skeleton className="h-3 w-32" /></div>)}</div></div>
    </div>
    <div className="flex flex-col gap-3 border-t border-border bg-muted/15 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"><Skeleton className="h-3 w-3/4 max-w-72" /><Skeleton className="h-11 w-full rounded-lg sm:w-44" /></div>
  </div>;
}
