import { Skeleton } from "@/components/ui/skeleton";

export default function FeedbackThreadSkeleton() {
  return <div role="status" aria-label="Loading discussion" className="min-w-0 space-y-5">
    <div aria-hidden="true" className="space-y-5">
      <div className="flex items-center justify-between gap-3"><Skeleton className="h-3 w-40 max-w-full" /><Skeleton className="h-6 w-16 rounded-full" /></div>
      <div className="space-y-2"><Skeleton className="h-6 w-3/4" /><Skeleton className="h-3 w-48 max-w-full" /></div>
      <div className="space-y-2"><Skeleton className="h-3 w-full" /><Skeleton className="h-3 w-full" /><Skeleton className="h-3 w-2/3" /></div>
      <Skeleton className="h-16 w-full rounded-lg" />
      <div className="space-y-3 border-t border-border pt-4"><Skeleton className="h-4 w-20" />{[0, 1].map(i => <div key={i} className="space-y-3 rounded-lg bg-muted/30 p-3"><Skeleton className="h-3 w-40 max-w-full" /><Skeleton className="h-3 w-full" /><Skeleton className="h-3 w-2/3" /></div>)}</div>
    </div>
  </div>;
}
