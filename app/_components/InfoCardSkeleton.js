import { Skeleton } from "@/components/ui/skeleton";
import { User } from "lucide-react";

function InfoCardSkeleton({ fields = 4 }) {
  return (
    <section className="rounded-xl border border-border bg-background p-6 shadow-sm">
      <span className="flex items-center gap-2">
        <User className="h-4 w-4 text-foreground-faint" />
        <Skeleton className="h-3 w-28" />
      </span>

      <div className="mt-5 space-y-4">
        {Array.from({ length: fields }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <Skeleton className="h-2.5 w-20" />
            <Skeleton className="h-3.5 w-36" />
          </div>
        ))}
      </div>
    </section>
  );
}

export default InfoCardSkeleton;
