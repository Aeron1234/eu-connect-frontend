import { Skeleton } from "@/components/ui/skeleton";
import { Building2 } from "lucide-react";
import PastInternshipRecordRowSkeleton from "./PastInternshipRecordRowSkeleton";

function PastInternshipDocumentsSkeleton({ rows = 2 }) {
  return (
    <div className="space-y-3">
      <h3 className="flex items-center gap-2">
        <Building2 className="size-4 text-primary-300" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-3 w-32" />
      </h3>
      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, i) => (
          <PastInternshipRecordRowSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export default PastInternshipDocumentsSkeleton;
