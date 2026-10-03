import { Skeleton } from "@/components/ui/skeleton";
import { User } from "lucide-react";

function AccountProfileBannerSkeleton() {
  return (
    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      <div className="h-14 sm:h-20 bg-primary" />

      <div className="px-4 sm:px-6 pb-4 sm:pb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3 sm:gap-4 -mt-7 sm:-mt-10">
          <div className="shadow-lg w-14 h-14 sm:w-20 sm:h-20 rounded-2xl bg-muted border-2 border-card flex items-center justify-center text-foreground-faint flex-shrink-0">
            <User className="w-7 h-7 sm:w-9 sm:h-9" />
          </div>

          <div className="flex-1 min-w-0 pb-1 space-y-1.5">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AccountProfileBannerSkeleton;
