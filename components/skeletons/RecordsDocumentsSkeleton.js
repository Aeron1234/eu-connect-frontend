import { Skeleton } from "@/components/ui/skeleton";
import InternshipRequirementsTypeSkeleton from "./InternshipRequirementsTypeSkeleton";
import DocumentCardSkeleton from "./DocumentCardSkeleton";

function RecordsDocumentsSkeleton({ items = 6 }) {
  return (
    <>
      <div className="rounded-xl bg-card border border-border p-5 sm:p-6">
        <InternshipRequirementsTypeSkeleton />
      </div>

      <div className="mt-5 flex justify-start">
        <div className="grid w-full min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2 sm:flex sm:w-auto">
          <div className="col-span-2 min-w-0 sm:w-56">
            <Skeleton className="h-9 w-full rounded-lg" />
          </div>
          <Skeleton className="h-9 w-full min-w-0 rounded-md sm:w-[200px]" />
          <Skeleton className="h-[34px] w-[66px] shrink-0 rounded-lg" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 mt-5">
        {Array.from({ length: items }).map((_, i) => (
          <DocumentCardSkeleton key={i} />
        ))}
      </div>
    </>
  );
}

export default RecordsDocumentsSkeleton;
