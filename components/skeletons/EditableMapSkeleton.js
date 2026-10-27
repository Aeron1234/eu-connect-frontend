import { Skeleton } from "@/components/ui/skeleton";

export default function EditableMapSkeleton() {
  return <div role="status" aria-label="Loading location map" className="relative h-full min-h-40 w-full bg-muted/30">
    <div aria-hidden="true" className="absolute inset-0 p-3">
      <Skeleton className="absolute inset-0 h-full w-full rounded-lg" />
      <Skeleton className="relative mx-auto h-10 w-2/3 max-w-sm rounded-md" />
      <div className="absolute left-3 top-3 space-y-1"><Skeleton className="size-8 rounded" /><Skeleton className="size-8 rounded" /></div>
    </div>
  </div>;
}
