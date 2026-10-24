export default function Loading() {
  return <div role="status" aria-label="Loading feedback" className="space-y-4 p-4 sm:p-6"><div className="h-7 w-56 animate-pulse rounded bg-muted" /><div className="grid gap-4 lg:grid-cols-[minmax(17rem,0.85fr)_minmax(0,1.3fr)]"><div className="h-[65dvh] animate-pulse rounded-xl border border-border bg-muted/40" /><div className="hidden h-[65dvh] animate-pulse rounded-xl border border-border bg-muted/40 lg:block" /></div></div>;
}
