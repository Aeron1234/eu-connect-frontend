import { Skeleton } from "@/components/ui/skeleton";
import PageTitleSkeleton from "./PageTitleSkeleton";

function AccountPageHeaderSkeleton() {
  return (
    <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-end md:justify-between">
      <PageTitleSkeleton />
      <Skeleton className="h-11 w-full sm:w-40 rounded-md" />
    </div>
  );
}

export default AccountPageHeaderSkeleton;
