import { Skeleton } from '@/components/ui/skeleton';
import EditableMapSkeleton from '@/components/skeletons/EditableMapSkeleton';

export function StudentTableSkeleton() {
  return <div role="status" aria-label="Loading students" className="space-y-4 p-4">{Array.from({ length: 5 }, (_, i) => <div className="flex items-center gap-3" key={i}><Skeleton className="size-9 rounded-full" /><div className="flex-1 space-y-2"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-3 w-1/2" /></div><Skeleton className="h-7 w-16" /></div>)}</div>;
}
export default function BulkDtrSkeleton() {
  return <div className="min-w-0 space-y-6 p-4 sm:p-8" role="status" aria-label="Loading DTR location assignment"><Skeleton className="h-9 w-64 max-w-full" /><div className="grid gap-3 sm:grid-cols-3">{[0,1,2].map(i=><Skeleton key={i} className="h-10 w-full" />)}</div><div className="grid min-w-0 gap-4 xl:grid-cols-2"><div className="min-w-0 overflow-hidden rounded-xl border border-border bg-card"><div className="space-y-3 p-4"><Skeleton className="h-5 w-48 max-w-full"/><Skeleton className="h-3 w-3/4"/></div><div className="h-[360px] sm:h-[460px]"><EditableMapSkeleton/></div></div><div className="min-w-0 rounded-xl border border-border bg-card"><div className="border-b border-border p-4"><Skeleton className="h-5 w-32"/></div><StudentTableSkeleton /></div></div></div>;
}
