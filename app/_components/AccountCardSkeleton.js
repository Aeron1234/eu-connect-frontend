import { Skeleton } from "@/components/ui/skeleton";
import { User } from "lucide-react";

function AccountCardSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 rounded-xl border border-stone-300 bg-white p-4 sm:p-5 shadow-sm">
      <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
        <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-stone-100 text-stone-300">
          <User className="h-5 w-5" />
        </span>

        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="h-4 w-20 rounded-full" />
          </div>
          <Skeleton className="h-2.5 w-40" />
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0">
        <Skeleton className="h-2.5 w-24" />
        <Skeleton className="h-8 w-24 rounded-md" />
      </div>
    </div>
  );
}

export default AccountCardSkeleton;
