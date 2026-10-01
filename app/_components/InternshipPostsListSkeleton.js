import { Skeleton } from "@/components/ui/skeleton";
import { Clock, Globe, Mail, MapPin, Phone } from "lucide-react";

function InternshipPostsListSkeleton() {
  return (
    <article className="rounded-xl border border-border bg-card p-4 sm:p-6 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 gap-3 sm:gap-4">
          <Skeleton className="h-10 w-10 flex-shrink-0 rounded-lg" />
          <div className="min-w-0 space-y-1.5">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-28" />
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-4 w-24" />
      </div>

      <div className="mt-4 space-y-1.5">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
        <span className="flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 text-foreground-faint" />
          <Skeleton className="h-2.5 w-20" />
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-foreground-faint" />
          <Skeleton className="h-2.5 w-16" />
        </span>
        <Skeleton className="h-4 w-14 rounded-md" />
        <Skeleton className="h-2.5 w-24 ml-0 sm:ml-auto" />
      </div>

      <div className="mt-4 space-y-2">
        <Skeleton className="h-2.5 w-24" />
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-11/12" />
          <Skeleton className="h-3 w-4/5" />
        </div>
      </div>

      <div className="mt-5 border-t border-border pt-4">
        <Skeleton className="h-2.5 w-28" />
        <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-2">
          <Skeleton className="h-3 w-28" />
          <span className="flex items-center gap-1.5">
            <Mail className="h-3.5 w-3.5 text-foreground-faint" />
            <Skeleton className="h-2.5 w-32" />
          </span>
          <span className="flex items-center gap-1.5">
            <Phone className="h-3.5 w-3.5 text-foreground-faint" />
            <Skeleton className="h-2.5 w-24" />
          </span>
          <span className="flex items-center gap-1.5">
            <Globe className="h-3.5 w-3.5 text-foreground-faint" />
            <Skeleton className="h-2.5 w-28" />
          </span>
        </div>
      </div>
    </article>
  );
}

export default InternshipPostsListSkeleton;
