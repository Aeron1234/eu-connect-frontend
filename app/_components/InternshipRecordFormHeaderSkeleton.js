import { Skeleton } from "@/components/ui/skeleton";
import { Plus, ChevronDown } from "lucide-react";

function InternshipRecordFormHeaderSkeleton() {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1 pr-2 space-y-1.5">
        <span className="flex items-center gap-2">
          <Plus className="h-5 w-5 flex-shrink-0 text-stone-300" />
          <Skeleton className="h-4 w-40" />
        </span>
        <Skeleton className="h-3 w-64" />
      </div>

      <ChevronDown className="h-5 w-5 flex-shrink-0 text-stone-300" />
    </div>
  );
}

export default InternshipRecordFormHeaderSkeleton;
