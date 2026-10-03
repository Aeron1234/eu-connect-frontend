import { Skeleton } from "@/components/ui/skeleton";
import AnnexCManagerSkeleton from "./AnnexCManagerSkeleton";

export default function SIPPReportsManagerSkeleton() {
  return (
    <div className="space-y-6">
      {/* Scope tab bar (Annex C / Annex D) */}
      <div className="rounded-xl bg-secondary shadow-sm p-1.5 sm:w-fit">
        <div className="flex gap-1.5">
          <Skeleton className="h-8 w-40 rounded-lg" />
          <Skeleton className="h-8 w-40 rounded-lg" />
        </div>
      </div>

      {/* Default scope is "annex-c" */}
      <AnnexCManagerSkeleton />
    </div>
  );
}
