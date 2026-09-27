import { Skeleton } from "@/components/ui/skeleton";
import { Lock } from "lucide-react";

function SecurityCardSkeleton() {
  return (
    <section className="rounded-xl border border-border bg-background p-6 shadow-sm">
      <Skeleton className="h-2.5 w-16" />

      <div className="mt-4 rounded-lg bg-secondary/70 px-4 py-3">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-stone-300" />
            <Skeleton className="h-3 w-16" />
          </span>
          <Skeleton className="h-3 w-12" />
        </div>
      </div>

      <Skeleton className="h-3 w-full max-w-xs mt-3" />
    </section>
  );
}

export default SecurityCardSkeleton;
