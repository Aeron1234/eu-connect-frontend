import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return <main className="space-y-6 p-4 sm:p-6 lg:p-8"><Skeleton className="h-8 w-56" /><Skeleton className="h-36 w-full rounded-xl" /><Skeleton className="h-96 w-full rounded-xl" /></main>;
}
