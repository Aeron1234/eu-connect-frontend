import { Skeleton } from "@/components/ui/skeleton";

// Placeholder selections are decorative, never real or submittable form controls.
export default function SelectionRowsSkeleton({ label = "Loading selections", search = false, rows = 3 }) {
  return <div role="status" aria-label={label} className="min-w-0 space-y-3">
    <div aria-hidden="true" className="space-y-3">
      {search && <Skeleton className="h-10 w-full rounded-md" />}
      {Array.from({ length: rows }, (_, index) => <div key={index} className="flex items-start gap-3 rounded-lg border border-border p-3">
        <Skeleton className="mt-0.5 size-4 shrink-0 rounded" />
        <div className="min-w-0 flex-1 space-y-2"><Skeleton className="h-4 w-40 max-w-full" /><Skeleton className="h-3 w-60 max-w-full" /></div>
      </div>)}
    </div>
  </div>;
}
