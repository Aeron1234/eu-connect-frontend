import { ChevronLeft } from "lucide-react";
import RecordsHeaderSkeleton from "@/app/_components/RecordsHeaderSkeleton";
import TabBarSkeleton from "@/app/_components/TabBarSkeleton";
import RecordsOverviewSkeleton from "@/app/_components/RecordsOverviewSkeleton";

function InternshipRecordDetailLoading() {
  return (
    <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <span className="inline-flex items-center gap-2 text-sm text-foreground-subtle">
        <ChevronLeft className="h-4 w-4" /> Back to records
      </span>

      <RecordsHeaderSkeleton />
      <TabBarSkeleton tabs={5} />
      <RecordsOverviewSkeleton />
    </main>
  );
}

export default InternshipRecordDetailLoading;
