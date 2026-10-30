import { Skeleton } from '@/components/ui/skeleton';

export function StudentTableSkeleton() {
  return <div role="status" aria-label="Loading students" className="space-y-4 p-4">{Array.from({ length: 5 }, (_, i) => <div className="flex items-center gap-3" key={i}><Skeleton className="size-9 rounded-full" /><div className="flex-1 space-y-2"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-3 w-1/2" /></div><Skeleton className="h-7 w-16" /></div>)}</div>;
}
export default function BulkDtrSkeleton() {
  return <div className="space-y-6 p-4 sm:p-8" role="status" aria-label="Loading DTR location assignment"><Skeleton className="h-9 w-64" /><Skeleton className="h-10 w-full" /><div className="grid gap-4 xl:grid-cols-2"><Skeleton className="h-[460px] w-full rounded-xl" /><StudentTableSkeleton /></div></div>;
}
