import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, Mail, Users } from "lucide-react";

function InternsSupervisedCardSkeleton({ rows = 4 }) {
  return (
    <div className="h-full rounded-xl bg-card border border-border shadow-sm p-5 sm:p-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Users className="w-4 h-4 text-primary-emphasis" />
          Interns You Supervised
        </h3>
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-6 w-10 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </div>

      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between gap-4 rounded-lg border border-border p-4"
          >
            <div className="flex items-start gap-3 min-w-0">
              <Skeleton className="w-10 h-10 flex-shrink-0 rounded-full" />
              <div className="min-w-0 space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <Skeleton className="h-3.5 w-28" />
                  <Skeleton className="h-4 w-16 rounded-full" />
                </div>
                <Skeleton className="h-3 w-40" />
                <div className="flex items-center flex-wrap gap-x-4 gap-y-1 mt-1.5">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-foreground-faint" />
                    <Skeleton className="h-2.5 w-14" />
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-foreground-faint" />
                    <Skeleton className="h-2.5 w-16" />
                  </span>
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-foreground-faint" />
                    <Skeleton className="h-2.5 w-24" />
                  </span>
                </div>
              </div>
            </div>
            <Skeleton className="h-3 w-16 flex-shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default InternsSupervisedCardSkeleton;
