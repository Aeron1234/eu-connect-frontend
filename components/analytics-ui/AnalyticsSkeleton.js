import { Skeleton } from '@/components/ui/skeleton';
const card='min-w-0 rounded-xl border border-border bg-card p-4 sm:p-5';
export default function AnalyticsSkeleton({registrar=false,admin=false}){return <div role="status" aria-label="Loading analytics" className="min-w-0 space-y-5 p-4 sm:p-6 lg:p-8">
  <Skeleton className="h-8 w-52 max-w-full"/>
  <div className={`${card} space-y-3`}><div className={`grid gap-3 sm:grid-cols-2 ${admin&&!registrar?'xl:grid-cols-4':'xl:grid-cols-3'}`}>{Array.from({length:registrar?1:admin?4:3},(_,i)=><Skeleton key={i} className="h-10 w-full"/>)}</div>{!registrar&&<div className="grid gap-3 sm:grid-cols-2">{[0,1].map(i=><Skeleton key={i} className="h-12 w-full"/>)}</div>}</div>
  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">{[0,1,2,3].map(i=><div key={i} className={card}><Skeleton className="h-3 w-3/4"/><Skeleton className="mt-5 h-8 w-16"/></div>)}</div>
  <div className="grid min-w-0 gap-4 xl:grid-cols-2">{[0,1].map(i=><div key={i} className={card}><Skeleton className="h-5 w-2/3"/><div className="mt-6 space-y-5 border-b border-l border-border p-4">{['w-full','w-4/5','w-3/5','w-2/5'].map(width=><Skeleton key={width} className={`h-7 ${width}`}/>)}</div></div>)}</div>
  <div className={`${card} space-y-4`}><Skeleton className="h-5 w-44 max-w-full"/>{[0,1,2,3].map(i=><Skeleton key={i} className="h-5 w-full"/>)}</div>
</div>;}
