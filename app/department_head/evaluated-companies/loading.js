import { Skeleton } from "@/components/ui/skeleton";

export default function EvaluatedCompaniesLoading() {
  return <main className="space-y-5 p-4 sm:p-6 lg:p-8" aria-label="Loading evaluated companies"><Skeleton className="h-8 w-64" /><Skeleton className="h-28 w-full rounded-xl" /><div className="grid gap-3 sm:grid-cols-2"><Skeleton className="h-28 rounded-xl" /><Skeleton className="h-28 rounded-xl" /></div>{Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-44 rounded-xl" />)}</main>;
}
