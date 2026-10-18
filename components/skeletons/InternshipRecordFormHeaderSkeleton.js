import { Skeleton } from "@/components/ui/skeleton";

export default function InternshipRecordFormHeaderSkeleton() {
  return (
    <div className="min-w-0 space-y-2">
      <Skeleton className="mb-3 h-2.5 w-28" />
      <Skeleton className="h-6 w-56 max-w-full" />
      <Skeleton className="h-4 w-full max-w-xl" />
      <Skeleton className="h-4 w-3/4 max-w-md sm:hidden" />
    </div>
  );
}
