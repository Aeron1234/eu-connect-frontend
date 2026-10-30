import { Skeleton } from "@/components/ui/skeleton";

export default function EditableMapSkeleton() {
  return <div role="status" aria-label="Loading location map" className="relative h-full min-h-40 w-full overflow-hidden bg-muted/30">
    <div aria-hidden="true" className="absolute inset-0 p-3">
      <div className="absolute inset-x-0 top-1/2 -rotate-12"><Skeleton className="h-5 w-full rounded-none" /></div>
      <div className="absolute inset-y-0 left-1/2 rotate-12"><Skeleton className="h-full w-5 rounded-none" /></div>
      <div className="relative mx-auto w-2/3 max-w-sm rounded-md border border-border bg-card p-2 shadow-sm"><Skeleton className="h-6 w-full" /></div>
      <div className="absolute left-3 top-3 space-y-1 rounded border border-border bg-card p-1 shadow-sm"><Skeleton className="size-8 rounded" /><Skeleton className="size-8 rounded" /></div>
    </div>
  </div>;
}
