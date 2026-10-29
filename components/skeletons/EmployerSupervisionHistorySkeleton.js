import { Skeleton } from "@/components/ui/skeleton";

export default function EmployerSupervisionHistorySkeleton() {
  return <section role="status" aria-label="Loading supervised interns" className="min-w-0 space-y-4 rounded-xl border border-border bg-card p-4 shadow-sm sm:p-6">
    <div aria-hidden="true">
      <Skeleton className="h-5 w-56 max-w-full" /><Skeleton className="mt-2 h-3 w-72 max-w-full" />
      <div className="mt-4 space-y-3">{Array.from({ length: 3 }, (_, index) => <div key={index} className="flex gap-3 rounded-lg border border-border p-4">
        <Skeleton className="size-10 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1 space-y-2"><Skeleton className="h-4 w-40 max-w-full" /><Skeleton className="h-3 w-64 max-w-full" /><Skeleton className="h-3 w-48 max-w-full" /></div>
      </div>)}</div>
    </div>
  </section>;
}
