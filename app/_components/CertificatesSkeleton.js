import { Skeleton } from "@/components/ui/skeleton";
import { Building2 } from "lucide-react";

function CertificatesSkeleton({ rows = 2 }) {
  return (
    <div className="bg-white rounded-xl border border-stone-300 shadow-sm p-4 sm:p-6 space-y-5">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
          <Building2 className="w-5 h-5 text-primary-300" />
        </div>
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-64" />
        </div>
      </div>

      <div className="rounded-xl border border-dashed border-stone-300 bg-stone-50 p-4 sm:p-5 space-y-4">
        <div className="w-full flex flex-col items-center justify-center gap-2 py-6">
          <Skeleton className="w-6 h-6 rounded" />
          <Skeleton className="h-3.5 w-48" />
          <Skeleton className="h-2.5 w-40" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Skeleton className="h-2.5 w-16" />
            <Skeleton className="h-9 w-full rounded-md" />
          </div>
          <div className="space-y-1.5">
            <Skeleton className="h-2.5 w-24" />
            <Skeleton className="h-9 w-full rounded-md" />
          </div>
        </div>

        <Skeleton className="h-9 w-32 rounded-md" />
      </div>

      <div className="space-y-2">
        <Skeleton className="h-2.5 w-32" />
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-lg border border-stone-200 bg-white p-3"
          >
            <Skeleton className="w-9 h-9 rounded-lg flex-shrink-0" />
            <div className="flex-1 min-w-0 space-y-1.5">
              <Skeleton className="h-3.5 w-40" />
              <Skeleton className="h-2.5 w-32" />
            </div>
            <Skeleton className="h-4 w-4" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default CertificatesSkeleton;
