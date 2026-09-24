import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, User } from "lucide-react";

function SearchedUserHeaderSkeleton() {
  return (
    <div className="w-full">
      <span className="flex items-center gap-1 text-sm text-stone-400 mb-4">
        <ChevronLeft className="w-4 h-4" /> Back to search
      </span>

      <div className="bg-primary-500 rounded-xl border border-stone-300 shadow-sm overflow-hidden">
        <div className="h-16 sm:h-20 bg-primary-500" />

        <div className="px-4 sm:px-6 pb-4 sm:pb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-8 sm:-mt-10">
            <div className="shadow-lg w-14 h-14 sm:w-20 sm:h-20 rounded-xl bg-stone-100 border-2 border-white flex items-center justify-center text-stone-300 flex-shrink-0">
              <User className="w-7 h-7 sm:w-9 sm:h-9" />
            </div>

            <div className="flex-1 min-w-0 pb-1 space-y-1.5">
              <Skeleton className="h-5 w-40 bg-white/25" />
              <Skeleton className="h-3.5 w-28 bg-white/25" />
            </div>

            <div className="text-left sm:text-right shrink-0 w-full sm:w-auto pb-1 space-y-1.5">
              <Skeleton className="h-7 w-24 bg-white/25 ml-0 sm:ml-auto" />
              <Skeleton className="h-2 w-full sm:w-32 rounded-full bg-white/20" />
              <Skeleton className="h-2.5 w-20 bg-white/25 ml-0 sm:ml-auto" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SearchedUserHeaderSkeleton;
