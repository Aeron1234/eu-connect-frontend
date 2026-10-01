import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";
import PageTitleSkeleton from "./PageTitleSkeleton";

function RecordsPageHeaderSkeleton() {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <PageTitleSkeleton />

      <div className="relative md:w-80">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-faint" />
        <Skeleton className="h-11 w-full rounded-lg" />
      </div>
    </div>
  );
}

export default RecordsPageHeaderSkeleton;
