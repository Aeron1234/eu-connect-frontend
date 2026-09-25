import { Skeleton } from "@/components/ui/skeleton";
import InternshipRequirementsTypeSkeleton from "./InternshipRequirementsTypeSkeleton";
import DocumentCardSkeleton from "./DocumentCardSkeleton";

function RecordsDocumentsSkeleton({ items = 6 }) {
  return (
    <>
      <div className="rounded-xl bg-white border border-stone-200 p-5 sm:p-6">
        <InternshipRequirementsTypeSkeleton />
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center gap-3 mt-5">
        <div className="flex items-center gap-1.5 flex-wrap">
          <Skeleton className="h-7 w-24 rounded-full" />
          <Skeleton className="h-7 w-32 rounded-full" />
          <Skeleton className="h-7 w-32 rounded-full" />
        </div>

        <div className="flex items-center gap-2 lg:ml-auto">
          <Skeleton className="h-9 w-full lg:w-56 rounded-lg" />
          <Skeleton className="h-9 w-[68px] rounded-lg" />
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
