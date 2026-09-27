import { Skeleton } from "@/components/ui/skeleton";
import { Building2, ChevronDown } from "lucide-react";

function PastInternshipRecordRowSkeleton() {
  return (
    <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
      <div className="w-full flex items-center justify-between gap-3 p-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex size-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary-500/10 text-primary-300">
            <Building2 className="size-4" />
          </div>
          <div className="min-w-0 space-y-1.5">
            <Skeleton className="h-3.5 w-40" />
            <Skeleton className="h-2.5 w-56" />
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-2.5 w-12" />
          <ChevronDown className="size-4 text-stone-300" />
        </div>
      </div>
    </div>
  );
}

export default PastInternshipRecordRowSkeleton;
