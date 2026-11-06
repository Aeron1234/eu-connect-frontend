import { ChevronLeft } from "lucide-react";
import RecordsHeaderSkeleton from "@/components/skeletons/RecordsHeaderSkeleton";
import TabBarSkeleton from "@/components/skeletons/TabBarSkeleton";
import RecordsOverviewSkeleton from "@/components/skeletons/RecordsOverviewSkeleton";

function InternshipRecordDetailLoading() {
  return (
    <div className="min-w-0 p-4 sm:p-6 lg:p-8 space-y-6">
      <span className="inline-flex items-center gap-2 text-sm text-foreground-subtle">
        <ChevronLeft className="h-4 w-4" /> Back to records
      </span>

      <RecordsHeaderSkeleton />
      <TabBarSkeleton tabs={6} />
      <RecordsOverviewSkeleton />
    </div>
  );
}

export default InternshipRecordDetailLoading;
