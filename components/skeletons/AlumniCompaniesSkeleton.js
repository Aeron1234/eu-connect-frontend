import { Skeleton } from "@/components/ui/skeleton";
import { ChevronDown } from "lucide-react";

function AlumniCompaniesSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="flex w-full items-center justify-between gap-3 px-4 sm:px-5 py-4">
        <div className="min-w-0 space-y-1.5">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-56" />
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <Skeleton className="h-6 w-20 rounded-full" />
          <ChevronDown className="size-4 text-foreground-faint" />
        </div>
      </div>
    </div>
  );
}

export default AlumniCompaniesSkeleton;
