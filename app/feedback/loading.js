import { Skeleton } from '@/components/ui/skeleton';
export default function Loading() {
  return <div role="status" aria-label="Loading feedback" className="space-y-4 p-4 sm:p-6"><Skeleton className="h-7 w-56" /><div className="grid gap-4 lg:grid-cols-[minmax(17rem,0.85fr)_minmax(0,1.3fr)]"><Skeleton className="h-[65dvh] rounded-xl border border-border" /><Skeleton className="hidden h-[65dvh] rounded-xl border border-border lg:block" /></div></div>;
}
