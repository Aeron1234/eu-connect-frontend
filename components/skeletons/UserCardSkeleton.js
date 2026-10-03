import { Skeleton } from "@/components/ui/skeleton";
import { User } from "lucide-react";

function UserCardSkeleton() {
  return (
    <div className="w-full bg-card rounded-xl border border-border shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 sm:p-5">
        <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
          <div className="w-12 h-12 sm:w-15 sm:h-15 rounded-xl bg-muted border-2 border-primary-100 flex items-center justify-center text-foreground-faint flex-shrink-0">
            <User className="w-7 h-7 sm:w-9 sm:h-9" />
          </div>

          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-16 rounded-full" />
            </div>
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserCardSkeleton;
